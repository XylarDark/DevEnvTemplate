#!/usr/bin/env node

/**
 * Copy static JS utilities that are not produced by the TypeScript build.
 * (Currently empty – all tooling now compiles from TypeScript sources.)
 */

const fs = require('fs').promises;
const path = require('path');

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const copies = [];

  for (const file of copies) {
    try {
      await fs.mkdir(path.dirname(file.dest), { recursive: true });
      await fs.copyFile(file.src, file.dest);
      console.log(`Copied ${path.relative(repoRoot, file.src)} → ${path.relative(repoRoot, file.dest)}`);
    } catch (error) {
      console.error(`Failed to copy ${file.src} → ${file.dest}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

main();

