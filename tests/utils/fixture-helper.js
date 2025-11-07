/**
 * Test Fixture Helper Utilities
 * 
 * Provides utilities for working with test fixtures including copying them
 * to temporary directories for isolated testing.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Create a temporary copy of a fixture for testing
 * @param {string} fixtureName - Name of the fixture directory
 * @returns {Promise<string>} Path to the temporary fixture directory
 */
async function createTempFixture(fixtureName) {
  const fixtureDir = path.join(__dirname, '../fixtures', fixtureName);
  const tempDir = path.join(os.tmpdir(), `devenv-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  
  // Check if fixture exists
  try {
    await fs.access(fixtureDir);
  } catch (error) {
    throw new Error(`Fixture '${fixtureName}' not found at ${fixtureDir}`);
  }
  
  // Copy fixture to temp directory
  await fs.cp(fixtureDir, tempDir, { recursive: true });
  
  return tempDir;
}

/**
 * Clean up a temporary fixture directory
 * @param {string} tempDir - Path to temporary directory to remove
 * @returns {Promise<void>}
 */
async function cleanupTempFixture(tempDir) {
  if (!tempDir || !tempDir.includes('devenv-test')) {
    throw new Error('Invalid temp directory path for cleanup');
  }
  
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors if directory doesn't exist
  }
}

/**
 * Check if a file exists in a directory
 * @param {string} dir - Directory path
 * @param {string} file - File path relative to directory
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(dir, file) {
  try {
    await fs.access(path.join(dir, file));
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file from a directory
 * @param {string} dir - Directory path
 * @param {string} file - File path relative to directory
 * @returns {Promise<string>} File contents
 */
async function readFile(dir, file) {
  return await fs.readFile(path.join(dir, file), 'utf8');
}

/**
 * Write a file to a directory
 * @param {string} dir - Directory path
 * @param {string} file - File path relative to directory
 * @param {string} contents - File contents
 * @returns {Promise<void>}
 */
async function writeFile(dir, file, contents) {
  const filePath = path.join(dir, file);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

module.exports = {
  createTempFixture,
  cleanupTempFixture,
  fileExists,
  readFile,
  writeFile
};

