#!/usr/bin/env node

/**
 * Interactive CLI for guiding users through project setup
 * Generates project.manifest.json based on user selections
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../utils/logger';
import { Requirements, ProjectManifest } from '../types/manifest';

const logger = createLogger({ context: 'agent-cli' });

export class AgentCLI {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question: string, options: string[] | null = null, defaultValue: number | string | null = null): Promise<string> {
    return new Promise((resolve) => {
      let fullQuestion = question;
      if (options && options.length > 0) {
        fullQuestion += `\n${options.map((opt, idx) => `${idx + 1}) ${opt}`).join('\n')}`;
        if (defaultValue !== null && typeof defaultValue === 'number') {
          fullQuestion += `\n(default: ${defaultValue + 1})`;
        }
      }
      fullQuestion += '\n> ';

      this.rl.question(fullQuestion, (answer: string) => {
        if (options && options.length > 0) {
          const index = parseInt(answer.trim()) - 1;
          if (!isNaN(index) && index >= 0 && index < options.length) {
            resolve(options[index]);
            return;
          }
          if (typeof defaultValue === 'number' && answer.trim() === '') {
            resolve(options[defaultValue]);
            return;
          }
          logger.warn('Invalid selection. Please choose a number from the list.');
          resolve(this.prompt(question, options, defaultValue));
          return;
        }
        resolve(answer.trim() || (typeof defaultValue === 'string' ? defaultValue : ''));
      });
    });
  }

  async promptYesNo(question: string, defaultValue: boolean = false): Promise<boolean> {
    const answer = await this.prompt(`${question} (y/n)`, null, defaultValue ? 'y' : 'n');
    const normalized = answer.toLowerCase();
    if (normalized === 'y' || normalized === 'yes') return true;
    if (normalized === 'n' || normalized === 'no') return false;
    logger.warn('Please answer y or n.');
    return this.promptYesNo(question, defaultValue);
  }

  async promptMultiSelect(question: string, options: string[], defaultValues: string[] = []): Promise<string[]> {
    logger.info(`${question}\nSelect multiple options (comma-separated numbers):`);
    options.forEach((opt, idx) => logger.info(`${idx + 1}) ${opt}`));
    logger.info(`(default: ${defaultValues.map(v => options.indexOf(v) + 1).join(',')})`);

    const defaultAnswer = defaultValues.map(v => options.indexOf(v) + 1).join(',');
    const answer = await this.prompt('', null, defaultAnswer);
    const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);

    const selected: string[] = [];
    const invalid: number[] = [];
    indices.forEach(idx => {
      if (!isNaN(idx) && idx >= 0 && idx < options.length) {
        selected.push(options[idx]);
      } else {
        invalid.push(idx + 1);
      }
    });

    if (invalid.length > 0) {
      logger.warn(`Invalid selections: ${invalid.join(', ')}. Please try again.`);
      return this.promptMultiSelect(question, options, defaultValues);
    }

    return selected;
  }

  async collectRequirements(): Promise<Requirements> {
    logger.info('🚀 Welcome to the DevEnv Template Agent!');
    logger.info('I\'ll help you define your project requirements and generate a manifest.\n');

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

  generateManifest(requirements: Requirements): ProjectManifest {
    // Derive features array for cleanup/scaffolding
    const features: string[] = [];

    // Map core features to cleanup features
    const featureMapping: Record<string, string[]> = {
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
    const stackMapping: Record<string, string[]> = {
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
    const governanceMapping: Record<string, string[]> = {
      'High (financial/healthcare data, strict compliance)': ['security', 'compliance'],
      'Enterprise (audit trails, advanced security)': ['security', 'audit', 'compliance'],
      'Public sector (government standards)': ['security', 'compliance', 'audit']
    };
    const govFeatures = governanceMapping[requirements.governanceSensitivity] || [];
    features.push(...govFeatures);

    // Map testing level
    const testingMapping: Record<string, string[]> = {
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

  async saveManifest(manifest: ProjectManifest, outputPath: string = 'project.manifest.json'): Promise<void> {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
      logger.info(`\n✅ Manifest saved to ${outputPath}`);
      logger.info('\n📋 Summary of your selections:');
      logger.info(`   Product Type: ${manifest.requirements.productType}`);
      logger.info(`   Stack: ${manifest.requirements.preferredStack}`);
      logger.info(`   Features: ${manifest.requirements.coreFeatures.join(', ')}`);
      logger.info(`   Deployment: ${manifest.requirements.deploymentTarget}`);
      logger.info(`   Testing: ${manifest.requirements.testingLevel}`);
      logger.info(`   Governance: ${manifest.requirements.governanceSensitivity}`);
      logger.info(`\n🔧 Derived features for cleanup/scaffolding: ${manifest.derived.features.join(', ')}`);
    } catch (error: any) {
      logger.error(`❌ Failed to save manifest: ${error.message}`);
      process.exit(1);
    }
  }

  async run(): Promise<void> {
    try {
      const requirements = await this.collectRequirements();
      const manifest = this.generateManifest(requirements);
      await this.saveManifest(manifest);
      logger.info('\n🎉 Setup complete! Run `npm run agent:apply` to apply these settings to your project.');
    } catch (error: any) {
      logger.error(`❌ Error: ${error.message}`);
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

export default AgentCLI;

