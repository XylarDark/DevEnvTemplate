#!/usr/bin/env node

/**
 * JavaScript wrapper for TypeScript agent CLI
 * Provides backward compatibility by re-exporting compiled TypeScript code
 */

const AgentCLI = require('../../dist/agent/cli').default;

// CLI entry point
if (require.main === module) {
  const cli = new AgentCLI();
  cli.run();
}

module.exports = AgentCLI;
