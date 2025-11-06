#!/usr/bin/env node

/**
 * Validation script for project.manifest.json
 * Uses JSON Schema validation to ensure manifest conforms to expected structure
 */

const fs = require('fs');
const path = require('path');

class ManifestValidator {
  constructor() {
    this.schema = null;
  }

  loadSchema() {
    const schemaPath = path.join(__dirname, '../../schemas/project.manifest.schema.json');
    try {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load schema: ${error.message}`);
      return false;
    }
  }

  // Simple JSON Schema validator (basic implementation)
  // For production, consider using a full JSON Schema library like ajv
  validate(manifest) {
    const errors = [];

    // Check required properties
    const required = this.schema.required || [];
    for (const prop of required) {
      if (!(prop in manifest)) {
        errors.push(`Missing required property: ${prop}`);
      }
    }

    // Validate version format
    if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      errors.push('Version must be in semver format (x.y.z)');
    }

    // Validate generatedAt format
    if (manifest.generatedAt && !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(manifest.generatedAt)) {
      errors.push('generatedAt must be ISO 8601 date-time format');
    }

    // Validate requirements
    if (manifest.requirements) {
      const req = manifest.requirements;
      const reqRequired = ['productType', 'coreFeatures', 'preferredStack', 'deploymentTarget',
                          'testingLevel', 'governanceSensitivity', 'needsCI', 'needsDocker',
                          'needsMonitoring', 'teamSize'];

      for (const prop of reqRequired) {
        if (!(prop in req)) {
          errors.push(`Missing required requirements property: ${prop}`);
        }
      }

      // Validate enums
      const enums = {
        productType: ["Web Application", "API/Microservices", "Mobile App", "Desktop Application",
                     "Library/SDK", "CLI Tool", "Other"],
        preferredStack: ["Node.js", "Python", "Go", "C#/.NET", "Java", "Frontend (React/Vue/Angular)",
                        "Full-stack (MERN/MEAN/etc.)", "Other"],
        deploymentTarget: ["Cloud (AWS/GCP/Azure)", "Self-hosted (VPS/Dedicated)", "Docker Containers",
                          "Kubernetes", "Serverless", "Static Hosting (Netlify/Vercel)", "Hybrid"],
        testingLevel: ["Unit tests only", "Unit + Integration tests", "Unit + Integration + E2E tests",
                      "Comprehensive testing (including performance/load tests)",
                      "Minimal testing (just enough to deploy)"],
        governanceSensitivity: ["Standard (basic security, some compliance)",
                              "High (financial/healthcare data, strict compliance)",
                              "Enterprise (audit trails, advanced security)",
                              "Public sector (government standards)",
                              "None (personal/hobby project)"],
        teamSize: ["Solo developer", "Small team (2-5 developers)", "Medium team (6-15 developers)",
                  "Large team (16+ developers)"]
      };

      for (const [prop, allowed] of Object.entries(enums)) {
        if (req[prop] && !allowed.includes(req[prop])) {
          errors.push(`Invalid ${prop}: ${req[prop]}. Must be one of: ${allowed.join(', ')}`);
        }
      }

      // Validate coreFeatures array
      if (req.coreFeatures && Array.isArray(req.coreFeatures)) {
        const allowedFeatures = ["Authentication/Authorization", "REST API", "GraphQL API",
                                "Web UI (Frontend)", "Database Integration", "Caching",
                                "File Storage", "Real-time Features (WebSocket)",
                                "Background Jobs/Queues", "Admin Panel", "API Documentation",
                                "Monitoring/Logging", "Search Functionality", "Email/SMS Notifications"];

        const invalidFeatures = req.coreFeatures.filter(f => !allowedFeatures.includes(f));
        if (invalidFeatures.length > 0) {
          errors.push(`Invalid coreFeatures: ${invalidFeatures.join(', ')}`);
        }

        // Check for duplicates
        if (new Set(req.coreFeatures).size !== req.coreFeatures.length) {
          errors.push('coreFeatures contains duplicates');
        }
      }

      // Validate boolean fields
      const booleans = ['needsCI', 'needsDocker', 'needsMonitoring'];
      for (const prop of booleans) {
        if (req[prop] !== undefined && typeof req[prop] !== 'boolean') {
          errors.push(`${prop} must be a boolean`);
        }
      }
    }

    // Validate derived
    if (manifest.derived) {
      const derived = manifest.derived;

      if (derived.features && Array.isArray(derived.features)) {
        const allowedDerivedFeatures = [
          "auth", "api", "graphql", "frontend", "database", "cache", "storage", "websocket",
          "jobs", "admin", "docs", "monitoring", "search", "notifications", "node", "python",
          "go", "dotnet", "java", "ci", "docker", "security", "compliance", "audit",
          "unit-tests", "integration-tests", "e2e-tests", "performance-tests"
        ];

        const invalidFeatures = derived.features.filter(f => !allowedDerivedFeatures.includes(f));
        if (invalidFeatures.length > 0) {
          errors.push(`Invalid derived features: ${invalidFeatures.join(', ')}`);
        }

        // Check for duplicates
        if (new Set(derived.features).size !== derived.features.length) {
          errors.push('derived.features contains duplicates');
        }
      }
    }

    return errors;
  }

  validateFile(manifestPath) {
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      return this.validate(manifest);
    } catch (error) {
      return [`Failed to read/parse manifest: ${error.message}`];
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const manifestPath = args[0] || 'project.manifest.json';

    if (!this.loadSchema()) {
      process.exit(1);
    }

    console.log(`🔍 Validating ${manifestPath}...`);

    const errors = this.validateFile(manifestPath);

    if (errors.length === 0) {
      console.log('✅ Manifest is valid!');
      process.exit(0);
    } else {
      console.log('❌ Manifest validation failed:');
      errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }
  }
}

// CLI entry point
if (require.main === module) {
  const validator = new ManifestValidator();
  validator.run();
}

module.exports = ManifestValidator;
