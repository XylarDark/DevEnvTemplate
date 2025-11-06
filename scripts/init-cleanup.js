#!/usr/bin/env node

/**
 * Post-scaffold cleanup script
 *
 * This script is run once after scaffolding a new project from the template.
 * It applies cleanup rules to remove template-only code and commits the changes.
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const { resolveConfigPath } = require("./utils/path-resolver");

async function runPostScaffoldCleanup() {
  const scriptDir = path.dirname(__filename);
  const projectRoot = path.resolve(scriptDir, "..");
  const cleanupCli = path.join(scriptDir, "cleanup", "cli.js");

  console.log("🚀 Running post-scaffold cleanup...");

  try {
    // Check if cleanup config exists
    const configPath = resolveConfigPath("cleanup.config.yaml", projectRoot);
    try {
      await fs.access(configPath);
    } catch (error) {
      console.log("ℹ️  No cleanup.config.yaml found, skipping cleanup");
      return;
    }

    // Run cleanup in apply mode
    console.log("📋 Applying cleanup rules...");
    execSync(`node "${cleanupCli}" --apply --report cleanup-report.json`, {
      cwd: projectRoot,
      stdio: "inherit",
    });

    // Check if there were any changes
    const gitStatus = execSync("git status --porcelain", {
      cwd: projectRoot,
      encoding: "utf8",
    });

    if (gitStatus.trim()) {
      console.log("📝 Committing cleanup changes...");

      // Stage all changes
      execSync("git add .", { cwd: projectRoot });

      // Commit with a descriptive message
      execSync(
        `git commit -m "chore: remove template-only code after scaffolding

- Applied cleanup rules to remove template artifacts
- Removed scaffold scripts, template files, and dependencies
- See cleanup-report.json for details of changes"`,
        {
          cwd: projectRoot,
        }
      );

      console.log("✅ Cleanup completed and committed");
    } else {
      console.log("ℹ️  No changes to commit - cleanup was already clean");
    }

    // Clean up the cleanup system itself
    console.log("🧹 Cleaning up cleanup system...");
    await cleanupCleanupSystem(projectRoot);
  } catch (error) {
    console.error("❌ Post-scaffold cleanup failed:", error.message);
    process.exit(1);
  }
}

/**
 * Remove the cleanup system files after successful cleanup
 */
async function cleanupCleanupSystem(projectRoot) {
  const cleanupFiles = [
    "scripts/cleanup/",
    "scripts/init-cleanup.js",
    "cleanup.config.yaml",
    "cleanup-report.json", // Optional - keep for reference
  ];

  for (const file of cleanupFiles) {
    const fullPath = path.join(projectRoot, file);
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }
      console.log(`   Removed: ${file}`);
    } catch (error) {
      // File might not exist or already removed, continue
    }
  }

  // Also remove cleanup-related dependencies from package.json if they exist
  try {
    const packageJsonPath = path.join(projectRoot, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));

    const cleanupDeps = ["commander", "glob", "yaml"];
    let modified = false;

    if (packageJson.dependencies) {
      cleanupDeps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          delete packageJson.dependencies[dep];
          modified = true;
        }
      });
    }

    if (modified) {
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log("   Removed cleanup dependencies from package.json");

      // Remove package-lock.json to force regeneration
      try {
        await fs.unlink(path.join(projectRoot, "package-lock.json"));
        console.log("   Removed package-lock.json (will regenerate on next install)");
      } catch (error) {
        // package-lock.json might not exist
      }
    }
  } catch (error) {
    // package.json processing failed, but don't fail the whole cleanup
    console.warn("   Warning: Could not clean up package.json dependencies");
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  runPostScaffoldCleanup().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { runPostScaffoldCleanup };
