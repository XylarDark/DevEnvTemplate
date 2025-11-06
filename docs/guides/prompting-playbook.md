# LLM Prompting Playbook for DevEnvTemplate

This playbook provides structured prompt templates for maximizing accuracy when working with LLMs in DevEnvTemplate development. Follow the Question → Plan → Implement workflow to ensure high-quality, predictable results.

## Core Principles

### Context Density
- **Complete Context**: Provide all relevant information upfront
- **Token Efficiency**: Structure prompts to minimize token usage while maximizing signal
- **Progressive Disclosure**: Start broad, then focus on specifics

### Workflow Structure
1. **Question Phase**: Gather missing information
2. **Planning Phase**: Create detailed implementation plans
3. **Implementation Phase**: Execute with full context

### Quality Gates
- **Validation First**: Always validate understanding before implementing
- **Acceptance Criteria**: Define success metrics upfront
- **Error Boundaries**: Include rollback and error handling strategies

## Question Phase Templates

### Initial Context Assessment

```
You are analyzing a Context Contract for DevEnvTemplate development.

CONTEXT CONTRACT:
[Full context contract JSON]

INSTRUCTIONS:
1. Review the contract for completeness and clarity
2. Identify missing or ambiguous information
3. Generate specific questions to fill gaps
4. Prioritize questions by impact on implementation

OUTPUT FORMAT:
## Critical Questions
1. [High-impact question with rationale]
2. [Another critical question]

## High Priority Questions
1. [Medium-high impact question]
...

## Clarification Questions
1. [Low-impact clarification]
...

RESPONSE:
```

### Assumption Validation

```
You need to validate assumptions before implementation.

ASSUMPTIONS TO VALIDATE:
[List of assumptions from context contract]

CURRENT KNOWLEDGE:
[Relevant existing code/files]

VALIDATION METHODS:
- Code inspection
- Documentation review
- Stakeholder consultation
- Testing/experimentation

For each assumption, provide:
1. Validation approach
2. Expected evidence
3. Risk if assumption is wrong
4. Recommended action

RESPONSE:
```

## Planning Phase Templates

### Implementation Plan Generation

```
Create a detailed implementation plan for this DevEnvTemplate task.

CONTEXT CONTRACT: [Complete contract JSON]
ACCEPTANCE CRITERIA: [List from contract]
CONSTRAINTS: [Technical/business constraints]
ASSUMPTIONS: [Validated assumptions]

REQUIREMENTS:
1. Break down into specific, testable tasks
2. Include acceptance criteria for each task
3. Estimate effort (hours/days) with confidence levels
4. Identify dependencies and risks
5. Provide rollback strategies

OUTPUT FORMAT:
# Implementation Plan: [Title]

## Task Breakdown
### Task 1: [Specific Task]
- **Description**: [What and why]
- **Acceptance Criteria**:
  - [Specific, testable criterion]
  - [Another criterion]
- **Effort**: [X hours, confidence: high/medium/low]
- **Dependencies**: [What must be done first]
- **Risks**: [Potential issues and mitigations]

### Task 2: [Next Task]
...

## Timeline
- **Total Estimate**: [X days/hours]
- **Milestones**: [Key checkpoints]

## Success Metrics
- [How to measure success]
- [Quality indicators]

RESPONSE:
```

### Impact Analysis

```
Analyze the potential impact of this change on the DevEnvTemplate codebase.

PROPOSED CHANGE: [Description from context contract]
CURRENT CODEBASE: [Relevant files/functions/modules]
ARCHITECTURE: [Key design patterns and boundaries]

ANALYSIS REQUIREMENTS:
1. Identify files likely to be modified
2. Predict modules that will be affected
3. Assess risk of breaking changes
4. Identify testing requirements
5. Suggest monitoring/alerting needs

OUTPUT FORMAT:
## Impact Assessment

### Files to Modify
- **High Confidence**: [Files definitely affected]
- **Medium Confidence**: [Files likely affected]
- **Low Confidence**: [Files possibly affected]

### Risk Assessment
- **Breaking Changes**: [Likelihood and impact]
- **Performance Impact**: [Expected effects]
- **Security Considerations**: [Potential issues]

### Testing Strategy
- **Unit Tests**: [What to test]
- **Integration Tests**: [Cross-module testing]
- **E2E Tests**: [User journey validation]

RESPONSE:
```

## Implementation Phase Templates

