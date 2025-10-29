---
title: <Feature> PRD (Custom with Compliance)
status: draft
owner: Nathan
version: 0.1.0
date: <date>
spec_type: prd
source: .claude/templates/template-prd.md
customizations:
  - Added "Security & Compliance" section
  - Added data classification and approval tracking
---

# <Feature> — PRD

## 1) Problem & Outcomes

- Problem:
- Success metrics:

## 2) Users & Jobs

- Primary user:
- Top jobs-to-be-done:

## 3) Scope (MVP → v1)

- In:
- Out (YAGNI):

## 4) User Flows

- Flow A:
- Flow B:

## 5) Non-Functional

Privacy • Reliability • Performance • Accessibility

## 6) Security & Compliance

**CUSTOM SECTION** - Regulatory and security requirements

### Data Classification

**Data Sensitivity Level**: [Select one]

- **Public**: No privacy concerns, can be disclosed publicly
- **Internal**: Internal use only, not sensitive
- **Confidential**: Restricted to authorized personnel
- **Restricted**: Highly sensitive, strict access controls required

**Examples of data handled**:

- [Data type 1, e.g., "User email addresses"]
- [Data type 2, e.g., "Transaction amounts"]

### Data Residency & Protection

- **Primary Storage Location**: [Region, e.g., "US-East"]
- **Backup Locations**: [Regions or "No geographic backup"]
- **Encryption at Rest**: [Yes/No, and algorithm if yes]
- **Encryption in Transit**: [Yes/No, and method]
- **Data Retention Period**: [Duration or "See compliance requirements"]
- **Deletion Policy**: [How data is deleted after retention period]

### Compliance Requirements

**Applicable Standards** (check all that apply):

- [ ] **GDPR** (EU data protection)
  - Impact: [Describe how this feature affects GDPR obligations]
  - Compliance Checklist:
    - [ ] Privacy policy updated
    - [ ] Consent mechanism implemented
    - [ ] Data subject rights supported (access, deletion, portability)
    - [ ] Data processing agreement reviewed

- [ ] **CCPA** (California privacy)
  - Impact: [Describe CCPA implications]
  - Compliance Checklist:
    - [ ] Privacy policy includes CCPA disclosures
    - [ ] Consumer rights mechanism implemented
    - [ ] Opt-out functionality ready

- [ ] **HIPAA** (Healthcare data)
  - Impact: [Describe if handling protected health information]
  - Compliance Checklist:
    - [ ] Business Associate Agreement in place
    - [ ] Encryption and access controls implemented
    - [ ] Audit logging enabled

- [ ] **SOC 2** (Security certification)
  - Impact: [How this affects SOC 2 controls]
  - Compliance Checklist:
    - [ ] Security controls mapped
    - [ ] Logging and monitoring configured
    - [ ] Access controls defined

- [ ] **Industry-Specific** [Other standards]
  - Standard: [Name]
  - Impact: [Describe requirements]
  - Compliance Checklist:
    - [ ] Requirement 1
    - [ ] Requirement 2

### Security Review & Approval

**Security Review Status**:

- [ ] Security review completed
  - Reviewed By: [Security team or lead]
  - Date: [YYYY-MM-DD]
  - Findings: [Link to security assessment]
  - Risk Level: [Low | Medium | High | Critical]
  - Remediation Plan: [If risks identified]

**Approval Status**:

- [ ] Product approval obtained
  - Approved By: [Product owner or manager]
  - Date: [YYYY-MM-DD]

- [ ] Legal review obtained (if required)
  - Reviewed By: [Legal team or counsel]
  - Date: [YYYY-MM-DD]
  - Conditions: [Any legal conditions or requirements]

- [ ] Compliance sign-off (if required)
  - Approved By: [Compliance officer or lead]
  - Date: [YYYY-MM-DD]
  - Requirements: [Any additional compliance requirements]

### Risk Assessment

**Data Breach Risk**: [Low | Medium | High | Critical]

- Likelihood: [Low | Medium | High]
- Impact if breached: [Description]
- Mitigation: [How risks are mitigated]

**Regulatory Risk**: [Low | Medium | High | Critical]

- Compliance gaps: [If any]
- Remediation timeline: [Target completion date]
- Owner: [Who's responsible]

### Threat Model

[Link to threat model document or brief summary]

**Key Threats**:

- [Threat 1, e.g., "Unauthorized data access"]
  - Mitigation: [How addressed]
- [Threat 2, e.g., "Data exfiltration"]
  - Mitigation: [How addressed]

### Privacy Considerations

- **Data Minimization**: [What data is collected and why]
- **Consent Model**: [How user consent is obtained, if applicable]
- **Third-party Sharing**: [How data is shared with vendors, if any]
- **User Rights**: [Access, deletion, portability - how supported]
- **Transparency**: [Privacy notices and disclosures provided]

---

## 7) Decisions (Locked)

- Directionality / guardrails:

## 8) Open Questions

- Q1:
- Q2:

---

## Compliance Sign-off

**This PRD approved by**:

| Role             | Name | Date | Signature |
| ---------------- | ---- | ---- | --------- |
| Product Owner    |      |      |           |
| Security Lead    |      |      |           |
| Legal/Compliance |      |      |           |

**Approval Date**: [YYYY-MM-DD]

**Effective Date**: [When feature is live]
