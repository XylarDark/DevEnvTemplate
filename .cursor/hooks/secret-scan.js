#!/usr/bin/env node
/**
 * Fail-closed secret scanner for agent hooks.
 *
 * Wired to `beforeReadFile` and `beforeShellExecution` in `.cursor/hooks.json`. Cursor imports
 * Claude Code's hook format, so the same script serves both tools.
 *
 * This is the cheapest real mitigation for agent-driven credential exfiltration: an agent that
 * reads a `.env` and then curls it somewhere is the documented attack, and blocking the read is
 * more reliable than hoping the model declines.
 *
 * Protocol (see https://cursor.com/docs/hooks):
 *   stdin  - JSON payload including `hook_event_name` and the event's own fields.
 *   stdout - `{"permission": "allow" | "deny" | "ask", "user_message": ..., "agent_message": ...}`
 *            The message keys are snake_case; camelCase variants are silently discarded.
 *
 * Three implementation constraints, all learned the hard way. With `failClosed` set, each of
 * these failure modes blocks every operation in the editor, so they matter more than usual:
 *
 * 1. `process.stdout` is a pipe and writes to it are asynchronous. Calling `process.exit()`
 *    straight after `write()` truncates the output and Cursor reports "returned no output".
 *    Exit from the write callback instead, once the bytes are flushed.
 *
 * 2. Equally, do not just let the process end on its own: stdin may stay open, the process
 *    lingers, and Cursor kills it at the configured timeout. Destroy stdin and exit explicitly.
 *
 * 3. Cursor prefixes the payload with a UTF-8 BOM, which `JSON.parse` rejects.
 *
 * Cursor fails *open* on crash, timeout, or unparsable output, so `failClosed: true` in
 * `.cursor/hooks.json` is what actually closes that hole.
 */

const fs = require('fs');
const path = require('path');

/**
 * Appends one line per invocation to a gitignored audit log: what was requested, what was
 * decided, and how long it took. A security control that blocks silently is impossible to
 * operate, and this log is also the only way to tell a hook that denied something from a hook
 * that never ran at all.
 *
 * Best-effort by design. Logging must never be the reason a decision fails to reach Cursor.
 */
function audit(fields) {
  try {
    const logDir = path.join(__dirname, '..', '..', '.devenv');
    fs.mkdirSync(logDir, { recursive: true });

    const line =
      JSON.stringify({
        at: new Date().toISOString(),
        elapsedMs: Math.round(process.uptime() * 1000),
        ...fields,
      }) + '\n';

    fs.appendFileSync(path.join(logDir, 'hook-audit.log'), line);
  } catch {
    // Ignored deliberately: see above.
  }
}

/** Files whose contents are secrets by definition. Reading them into context is the leak. */
const BLOCKED_FILE_PATTERNS = [
  /(^|[\\/])\.env$/i,
  /(^|[\\/])\.env\.(?!.*\.(example|sample|template)$)[^\\/]+$/i,
  /(^|[\\/])(id_rsa|id_dsa|id_ecdsa|id_ed25519)$/i,
  /\.(pem|pfx|p12|keystore|jks)$/i,
  /(^|[\\/])\.npmrc$/i,
  /(^|[\\/])\.netrc$/i,
  /(^|[\\/])credentials(\.json)?$/i,
  /(^|[\\/])service-account[^\\/]*\.json$/i,
  /(^|[\\/])\.aws[\\/]/i,
  /(^|[\\/])\.ssh[\\/]/i,
  /(^|[\\/])\.git-credentials$/i,
];

/** Templates are safe: they carry placeholders, and contributors need to read them. */
const ALLOWED_FILE_PATTERNS = [/\.example$/i, /\.sample$/i, /\.template$/i];

/**
 * Live credential material, matched against file *contents* rather than names. A token pasted
 * into an innocuously named config file is the case a path allowlist cannot catch.
 *
 * These are deliberately anchored to vendor-specific prefixes. Generic entropy heuristics
 * produce false positives on minified assets and lockfiles, and a scanner that cries wolf
 * gets switched off.
 */
const CONTENT_SECRET_PATTERNS = [
  { pattern: /\bAKIA[0-9A-Z]{16}\b/, label: 'an AWS access key ID' },
  { pattern: /\bghp_[A-Za-z0-9]{36}\b/, label: 'a GitHub personal access token' },
  { pattern: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/, label: 'a GitHub fine-grained token' },
  { pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, label: 'a Slack token' },
  { pattern: /\bsk-[A-Za-z0-9]{32,}\b/, label: 'an OpenAI-style secret key' },
  { pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/, label: 'an Anthropic API key' },
  { pattern: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/, label: 'a private key' },
  { pattern: /\bAIza[0-9A-Za-z_-]{35}\b/, label: 'a Google API key' },
  { pattern: /\bnpm_[A-Za-z0-9]{36}\b/, label: 'an npm access token' },
];

