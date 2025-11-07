#!/usr/bin/env node

/**
 * Template Cleanup CLI
 *
 * Command-line interface for the template cleanup engine.
 * Provides dry-run and apply modes for safe template code removal.
 */

const { Command } = require("commander");
const path = require("path");
const { executeCleanup } = require("./engine");
const { createLogger } = require("../utils/logger");

const logger = createLogger({ context: 'cleanup-cli' });

const program = new Command();

program
  .name("cleanup")
  .description("Remove template-only code from scaffolded projects")
  .version("1.0.0")
  .option("-c, --config <path>", "path to cleanup config file", "cleanup.config.yaml")
  .option("-p, --profile <name>", "cleanup profile to use", "common")
  .option("-f, --feature <features...>", "enable feature flags")
  .option("--only <rules...>", "run only specified rules (by ID)")
  .option("--exclude <rules...>", "exclude specified rules (by ID)")
  .option("--exclude-glob <globs...>", "exclude files matching glob patterns")
  .option("--keep <files...>", "preserve specified files even if they match removal rules")
  .option("-r, --report <path>", "export JSON report to specified path")
  .option("--working-dir <path>", "working directory", process.cwd())
  .option("--dry-run", "preview changes without applying them", true)
  .option("--apply", "apply changes (overrides --dry-run)")
  .option("--fail-on-actions", "exit with code 2 if any actions are detected (for CI)")
  .option("--verbose", "enable verbose output")
  .option("--quiet", "suppress non-error output");

program.action(async options => {
  try {
    // Validate mutually exclusive options
    if (options.apply && options.dryRun === false) {
      logger.error("--apply and --dry-run=false cannot be used together");
      process.exit(1);
    }

    // Determine run mode
    const dryRun = options.apply ? false : options.dryRun !== false;

    // Prepare engine options
    const engineOptions = {
      configPath: options.config,
      profile: options.profile,
      features: options.feature || [],
      workingDir: path.resolve(options.workingDir),
      dryRun,
      failOnActions: options.failOnActions,
      onlyRules: options.only,
      excludeRules: options.exclude,
      excludeGlobs: options.excludeGlob,
      keepFiles: options.keep,
    };

    if (!options.quiet) {
      logger.info(`🚀 Starting template cleanup...`);
      logger.info(`   Profile: ${options.profile}`);
      logger.info(`   Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
      if (engineOptions.features.length > 0) {
        logger.info(`   Features: ${engineOptions.features.join(", ")}`);
      }
      logger.info("");
    }

    // Execute cleanup
    const { report, exitCode } = await executeCleanup(engineOptions);

    // Export report if requested
    if (options.report) {
      const reportPath = await require("./engine").CleanupEngine.prototype.exportReport.call(
        { workingDir: engineOptions.workingDir, report },
        options.report
      );
      if (!options.quiet) {
        logger.info(`📊 Report exported to: ${reportPath}`);
      }
    }

    // Display summary
    if (!options.quiet) {
      displaySummary(report, options.verbose);
    }

    // Exit with error code if there were issues or actions detected
    if (report.errors.length > 0) {
      process.exit(1);
    }
    if (exitCode > 0) {
      process.exit(exitCode);
    }
  } catch (error) {
    logger.error(`❌ Cleanup failed: ${error.message}`, { stack: error.stack });
    if (options.verbose) {
      logger.error(error.stack);
    }
    process.exit(1);
  }
});

/**
 * Display cleanup summary
 */
function displaySummary(report, verbose = false) {
  const { summary, actions, errors } = report;

  logger.info("📋 Summary:");
  logger.info(`   Actions taken: ${summary.totalActions}`);
  logger.info(`   Files deleted: ${summary.filesDeleted}`);
  logger.info(`   Lines removed: ${summary.linesRemoved}`);
  logger.info(`   Blocks removed: ${summary.blocksRemoved}`);

  if (errors.length > 0) {
    logger.warn(`   Errors: ${errors.length}`);
    if (verbose) {
      errors.forEach((error, i) => {
        logger.warn(`     ${i + 1}. ${error.rule}: ${error.error}`);
      });
    }
  }

  logger.info("");

  if (actions.length > 0 && verbose) {
    logger.info("📝 Actions:");
    actions.forEach((action, i) => {
      const icon =
        action.type === "file_delete"
          ? "🗑️"
          : action.type === "line_remove"
            ? "📝"
            : action.type === "block_remove"
              ? "📦"
              : "⚙️";
      logger.info(`   ${icon} ${action.type}: ${action.path || action.description}`);
      if (action.dryRun) {
        logger.info(`      (dry run - not applied)`);
      }
    });
    logger.info("");
  }

  if (report.dryRun) {
    logger.info("✅ Dry run completed. No files were modified.");
    logger.info("💡 To apply changes, run with --apply flag.");
  } else {
    logger.info("✅ Cleanup completed successfully.");
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("❌ Unhandled Rejection", { reason, promise });
  process.exit(1);
});

// Parse command line arguments
program.parse();