### Code Generation with Context

```
Implement the following task using DevEnvTemplate patterns and standards.

TASK: [Specific task from plan]
ACCEPTANCE CRITERIA:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

CONTEXT:
- Existing Code: [Relevant current implementation]
- Architecture: [Design patterns to follow]
- Dependencies: [Modules/APIs to use]
- Constraints: [Technical limitations]

DevEnvTemplate STANDARDS:
- SOLID principles (Single Responsibility, Open/Closed, etc.)
- TypeScript strict mode
- Error handling with descriptive messages
- Accessibility compliance (WCAG guidelines)
- Performance considerations

IMPLEMENTATION REQUIREMENTS:
1. Use existing patterns and conventions
2. Include comprehensive error handling
3. Add TypeScript types for all data structures
4. Follow naming conventions from existing code
5. Include JSDoc comments for public APIs

OUTPUT FORMAT:
// File: [path/to/new/file.ts]
[code implementation]

[Explanation of key decisions and trade-offs]

RESPONSE:
```

### Refactoring with Safety

```
Refactor this code while maintaining functionality and improving quality.

ORIGINAL CODE:
[code snippet]

REFACTORING GOALS:
- [Specific improvements needed]
- [Quality metrics to achieve]

CONSTRAINTS:
- Must maintain exact same public API
- Cannot break existing functionality
- Must pass all existing tests
- Performance must not degrade

DevEnvTemplate PATTERNS:
- [Relevant patterns from codebase]
- [Error handling approaches]
- [Testing strategies]

OUTPUT FORMAT:
## Refactored Implementation

### Key Changes
- [What changed and why]
- [Benefits achieved]
- [Risks mitigated]

### Code
```typescript
[refactored code]
```

### Testing Considerations
- [Additional tests needed]
- [Edge cases to verify]

RESPONSE:
```

### Bug Fix with Root Cause

```
Fix this bug with proper root cause analysis and comprehensive solution.

BUG DESCRIPTION:
[Clear description of the issue]

CURRENT BEHAVIOR:
[What currently happens]

EXPECTED BEHAVIOR:
[What should happen]

REPRODUCTION STEPS:
[How to reproduce the issue]

ROOT CAUSE ANALYSIS:
[Suspected cause based on code inspection]

DevEnvTemplate CONTEXT:
- Related code: [affected files/functions]
- Architecture: [relevant design patterns]
- Tests: [existing test coverage]

FIX REQUIREMENTS:
1. Address root cause, not just symptoms
2. Include regression test
3. Update documentation if needed
4. Consider edge cases and error conditions

OUTPUT FORMAT:
## Bug Fix Analysis

### Root Cause
[Explanation of why this bug occurs]

### Solution
[How to fix it properly]

### Code Changes
```typescript
[fixed code]
```

### Test Coverage
```typescript
[regression test]
```

### Validation
[How to verify the fix works]

RESPONSE:
```

## Advanced Patterns

### Multi-File Changes

```
Implement this feature across multiple files with proper coordination.

FEATURE: [Description]
FILES TO MODIFY: [List of files]
COORDINATION REQUIREMENTS: [How files interact]

For each file, provide:
1. Specific changes needed
2. Dependencies on other files
3. Testing strategy

Use this format:

## File: [path/to/file1.ts]
### Changes
[Specific modifications]

### Dependencies
- Depends on [file2.ts] change X
- Requires [file3.ts] to be updated first

## File: [path/to/file2.ts]
...

RESPONSE:
```

### API Design

```
Design and implement a new API endpoint following DevEnvTemplate conventions.

API REQUIREMENTS:
- Endpoint: [URL path]
- Method: [GET/POST/PUT/DELETE]
- Input: [Request format/schema]
- Output: [Response format/schema]
- Authentication: [Required/optional]

BUSINESS LOGIC:
[What the API should do]

VALIDATION:
[Input validation rules]

ERROR HANDLING:
[Error conditions and responses]

OUTPUT FORMAT:
## API Design

### Endpoint Specification
- **URL**: [full path]
- **Method**: [HTTP method]
- **Auth**: [authentication requirements]

### Request Schema
```typescript
[TypeScript interface for request]
```

### Response Schema
```typescript
[TypeScript interface for response]
```

### Implementation
```typescript
[API route implementation]
```

### Error Responses
- `400`: [Validation error format]
- `401`: [Auth error format]
- `500`: [Server error format]

RESPONSE:
```

