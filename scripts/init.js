#!/usr/bin/env node

/**
 * DevEnvTemplate Init - One-command setup for indie developers
 *
 * Usage: npx devenv-init
 *
 * This is a simplified entry point that:
 * 1. Welcomes the user
 * 2. Runs the agent CLI with simplified questions
 * 3. Provides next steps
 */

const { spawn } = require('child_process');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  🚀 DevEnvTemplate - Ship Quality Code Faster                ║
║                                                               ║
║  For indie developers & solo founders                         ║
║  Setup in < 5 minutes                                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Let's set up your project with testing, CI/CD, and best practices!

Answer 5 quick questions and we'll configure everything automatically.
`);

// Run the simplified agent CLI
const agentCli = path.join(__dirname, 'agent', 'cli-simple.js');
const child = spawn('node', [agentCli], {
  stdio: 'inherit',
  cwd: process.cwd(),
});

child.on('exit', code => {
  if (code === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✅ Setup Complete!                                           ║
║                                                               ║
║  Next steps:                                                  ║
║  1. git add .                                                 ║
║  2. git commit -m "Add DevEnvTemplate"                        ║
║  3. git push                                                  ║
║                                                               ║
║  Your CI/CD will run automatically on push!                   ║
║                                                               ║
║  Check .devenv/stack-report.json after pushing for your       ║
║  quality audit.                                               ║
║                                                               ║
║  Need help? See USAGE.md or open an issue on GitHub          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
  } else {
    console.error(`\n❌ Setup failed with code ${code}`);
    console.error('See error messages above for details.');
    process.exit(code);
  }
});

child.on('error', err => {
  console.error(`\n❌ Failed to start setup: ${err.message}`);
  process.exit(1);
});
