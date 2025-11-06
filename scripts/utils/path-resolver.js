/**
 * Path resolver utility for dual-path loading during migration.
 * Supports new paths (config/, packs/) with fallback to old paths (root, presets/).
 */

const fs = require('fs');
const path = require('path');

/**
 * Resolve config file path with dual-path support
 * @param {string} configName - Config filename (e.g., 'cleanup.config.yaml')
 * @param {string} [workingDir] - Working directory (defaults to cwd)
 * @returns {string} Resolved config path
 */
function resolveConfigPath(configName, workingDir = process.cwd()) {
  const newPath = path.join(workingDir, 'config', configName);
  const oldPath = path.join(workingDir, configName);

  // Try new path first
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  // Fallback to old path
  if (fs.existsSync(oldPath)) {
    return oldPath;
  }

  // Default to new path for creation
  return newPath;
}

/**
 * Resolve pack/preset file path with dual-path support
 * @param {string} packName - Pack filename (e.g., 'node-basic.yaml')
 * @param {string} [workingDir] - Working directory (defaults to __dirname/../../)
 * @returns {string|null} Resolved pack path or null if not found
 */
function resolvePackPath(packName, workingDir = path.join(__dirname, '../..')) {
  const newPath = path.join(workingDir, 'packs', packName);
  const oldPath = path.join(workingDir, 'presets', packName);

  // Try new path first
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  // Fallback to old path
  if (fs.existsSync(oldPath)) {
    return oldPath;
  }

  return null;
}

/**
 * Get all available pack names from both locations
 * @param {string} [workingDir] - Working directory (defaults to __dirname/../../)
 * @returns {string[]} Array of available pack names
 */
function getAvailablePacks(workingDir = path.join(__dirname, '../..')) {
  const packs = new Set();

  // Check new packs directory
  const newPacksDir = path.join(workingDir, 'packs');
  if (fs.existsSync(newPacksDir)) {
    try {
      const files = fs.readdirSync(newPacksDir);
      files.filter(f => f.endsWith('.yaml')).forEach(f => packs.add(f));
    } catch (err) {
      // Ignore directory read errors
    }
  }

  // Check old presets directory
  const oldPresetsDir = path.join(workingDir, 'presets');
  if (fs.existsSync(oldPresetsDir)) {
    try {
      const files = fs.readdirSync(oldPresetsDir);
      files.filter(f => f.endsWith('.yaml')).forEach(f => packs.add(f));
    } catch (err) {
      // Ignore directory read errors
    }
  }

  return Array.from(packs).sort();
}

/**
 * Check if a config file exists in either location
 * @param {string} configName - Config filename
 * @param {string} [workingDir] - Working directory (defaults to cwd)
 * @returns {boolean} True if config exists in either location
 */
function configExists(configName, workingDir = process.cwd()) {
  const newPath = path.join(workingDir, 'config', configName);
  const oldPath = path.join(workingDir, configName);

  return fs.existsSync(newPath) || fs.existsSync(oldPath);
}

module.exports = {
  resolveConfigPath,
  resolvePackPath,
  getAvailablePacks,
  configExists
};
