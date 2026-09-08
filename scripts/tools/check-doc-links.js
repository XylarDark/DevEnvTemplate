#!/usr/bin/env node
/**
 * Verifies that every relative markdown link in the repo points at a file that exists.
 * Broken links are the standing failure mode of doc reorganizations, so this runs in CI
 * rather than relying on a reviewer noticing.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', '.devenv']);

/** Directories whose contents are provenance and may reference deleted files. */
const SKIP_PATHS = [path.join('docs', 'archive')];

const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function collectMarkdownFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectMarkdownFiles(path.join(dir, entry.name), found);
    } else if (entry.name.endsWith('.md')) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

function isExternal(target) {
  return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//') || target.startsWith('#');
}

function checkFile(file) {
  const relFile = path.relative(REPO_ROOT, file);
  if (SKIP_PATHS.some(skip => relFile.startsWith(skip))) return [];

  const contents = fs.readFileSync(file, 'utf8');
  const broken = [];

  for (const match of contents.matchAll(LINK_PATTERN)) {
    const rawTarget = match[1];
    if (isExternal(rawTarget)) continue;

    // Strip anchors and query strings; only the path needs to resolve.
    const target = decodeURIComponent(rawTarget.split('#')[0].split('?')[0]);
    if (!target) continue;

    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      const line = contents.slice(0, match.index).split('\n').length;
      broken.push({ file: relFile, line, target: rawTarget });
    }
  }

  return broken;
}

function main() {
  const files = collectMarkdownFiles(REPO_ROOT);
  const broken = files.flatMap(checkFile);

  if (broken.length === 0) {
    console.log(`Doc links OK: checked ${files.length} markdown files.`);
    return;
  }

  console.error(`Found ${broken.length} broken relative link(s):\n`);
  for (const { file, line, target } of broken) {
    console.error(`  ${file}:${line} -> ${target}`);
  }
  process.exitCode = 1;
}

main();
