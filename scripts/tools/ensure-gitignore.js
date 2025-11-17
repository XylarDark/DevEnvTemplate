#!/usr/bin/env node

/**
 * Ensures the host project has `.devenv/` in its .gitignore file.
 * Runs automatically after `npm install` inside the .devenv folder.
 */

const fs = require('fs');
const path = require('path');

function ensureGitignore() {
  const devenvRoot = process.cwd();
  const projectRoot = path.resolve(devenvRoot, '..');
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const entry = '.devenv/\n';

  try {
    // Skip if parent doesn't look like a git repo root
    if (!fs.existsSync(projectRoot)) {
      return;
    }

    let existing = '';
    if (fs.existsSync(gitignorePath)) {
      existing = fs.readFileSync(gitignorePath, 'utf8');
      if (existing.includes('.devenv')) {
        console.log('✓ .devenv already ignored in parent .gitignore');
        return;
      }
    }

    const needsLeadingNewline = existing.length > 0 && !existing.endsWith('\n');
    const addition = `${needsLeadingNewline ? '\n' : ''}# DevEnvTemplate workspace (auto-added)\n${entry}`;

    fs.writeFileSync(gitignorePath, existing + addition);
    console.log('✓ Added ".devenv/" to parent .gitignore');
  } catch (error) {
    console.warn('⚠️  Could not update parent .gitignore automatically:', error.message);
  }
}

ensureGitignore();

