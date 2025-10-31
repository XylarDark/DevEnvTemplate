# Code Review Checklist

Use this checklist during code review to ensure quality and consistency.

## General

- [ ] **Purpose Clear**: Changes have clear purpose and rationale
- [ ] **Scope Appropriate**: Changes are focused and not overly broad
- [ ] **Documentation**: Code is well-documented with comments where needed
- [ ] **Tests**: Appropriate tests added/updated for changes
- [ ] **Naming**: Variables, functions, classes use clear, descriptive names

## Code Quality

- [ ] **Readability**: Code is easy to read and understand
- [ ] **Maintainability**: Code follows project patterns and conventions
- [ ] **Performance**: No obvious performance issues or regressions
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Error Handling**: Proper error handling and edge cases covered

## Architecture

- [ ] **Design**: Changes align with overall system architecture
- [ ] **Dependencies**: No unnecessary dependencies added
- [ ] **Modularity**: Code is appropriately modular and reusable
- [ ] **Separation of Concerns**: Responsibilities are properly separated

## Testing

- [ ] **Unit Tests**: Core functionality has unit tests
- [ ] **Integration Tests**: Component interactions tested (if applicable)
- [ ] **Edge Cases**: Error conditions and edge cases covered
- [ ] **Test Coverage**: Test coverage maintained or improved
- [ ] **Test Quality**: Tests are meaningful and not just checking implementation

## Governance Compliance

- [ ] **Rules Followed**: Changes follow `.projectrules` guidelines
- [ ] **Scope Gate**: Appropriate for change scope (see PR template)
- [ ] **Performance Budget**: No significant budget violations (if applicable)
- [ ] **Breaking Changes**: Documented if present

## Security

- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Authentication**: Proper auth checks where needed
- [ ] **Authorization**: Appropriate access controls
- [ ] **Secrets**: No credentials or secrets committed
- [ ] **Dependencies**: No vulnerable dependencies introduced

## Accessibility (if UI)

- [ ] **Keyboard Navigation**: All interactive elements keyboard accessible
- [ ] **Screen Readers**: Proper ARIA labels and semantic HTML
- [ ] **Color Contrast**: Sufficient contrast ratios maintained
- [ ] **Focus Management**: Logical focus order and visible focus indicators
- [ ] **Alt Text**: Images have appropriate alternative text

## Documentation

- [ ] **README Updated**: Setup/usage docs updated if needed
- [ ] **API Docs**: Public APIs documented (if applicable)
- [ ] **Breaking Changes**: Migration guides provided
- [ ] **Examples**: Usage examples included where helpful

## Deployment/Operations

- [ ] **Backwards Compatible**: Changes don't break existing functionality
- [ ] **Migration Path**: Clear upgrade path provided
- [ ] **Rollback Plan**: Safe rollback procedure exists
- [ ] **Monitoring**: Appropriate monitoring/logging added

## Review Process

- [ ] **Self-Review**: Author has reviewed their own changes
- [ ] **Pair Review**: Changes reviewed by at least one other person
- [ ] **Automated Checks**: All CI checks passing
- [ ] **Feedback Addressed**: Review feedback incorporated

## Approval Criteria

- [ ] All automated tests pass
- [ ] Code review checklist complete
- [ ] No critical issues identified
- [ ] Appropriate approvals obtained
- [ ] Documentation updated

## Additional Notes

[Any additional context or concerns specific to this review]
