#!/usr/bin/env node
/**
 * Verify committed dist/ matches a fresh TypeScript build.
 *
 * Adopters run the doctor from dist/ after npm install alone. When sources change,
 * contributors must rebuild and commit dist/; this script catches drift in CI.
 */

const crypto = require('crypto');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(REPO_ROOT, 'dist');
const DOCTOR_ENTRY = path.join(DIST, 'scripts', 'doctor', 'cli.js');

/**
 * @param {string} directory
 * @param {string} [prefix]
 * @returns {Map<string, string>}
 */
function hashTree(directory, prefix = '') {
  const hashes = new Map();

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      for (const [filePath, digest] of hashTree(absolutePath, relativePath)) {
        hashes.set(filePath, digest);
      }
      continue;
    }

    const content = fs.readFileSync(absolutePath);
    hashes.set(relativePath, crypto.createHash('sha256').update(content).digest('hex'));
  }

  return hashes;
}

function main() {
  if (!fs.existsSync(DOCTOR_ENTRY)) {
    console.error('dist/ is missing or incomplete. Run: npm run build');
    process.exit(1);
  }

  const before = hashTree(DIST);

  const build = spawnSync('npm', ['run', 'build:clean'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (build.status !== 0) {
    if (build.stdout) {
      process.stderr.write(build.stdout);
    }
    if (build.stderr) {
      process.stderr.write(build.stderr);
    }
    process.exit(build.status ?? 1);
  }

  const after = hashTree(DIST);

  if (before.size !== after.size) {
    console.error(
      'dist/ file count changed after rebuild. Run `npm run build` and commit the updated dist/.'
    );
    process.exit(1);
  }

  for (const [filePath, digest] of after) {
    if (before.get(filePath) !== digest) {
      console.error(
        `dist/${filePath} is out of sync with TypeScript sources. Run \`npm run build\` and commit dist/.`
      );
      process.exit(1);
    }
  }

  console.log(`dist/ is in sync (${after.size} files checked).`);
}

try {
  main();
} catch (error) {
  console.error(`check-dist-sync failed: ${error.message}`);
  process.exit(1);
}
