/**
 * Backward compatibility wrapper for package managers
 * Re-exports from compiled TypeScript
 */

const {
  BasePackageManager,
  NpmManager,
  YarnManager,
  PnpmManager,
  PipManager,
  PoetryManager,
  GoManager,
  NugetManager,
  MavenManager,
  GradleManager,
  getPackageManager,
} = require('../../../dist/cleanup/package-managers');

module.exports = {
  BasePackageManager,
  NpmManager,
  YarnManager,
  PnpmManager,
  PipManager,
  PoetryManager,
  GoManager,
  NugetManager,
  MavenManager,
  GradleManager,
  getPackageManager,
};

