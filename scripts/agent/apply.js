#!/usr/bin/env node

/**
 * Apply script for the agent
 * Reads project.manifest.json and syncs features to cleanup config and CI
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { resolvePackPath } = require('../utils/path-resolver');

class AgentApply {
  constructor() {
    this.manifest = null;
    this.configPath = 'cleanup.config.yaml';
    this.manifestPath = 'project.manifest.json';
  }

  loadManifest() {
    try {
      const manifestContent = fs.readFileSync(this.manifestPath, 'utf8');
      this.manifest = JSON.parse(manifestContent);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load manifest: ${error.message}`);
      return false;
    }
  }

  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      return yaml.parse(configContent);
    } catch (error) {
      console.error(`❌ Failed to load cleanup config: ${error.message}`);
      return null;
    }
  }

  saveConfig(config) {
    try {
      const configContent = yaml.stringify(config);
      fs.writeFileSync(this.configPath, configContent);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save cleanup config: ${error.message}`);
      return false;
    }
  }

  getPresetPath(stack) {
    const stackMapping = {
      'Node.js': 'node-basic.yaml',
      'Python': 'python-basic.yaml',
      'Go': 'go-basic.yaml',
      'C#/.NET': 'dotnet-basic.yaml',
      'Java': 'java-basic.yaml',
      'Frontend (React/Vue/Angular)': 'frontend-spa.yaml',
      'Full-stack (MERN/MEAN/etc.)': 'fullstack-basic.yaml'
    };

    const presetFile = stackMapping[stack];
    if (presetFile) {
      return resolvePackPath(presetFile, path.join(__dirname, '../..'));
    }
    return null;
  }

  loadPreset(presetPath) {
    try {
      const presetContent = fs.readFileSync(presetPath, 'utf8');
      return yaml.parse(presetContent);
    } catch (error) {
      console.log(`⚠️  Could not load preset ${presetPath}: ${error.message}`);
      return null;
    }
  }

  mergePreset(config, preset) {
    // Merge preset rules into config
    if (preset.rules) {
      if (!config.rules) config.rules = [];
      config.rules = [...config.rules, ...preset.rules];
    }

    // Merge preset profiles
    if (preset.profiles) {
      if (!config.profiles) config.profiles = {};
      Object.assign(config.profiles, preset.profiles);
    }

    return config;
  }

  applyFeaturesToConfig(config) {
    const features = this.manifest.derived.features;

    // Enable feature flags in config
    if (!config.features) config.features = {};
    features.forEach(feature => {
      config.features[feature] = true;
    });

    // Update profiles to include feature conditions
    if (config.profiles) {
      Object.keys(config.profiles).forEach(profileName => {
        const profile = config.profiles[profileName];
        if (profile.rules) {
          profile.rules.forEach(rule => {
            if (rule.condition && typeof rule.condition === 'string') {
              // Replace features references in conditions
              rule.condition = rule.condition.replace(/features/g, 'config.features');
            }
          });
        }
      });
    }

    return config;
  }

  generateCIArgs() {
    const features = this.manifest.derived.features;
    const featureFlags = features.map(f => `--feature ${f}`).join(' ');
    return featureFlags;
  }

  createGitHubEnv() {
    // Create .github/env file for CI to use
    const envDir = path.join('.github');
    const envFile = path.join(envDir, 'cleanup-env');

    try {
      if (!fs.existsSync(envDir)) {
        fs.mkdirSync(envDir, { recursive: true });
      }

      const ciArgs = this.generateCIArgs();
      const envContent = `CLEANUP_FEATURE_FLAGS=${ciArgs}\n`;
      fs.writeFileSync(envFile, envContent);
      console.log(`✅ Created .github/cleanup-env for CI`);
    } catch (error) {
      console.log(`⚠️  Could not create CI env file: ${error.message}`);
    }
  }

  async run() {
    console.log('🔄 Applying project manifest to configuration...\n');

    if (!this.loadManifest()) {
      process.exit(1);
    }

    console.log(`📋 Loaded manifest for: ${this.manifest.requirements.productType}`);
    console.log(`   Stack: ${this.manifest.requirements.preferredStack}`);
    console.log(`   Features: ${this.manifest.derived.features.join(', ')}\n`);

    // Load current config
    let config = this.loadConfig();
    if (!config) {
      console.log('ℹ️  No cleanup.config.yaml found, creating default config');
      config = {
        version: '1.0.0',
        profiles: {
          common: {
            description: 'Common cleanup rules',
            rules: []
          }
        }
      };
    }

    // Apply features to config
    config = this.applyFeaturesToConfig(config);

    // Try to load and merge preset
    const presetPath = this.getPresetPath(this.manifest.requirements.preferredStack);
    if (presetPath) {
      const preset = this.loadPreset(presetPath);
      if (preset) {
        console.log(`📚 Merging preset: ${preset.name}`);
        config = this.mergePreset(config, preset);
      }
    }

    // Save updated config
    if (this.saveConfig(config)) {
      console.log('✅ Updated cleanup.config.yaml with manifest features');
    }

    // Create CI environment
    this.createGitHubEnv();

    console.log('\n🎉 Configuration applied successfully!');
    console.log('\nNext steps:');
    console.log('  • Run cleanup: npm run cleanup:dry-run');
    console.log('  • Or apply changes: npm run cleanup:apply');
    console.log('  • CI will automatically use the configured features');
  }
}

// CLI entry point
if (require.main === module) {
  const apply = new AgentApply();
  apply.run().catch(error => {
    console.error(`❌ Apply failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = AgentApply;