/**
 * Shell commands that would move credentials off the machine or print them into context.
 *
 * Each pattern requires both a sensitive target and an action, so ordinary development commands
 * pass. Blocking too broadly is its own failure: a hook that stops `npm test` gets removed, and
 * then nothing is protected. `tests/unit/secret-scan-hook.test.js` holds a corpus of routine
 * commands that must keep passing.
 */
const BLOCKED_COMMANDS = [
  {
    pattern:
      /\b(curl|wget|nc|ncat|netcat|scp|rsync|ftp|Invoke-WebRequest|Invoke-RestMethod)\b[^|;&]*\$\{?[A-Za-z_]*(TOKEN|SECRET|API_?KEY|PASSWORD|CREDENTIAL)/i,
    reason: 'sends an environment secret to a remote host',
  },
  {
    // The `.example`/`.sample`/`.template` exclusion keeps template files readable; those
    // carry placeholders and contributors legitimately cat them.
    pattern:
      /\b(cat|head|tail|less|more|bat|Get-Content|type)\b[^|;&]*\.env(?!\.(?:example|sample|template)\b)(\.[A-Za-z0-9_-]+)?(?=\s|$|["'])/i,
    reason: 'prints a .env file into the transcript',
  },
  {
    pattern:
      /\b(curl|wget|Invoke-WebRequest|Invoke-RestMethod)\b[^|;&]*(--data|--data-binary|--upload-file|--form|-T|-F|-Body)\s*[^|;&]*\.env\b/i,
    reason: 'uploads a .env file',
  },
  {
    pattern: /\b(env|printenv)\b\s*\|\s*(curl|wget|nc|ncat|netcat|base64|xxd)/i,
    reason: 'pipes the environment to a network or encoding tool',
  },
  {
    pattern: /\bgit\s+config\s+[^|;&]*(user\.password|credential\.helper)\s*=/i,
    reason: 'rewrites stored git credentials',
  },
  {
    pattern: /\bnpm\s+(config\s+set\s+(_auth|_authToken)|token\s+create)/i,
    reason: 'creates or writes an npm auth token',
  },
  {
    // MCP config rewrites were the vector in CVE-2025-54135; changing them is a reviewed act.
    pattern:
      /(>>?|Set-Content|Out-File|\btee\b)\s*[^|;&]*(\.cursor[\\/]mcp\.json|(^|[\s"'/\\])\.mcp\.json)\b/i,
    reason: 'rewrites MCP server configuration outside of review',
  },
  {
    pattern: /\b(cat|Get-Content|type)\s+[^|;&]*(id_rsa|id_ed25519|\.pem)\b/i,
    reason: 'prints a private key into the transcript',
  },
];

const ALLOW = { permission: 'allow', user_message: '', agent_message: '' };

function deny(message) {
  return { permission: 'deny', user_message: message, agent_message: message };
}

function ask(userMessage, agentMessage) {
  return { permission: 'ask', user_message: userMessage, agent_message: agentMessage };
}

function readStdin() {
  return new Promise(resolve => {
    let data = '';
    let settled = false;

    // Resolve well below the `timeout` configured in hooks.json so this script produces a
    // decision rather than being killed, which Cursor treats as a hook failure. The margin is
    // wide because Node's startup on a Windows machine with live antivirus scanning is both slow
    // and variable, and the budget covers startup plus this wait plus the flush.
    const timer = setTimeout(() => finish(), 1500);

    function finish() {
      if (settled) return;
      settled = true;
      // Clearing the timer matters: an outstanding timer keeps the process alive for its full
      // duration, which would add seconds of latency to every hook invocation.
      clearTimeout(timer);
      resolve(data);
    }

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', finish);
    process.stdin.on('error', finish);
  });
}

/** Returns a denial reason for a path, or null when the path is safe to read. */
function checkFilePath(filePath) {
  const normalized = String(filePath).replace(/\\/g, '/');
  const base = path.posix.basename(normalized);

  if (ALLOWED_FILE_PATTERNS.some(pattern => pattern.test(base))) {
    return null;
  }

  const blocked = BLOCKED_FILE_PATTERNS.some(
    pattern => pattern.test(normalized) || pattern.test(base)
  );

  if (blocked) {
    return (
      `Blocked reading ${base}: this file holds credentials. ` +
      'Read the matching .example template instead, or describe what you need from it.'
    );
  }

  return null;
}

/** Returns a denial reason for file contents, or null when no live credential is present. */
function checkFileContent(content) {
  if (typeof content !== 'string' || !content) {
    return null;
  }

  for (const { pattern, label } of CONTENT_SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return (
        `Blocked reading this file: it contains what looks like ${label}. ` +
        'Move the value into an ignored .env file and reference it by variable name.'
      );
    }
  }

  return null;
}

function checkCommand(command) {
  const text = String(command);

  for (const { pattern, reason } of BLOCKED_COMMANDS) {
    if (pattern.test(text)) {
      return `Blocked command: it ${reason}. Review and run it manually if that is intended.`;
    }
  }

  return null;
}

function decideReadFile(input) {
  // Every path the read would pull into context, including context attachments. A .env arriving
  // as an attachment leaks exactly as thoroughly as one opened directly.
  const paths = [input.file_path, input.filePath, input.path].filter(Boolean);

  if (Array.isArray(input.attachments)) {
    for (const attachment of input.attachments) {
      if (attachment && attachment.file_path) {
        paths.push(attachment.file_path);
      }
    }
  }

  for (const candidate of paths) {
    const reason = checkFilePath(candidate);
    if (reason) return deny(reason);
  }

  const contentReason = checkFileContent(input.content);
  if (contentReason) return deny(contentReason);

  return ALLOW;
}

function decideShellExecution(input) {
  const command = input.command || input.shell_command || input.commandLine;

  if (!command) {
    // Nothing to inspect on a shell event means the payload shape changed. Denying every
    // command would make the agent unusable, so surface it as an explicit approval instead.
    return ask(
      'Secret scanner could not read the command from this hook payload. Approve only if you recognize it.',
      'The secret scanner could not parse the command field. Ask the user to confirm.'
    );
  }

  const reason = checkCommand(command);
  if (reason) return deny(reason);

  return ALLOW;
}

/** Maps a hook payload to exactly one decision. */
function decide(raw) {
  // Cursor prefixes the payload with a UTF-8 BOM, which JSON.parse rejects outright. Without
  // stripping it every operation is denied for "unparsable payload".
  const text = String(raw).replace(/^\uFEFF/, '').trim();

  if (!text) {
    return deny('Secret scanner received no hook input; denying by default.');
  }

  let input;
  try {
    input = JSON.parse(text);
  } catch {
    return deny('Secret scanner could not parse the hook payload; denying by default.');
  }

  // Dispatch on the event name. `beforeMCPExecution` also carries a `command` field, so
  // sniffing which fields are present would conflate two different events.
  switch (input.hook_event_name) {
    case 'beforeReadFile':
    case 'beforeTabFileRead':
      return decideReadFile(input);
    case 'beforeShellExecution':
      return decideShellExecution(input);
    default:
      break;
  }

  // No event name (older payloads, or direct invocation in tests): fall back to whichever
  // fields are present rather than refusing to evaluate.
  if (input.file_path || input.filePath || input.path || input.content) {
    return decideReadFile(input);
  }

  if (input.command || input.shell_command || input.commandLine) {
    return decideShellExecution(input);
  }

  return deny('Secret scanner could not identify the requested operation; denying by default.');
}

async function main() {
  let decision;
  let raw = '';

  try {
    raw = await readStdin();
    decision = decide(raw);
  } catch (error) {
    decision = deny(`Secret scanner failed: ${error.message}. Denying by default.`);
  }

  const payload = JSON.stringify(decision);

  audit({
    permission: decision.permission,
    inputBytes: raw.length,
    reason: decision.user_message || undefined,
  });

  // Release the input pipe so nothing keeps this process alive once the decision is written.
  process.stdin.destroy();

  // Write synchronously to fd 1, then exit.
  //
  // `process.stdout.write()` is asynchronous on a Windows pipe, and its callback fires when the
  // data is queued rather than delivered. Both obvious spellings therefore lose the payload:
  // exiting after the callback can truncate it, and exiting naturally can drop it too. The audit
  // log recorded a complete 59-byte write on invocations that Cursor reported as returning no
  // output - and with `failClosed` set, no output blocks the operation.
  //
  // `fs.writeSync` blocks until the OS accepts the bytes, which removes the race entirely.
  try {
    fs.writeSync(1, payload);
    audit({ wrote: payload.length });
  } catch (error) {
    // EPIPE means Cursor stopped reading, so there is nothing left to report to.
    audit({ writeFailed: error.message });
  }

  process.exit(0);
}

// Only read stdin when run as a hook; requiring this file (in tests) must not block on input.
if (require.main === module) {
  main();
}

module.exports = { decide, checkCommand, checkFilePath, checkFileContent };
