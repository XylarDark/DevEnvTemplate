# DevEnvTemplate: Quick Start Guide for Any Technology Stack

**What is DevEnvTemplate?** It's your fast-track to professional development setup. Instead of spending days configuring CI/CD, documentation, security scanning, and governance, you get a complete, production-ready foundation in minutes. It works with any programming language, framework, or deployment target.

**Why use it?** DevEnvTemplate gives your projects:
- **Professional CI/CD** with security scanning and automated testing
- **Governance guardrails** to maintain code quality and security standards
- **Documentation templates** for clear communication and onboarding
- **Cleanup automation** to keep your codebase lean and focused
- **Demo deployment** capabilities to showcase working prototypes

**For LLMs and AI agents:** This guide shows how to provide the right context so AI assistants can accelerate your development 10x by understanding your project's structure, requirements, and constraints from the start.

---

## Quick Start: 10 Minutes to Professional Setup

### Option 1: Website Flow (Recommended for Beginners)

1. **Open the website**: Visit [your-devenv-template-site.com](https://your-devenv-template-site.com)
2. **Choose your path**:
   - **Guided Flow**: Step-by-step wizard for beginners (recommended)
   - **Advanced Flow**: Full control with detailed options
3. **Describe your project**:
   - What type of app? (Web app, API, mobile, desktop, etc.)
   - What features do you need? (Authentication, database, API, etc.)
   - What technology stack? (React, Node.js, Python, Go, etc.)
   - Where will it run? (Cloud, Docker, self-hosted, etc.)
4. **Download your config**: Get `project.manifest.json` - your project's DNA
5. **Copy template files**: Add DevEnvTemplate to your project
6. **Run setup**: Execute the generated configuration

### Option 2: CLI Flow (For Power Users)

```bash
# 1. Copy DevEnvTemplate to your new project
cp -r DevEnvTemplate/* my-new-project/
cd my-new-project

# 2. Run interactive setup
npm run agent:init

# 3. Apply the generated configuration
npm run agent:apply

# 4. Add your minimal app code
# (Create Hello World or basic endpoint)

# 5. Clean up template artifacts
npm run cleanup:apply
```

**That's it!** You now have professional CI/CD, documentation, security scanning, and governance in place.

---

## Understanding the Key Concepts

### Project Manifest: Your Project's DNA

Your `project.manifest.json` is a machine-readable description of what you're building. It includes:
- **Requirements**: What type of app, features needed, technology choices
- **Derived features**: Automatically determined capabilities based on your choices
- **Rationale**: Why certain features were included

Example manifest:
```json
{
  "version": "1.0.0",
  "requirements": {
    "productType": "Web Application",
    "coreFeatures": ["Authentication/Authorization", "Web UI (Frontend)"],
    "preferredStack": "Node.js",
    "deploymentTarget": "Docker Containers"
  },
  "derived": {
    "features": ["auth", "frontend", "docker"],
    "rationale": {
      "features": "Based on your authentication and UI requirements",
      "stack": "Node.js supports both frontend and backend",
      "infrastructure": "Docker enables consistent deployment"
    }
  }
}
```

### Template Packs: Technology-Specific Blueprints

Template packs contain the actual code and configuration for specific technologies. Each pack includes:
- **Code templates** for your chosen stack
- **Configuration files** (package.json, dockerfiles, etc.)
- **Cleanup rules** to remove unused code
- **CI/CD workflows** for automated testing and deployment

### Deterministic Pipeline: Predictable Results

Every DevEnvTemplate operation follows the same reliable process:
1. **Plan**: Preview exactly what will change
2. **Apply**: Execute the planned changes safely
3. **Verify**: Confirm everything works as expected
4. **Rollback**: Undo changes if something goes wrong

### Cleanup Rules: Keep Your Codebase Lean

As your project evolves, cleanup rules automatically remove:
- Unused dependencies for features you didn't select
- Template placeholder code
- Configuration for technologies you're not using
- Outdated documentation sections

### Policy Gates: Quality and Security Guardrails

Before your code gets merged, policy gates check:
- **License compliance**: Only approved open-source licenses
- **Security vulnerabilities**: No known security issues in dependencies
- **Code quality**: Tests pass, linting clean, no secrets committed
- **Bundle size**: Stay within performance budgets

---

## Optimal Usage with LLMs and AI Agents

### Why Context Matters

When working with AI assistants, providing the right context prevents wasted time and ensures high-quality results. DevEnvTemplate gives you structured context that LLMs understand immediately.

### Essential Context to Provide

**Always include these files when briefing an AI agent:**

1. **`project.manifest.json`** - Your project's requirements and constraints
2. **Key spec files** from `docs/specs/`:
   - `project-definition-schema-v1.md` - How manifests work
   - `cleanup-rules-dsl.md` - How cleanup automation works
   - `policy-gates-spec.md` - What quality checks apply

3. **Relevant docs**:
   - `docs/engineering-handbook.md` - Code standards and principles
   - `.github/SECURITY.md` - Security requirements and practices

### Agent Briefing Template

```
You are helping develop a project using DevEnvTemplate. Here's the essential context:

PROJECT REQUIREMENTS: [Attach project.manifest.json]
TECHNOLOGY STANDARDS: See docs/engineering-handbook.md
QUALITY GATES: See docs/specs/policy-gates-spec.md
CLEANUP RULES: See docs/specs/cleanup-rules-dsl.md

Key instructions:
- Follow the schema in project-definition-schema-v1.md for any config changes
- Use cleanup rules to remove unused code (don't leave template artifacts)
- Ensure all changes pass policy gates (no secrets, license compliance, etc.)
- Maintain the existing governance and CI/CD setup
- Write deterministic, testable code following SOLID principles

Specific task: [Describe what you need help with]
```

### Common Agent Workflows

#### Adding a New Feature

```
Context: [project.manifest.json + relevant specs]

I need to add [FEATURE] to my [STACK] application. Please:

1. Check if this requires updating project.manifest.json
2. Generate the code following our engineering standards
3. Ensure it integrates with existing cleanup rules
4. Verify it passes all policy gates
5. Update documentation if needed

Deliverables: Code changes + any manifest updates + test coverage
```

#### Debugging Issues

```
Context: [project.manifest.json + error logs]

I'm getting [ERROR] in my [STACK] app. The error occurs when [CONDITIONS].

Debugging context:
- Project setup: [How you initialized the project]
- Recent changes: [What you modified]
- Environment: [Local dev vs CI vs production]

Please help identify the root cause and provide a fix that:
- Follows our cleanup rules (no unused code)
- Maintains policy compliance
- Includes appropriate error handling
```

#### Optimizing Performance

```
Context: [project.manifest.json + performance metrics]

My [STACK] application has [PERFORMANCE ISSUE]. Current metrics:
- [Bundle size, load times, etc.]

Please optimize by:
- Following our bundle size limits from policy gates
- Using appropriate cleanup rules to remove dead code
- Maintaining code quality standards
- Providing before/after metrics
```

---

## Step-by-Step Implementation

### Step 1: Define Your Project (Manifest Creation)

**Using the Website (Easiest):**
1. Go to the DevEnvTemplate website
2. Choose Guided or Advanced flow
3. Answer questions about your project
4. Download `project.manifest.json`

**Using CLI (Advanced):**
```bash
npm run agent:init
# Follow interactive prompts
```

**Manual Creation (Expert):**
Create `project.manifest.json` following the schema in `docs/specs/project-definition-schema-v1.md`

### Step 2: Set Up Your Repository

```bash
# Create new repository
mkdir my-awesome-project
cd my-awesome-project
git init

# Add DevEnvTemplate foundation
cp -r /path/to/DevEnvTemplate/* ./
git add .
git commit -m "chore: initialize project with DevEnvTemplate"
```

### Step 3: Configure for Your Project

```bash
# Apply your manifest configuration
npm run agent:apply

# Or configure manually based on manifest
```

### Step 4: Add Your Application Code

Create a minimal working version of your app:

**Web Application:**
```javascript
// src/app.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
```

**Test:**
```javascript
// tests/app.test.js
const request = require('supertest');
const app = require('../src/app');

test('health endpoint returns ok', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
  expect(response.body.status).toBe('ok');
});
```

### Step 5: Clean Up Template Code

```bash
# Preview what will be removed
npm run cleanup:dry-run

# Apply cleanup (removes unused template code)
npm run cleanup:apply
```

### Step 6: Verify Everything Works

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build if applicable
npm run build

# Start locally
npm start
```

### Step 7: Enable CI/CD

DevEnvTemplate includes GitHub Actions workflows that:
- Run tests and linting on every push
- Validate your manifest configuration
- Check for security vulnerabilities
- Ensure cleanup rules are followed
- Scan for secrets and license compliance

The workflows run in "report-only" mode initially, so they won't block your development.

### Step 8: Create Your First Pull Request

```bash
# Create feature branch
git checkout -b feat/initial-setup

# Make your changes
git add .
git commit -m "feat: initial project setup with DevEnvTemplate"

# Push and create PR
git push origin feat/initial-setup
```

Your PR will automatically run all quality checks and provide feedback on any issues.

---

## Best Practices for Maximum Benefit

### Development Workflow

1. **Always start with a manifest** - Define requirements first, then build
2. **Use dry-run mode** - Preview changes before applying them
3. **Commit frequently** - Small, focused commits with clear messages
4. **Run cleanup regularly** - Keep your codebase lean as features evolve
5. **Review policy gate feedback** - Address warnings before they become blocking

### AI Agent Integration

1. **Provide complete context** - Include manifest + relevant specs every time
2. **Use structured prompts** - Follow the templates above for consistent results
3. **Validate outputs** - Always run tests and linting after AI-generated code
4. **Review cleanup impact** - Ensure AI changes work with your cleanup rules
5. **Maintain governance** - AI code must still pass policy gates

### Team Collaboration

1. **Standardize manifest creation** - Use the website for consistent project definitions
2. **Share cleanup rules** - Document custom rules for team knowledge
3. **Review policy configurations** - Ensure team alignment on quality standards
4. **Document exceptions** - Track approved deviations from standards

---

## Troubleshooting Common Issues

### Manifest Validation Errors

**Problem:** `project.manifest.json` fails validation
**Solution:**
- Check against `docs/specs/project-definition-schema-v1.md`
- Use the website to generate valid manifests
- Validate with: `npm run validate-manifest`

### Cleanup Removes Important Code

**Problem:** Cleanup rules removed code you needed
**Solution:**
- Update your manifest to include the required features
- Re-run `npm run agent:apply` to regenerate cleanup configuration
- Create custom cleanup rules if needed

### CI/CD Pipeline Fails

**Problem:** GitHub Actions workflows failing
**Solution:**
- Check the workflow logs for specific error messages
- Ensure all required files are present (package.json, etc.)
- Verify your manifest is valid
- Run locally first: `npm run lint && npm test && npm run build`

### Policy Gates Blocking Deployment

**Problem:** Security or quality checks failing
**Solution:**
- Review the specific policy violation in CI logs
- Fix security vulnerabilities by updating dependencies
- Address code quality issues (linting, test coverage)
- For temporary exceptions, document rationale and get approval

### Dependencies Not Installing

**Problem:** `npm install` fails in CI
**Solution:**
- Check Node.js version compatibility
- Verify package.json syntax
- Ensure no conflicting dependency versions
- Use `npm ls` to debug dependency trees

---

## Advanced Features

### Custom Cleanup Rules

Create technology-specific cleanup rules in `cleanup.config.yaml`:

```yaml
rules:
  - name: remove-unused-react-components
    conditions:
      - feature: "!Web UI (Frontend)"
    actions:
      - type: delete
        pattern: "src/components/*.tsx"
```

### Policy Gate Configuration

Customize quality standards in CI environment variables:

```bash
# Allow larger bundles for data-heavy apps
BUNDLE_SIZE_LIMIT=10MB

# Require higher test coverage for critical systems
MIN_TEST_COVERAGE=90

# Strict license checking
LICENSE_POLICY=strict
```

### Demo Deployment

For quick prototyping, DevEnvTemplate can create deployable demos:

```bash
# Generate demo bundle
npm run demo:create

# Deploy to platform (Docker, Vercel, Netlify, etc.)
npm run demo:deploy -- --platform=docker
```

---

## Resources and References

- **Engineering Handbook**: `docs/engineering-handbook.md` - Code standards and principles
- **Security Policy**: `.github/SECURITY.md` - Security requirements and reporting
- **Technical Specs**: `docs/specs/` - Detailed technical specifications
- **Checklists**: `docs/checklists/` - Code review and release checklists
- **Website**: Interactive project configuration tool

---

## Getting Help

- **Documentation**: Check `docs/` folder for detailed guides
- **Issues**: Use GitHub issues for bugs and feature requests
- **Security**: See `.github/SECURITY.md` for vulnerability reporting
- **Community**: Join discussions for implementation tips

DevEnvTemplate transforms development from tedious setup to focused creation. By providing structured context to AI agents and following these practices, you'll deliver higher quality software faster while maintaining professional standards.