## Quality Assurance Templates

### Code Review Preparation

```
Prepare this code for review by identifying potential issues and improvements.

CODE TO REVIEW:
[implementation code]

CONTEXT:
- Requirements: [what it should do]
- Constraints: [limitations]
- Existing Patterns: [codebase conventions]

REVIEW FOCUS AREAS:
1. Functionality correctness
2. Code quality and maintainability
3. Performance implications
4. Security considerations
5. Testing adequacy
6. Documentation completeness

OUTPUT FORMAT:
## Code Review Preparation

### ✅ Strengths
- [Positive aspects of the implementation]
- [Good practices followed]

### ⚠️ Potential Issues
- [Areas that might need attention]
- [Edge cases to consider]

### 🔧 Suggested Improvements
- [Optional enhancements]
- [Best practice alignments]

### 🧪 Testing Recommendations
- [Additional test cases]
- [Edge case coverage]

RESPONSE:
```

### Performance Optimization

```
Optimize this code for better performance while maintaining functionality.

CURRENT IMPLEMENTATION:
[code with performance issues]

PERFORMANCE REQUIREMENTS:
- [Response time targets]
- [Resource usage limits]
- [Scalability requirements]

ANALYSIS:
1. Identify performance bottlenecks
2. Suggest optimization strategies
3. Estimate impact of changes
4. Ensure no functionality regression

OUTPUT FORMAT:
## Performance Optimization

### Current Issues
- [Specific performance problems identified]
- [Impact assessment]

### Optimization Strategy
1. **[Strategy 1]**: [Description, expected impact]
2. **[Strategy 2]**: [Description, expected impact]

### Optimized Code
```typescript
[improved implementation]
```

### Validation
- [How to measure improvement]
- [Regression testing approach]

RESPONSE:
```

## Error Handling and Recovery

### Error Boundary Implementation

```
Implement comprehensive error handling for this component/feature.

COMPONENT: [Description]
ERROR SCENARIOS:
- [Expected error conditions]
- [Unexpected failures]
- [Edge cases]

DevEnvTemplate PATTERNS:
- Error types: [standard error classes]
- Logging: [logging strategies]
- Recovery: [fallback behaviors]

OUTPUT FORMAT:
## Error Handling Strategy

### Error Types
- **[ErrorType1]**: [Description, handling strategy]
- **[ErrorType2]**: [Description, handling strategy]

### Implementation
```typescript
[error handling code]
```

### User Experience
- [How errors are communicated to users]
- [Fallback UI/behavior]

RESPONSE:
```

## Integration Patterns

### Third-Party Service Integration

```
Integrate with [Service Name] following DevEnvTemplate patterns.

SERVICE: [Service description and API]
INTEGRATION REQUIREMENTS:
- [What data to send/receive]
- [Authentication approach]
- [Error handling strategy]

DevEnvTemplate STANDARDS:
- Service layer abstraction
- Configuration management
- Retry and circuit breaker patterns
- Logging and monitoring

OUTPUT FORMAT:
## Service Integration

### Configuration
```typescript
[environment variables and config]
```

### Service Layer
```typescript
[service abstraction implementation]
```

### Integration Points
```typescript
[usage in application code]
```

### Error Handling
- [Service-specific error scenarios]
- [Retry and fallback strategies]

RESPONSE:
```

## Best Practices Summary

### Prompt Construction
1. **Start Specific**: Begin with concrete requirements, not abstract goals
2. **Provide Context**: Include relevant existing code and patterns
3. **Define Success**: Specify acceptance criteria and validation methods
4. **Include Constraints**: State technical and business limitations
5. **Request Structure**: Ask for organized output with clear sections

### Quality Verification
1. **Validate Assumptions**: Ensure all assumptions are stated and validated
2. **Check Completeness**: Verify all acceptance criteria are addressed
3. **Review Patterns**: Ensure implementation follows established conventions
4. **Test Coverage**: Include appropriate testing strategies
5. **Documentation**: Provide clear explanations and usage examples

### Iteration Management
1. **Single Responsibility**: Each prompt should address one clear task
2. **Progressive Refinement**: Start broad, then focus on details
3. **Feedback Loop**: Include validation and improvement opportunities
4. **Error Recovery**: Plan for handling unexpected issues

This playbook ensures consistent, high-quality interactions with LLMs while maximizing the effectiveness of each prompting session.
