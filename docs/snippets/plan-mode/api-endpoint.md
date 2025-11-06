# API Endpoint Implementation Plan Template

## API Endpoint Overview

**Endpoint:** [HTTP Method] [Path]

**Purpose:** [What this endpoint does]

**Context Contract ID:** [Link to context-contract.json]

## Problem Statement

[What requirement or user need drives this API endpoint? What problem does it solve?]

## Goals

- [ ] Endpoint responds correctly to valid requests
- [ ] Proper error handling for invalid requests
- [ ] Appropriate response codes and formats
- [ ] Input validation and sanitization
- [ ] Performance meets requirements

## API Specification

### Request
```
Method: [GET/POST/PUT/DELETE/PATCH]
Path: [API path with parameters]
Headers:
  - Content-Type: application/json
  - Authorization: Bearer [token format]

Body: [JSON schema for request body]
```

### Response
```json
{
  "success": true,
  "data": {
    [Response data structure]
  },
  "meta": {
    [Pagination, timestamps, etc.]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      [Additional error information]
    }
  }
}
```

## Constraints

- **Authentication:** [Required/Optional] - [Method]
- **Authorization:** [Role/permission requirements]
- **Rate Limiting:** [Requests per minute/hour]
- **Data Validation:** [Schema validation requirements]
- **Performance:** [Response time targets]

## Impact Analysis

**Predicted Files to Change:**
- `src/routes/[endpoint].ts` - Main endpoint handler
- `src/controllers/[controller].ts` - Business logic
- `src/services/[service].ts` - Data access layer
- `src/middleware/validation.ts` - Input validation
- `tests/api/[endpoint].test.ts` - API tests

**Risk Level:** [High/Medium/Low] - [Database changes, breaking changes, etc.]

## Requirements

### Functional Requirements
- [ ] Endpoint accepts correct request format
- [ ] Returns proper response format
- [ ] Handles all specified HTTP methods
- [ ] Validates input data
- [ ] Returns appropriate error responses

### Technical Requirements
- [ ] Follow REST API conventions
- [ ] Include comprehensive TypeScript types
- [ ] Add input/output validation schemas
- [ ] Implement proper error handling
- [ ] Write comprehensive API tests
- [ ] Include API documentation

### Security Requirements
- [ ] Input sanitization and validation
- [ ] Authentication check (if required)
- [ ] Authorization check (if required)
- [ ] Rate limiting (if applicable)
- [ ] No sensitive data in logs

## Implementation Plan

### Phase 1: API Design & Setup
1. **Task 1:** Define request/response schemas - [30m]
   - Acceptance Criteria: OpenAPI/Swagger spec complete
   - Dependencies: API design approval

2. **Task 2:** Set up route handler - [30m]
   - Acceptance Criteria: Basic endpoint responds
   - Dependencies: Route setup

### Phase 2: Core Implementation
3. **Task 3:** Implement input validation - [45m]
4. **Task 4:** Implement business logic - [1h]
5. **Task 5:** Implement error handling - [30m]

### Phase 3: Testing & Documentation
6. **Task 6:** Write API tests - [1h]
7. **Task 7:** Update API documentation - [30m]
8. **Task 8:** Integration testing - [45m]

## Success Metrics

- [ ] Endpoint responds to all documented request types
- [ ] All response codes work correctly
- [ ] Error messages are helpful and secure
- [ ] API tests pass with >95% coverage
- [ ] Documentation is complete and accurate

## Testing Strategy

### Unit Tests
- Input validation logic
- Business logic functions
- Error handling paths

### Integration Tests
- End-to-end API call testing
- Database interaction testing
- Authentication/authorization testing

### Performance Tests
- Response time under load
- Memory usage monitoring
- Rate limiting verification

## Security Considerations

- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection (if state-changing)
- [ ] Sensitive data not logged
- [ ] Proper CORS configuration

## Rollback Strategy

**If API causes issues:**
1. Route returns 503 Service Unavailable
2. Rollback deployment
3. Notify API consumers
4. Provide alternative endpoint if critical

## DevEnvTemplate Commands

```bash
# Create context contract
npm run agent:questions -c api-endpoint.json --interactive

# Analyze impact
npm run agent:impact -c api-endpoint.json

# Generate implementation prompt
npm run agent:prompt -c api-endpoint.json -p plans/api-endpoint-plan.md

# Run quality checks
# Quality gates validated automatically in CI
```

## Timeline

- **Design Complete:** [Date]
- **Implementation Start:** [Date]
- **API Ready:** [Date]
- **Testing Complete:** [Date]
- **Production Deploy:** [Date]

## Stakeholders

- **API Consumers:** [Teams/Systems] - [Requirements validation]
- **Security Team:** [Name] - [Security review]
- **DevOps:** [Name] - [Deployment coordination]
- **QA:** [Name] - [API testing]

## Open Questions

- [Question about request format]
- [Question about authentication method]
- [Question about rate limiting approach]
