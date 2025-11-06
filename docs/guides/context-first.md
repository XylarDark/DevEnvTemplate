# Context-First Development Guide

This guide explains how to use Context Contracts, Task Slices, and Assumptions to maximize code accuracy and minimize iterations in DevEnvTemplate development.

## Overview

Context-First Development ensures that:
- Requirements are fully understood before implementation begins
- Code changes are predictable and bounded
- Assumptions are explicitly documented and validated
- Impact is assessed before touching code

## Core Concepts

### Context Contract

A Context Contract is a comprehensive document that captures all requirements, constraints, assumptions, and unknowns before any code is written. It serves as the single source of truth for a development task.

**Key Components:**
- **Problem Statement**: Clear description of what needs to be solved
- **Goals**: Specific, measurable objectives
- **Constraints**: Technical, business, and operational limitations
- **Assumptions**: Things taken for granted that need validation
- **Acceptance Tests**: How to verify the solution works
- **Unknowns**: Questions that need investigation

### Task Slice

A Task Slice is a small, self-contained unit of work with explicit boundaries. It breaks down large features into manageable, independently-implementable pieces.

**Characteristics:**
- Single responsibility
- Clear acceptance criteria
- Explicit dependencies
- Predictable effort (hours/days)
- Rollback strategy

### Assumptions Register

Assumptions are uncertainties that could affect implementation. Each assumption has an owner, confidence level, and validation plan.

**Assumption States:**
- `draft`: Newly identified
- `proposed`: Ready for review
- `approved`: Validated and approved
- `validated`: Confirmed through testing
- `invalidated`: Proved false
- `expired`: Needs revalidation

## Workflow

### Phase 1: Context Gathering

1. **Create Context Contract**
   ```bash
   # Use the website wizard or create manually
   npm run agent:questions -c context-contract.json --interactive
   ```

2. **Generate Questions**
   ```bash
   npm run agent:questions -c context-contract.json
   ```

3. **Answer Critical Questions**
   - Work through high-priority questions first
   - Validate assumptions with stakeholders
   - Research unknowns before proceeding

4. **Validate Contract**
   ```bash
   npm run agent:lint:context -c context-contract.json
   ```

### Phase 2: Planning

1. **Impact Analysis**
   ```bash
   npm run agent:impact -c context-contract.json
   ```

2. **Generate Plan**
   ```bash
   npm run agent:plan -c context-contract.json
   ```

3. **Review Plan**
   - Check acceptance criteria are testable
   - Verify effort estimates are realistic
   - Ensure dependencies are clear

4. **Open Plan-Only PR**
   - Create PR with just the plan (no code changes)
   - Get stakeholder approval
   - CI validates context completeness

### Phase 3: Implementation

1. **Assemble Context Pack**
   ```bash
   npm run agent:context -c context-contract.json
   ```

2. **Build LLM Prompt**
   ```bash
   npm run agent:prompt -c context-contract.json -p plans/plan-id.md
   ```

3. **Implement Changes**
   - Use the generated prompt with your LLM
   - Implement exactly as planned
   - Don't deviate from acceptance criteria

4. **Validate Results**
   - Run acceptance tests
   - Update assumptions register
   - Document any discoveries

## Tools and Commands

### Context Contract Management

```bash
# Generate questions for incomplete contracts
npm run agent:questions -c context-contract.json

# Validate contract completeness
npm run agent:lint:context -c context-contract.json

# Interactive contract creation
npm run agent:questions -c context-contract.json --interactive
```

### Planning Tools

```bash
# Analyze potential impact
npm run agent:impact -c context-contract.json

# Generate implementation plan
npm run agent:plan -c context-contract.json -o plans/my-plan.md

# Assemble context pack for LLM
npm run agent:context -c context-contract.json -o .contextpack
```

### LLM Integration

```bash
# Build optimized prompt
npm run agent:prompt -c context-contract.json -p plans/plan-id.md

# Include context pack in your LLM session
# The .contextpack directory contains all relevant files and metadata
```

## Best Practices

### Contract Creation

