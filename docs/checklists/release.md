# Release Checklist

Use this checklist to ensure releases are prepared and deployed safely.

## Pre-Release

- [ ] **Version Bumped**: Version number updated in appropriate files
- [ ] **Changelog Updated**: CHANGELOG.md reflects all changes
- [ ] **Dependencies Updated**: All dependencies checked for security updates
- [ ] **Breaking Changes**: Documented with migration guides if present
- [ ] **Deprecation Notices**: Added for features to be removed

## Testing

- [ ] **Unit Tests**: All tests pass
- [ ] **Integration Tests**: All integration tests pass (if applicable)
- [ ] **E2E Tests**: End-to-end tests pass (if applicable)
- [ ] **Website Smoke Tests**: Guided and Advanced onboarding flows work (basic happy path)
- [ ] **Performance Tests**: Performance budgets met
- [ ] **Security Tests**: Security scans pass
- [ ] **Accessibility Tests**: A11y checks pass (if applicable)
- [ ] **Playwright Tests**: Website E2E tests pass in CI

## Documentation

- [ ] **README Updated**: Installation and usage instructions current
- [ ] **API Documentation**: Generated and published (if applicable)
- [ ] **Migration Guides**: Provided for breaking changes
- [ ] **Release Notes**: Clear summary of changes and impact
- [ ] **Upgrade Guide**: Step-by-step upgrade instructions

## Code Quality

- [ ] **Linting**: All code passes linting rules
- [ ] **Code Coverage**: Minimum coverage requirements met
- [ ] **Security Scan**: No high/critical vulnerabilities
- [ ] **License Compliance**: All dependencies properly licensed
- [ ] **Code Review**: All changes reviewed and approved
- [ ] **SBOM Generated**: CycloneDX SBOM created successfully
- [ ] **Dead Code Check**: `ts-prune` and `depcheck` clean results
- [ ] **Quality Gates**: `npm run deploy:prepare` succeeds

## Build & Packaging

- [ ] **Build Successful**: Clean build with no errors/warnings
- [ ] **Website Build**: `npm run build` succeeds in `website/` directory
- [ ] **TypeScript Check**: `tsc --noEmit` passes for website
- [ ] **Linting**: ESLint passes for website code
- [ ] **Artifacts Generated**: All required build artifacts created
- [ ] **Package Integrity**: Package can be installed/tested
- [ ] **Signatures**: Release artifacts signed (if applicable)
- [ ] **Size Checks**: Package size within expected limits
- [ ] **Budget Compliance**: Builds meet `config/quality-budgets.json` limits
- [ ] **Provider Selection**: Deployment provider documented and configured

## Deployment

- [ ] **Deployment Plan**: Clear deployment strategy documented
- [ ] **Rollback Plan**: Safe rollback procedure tested
- [ ] **Database Migrations**: Schema changes tested and reversible
- [ ] **Environment Config**: All required environment variables documented
- [ ] **Feature Flags**: New features behind flags if needed

## Staging Verification

- [ ] **Staging Deploy**: Successfully deployed to staging environment
- [ ] **Smoke Tests**: Basic functionality verified in staging
- [ ] **Integration Tests**: External integrations tested
- [ ] **Performance Tests**: Performance verified in staging
- [ ] **Security Tests**: Security verified in staging

## Communications

- [ ] **Team Notification**: Development team informed of release
- [ ] **Stakeholder Review**: Key stakeholders reviewed changes
- [ ] **Customer Communication**: Customer-facing changes communicated
- [ ] **Support Team**: Support team prepared for new version
- [ ] **Marketing**: Marketing materials updated if needed

## Go/No-Go Decision

- [ ] **Release Manager**: Release manager identified and available
- [ ] **Go Criteria Met**: All go criteria satisfied
- [ ] **No Critical Issues**: No critical bugs or security issues
- [ ] **Business Approval**: Business stakeholders approve release
- [ ] **Technical Approval**: Technical leads approve release

## Post-Release

- [ ] **Production Deploy**: Successfully deployed to production
- [ ] **Health Checks**: Application health verified in production
- [ ] **Monitoring**: Application monitoring active and alerting
- [ ] **Logs**: Application logs accessible and searchable
- [ ] **Backups**: Data backups verified before deployment

## Follow-up

- [ ] **User Feedback**: Monitor user feedback and support tickets
- [ ] **Metrics Review**: Key metrics monitored post-release
- [ ] **Incident Response**: Incident response plan ready if needed
- [ ] **Hotfix Process**: Hotfix deployment process verified
- [ ] **Next Release Planning**: Start planning for next release

## Retrospective

- [ ] **Release Retrospective**: Conduct post-release review
- [ ] **Lessons Learned**: Document what went well and what didn't
- [ ] **Process Improvements**: Identify and implement process improvements
- [ ] **Tooling Updates**: Update tooling based on release experience
- [ ] **Documentation Updates**: Update release documentation

## Emergency Contacts

**Release Manager**: [Name] [Contact]
**On-call Engineer**: [Name] [Contact]
**DevOps Lead**: [Name] [Contact]
**Security Lead**: [Name] [Contact]

## Rollback Procedures

**Database Rollback**: [Procedure]
**Application Rollback**: [Procedure]
**Data Recovery**: [Procedure]
**Communication Plan**: [Procedure]
