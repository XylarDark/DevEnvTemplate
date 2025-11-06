#!/usr/bin/env node

const { execSync } = require("child_process");
const os = require("os");

function log(message) {
  console.log(`🔧 ${message}`);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

// Check Node.js version
const nodeVersion = process.versions.node;
const nodeMajor = parseInt(nodeVersion.split(".")[0], 10);

if (nodeMajor < 20) {
  warn(`Node.js ${nodeVersion} detected. Shopify recommends Node 20.x or later.`);
  warn("Consider updating: https://nodejs.org/");
}

// Check Shopify CLI
let shopifyCliPresent = false;
try {
  const shopifyVersion = execSync("shopify version", { encoding: "utf8", stdio: "pipe" });
  success(`Shopify CLI ${shopifyVersion.trim()} found`);
  shopifyCliPresent = true;
} catch (err) {
  error("Shopify CLI not found");

  const platform = os.platform();
  const installUrl = "https://shopify.dev/docs/themes/tools/cli/install";

  if (platform === "win32") {
    log("Install on Windows:");
    log("  winget install Shopify.cli");
    log(`  Or visit: ${installUrl}`);
  } else if (platform === "darwin") {
    log("Install on macOS:");
    log("  brew install shopify-cli");
    log(`  Or visit: ${installUrl}`);
  } else {
    log("Install on Linux/other:");
    log(`  Visit: ${installUrl}`);
  }

  log("After installing, run: shopify auth login");
  process.exit(1);
}

// Run theme check if CLI is present
if (shopifyCliPresent) {
  try {
    log("Running theme check...");
    execSync("shopify theme check --fail-level error", { stdio: "inherit" });
    success("Theme check passed");
  } catch (err) {
    warn("Theme check failed - fix issues or run manually: shopify theme check");
    // Don't exit with error - keep setup fast and non-blocking
  }
}

success("Tool verification complete");
