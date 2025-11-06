---
name: Security Issue
description: Report a security vulnerability (DO NOT use for public disclosure)
title: "[SECURITY] Brief description of security issue"
labels: ["security", "vulnerability"]
assignees: []
---

<!-- IMPORTANT: Do not include any sensitive information in this public issue.
     If you have found a security vulnerability, please report it responsibly.
     See SECURITY.md for reporting guidelines. -->

## Security Issue Report

**⚠️ IMPORTANT**: This template is for tracking security issues after they've been properly reported and triaged. For initial security vulnerability reports, please follow the process in [SECURITY.md](SECURITY.md).

## Issue Classification

- [ ] **Confirmed Vulnerability**: Validated security issue
- [ ] **False Positive**: Not actually a security issue
- [ ] **Enhancement**: Security improvement opportunity
- [ ] **Question**: Security-related question or clarification needed

## Vulnerability Details

<!-- Only fill these details after the issue has been properly triaged -->

### Vulnerability Type

<!-- Select all that apply -->

- [ ] Injection (SQL, XSS, etc.)
- [ ] Broken Authentication
- [ ] Sensitive Data Exposure
- [ ] XML External Entities (XXE)
- [ ] Broken Access Control
- [ ] Security Misconfiguration
- [ ] Cross-Site Scripting (XSS)
- [ ] Insecure Deserialization
- [ ] Vulnerable Components
- [ ] Insufficient Logging & Monitoring
- [ ] Other: [specify]

### Severity

- [ ] Critical: Immediate threat to data/system security
- [ ] High: Significant security risk
- [ ] Medium: Moderate security concern
- [ ] Low: Minor security improvement needed
- [ ] Info: Security best practice recommendation

### CVSS Score

<!-- If applicable -->

CVSS v3.1 Score: [score]/10
Vector: [CVSS vector string]

## Impact Assessment

### Affected Components

- [ ] Frontend/Web Interface
- [ ] API/Backend Services
- [ ] Database
- [ ] Authentication System
- [ ] File Upload/Storage
- [ ] Third-party Integrations
- [ ] Other: [specify]

### Data Exposure Risk

- [ ] No data exposure
- [ ] Public data only
- [ ] Internal/sensitive data
- [ ] Personally identifiable information (PII)
- [ ] Financial/payment data
- [ ] Health/medical data
- [ ] Other sensitive data

### User Impact

- [ ] No user impact
- [ ] User inconvenience
- [ ] Data compromise possible
- [ ] Account takeover possible
- [ ] System compromise possible

## Remediation

### Recommended Actions

1. [Immediate action]
2. [Short-term fix]
3. [Long-term solution]

### Timeline

- **Detection**: [When was this discovered?]
- **Fix Target**: [When should this be fixed?]
- **Communication**: [When to notify affected parties?]

### Responsible Parties

- **Security Lead**: [Name]
- **Developer**: [Name]
- **Reviewer**: [Name]

## Verification

### Testing Steps

1. [Step to verify the vulnerability exists]
2. [Step to verify the fix works]
3. [Regression testing steps]

### Acceptance Criteria

- [ ] Vulnerability no longer exploitable
- [ ] Fix doesn't break existing functionality
- [ ] Security tests added/updated
- [ ] Documentation updated

## Communication

### Internal Notification

- [ ] Security team notified
- [ ] Development team notified
- [ ] Management notified

### External Communication

- [ ] Users notified (if applicable)
- [ ] Security advisory published
- [ ] CVE requested (if applicable)

## References

- [Security Advisory Link]
- [CVE Link]
- [Related Issues]
- [OWASP Reference]
- [Other Security Resources]

---

**Remember**: Never disclose security vulnerabilities publicly before they are properly fixed and communicated.
