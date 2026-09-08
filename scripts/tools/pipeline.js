#!/usr/bin/env node

/**
 * The stage runner shared by `verify.js` and `preflight.js`.
 *
 * Both pipelines make the same distinction, so it lives in one place: an exit code says "nothing
 * threw", while evidence says "the suite ran 289 tests and 286 passed". A stage that exits zero
 * without producing its expected output is reported as `inconclusive`, never as a pass.
 *
 * A stage may declare an `available()` predicate for a tool that might not be installed. When it
 * returns false the stage is `not run`, which is distinct from both a pass and a failure: the
 * check did not happen, and nothing about its subject was demonstrated.
 */

const { spawnSync } = require('child_process');

/** The identifying fields of a stage, without its behavior. */
function describe(stage) {
  return {
    id: stage.id,
    title: stage.title,
    proves: stage.proves,
    command: [stage.command, ...stage.args].join(' '),
  };
}

/** The last lines of output, where the actual error almost always is. */
function failureDetail(stdout, stderr) {
  const combined = `${stdout}\n${stderr}`
    .split('\n')
    .map(line => line.trimEnd())
    .filter(Boolean);

  return combined.slice(-15).join('\n') || 'No output.';
}

function notRun(stage, detail) {
  return { ...describe(stage), status: 'not run', durationMs: 0, evidence: null, detail };
}

function runStage(stage, cwd) {
  if (stage.available && !stage.available()) {
    return notRun(stage, stage.unavailableDetail);
  }

  const started = Date.now();

  const result = spawnSync(stage.command, stage.args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const code = result.status;
  const durationMs = Date.now() - started;

  if (result.error) {
    return {
      ...describe(stage),
      status: 'failed',
      durationMs,
      evidence: null,
      detail: `Could not run ${stage.command}: ${result.error.message}`,
    };
  }

  const evidence = stage.evidence({ stdout, stderr, code });

  // Passing requires both a zero exit code and recognizable evidence. A stage that exits zero
  // without producing its expected output has not demonstrated anything.
  if (code === 0 && evidence) {
    return { ...describe(stage), status: 'passed', durationMs, evidence, detail: null };
  }

  if (code === 0 && !evidence) {
    return {
      ...describe(stage),
      status: 'inconclusive',
      durationMs,
      evidence: null,
      detail: 'Exited zero but produced no recognizable evidence, so nothing was demonstrated.',
    };
  }

  // A stage may summarize its own failure when the tail of its output is unreadable - a JSON
  // report, for instance, whose last fifteen lines say nothing about what went wrong.
  const summary = stage.failureSummary && stage.failureSummary({ stdout, stderr, code });

  return {
    ...describe(stage),
    status: 'failed',
    durationMs,
    evidence,
    detail: summary || failureDetail(stdout, stderr),
  };
}

/**
 * Counts outcomes. `notRun` is deliberately counted against verification rather than ignored,
 * because a stage that did not run proved nothing and its silence must not read as success.
 */
function summarize(results) {
  const failed = results.filter(r => r.status === 'failed' || r.status === 'inconclusive');
  const notRunResults = results.filter(r => r.status === 'not run');
  const passed = results.filter(r => r.status === 'passed');

  return {
    failed,
    notRun: notRunResults,
    passed,
    verified: failed.length === 0 && notRunResults.length === 0,
    counts: {
      passed: passed.length,
      failed: failed.length,
      notRun: notRunResults.length,
      total: results.length,
    },
  };
}

module.exports = { describe, failureDetail, notRun, runStage, summarize };
