/**
 * Unit Tests for Agent CLI
 * 
 * Tests the interactive CLI that generates project manifests including:
 * - Manifest generation from requirements
 * - Feature mapping logic
 * - Validation of generated manifests
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const AgentCLI = require('../../scripts/agent/cli');

describe('AgentCLI', () => {
  describe('Manifest Generation', () => {
    test('should generate valid manifest from basic requirements', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API', 'Database Integration'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit + Integration tests',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Small team (2-5 developers)'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.strictEqual(manifest.version, '1.0.0', 'Should have version 1.0.0');
      assert.ok(manifest.generatedAt, 'Should have generatedAt timestamp');
      assert.ok(manifest.requirements, 'Should have requirements section');
      assert.ok(manifest.derived, 'Should have derived section');
    });

    test('should include all requirement fields in manifest', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'API/Microservices',
        coreFeatures: ['REST API'],
        preferredStack: 'Python',
        deploymentTarget: 'Cloud (AWS/GCP/Azure)',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'None (personal/hobby project)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.deepStrictEqual(manifest.requirements, requirements, 'Manifest should contain all requirements');
    });
  });

  describe('Feature Mapping', () => {
    test('should map REST API to api feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('api'), 'Should include api feature');
    });

    test('should map Authentication/Authorization to auth feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['Authentication/Authorization'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('auth'), 'Should include auth feature');
    });

    test('should map Database Integration to database feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['Database Integration'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('database'), 'Should include database feature');
    });

    test('should map Web UI (Frontend) to frontend feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['Web UI (Frontend)'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('frontend'), 'Should include frontend feature');
    });

    test('should map multiple features correctly', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API', 'Database Integration', 'Authentication/Authorization'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('api'), 'Should include api feature');
      assert.ok(manifest.derived.features.includes('database'), 'Should include database feature');
      assert.ok(manifest.derived.features.includes('auth'), 'Should include auth feature');
    });
  });

  describe('Stack Mapping', () => {
    test('should map Node.js stack to node feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('node'), 'Should include node feature');
    });

    test('should map Python stack to python feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'API/Microservices',
        coreFeatures: [],
        preferredStack: 'Python',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('python'), 'Should include python feature');
    });

    test('should map Go stack to go feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'API/Microservices',
        coreFeatures: [],
        preferredStack: 'Go',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('go'), 'Should include go feature');
    });
  });

  describe('Infrastructure Mapping', () => {
    test('should map needsCI to ci feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('ci'), 'Should include ci feature');
    });

    test('should map needsDocker to docker feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: false,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('docker'), 'Should include docker feature');
    });

    test('should map needsMonitoring to monitoring feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: true,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('monitoring'), 'Should include monitoring feature');
    });
  });

  describe('Testing Level Mapping', () => {
    test('should map "Unit tests only" to unit-tests feature', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('unit-tests'), 'Should include unit-tests feature');
    });

    test('should map "Unit + Integration tests" to both features', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit + Integration tests',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('unit-tests'), 'Should include unit-tests feature');
      assert.ok(manifest.derived.features.includes('integration-tests'), 'Should include integration-tests feature');
    });

    test('should map "Unit + Integration + E2E tests" to all test features', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit + Integration + E2E tests',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('unit-tests'), 'Should include unit-tests feature');
      assert.ok(manifest.derived.features.includes('integration-tests'), 'Should include integration-tests feature');
      assert.ok(manifest.derived.features.includes('e2e-tests'), 'Should include e2e-tests feature');
    });
  });

  describe('Governance Mapping', () => {
    test('should map High governance to security and compliance features', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'High (financial/healthcare data, strict compliance)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('security'), 'Should include security feature');
      assert.ok(manifest.derived.features.includes('compliance'), 'Should include compliance feature');
    });

    test('should map Enterprise governance to security, audit, and compliance features', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Enterprise (audit trails, advanced security)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.features.includes('security'), 'Should include security feature');
      assert.ok(manifest.derived.features.includes('audit'), 'Should include audit feature');
      assert.ok(manifest.derived.features.includes('compliance'), 'Should include compliance feature');
    });
  });

  describe('Rationale Generation', () => {
    test('should include rationale in derived section', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      assert.ok(manifest.derived.rationale, 'Should have rationale');
      assert.ok(manifest.derived.rationale.features, 'Should have features rationale');
      assert.ok(manifest.derived.rationale.stack, 'Should have stack rationale');
      assert.ok(manifest.derived.rationale.infrastructure, 'Should have infrastructure rationale');
      assert.ok(manifest.derived.rationale.governance, 'Should have governance rationale');
      assert.ok(manifest.derived.rationale.testing, 'Should have testing rationale');
    });
  });

  describe('Feature Uniqueness', () => {
    test('should not duplicate features in derived list', () => {
      const cli = new AgentCLI();
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API', 'GraphQL API'], // Both might map to similar features
        preferredStack: 'Full-stack (MERN/MEAN/etc.)', // Maps to node and frontend
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      const features = manifest.derived.features;
      
      // Check for duplicates
      const uniqueFeatures = [...new Set(features)];
      assert.strictEqual(features.length, uniqueFeatures.length, 'Should not have duplicate features');
    });
  });
});

