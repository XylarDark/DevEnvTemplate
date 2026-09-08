#!/usr/bin/env node
/**
 * Remove build output so a rebuild cannot inherit stale artifacts.
 *
 * `tsc --build --clean` only deletes files the current tsconfig would emit, so it leaves
 * behind output from previous directory layouts. Those orphans are load-bearing by accident:
 * tests that require a path the current build no longer produces still resolve against them
 * and pass locally while failing on a clean checkout. This removes the whole tree instead.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

/** Build artifacts, relative to the repo root. */
const TARGETS = ['dist', 'tsconfig.tsbuildinfo'];

/**
 * Delete a build artifact if present.
 *
 * @param {string} relativeTarget Path relative to the repo root.
 * @returns {'removed' | 'skipped'} Whether anything was deleted.
 */
function removeTarget(relativeTarget) {
  const absoluteTarget = path.join(REPO_ROOT, relativeTarget);

  // Refuse to delete anything outside the repo, in case a caller passes a traversal path.
  if (!absoluteTarget.startsWith(REPO_ROOT + path.sep)) {
    throw new Error(`Refusing to delete outside the repository: ${relativeTarget}`);
  }

  if (!fs.existsSync(absoluteTarget)) {
    return 'skipped';
  }

  try {
    fs.rmSync(absoluteTarget, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to remove ${relativeTarget}: ${error.message}`, { cause: error });
  }

  return 'removed';
}

function main() {
  let removedCount = 0;

  for (const target of TARGETS) {
    const outcome = removeTarget(target);

    if (outcome === 'removed') {
      removedCount += 1;
      console.log(`  removed  ${target}`);
    } else {
      console.log(`  skipped  ${target} (not present)`);
    }
  }

  console.log(
    removedCount > 0
      ? `Clean complete (${removedCount} of ${TARGETS.length} targets removed).`
      : 'Clean complete (nothing to remove).'
  );
}

try {
  main();
} catch (error) {
  console.error(`Clean failed: ${error.message}`);
  process.exit(1);
}
