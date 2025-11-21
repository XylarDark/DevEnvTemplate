#!/usr/bin/env node

/**
 * Documentation Organizer CLI
 * 
 * Command-line tool for organizing markdown files into appropriate directories.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { resolveProjectRoot } from '../utils/path-resolver';
import {
  organizeDocumentation,
  validateOrganization,
  detectMisplacedDocs,
  loadDocsConfig,
  determineTargetDirectory
} from '../utils/docs-organizer';

interface CliOptions {
  dryRun?: boolean;
  autoFix?: boolean;
  config?: string;
  verbose?: boolean;
  projectRoot?: string;
}

/**
 * Format file path for display
 */
function formatPath(filePath: string, projectRoot: string): string {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  
  const options: CliOptions = {
    dryRun: args.includes('--dry-run'),
    autoFix: args.includes('--auto-fix'),
    verbose: args.includes('--verbose'),
  };
  
  // Parse --config option
  const configIndex = args.findIndex(arg => arg.startsWith('--config'));
  if (configIndex !== -1) {
    const configArg = args[configIndex];
    if (configArg.includes('=')) {
      options.config = configArg.split('=')[1];
    } else if (args[configIndex + 1]) {
      options.config = args[configIndex + 1];
    }
  }
  
  // Parse --project-root option
  const rootIndex = args.findIndex(arg => arg.startsWith('--project-root'));
  if (rootIndex !== -1) {
    const rootArg = args[rootIndex];
    if (rootArg.includes('=')) {
      options.projectRoot = rootArg.split('=')[1];
    } else if (args[rootIndex + 1]) {
      options.projectRoot = args[rootIndex + 1];
    }
  }
  
  // Resolve project root
  const currentDir = process.cwd();
  const projectRoot = options.projectRoot || resolveProjectRoot(currentDir) || currentDir;
  
  if (projectRoot !== currentDir) {
    process.chdir(projectRoot);
  }
  
  try {
    // Validate organization is needed
    const validation = await validateOrganization(projectRoot);
    
    if (!validation.needsOrganization) {
      console.log('✅ All documentation files are properly organized.\n');
      process.exit(0);
    }
    
    // Show what needs to be organized
    console.log('📚 Documentation Organization\n');
    console.log(`Found ${validation.misplacedFiles.length} file(s) that need organization:\n`);
    
    // Load config to show target directories
    const config = await loadDocsConfig(projectRoot);
    
    for (const filename of validation.misplacedFiles) {
      const { target, reason } = determineTargetDirectory(filename, config, projectRoot);
      const targetRelative = formatPath(target, projectRoot);
      console.log(`  • ${filename}`);
      console.log(`    → ${targetRelative}/`);
      if (options.verbose) {
        console.log(`    Reason: ${reason}`);
      }
    }
    
    // If dry-run or not auto-fix, show preview
    if (options.dryRun || !options.autoFix) {
      console.log('\n' + '='.repeat(50));
      console.log('DRY RUN MODE - No files will be moved');
      console.log('='.repeat(50) + '\n');
      
      const result = await organizeDocumentation(projectRoot, true);
      
      if (result.conflicts.length > 0) {
        console.log('\n⚠️  Conflicts detected:');
        for (const conflict of result.conflicts) {
          console.log(`  • ${formatPath(conflict.source, projectRoot)}`);
          console.log(`    Target already exists: ${formatPath(conflict.target, projectRoot)}`);
        }
      }
      
      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        for (const error of result.errors) {
          console.log(`  • ${error}`);
        }
      }
      
      console.log('\nTo apply changes, run with --auto-fix flag:');
      console.log('  devenv organize-docs --auto-fix\n');
      
      process.exit(0);
    }
    
    // Auto-fix mode
    console.log('\n' + '='.repeat(50));
    console.log('AUTO-FIX MODE - Files will be moved');
    console.log('='.repeat(50) + '\n');
    
    const result = await organizeDocumentation(projectRoot, false);
    
    if (result.filesToMove.length > 0) {
      console.log(`✅ Moved ${result.filesToMove.length} file(s):\n`);
      for (const move of result.filesToMove) {
        console.log(`  • ${formatPath(move.source, projectRoot)}`);
        console.log(`    → ${formatPath(move.target, projectRoot)}`);
        if (options.verbose) {
          console.log(`    Reason: ${move.reason}`);
        }
      }
    }
    
    if (result.conflicts.length > 0) {
      console.log('\n⚠️  Conflicts (files not moved):');
      for (const conflict of result.conflicts) {
        console.log(`  • ${formatPath(conflict.source, projectRoot)}`);
        console.log(`    ${conflict.message}`);
      }
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const error of result.errors) {
        console.log(`  • ${error}`);
      }
      process.exit(1);
    }
    
    if (result.success) {
      console.log('\n✅ Documentation organization complete!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Organization completed with errors\n');
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };

