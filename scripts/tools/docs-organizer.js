#!/usr/bin/env node

/**
 * Documentation Organizer - JavaScript wrapper for TypeScript implementation
 * 
 * This wrapper provides backward compatibility by importing the compiled TypeScript version.
 */

const docsOrganizerModule = require('../../dist/scripts/tools/docs-organizer');
const main = docsOrganizerModule.main || docsOrganizerModule.default || docsOrganizerModule;

// Run the organizer if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = docsOrganizerModule;