- **Start Early**: Create contracts before any code investigation
- **Be Specific**: Use concrete examples, not abstract descriptions
- **Document Assumptions**: Don't leave uncertainties unstated
- **Include Stakeholders**: Get input from all affected parties

### Task Slicing

- **Keep Small**: Tasks should be completable in 1-3 days
- **Single Responsibility**: One clear outcome per task
- **Explicit Boundaries**: Clearly define what's in/out of scope
- **Independent**: Tasks should be implementable without each other

### Assumption Management

- **Validate Early**: Don't proceed with high-impact, low-confidence assumptions
- **Assign Owners**: Every assumption needs someone responsible
- **Track State**: Update assumption status as validation occurs
- **Document Evidence**: Record what confirmed or refuted assumptions

### CI/CD Integration

- **Plan-Only Gate**: Never merge code without approved plan
- **Context Validation**: All contracts must pass linting
- **Impact Guard**: Changes must align with predicted impact
- **Assumption Tracking**: High-risk assumptions require approval

## Common Patterns

### API Endpoint Addition

**Context Contract:**
- Problem: Need to expose user preferences via REST API
- Goals: CRUD operations for user preferences
- Constraints: Must use existing auth system, <2s response time
- Assumptions: User model has preferences field

**Task Slices:**
1. Add preference fields to user model
2. Create API routes for CRUD operations
3. Add validation and error handling
4. Update API documentation

### UI Component Enhancement

**Context Contract:**
- Problem: Settings page is hard to navigate
- Goals: Reduce time to find settings by 50%
- Constraints: Must work on mobile, maintain accessibility
- Assumptions: Users primarily use search function

**Task Slices:**
1. Add search/filter to settings page
2. Reorganize settings into logical groups
3. Add keyboard navigation
4. Test with screen readers

## Troubleshooting

### Incomplete Contracts

**Problem:** Contract fails validation with missing fields
**Solution:**
1. Run `npm run agent:questions` to see what's missing
2. Fill in critical gaps first (problem, goals, acceptance tests)
3. Get stakeholder input for assumptions and constraints

### Impact Mismatch

**Problem:** Actual changes don't match impact analysis
**Solution:**
1. Update the context contract with new findings
2. Re-run impact analysis
3. Adjust plan if scope has changed significantly

### Assumption Invalidated

**Problem:** Implementation reveals false assumption
**Solution:**
1. Stop implementation immediately
2. Update assumption status to `invalidated`
3. Re-evaluate if the task is still viable
4. Update context contract and replan if needed

### Large Context Packs

**Problem:** Context pack exceeds size limits
**Solution:**
1. Break task into smaller slices
2. Focus on essential files only
3. Use documentation references instead of full files
4. Consider creating separate context packs for sub-tasks

## Integration with CI/CD

Context-First Development integrates with CI/CD through:

1. **Context Validation**: PRs with context contracts are validated for completeness
2. **Plan-Only Gate**: Code changes require approved plan-only PRs
3. **Impact Guard**: Changed files must align with impact predictions
4. **Assumption Tracking**: CI can flag unvalidated high-risk assumptions

Configure via repository variables:
- `STRICT_PLAN_GUARD=true`: Require plan-only PRs for code changes
- `IMPACT_GUARD=warn|block`: How to handle impact mismatches
- `CONTEXT_BUDGET_KB=500`: Maximum context pack size

## Metrics and Success

Track these metrics to measure Context-First effectiveness:

- **Contract Completeness**: % of contracts passing validation
- **Plan Accuracy**: % of implementations matching plans
- **Iteration Reduction**: Average number of code iterations per task
- **Time to First Valid**: Time from contract creation to working implementation
- **Assumption Hit Rate**: % of assumptions validated vs invalidated

## Resources

- [Context Contract Schema](schemas/context-contract.schema.json)
- [Task Slice Schema](schemas/task-slice.schema.json)
- [Assumption Schema](schemas/assumption.schema.json)
- [Engineering Handbook: Context-First Policy](docs/engineering-handbook.md#context-first-development)
- [Prompting Playbook](docs/guides/prompting-playbook.md)
