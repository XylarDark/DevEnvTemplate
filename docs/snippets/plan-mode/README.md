# Cursor Plan Mode Snippets

This directory contains ready-to-use prompt templates for Cursor Plan Mode. Each template is designed for a specific type of development task and integrates with DevEnvTemplate's Context-First workflow.

## How to Use

1. Copy the content of the relevant template
2. Paste it into Cursor Plan Mode (Cmd/Ctrl + Shift + P → "Plan Mode")
3. Replace the bracketed placeholders with your specific details
4. Add any additional context specific to your task

## Available Templates

### Core Development Tasks
- **feature-implementation.md** - New feature development
- **api-endpoint.md** - REST API endpoint creation
- **ui-component.md** - React/TypeScript component development
- **database-schema.md** - Database schema changes
- **refactoring.md** - Code refactoring tasks

### Quality & Maintenance
- **bug-fix.md** - Bug fixes and patches
- **performance-optimization.md** - Performance improvements
- **accessibility-improvement.md** - A11y compliance updates
- **security-patch.md** - Security vulnerability fixes

### Infrastructure & Configuration
- **ci-cd-update.md** - CI/CD pipeline modifications
- **dependency-update.md** - Package/library updates
- **configuration-change.md** - Config file modifications

## Template Structure

Each template includes:
- **Context Section** - Problem statement, goals, constraints
- **Requirements** - Technical and quality standards
- **Success Criteria** - Measurable outcomes
- **DevEnvTemplate Integration** - Commands and validation steps

## Integration with Context-First

These templates work best when used with a Context Contract:

```bash
# Create context contract first
npm run agent:questions -c my-task.json --interactive

# Then use the appropriate Plan Mode template
# (Paste template content into Plan Mode)

# Generate the final implementation prompt
npm run agent:prompt -c my-task.json -p plans/my-task-plan.md
```

## Customization

Templates are designed to be starting points. Modify them based on:
- Project complexity
- Technology stack specifics
- Team conventions
- Organizational requirements

## Contributing

Add new templates by:
1. Creating a new `.md` file in this directory
2. Following the established structure
3. Including all required sections
4. Adding appropriate usage notes
