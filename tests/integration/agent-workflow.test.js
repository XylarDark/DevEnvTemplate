/**
 * Integration Tests for Agent Workflow
 * 
 * Tests end-to-end agent workflows including:
 * - Manifest generation via CLI
 * - Manifest validation
 * - End-to-end agent flow
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const AgentCLI = require('../../scripts/agent/cli');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Agent Workflow Integration', () => {
  describe('End-to-End Manifest Generation', () => {
    test('should generate and validate manifest through full workflow', async () => {
      const cli = new AgentCLI();
      
      // Simulate user requirements
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API', 'Database Integration', 'Authentication/Authorization'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit + Integration tests',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Small team (2-5 developers)'
      };
      
      // Generate manifest
      const manifest = cli.generateManifest(requirements);
      
      // Load schema
      const schemaPath = path.join(__dirname, '../../schemas/project.manifest.schema.json');
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
      
      // Validate manifest
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const isValid = validate(manifest);
      
      if (!isValid) {
        console.log('Validation errors:', validate.errors);
      }
      
      assert.ok(isValid, 'Generated manifest should be valid');
      assert.ok(manifest.version, 'Should have version');
      assert.ok(manifest.generatedAt, 'Should have generatedAt');
      assert.ok(manifest.requirements, 'Should have requirements');
      assert.ok(manifest.derived, 'Should have derived section');
      assert.ok(manifest.derived.features.length > 0, 'Should have derived features');
    });

    test('should generate manifest with all features correctly mapped', async () => {
      const cli = new AgentCLI();
      
      const requirements = {
        productType: 'API/Microservices',
        coreFeatures: [
          'REST API',
          'GraphQL API',
          'Database Integration',
          'Caching',
          'Monitoring/Logging'
        ],
        preferredStack: 'Python',
        deploymentTarget: 'Kubernetes',
        testingLevel: 'Unit + Integration + E2E tests',
        governanceSensitivity: 'High (financial/healthcare data, strict compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: true,
        teamSize: 'Medium team (6-15 developers)'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      // Verify expected features
      const features = manifest.derived.features;
      assert.ok(features.includes('api'), 'Should have api feature');
      assert.ok(features.includes('graphql'), 'Should have graphql feature');
      assert.ok(features.includes('database'), 'Should have database feature');
      assert.ok(features.includes('cache'), 'Should have cache feature');
      assert.ok(features.includes('monitoring'), 'Should have monitoring feature');
      assert.ok(features.includes('python'), 'Should have python feature');
      assert.ok(features.includes('ci'), 'Should have ci feature');
      assert.ok(features.includes('docker'), 'Should have docker feature');
      assert.ok(features.includes('unit-tests'), 'Should have unit-tests feature');
      assert.ok(features.includes('integration-tests'), 'Should have integration-tests feature');
      assert.ok(features.includes('e2e-tests'), 'Should have e2e-tests feature');
      assert.ok(features.includes('security'), 'Should have security feature');
      assert.ok(features.includes('compliance'), 'Should have compliance feature');
    });

    test('should generate different manifests for different stacks', async () => {
      const cli = new AgentCLI();
      
      const baseRequirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API'],
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit tests only',
        governanceSensitivity: 'Standard (basic security, some compliance)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      // Generate Node.js manifest
      const nodeManifest = cli.generateManifest({
        ...baseRequirements,
        preferredStack: 'Node.js'
      });
      
      // Generate Python manifest
      const pythonManifest = cli.generateManifest({
        ...baseRequirements,
        preferredStack: 'Python'
      });
      
      // Generate Go manifest
      const goManifest = cli.generateManifest({
        ...baseRequirements,
        preferredStack: 'Go'
      });
      
      // Verify stack-specific features
      assert.ok(nodeManifest.derived.features.includes('node'), 'Node manifest should have node feature');
      assert.ok(!nodeManifest.derived.features.includes('python'), 'Node manifest should not have python feature');
      
      assert.ok(pythonManifest.derived.features.includes('python'), 'Python manifest should have python feature');
      assert.ok(!pythonManifest.derived.features.includes('node'), 'Python manifest should not have node feature');
      
      assert.ok(goManifest.derived.features.includes('go'), 'Go manifest should have go feature');
      assert.ok(!goManifest.derived.features.includes('node'), 'Go manifest should not have node feature');
    });
  });

  describe('Manifest File Operations', () => {
    test('should save manifest to file', async () => {
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
      
      // Save to temp file
      const tempFile = path.join(__dirname, '../fixtures/temp-manifest.json');
      await cli.saveManifest(manifest, tempFile);
      
      // Verify file exists and content
      const fileContent = await fs.readFile(tempFile, 'utf8');
      const loadedManifest = JSON.parse(fileContent);
      
      assert.deepStrictEqual(loadedManifest, manifest, 'Saved manifest should match generated manifest');
      
      // Clean up
      await fs.unlink(tempFile).catch(() => {});
    });
  });

  describe('Rationale Generation', () => {
    test('should generate meaningful rationale for all sections', async () => {
      const cli = new AgentCLI();
      
      const requirements = {
        productType: 'Web Application',
        coreFeatures: ['REST API', 'Database Integration'],
        preferredStack: 'Node.js',
        deploymentTarget: 'Docker Containers',
        testingLevel: 'Unit + Integration tests',
        governanceSensitivity: 'Enterprise (audit trails, advanced security)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: true,
        teamSize: 'Large team (16+ developers)'
      };
      
      const manifest = cli.generateManifest(requirements);
      const rationale = manifest.derived.rationale;
      
      assert.ok(rationale.features, 'Should have features rationale');
      assert.ok(rationale.stack, 'Should have stack rationale');
      assert.ok(rationale.infrastructure, 'Should have infrastructure rationale');
      assert.ok(rationale.governance, 'Should have governance rationale');
      assert.ok(rationale.testing, 'Should have testing rationale');
      
      // Rationales should be non-empty strings
      assert.ok(typeof rationale.features === 'string' && rationale.features.length > 0, 'Features rationale should be non-empty');
      assert.ok(typeof rationale.stack === 'string' && rationale.stack.length > 0, 'Stack rationale should be non-empty');
      assert.ok(typeof rationale.infrastructure === 'string' && rationale.infrastructure.length > 0, 'Infrastructure rationale should be non-empty');
      assert.ok(typeof rationale.governance === 'string' && rationale.governance.length > 0, 'Governance rationale should be non-empty');
      assert.ok(typeof rationale.testing === 'string' && rationale.testing.length > 0, 'Testing rationale should be non-empty');
    });
  });

  describe('Edge Cases', () => {
    test('should handle minimal requirements', async () => {
      const cli = new AgentCLI();
      
      const requirements = {
        productType: 'CLI Tool',
        coreFeatures: [],
        preferredStack: 'Go',
        deploymentTarget: 'Self-hosted (VPS/Dedicated)',
        testingLevel: 'Minimal testing (just enough to deploy)',
        governanceSensitivity: 'None (personal/hobby project)',
        needsCI: false,
        needsDocker: false,
        needsMonitoring: false,
        teamSize: 'Solo developer'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      // Load schema
      const schemaPath = path.join(__dirname, '../../schemas/project.manifest.schema.json');
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
      
      // Validate manifest
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const isValid = validate(manifest);
      assert.ok(isValid, 'Minimal manifest should still be valid');
      
      // Should still have basic features
      assert.ok(manifest.derived.features.includes('go'), 'Should have go feature');
    });

    test('should handle maximal requirements', async () => {
      const cli = new AgentCLI();
      
      const requirements = {
        productType: 'Web Application',
        coreFeatures: [
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
        ],
        preferredStack: 'Full-stack (MERN/MEAN/etc.)',
        deploymentTarget: 'Kubernetes',
        testingLevel: 'Comprehensive testing (including performance/load tests)',
        governanceSensitivity: 'Enterprise (audit trails, advanced security)',
        needsCI: true,
        needsDocker: true,
        needsMonitoring: true,
        teamSize: 'Large team (16+ developers)'
      };
      
      const manifest = cli.generateManifest(requirements);
      
      // Load schema
      const schemaPath = path.join(__dirname, '../../schemas/project.manifest.schema.json');
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
      
      // Validate manifest
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      
      const isValid = validate(manifest);
      assert.ok(isValid, 'Maximal manifest should be valid');
      
      // Should have many features
      assert.ok(manifest.derived.features.length > 10, 'Should have many features');
    });
  });
});

