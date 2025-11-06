#!/usr/bin/env node

/**
 * Interactive CLI for guiding users through project setup
 * Generates project.manifest.json based on user selections
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

class AgentCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question, options = null, defaultValue = null) {
    return new Promise((resolve) => {
      let fullQuestion = question;
      if (options && options.length > 0) {
        fullQuestion += `\n${options.map((opt, idx) => `${idx + 1}) ${opt}`).join('\n')}`;
        if (defaultValue !== null) {
          fullQuestion += `\n(default: ${defaultValue + 1})`;
        }
      }
      fullQuestion += '\n> ';

      this.rl.question(fullQuestion, (answer) => {
        if (options && options.length > 0) {
          const index = parseInt(answer.trim()) - 1;
          if (!isNaN(index) && index >= 0 && index < options.length) {
            resolve(options[index]);
            return;
          }
          if (defaultValue !== null && answer.trim() === '') {
            resolve(options[defaultValue]);
            return;
          }
          console.log('Invalid selection. Please choose a number from the list.');
          resolve(this.prompt(question, options, defaultValue));
          return;
        }
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async promptYesNo(question, defaultValue = false) {
    const answer = await this.prompt(`${question} (y/n)`, null, defaultValue ? 'y' : 'n');
    const normalized = answer.toLowerCase();
    if (normalized === 'y' || normalized === 'yes') return true;
    if (normalized === 'n' || normalized === 'no') return false;
    console.log('Please answer y or n.');
    return this.promptYesNo(question, defaultValue);
  }

  async promptMultiSelect(question, options, defaultValues = []) {
    console.log(`${question}\nSelect multiple options (comma-separated numbers):`);
    options.forEach((opt, idx) => console.log(`${idx + 1}) ${opt}`));
    console.log(`(default: ${defaultValues.map(v => options.indexOf(v) + 1).join(',')})`);

    const answer = await this.prompt('', null, defaultValues.map(v => options.indexOf(v) + 1).join(','));
    const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);

    const selected = [];
    const invalid = [];
    indices.forEach(idx => {
      if (!isNaN(idx) && idx >= 0 && idx < options.length) {
        selected.push(options[idx]);
      } else {
        invalid.push(idx + 1);
      }
    });

    if (invalid.length > 0) {
      console.log(`Invalid selections: ${invalid.join(', ')}. Please try again.`);
      return this.promptMultiSelect(question, options, defaultValues);
    }

    return selected;
  }

  async collectRequirements() {
    console.log('🚀 Welcome to the DevEnv Template Agent!');
    console.log('I\'ll help you define your project requirements and generate a manifest.\n');

    // Product type
    const productTypes = [
      'Web Application',
      'API/Microservices',
      'Mobile App',
      'Desktop Application',
      'Library/SDK',
      'CLI Tool',
      'Other'
    ];
    const productType = await this.prompt('What type of product are you building?', productTypes, 0);

    // Core features
    const featureOptions = [
      'Authentication/Authorization',
      'REST API',
      'GraphQL API',
      'Web UI (Frontend)',
      'Database Integration',
      'Caching',
      'File Storage',
      'Real-time Features (WebSocket)',
      'Background Jobs/Queues',
      'Admin Panel',
      'API Documentation',
      'Monitoring/Logging',
      'Search Functionality',
      'Email/SMS Notifications'
    ];
    const coreFeatures = await this.promptMultiSelect(
      'Which core features does your product need?',
      featureOptions,
      [] // no defaults
    );

    // Tech stack preferences
    const stackOptions = [
      'Node.js',
      'Python',
      'Go',
      'C#/.NET',
      'Java',
      'Frontend (React/Vue/Angular)',
      'Full-stack (MERN/MEAN/etc.)',
      'Other'
    ];
    const preferredStack = await this.prompt('What\'s your preferred technology stack?', stackOptions, 0);

    // Deployment target
    const deploymentOptions = [
      'Cloud (AWS/GCP/Azure)',
      'Self-hosted (VPS/Dedicated)',
      'Docker Containers',
      'Kubernetes',
      'Serverless',
      'Static Hosting (Netlify/Vercel)',
      'Hybrid'
    ];
    const deploymentTarget = await this.prompt('What\'s your primary deployment target?', deploymentOptions, 2); // Docker default

    // Testing level
    const testingLevels = [
      'Unit tests only',
      'Unit + Integration tests',
      'Unit + Integration + E2E tests',
      'Comprehensive testing (including performance/load tests)',
      'Minimal testing (just enough to deploy)'
    ];
    const testingLevel = await this.prompt('What level of testing do you want?', testingLevels, 1);

    // Governance sensitivity
    const governanceOptions = [
      'Standard (basic security, some compliance)',
      'High (financial/healthcare data, strict compliance)',
      'Enterprise (audit trails, advanced security)',
      'Public sector (government standards)',
      'None (personal/hobby project)'
    ];
    const governanceSensitivity = await this.prompt('What governance/sensitivity level applies?', governanceOptions, 0);

    // Additional questions
    const needsCI = await this.promptYesNo('Do you need CI/CD pipeline setup?', true);
    const needsDocker = await this.promptYesNo('Do you need Docker configuration?', true);
    const needsMonitoring = await this.promptYesNo('Do you need monitoring/observability setup?', false);

    // Team size consideration
    const teamSizes = [
      'Solo developer',
      'Small team (2-5 developers)',
      'Medium team (6-15 developers)',
      'Large team (16+ developers)'
    ];
    const teamSize = await this.prompt('What\'s your team size?', teamSizes, 1);

    return {
      productType,
      coreFeatures,
      preferredStack,
      deploymentTarget,
      testingLevel,
      governanceSensitivity,
      needsCI,
      needsDocker,
      needsMonitoring,
      teamSize
    };
  }

  generateManifest(requirements) {
    // Derive features array for cleanup/scaffolding
    const features = [];

    // Map core features to cleanup features
    const featureMapping = {
      'Authentication/Authorization': ['auth'],
      'REST API': ['api'],
      'GraphQL API': ['graphql'],
      'Web UI (Frontend)': ['frontend'],
      'Database Integration': ['database'],
      'Caching': ['cache'],
      'File Storage': ['storage'],
      'Real-time Features (WebSocket)': ['websocket'],
      'Background Jobs/Queues': ['jobs'],
      'Admin Panel': ['admin'],
      'API Documentation': ['docs'],
      'Monitoring/Logging': ['monitoring'],
      'Search Functionality': ['search'],
      'Email/SMS Notifications': ['notifications']
    };

    requirements.coreFeatures.forEach(feature => {
      const mapped = featureMapping[feature];
      if (mapped) features.push(...mapped);
    });

    // Map stack to features
    const stackMapping = {
      'Node.js': ['node'],
      'Python': ['python'],
      'Go': ['go'],
      'C#/.NET': ['dotnet'],
      'Java': ['java'],
      'Frontend (React/Vue/Angular)': ['frontend'],
      'Full-stack (MERN/MEAN/etc.)': ['node', 'frontend']
    };
    const stackFeatures = stackMapping[requirements.preferredStack] || [];
    features.push(...stackFeatures);

    // Add infrastructure features
    if (requirements.needsCI) features.push('ci');
    if (requirements.needsDocker) features.push('docker');
    if (requirements.needsMonitoring) features.push('monitoring');

    // Map governance to features
    const governanceMapping = {
      'High (financial/healthcare data, strict compliance)': ['security', 'compliance'],
      'Enterprise (audit trails, advanced security)': ['security', 'audit', 'compliance'],
      'Public sector (government standards)': ['security', 'compliance', 'audit']
    };
    const govFeatures = governanceMapping[requirements.governanceSensitivity] || [];
    features.push(...govFeatures);

    // Map testing level
    const testingMapping = {
      'Unit tests only': ['unit-tests'],
      'Unit + Integration tests': ['unit-tests', 'integration-tests'],
      'Unit + Integration + E2E tests': ['unit-tests', 'integration-tests', 'e2e-tests'],
      'Comprehensive testing (including performance/load tests)': ['unit-tests', 'integration-tests', 'e2e-tests', 'performance-tests']
    };
    const testFeatures = testingMapping[requirements.testingLevel] || ['unit-tests'];
    features.push(...testFeatures);

    // Remove duplicates
    const uniqueFeatures = [...new Set(features)];

    return {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      requirements,
      derived: {
        features: uniqueFeatures,
        rationale: {
          features: 'Features derived from your requirements to enable cleanup rules and scaffolding',
          stack: `Based on ${requirements.preferredStack} preference`,
          infrastructure: 'Based on deployment and operational needs',
          governance: 'Based on data sensitivity and compliance requirements',
          testing: 'Based on desired testing coverage level'
        }
      }
    };
  }

  async saveManifest(manifest, outputPath = 'project.manifest.json') {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
      console.log(`\n✅ Manifest saved to ${outputPath}`);
      console.log('\n📋 Summary of your selections:');
      console.log(`   Product Type: ${manifest.requirements.productType}`);
      console.log(`   Stack: ${manifest.requirements.preferredStack}`);
      console.log(`   Features: ${manifest.requirements.coreFeatures.join(', ')}`);
      console.log(`   Deployment: ${manifest.requirements.deploymentTarget}`);
      console.log(`   Testing: ${manifest.requirements.testingLevel}`);
      console.log(`   Governance: ${manifest.requirements.governanceSensitivity}`);
      console.log(`\n🔧 Derived features for cleanup/scaffolding: ${manifest.derived.features.join(', ')}`);
    } catch (error) {
      console.error(`❌ Failed to save manifest: ${error.message}`);
      process.exit(1);
    }
  }

  async run() {
    try {
      const requirements = await this.collectRequirements();
      const manifest = this.generateManifest(requirements);
      await this.saveManifest(manifest);
      console.log('\n🎉 Setup complete! Run `npm run agent:apply` to apply these settings to your project.');
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new AgentCLI();
  cli.run();
}

module.exports = AgentCLI;
