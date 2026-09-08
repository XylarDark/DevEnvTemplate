#!/usr/bin/env node

/**
 * DevEnvTemplate Init - One-command setup for indie developers
 *
 * Usage: npx devenv-init [--layers agent-context,operational-memory] [--defaults]
 *
 * Detects the host stack, lets you choose adoption layers, and scaffolds only what you pick.
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  DevEnvTemplate — adopt layers, not a monolith                ║
║                                                               ║
║  agent context · operational memory · doctor (Node)           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Choose which layers to copy. Each is independent — skip what you do not need.
`);

const agentInit = path.join(__dirname, '..', 'dist', 'scripts', 'agent', 'init.js');
const child = spawn('node', [agentInit, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('exit', code => {
  if (code === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  Setup complete                                               ║
║                                                               ║
║  Next steps:                                                  ║
║  1. Review AGENTS.md and copied files                         ║
║  2. If you adopted the doctor layer:                          ║
║     cd .devenv && npm install && npm run build                  ║
║  3. git add the new files and commit                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
  } else {
    console.error(`\nSetup failed with code ${code}`);
    process.exit(code ?? 1);
  }
});

child.on('error', err => {
  console.error(`\nFailed to start setup: ${err.message}`);
  process.exit(1);
});
