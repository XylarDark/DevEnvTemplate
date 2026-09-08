#!/usr/bin/env node

/**
 * Repairs mojibake: text whose UTF-8 bytes were once decoded as CP1252 and re-encoded as UTF-8,
 * which turns a character like "→" into "â†'". The damage is reversible, so this maps each
 * character back to the byte CP1252 would have produced and decodes the result as UTF-8 again.
 *
 * Guessing replacements per symbol was the alternative, and it loses information: the same
 * garbled prefix stands for many different original characters.
 *
 * Usage:
 *   node scripts/tools/fix-mojibake.js <file...>            report what would change
 *   node scripts/tools/fix-mojibake.js --write <file...>    repair in place
 *   node scripts/tools/fix-mojibake.js --check              scan the repo, exit 1 on damage
 *
 * `--check` is the guard that matters. This repo has re-introduced mojibake twice, once breaking
 * the linter and once garbling every generated plan, so recurrence is checked rather than trusted.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.devenv']);
const SCAN_EXTENSIONS = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdc',
  '.yml',
  '.yaml',
  '.sh',
  '.ps1',
]);

// This file documents the damage it repairs, so its own examples are not defects.
const SELF = path.join('scripts', 'tools', 'fix-mojibake.js');

/** CP1252's printable assignments for 0x80-0x9F, where it diverges from Latin-1. */
const CP1252_HIGH = {
  '\u20AC': 0x80,
  '\u201A': 0x82,
  '\u0192': 0x83,
  '\u201E': 0x84,
  '\u2026': 0x85,
  '\u2020': 0x86,
  '\u2021': 0x87,
  '\u02C6': 0x88,
  '\u2030': 0x89,
  '\u0160': 0x8a,
  '\u2039': 0x8b,
  '\u0152': 0x8c,
  '\u017D': 0x8e,
  '\u2018': 0x91,
  '\u2019': 0x92,
  '\u201C': 0x93,
  '\u201D': 0x94,
  '\u2022': 0x95,
  '\u2013': 0x96,
  '\u2014': 0x97,
  '\u02DC': 0x98,
  '\u2122': 0x99,
  '\u0161': 0x9a,
  '\u203A': 0x9b,
  '\u0153': 0x9c,
  '\u017E': 0x9e,
  '\u0178': 0x9f,
};

/**
 * Encodes text back to the CP1252 bytes it came from. Returns null when a character has no
 * CP1252 byte, which means the text is not mojibake and must be left alone.
 */
function toCp1252Bytes(text) {
  const bytes = Buffer.alloc(Buffer.byteLength(text, 'utf8'));
  let length = 0;

  for (const char of text) {
    const code = char.codePointAt(0);

    if (code <= 0x7f) {
      bytes[length++] = code;
    } else if (CP1252_HIGH[char] !== undefined) {
      bytes[length++] = CP1252_HIGH[char];
    } else if (code >= 0x80 && code <= 0xff) {
      // Covers Latin-1's upper half plus the five bytes CP1252 leaves unassigned (0x81, 0x8D,
      // 0x8F, 0x90, 0x9D). Lenient decoders pass those through as C1 control characters, which
      // is why emoji like U+274C survive as "\u00E2\u009D\u0152".
      bytes[length++] = code;
    } else {
      // Outside CP1252 entirely, so this character was never mojibake.
      return null;
    }
  }

  return bytes.subarray(0, length);
}

/**
 * Returns the repaired text, or the original when it is not repairable mojibake.
 */
function repair(text) {
  const bytes = toCp1252Bytes(text);
  if (!bytes) {
    return text;
  }

  const decoded = bytes.toString('utf8');

  // A failed decode yields U+FFFD. Reversing damage should never introduce it.
  if (decoded.includes('\uFFFD')) {
    return text;
  }

  return decoded;
}

/** Repairs only the mojibake runs, leaving already-correct characters untouched. */
function repairText(text) {
  // A mojibake run is a stretch of CP1252-range characters. Match them together so multi-byte
  // sequences are decoded as a unit.
  return text.replace(
    /[\u0080-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]+/g,
    run => repair(run)
  );
}

/** Every scannable file in the repo, relative to the root. */
function collectRepoFiles(dir = REPO_ROOT, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        collectRepoFiles(full, found);
      }
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      const relative = path.relative(REPO_ROOT, full);
      if (relative !== SELF) {
        found.push(relative);
      }
    }
  }

  return found;
}

/** Reports every file whose text is repairable, which means it is damaged. */
function check() {
  const damaged = [];

  for (const file of collectRepoFiles()) {
    const original = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
    if (repairText(original) !== original) {
      damaged.push(file);
    }
  }

  if (damaged.length === 0) {
    console.log('No mojibake found.');
    return 0;
  }

  console.error(`Mojibake found in ${damaged.length} file(s):\n`);
  for (const file of damaged) {
    console.error(`  ${file}`);
  }
  console.error('\nRepair with: node scripts/tools/fix-mojibake.js --write <file...>');
  return 1;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--check')) {
    process.exitCode = check();
    return;
  }

  const write = args.includes('--write');
  const files = args.filter(arg => arg !== '--write');

  if (files.length === 0) {
    console.error('Usage: node scripts/tools/fix-mojibake.js [--write] <file...> | --check');
    process.exit(1);
  }

  let changedCount = 0;

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    const repaired = repairText(original);

    if (original === repaired) {
      console.log(`unchanged  ${file}`);
      continue;
    }

    changedCount++;
    const originalLines = original.split('\n');
    const repairedLines = repaired.split('\n');
    const diffs = [];

    for (let i = 0; i < originalLines.length; i++) {
      if (originalLines[i] !== repairedLines[i]) {
        diffs.push(i + 1);
      }
    }

    console.log(`${write ? 'repaired  ' : 'would fix '} ${file}  (${diffs.length} line(s))`);
    for (const line of diffs.slice(0, 4)) {
      console.log(`    ${line}: ${repairedLines[line - 1].trim()}`);
    }

    if (write) {
      fs.writeFileSync(file, repaired, 'utf8');
    }
  }

  console.log(`\n${changedCount} file(s) ${write ? 'repaired' : 'need repair'}`);
}

if (require.main === module) {
  main();
}

module.exports = { repairText };
