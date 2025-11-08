/**
 * Unit Tests for Schema Validation
 * 
 * Tests JSON schema validation for:
 * - Project manifest schema
 * - Invalid input rejection
 * 
 * Note: Context contract, task slice, and assumption schemas removed as part of
 * enterprise bloat cleanup (Phase 1.5). These were enterprise features not needed
 * for indie developers.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Schema Validation', () => {
  let ajv;

  // Set up Ajv instance before tests
  const setupAjv = () => {
    const instance = new Ajv({ allErrors: true, strict: false });
    addFormats(instance);
    return instance;
  };

  describe('Project Manifest Schema', () => {
    test('should load project manifest schema', () => {
      const schemaPath = path.join(__dirname, '../../config/schemas/project.manifest.schema.json');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      assert.ok(schema, 'Schema should load');
      assert.ok(schema.$schema, 'Schema should have $schema property');
      assert.ok(schema.properties, 'Schema should have properties');
    });

    test('should validate valid manifest', () => {
      ajv = setupAjv();
      const schemaPath = path.join(__dirname, '../../config/schemas/project.manifest.schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      const validate = ajv.compile(schema);
      
      const validManifest = {
        version: '1.0.0',
        generatedAt: '2025-01-01T00:00:00.000Z',
        requirements: {
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
        },
        derived: {
          features: ['api', 'node', 'ci', 'docker', 'unit-tests'],
          rationale: {
            features: 'Test rationale',
            stack: 'Test stack rationale',
            infrastructure: 'Test infrastructure rationale',
            governance: 'Test governance rationale',
            testing: 'Test testing rationale'
          }
        }
      };
      
      const isValid = validate(validManifest);
      assert.ok(isValid, 'Valid manifest should pass validation');
    });

    test('should reject manifest without required fields', () => {
      ajv = setupAjv();
      const schemaPath = path.join(__dirname, '../../config/schemas/project.manifest.schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      const validate = ajv.compile(schema);
      
      const invalidManifest = {
        version: '1.0.0'
        // Missing required fields
      };
      
      const isValid = validate(invalidManifest);
      assert.ok(!isValid, 'Invalid manifest should fail validation');
      assert.ok(validate.errors, 'Should have validation errors');
    });

    test('should reject manifest with invalid productType', () => {
      ajv = setupAjv();
      const schemaPath = path.join(__dirname, '../../config/schemas/project.manifest.schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      const validate = ajv.compile(schema);
      
      const invalidManifest = {
        version: '1.0.0',
        generatedAt: '2025-01-01T00:00:00.000Z',
        requirements: {
          productType: 'Invalid Type', // Not in enum
          coreFeatures: [],
          preferredStack: 'Node.js',
          deploymentTarget: 'Docker Containers',
          testingLevel: 'Unit tests only',
          governanceSensitivity: 'Standard (basic security, some compliance)',
          needsCI: true,
          needsDocker: true,
          needsMonitoring: false,
          teamSize: 'Solo developer'
        },
        derived: {
          features: [],
          rationale: {}
        }
      };
      
      const isValid = validate(invalidManifest);
      assert.ok(!isValid, 'Manifest with invalid productType should fail');
    });

    test('should reject manifest with invalid feature', () => {
      ajv = setupAjv();
      const schemaPath = path.join(__dirname, '../../config/schemas/project.manifest.schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      const validate = ajv.compile(schema);
      
      const invalidManifest = {
        version: '1.0.0',
        generatedAt: '2025-01-01T00:00:00.000Z',
        requirements: {
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
        },
        derived: {
          features: ['invalid-feature'], // Not in enum
          rationale: {}
        }
      };
      
      const isValid = validate(invalidManifest);
      assert.ok(!isValid, 'Manifest with invalid feature should fail');
    });

    test('should validate manifest from fixture', () => {
      ajv = setupAjv();
      const schemaPath = path.join(__dirname, '../../config/schemas/project.manifest.schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      const validate = ajv.compile(schema);
      
      const fixtureManifestPath = path.join(__dirname, '../fixtures/basic-node-project/project.manifest.json');
      const fixtureManifest = JSON.parse(fs.readFileSync(fixtureManifestPath, 'utf8'));
      
      const isValid = validate(fixtureManifest);
      if (!isValid) {
        console.log('Validation errors:', validate.errors);
      }
      assert.ok(isValid, 'Fixture manifest should be valid');
    });
  });

  // Schema Structure test - only for remaining schemas
  describe('Schema Structure', () => {
    test('all schemas should have required metadata', () => {
      const schemaFiles = [
        'project.manifest.schema.json',
        // context-contract, task-slice, assumption schemas removed (enterprise bloat)
      ];
      
      schemaFiles.forEach(schemaFile => {
        const schemaPath = path.join(__dirname, '../../config/schemas', schemaFile);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        
        assert.ok(schema.$schema, `${schemaFile} should have $schema`);
        assert.ok(schema.type, `${schemaFile} should have type`);
      });
    });
  });
});

