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
- [ ] **Server/Client Boundaries**: No server-only modules (fs, path) used in "use client" files
- [ ] **Cross-Shell Safe**: Scripts and docs avoid && chaining; use npm scripts or separate commands
- [ ] **GitHub Ecosystem**: Documentation links correctly reference `.github/*` paths
- [ ] **Import Boundaries**: Imports respect `import/no-internal-modules` rules; no internal module access
- [ ] **Path Resolution**: Uses `scripts/utils/path-resolver.js` instead of hardcoded old paths
- [ ] **CSP Integrity**: Content Security Policy remains secure; no unsafe directives added

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
- [ ] **Repository Layout**: Changes maintain clean folder structure (`config/`, `packs/`, `scripts/`, `.github/`)
- [ ] **Migration Policy**: Dual-path loaders used appropriately; old paths removed after stabilization

## Security

- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Authentication**: Proper auth checks where needed
- [ ] **Authorization**: Appropriate access controls
- [ ] **Secrets**: No credentials or secrets committed
- [ ] **Dependencies**: No vulnerable dependencies introduced

## Next.js/Web Development

- [ ] **Schema Sourcing**: Options/data supplied via API routes or build-time copy, not fs in client bundles
- [ ] **Website Builds**: Website builds cleanly and typechecks without errors
- [ ] **External Imports**: No imports outside website/ directory unless experimental.externalDir enabled
- [ ] **Client Boundaries**: Client components properly marked with "use client" directive

## Accessibility (if UI)

- [ ] **Keyboard Navigation**: All interactive elements keyboard accessible
- [ ] **Screen Readers**: Proper ARIA labels and semantic HTML
- [ ] **Color Contrast**: Sufficient contrast ratios maintained
- [ ] **Focus Management**: Logical focus order and visible focus indicators
- [ ] **Alt Text**: Images have appropriate alternative text
- [ ] **Labels Required**: All form inputs have associated labels with proper for/id relationships

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
