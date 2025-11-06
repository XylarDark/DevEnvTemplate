# Threat Model: [System/Component Name]

## Overview

**Date**: YYYY-MM-DD
**Version**: 1.0
**Authors**: [Name] <email@domain.com>
**System/Component**: [Brief description]

## Data Flow Diagram

[Include a simple diagram showing data flows, trust boundaries, and external entities]

```
[External User] --> [Web App] --> [API] --> [Database]
                      |           |
                      v           v
                 [Auth Service]  [Cache]
```

## Assets

### Critical Assets

- [Asset 1]: Description and business value
- [Asset 2]: Description and business value
- [Asset 3]: Description and business value

### Supporting Assets

- [Asset 1]: Description and business value
- [Asset 2]: Description and business value

## Trust Boundaries

1. **Boundary 1**: [Description and why it's a boundary]
2. **Boundary 2**: [Description and why it's a boundary]
3. **Boundary 3**: [Description and why it's a boundary]

## Entry Points

1. **Entry Point 1**: [Description, protocols, authentication]
2. **Entry Point 2**: [Description, protocols, authentication]
3. **Entry Point 3**: [Description, protocols, authentication]

## Threats (STRIDE Analysis)

### Spoofing

| Threat ID | Description   | Impact         | Likelihood     | Mitigation            |
| --------- | ------------- | -------------- | -------------- | --------------------- |
| SPOOF-001 | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| SPOOF-002 | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

### Tampering

| Threat ID | Description   | Impact         | Likelihood     | Mitigation            |
| --------- | ------------- | -------------- | -------------- | --------------------- |
| TAMP-001  | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| TAMP-002  | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

### Repudiation

| Threat ID | Description   | Impact         | Likelihood     | Mitigation            |
| --------- | ------------- | -------------- | -------------- | --------------------- |
| REPUD-001 | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| REPUD-002 | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

### Information Disclosure

| Threat ID | Description   | Impact         | Likelihood     | Mitigation            |
| --------- | ------------- | -------------- | -------------- | --------------------- |
| INFO-001  | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| INFO-002  | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

### Denial of Service

| Threat ID | Description   | Impact         | Likelihood     | Mitigation            |
| --------- | ------------- | -------------- | -------------- | --------------------- |
| DOS-001   | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| DOS-002   | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

### Elevation of Privilege

| Threat ID | Description   | Impact         | Likelihood     | Mitigation            |
| --------- | ------------- | -------------- | -------------- | --------------------- |
| ELEV-001  | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| ELEV-002  | [Description] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

## Risk Assessment

### High Risk Threats

1. **[THREAT-ID]**: [Brief description, impact, recommended priority]
2. **[THREAT-ID]**: [Brief description, impact, recommended priority]

### Medium Risk Threats

1. **[THREAT-ID]**: [Brief description, impact, recommended priority]
2. **[THREAT-ID]**: [Brief description, impact, recommended priority]

### Low Risk Threats

1. **[THREAT-ID]**: [Brief description, impact, recommended priority]
2. **[THREAT-ID]**: [Brief description, impact, recommended priority]

## Security Controls

### Preventive Controls

- [Control 1]: Description and implementation
- [Control 2]: Description and implementation
- [Control 3]: Description and implementation

### Detective Controls

- [Control 1]: Description and implementation
- [Control 2]: Description and implementation
- [Control 3]: Description and implementation

### Responsive Controls

- [Control 1]: Description and implementation
- [Control 2]: Description and implementation
- [Control 3]: Description and implementation

## Recommendations

### Immediate Actions (High Priority)

1. [Action 1]: Timeline and responsible party
2. [Action 2]: Timeline and responsible party

### Short-term Actions (Medium Priority)

1. [Action 1]: Timeline and responsible party
2. [Action 2]: Timeline and responsible party

### Long-term Actions (Low Priority)

1. [Action 1]: Timeline and responsible party
2. [Action 2]: Timeline and responsible party

## Review and Updates

**Review Frequency**: [Monthly/Quarterly/Annually]
**Next Review Date**: [Date]
**Reviewers**: [Names/Roles]

## References

- [Link to related documents]
- [External security resources]
- [Related threat models]

---

_This threat model follows the STRIDE framework and should be reviewed regularly as the system evolves._
