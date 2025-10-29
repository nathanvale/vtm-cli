---
title: "[Feature/Component Name] Technical Specification (Custom with SLAs)"
status: draft # draft|review|approved|deprecated
owner: [Owner Name or Team]
version: 0.1.0
related_adrs: [] # ADRs that inform this spec
source: .claude/templates/template-spec.md
customizations:
  - Added "Service Level Agreements" section
  - Added availability, performance, and support SLAs
---

# [Feature/Component Name] Technical Specification

<!--
NAMING CONVENTION: spec-[feature-name].md
LOCATION: docs/specs/

CUSTOM SECTIONS:
- Service Level Agreements: Defines performance, availability, and support targets
- SLA Compliance: Monitoring and enforcement

USAGE:
1. Copy template to docs/specs/spec-[feature-name].md
2. Update frontmatter (related_adrs)
3. Define SLA targets based on criticality
4. Fill sections relevant to your spec
5. Remove unused sections and guidance comments
6. Link from parent ADR

CROSS-REFERENCES:
- Reference the ADR that motivated this spec
- Link to related specs if applicable
-->

## Executive Summary

<!--
2-3 sentences capturing:
- What this spec covers
- Why it matters
- Key decisions or patterns
-->

[PLACEHOLDER: Brief overview of what this specification defines and why it exists]

---

## Scope

### In Scope

- [PLACEHOLDER: What this spec covers, e.g., "User authentication system implementation"]
- [PLACEHOLDER: Component 2]

### Out of Scope

- [PLACEHOLDER: What this spec explicitly does NOT cover, e.g., "Password reset via email (future phase)"]
- [PLACEHOLDER: Exclusion 2]

### Dependencies

- **ADRs**:
  - [ADR-XXX: Decision Title](../adr/ADR-XXX-decision-title.md)
- **Related Specs**:
  - [Link to related specs if applicable]

---

## Success Criteria

<!-- How do we measure success of this specification? -->

- [ ] [PLACEHOLDER: Measurable criterion 1, e.g., "Authentication completes in <200ms"]
- [ ] [PLACEHOLDER: Criterion 2, e.g., "Zero authentication bypasses in security audit"]
- [ ] [PLACEHOLDER: Criterion 3, e.g., "100% test coverage for auth logic"]

---

## System Architecture

### Component Diagram

```
[PLACEHOLDER: ASCII diagram showing key components]

Example:
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Client    │─────>│     API      │─────>│  Database  │
│             │      │   Gateway    │      │            │
└─────────────┘      └──────────────┘      └────────────┘
                            │
                            v
                     ┌──────────────┐
                     │   Auth       │
                     │   Service    │
                     └──────────────┘
```

### Key Components

#### Component 1: [Name]

- **Purpose**: [PLACEHOLDER: What this component does]
- **Responsibilities**:
  - [PLACEHOLDER: Responsibility 1]
  - [PLACEHOLDER: Responsibility 2]
- **Technology**: [PLACEHOLDER: Framework/library used]
- **Location**: [PLACEHOLDER: File path or module name]

#### Component 2: [Name]

- **Purpose**: [PLACEHOLDER]
- **Responsibilities**: [PLACEHOLDER]
- **Technology**: [PLACEHOLDER]
- **Location**: [PLACEHOLDER]

### Data Flow

```
[PLACEHOLDER: Show how data moves through the system]

Example:
1. User submits credentials
2. API validates input
3. Auth service verifies against database
4. JWT token generated and returned
5. Client stores token for subsequent requests
```

### Integration Points

- **[External System 1]**: [PLACEHOLDER: How we integrate, e.g., "OAuth2 provider via passport.js"]
- **[External System 2]**: [PLACEHOLDER: Integration method]

---

## Technical Implementation

### Technology Stack

- **Language/Runtime**: [PLACEHOLDER: e.g., TypeScript 5.x with Node.js 20]
- **Key Libraries**:
  - [PLACEHOLDER: Library name and version, e.g., "express": "^4.18.0"]
  - [PLACEHOLDER: Library 2]
- **Development Tools**: [PLACEHOLDER: e.g., Jest for testing]

### File Structure

```
[PLACEHOLDER: Directory tree showing relevant files]

Example:
src/
  lib/
    auth/
      AuthService.ts           # Main authentication logic
      TokenGenerator.ts        # JWT token handling
      PasswordHasher.ts        # Password hashing utilities
  types/
    AuthTypes.ts               # Type definitions
```

### Core Interfaces

```typescript
// [PLACEHOLDER: Key interfaces/types]

interface AuthConfig {
  jwtSecret: string
  tokenExpiry: number
  hashRounds: number
}

interface AuthResult {
  success: boolean
  token?: string
  error?: string
}
```

### Implementation Details

#### Feature 1: [Name]

```typescript
// [PLACEHOLDER: Code example or pseudocode]

async function authenticate(credentials: UserCredentials): Promise<AuthResult> {
  // 1. Validate input
  // 2. Hash password
  // 3. Check against database
  // 4. Generate token
}
```

**Key Considerations**:

- [PLACEHOLDER: Important implementation detail, e.g., "Use bcrypt with 12 rounds for password hashing"]
- [PLACEHOLDER: Detail 2]

#### Feature 2: [Name]

[PLACEHOLDER: Implementation approach]

### Error Handling

- **[Error Type 1]**: [PLACEHOLDER: How handled, e.g., "Invalid credentials → 401 response"]
- **[Error Type 2]**: [PLACEHOLDER: Handling strategy]

### Configuration

**Environment Variables**:

```bash
[PLACEHOLDER: Required env vars]
JWT_SECRET=your-secret-key-here
TOKEN_EXPIRY_HOURS=24
```

**Config Files**:

- [PLACEHOLDER: Config file path and purpose]

---

## Service Level Agreements (SLA)

**CUSTOM SECTION** - Defines operational targets for this service/component

### Service Criticality

**Criticality Level**: [Select one]

- **Critical**: Business-critical, immediate customer impact if down
- **High**: Important functionality, significant impact if degraded
- **Medium**: Standard functionality, moderate impact if affected
- **Low**: Non-critical, minimal customer impact

**Business Impact**: [Describe impact of service outage]

---

### Availability SLA

**Target Uptime**: [Percentage, e.g., 99.95%]

**Calculation**: `(Total Time - Downtime) / Total Time × 100%`

**Allowed Downtime per Period**:

- Monthly: [Minutes, e.g., 21.6 minutes for 99.95%]
- Quarterly: [Minutes]
- Annually: [Minutes]

**Service Windows**:

- **Operating Hours**: [Hours when service is expected to run, e.g., "24/7" or "Business hours only"]
- **Planned Maintenance**: [Scheduled downtime, e.g., "Sunday 2-4am UTC monthly"]
- **Maintenance Window**: [Maximum time allowed for updates]

**Maintenance Notifications**:

- **Advance Notice**: [Hours/days, e.g., "72 hours advance notice"]
- **Communication Channel**: [How notifications are sent]
- **Maintenance Impact**: [Expected service impact during maintenance]

---

### Performance SLA

**Response Time Targets** (for synchronous operations):

- **P50 (Median) Latency**: [Duration, e.g., "<100ms"]
- **P95 Latency**: [Duration, e.g., "<250ms"]
- **P99 Latency**: [Duration, e.g., "<500ms"]
- **Max Latency**: [Duration for hard limits, if applicable]

**Throughput**:

- **Requests per Second**: [Number, e.g., "10,000 req/s"]
- **Concurrent Users**: [Number, e.g., "5,000 concurrent"]
- **Data Throughput**: [If applicable, e.g., "100 MB/s"]

**Specific Service Metrics**:

- [Metric 1]: [Target, e.g., "Database queries < 50ms p95"]
- [Metric 2]: [Target, e.g., "API response < 100ms p95"]

**Measurement Method**:

- Tool/Service: [e.g., "DataDog, CloudWatch, Prometheus"]
- Measurement Point: [Client-side, server-side, both]
- Data Retention: [How long metrics are kept, e.g., "90 days"]

---

### Error Rate SLA

**Target Error Rate**: [Percentage, e.g., "<0.1%"]

**Error Classifications**:

- **4xx Errors (Client)**: [e.g., "<0.05%"]
- **5xx Errors (Server)**: [e.g., "<0.05%"]
- **Timeout Errors**: [e.g., "<0.01%"]

**Exclusions from SLA**:

- Client-side errors due to misuse
- Third-party service failures beyond our control
- Planned maintenance windows
- Force majeure events

---

### Support SLA

**Support Hours**:

- **Production Support**: [Hours, e.g., "24/7/365"]
- **Non-Production Support**: [Hours, e.g., "Business hours only"]
- **Holidays**: [Coverage during holidays, e.g., "24/7 including holidays"]

**Response Times** (from incident report):

- **Critical Issues**: [Time, e.g., "<15 minutes"]
- **High Priority**: [Time, e.g., "<1 hour"]
- **Medium Priority**: [Time, e.g., "<4 hours"]
- **Low Priority**: [Time, e.g., "<24 hours"]

**Resolution Times**:

- **Critical Issues**: [Time, e.g., "<2 hours target"]
- **High Priority**: [Time, e.g., "<8 hours target"]
- **Medium Priority**: [Time, e.g., "<24 hours target"]
- **Low Priority**: [Time, e.g., "<5 business days target"]

**Escalation Process**:

- **Level 1**: [On-call engineer, escalates after X minutes]
- **Level 2**: [Senior engineer, escalates after X minutes]
- **Level 3**: [Engineering manager/lead]
- **Executive Escalation**: [When critical SLA is at risk]

[Link to incident response runbook]

---

### Data Durability & Backup SLA

**Data Durability Target**: [Percentage, e.g., "99.999999999% (11 nines)"]

**Backup Strategy**:

- **Backup Frequency**: [e.g., "Continuous or hourly"]
- **Retention Period**: [e.g., "30 days"]
- **Backup Location**: [Geographic redundancy, e.g., "Multi-region"]
- **Recovery Point Objective (RPO)**: [Data loss tolerance, e.g., "<1 hour"]
- **Recovery Time Objective (RTO)**: [Restoration time, e.g., "<4 hours"]

**Disaster Recovery**:

- **Failover Time**: [How quickly service fails over to backup, e.g., "<5 minutes"]
- **Failover Automation**: [Manual | Automatic | Automatic with manual confirmation]
- **Failover Testing**: [Frequency, e.g., "Quarterly"]

---

### SLA Monitoring & Reporting

**Monitoring**:

- **Real-time Dashboards**: [Where to view, e.g., "Internal monitoring tool"]
- **Alert Thresholds**: [When alerts triggered, e.g., "When latency exceeds P99 target"]
- **Alerting Channels**: [How team is notified, e.g., "PagerDuty, Slack"]

**Reporting**:

- **Frequency**: [e.g., "Daily, weekly, monthly"]
- **Report Contents**:
  - Uptime percentage
  - Response time metrics
  - Error rate
  - Incidents and resolutions
  - Maintenance activities
  - Recommendations for improvement
- **Report Distribution**: [Who receives reports, e.g., "Engineering team, product team, leadership"]
- **Public Status Page**: [If applicable, URL or "Internal only"]

**SLA Breaches**:

- **Notification**: [How customers are informed of breaches]
- **Credits/Remediation**: [Service credits or compensation policy]
- **Post-mortem**: [Process for investigating breaches and preventing recurrence]

---

## Test Strategy

### Test Pyramid

```
     /\
    /E2E\        [X tests - critical paths only]
   /------\
  /  INT   \     [Y tests - service integrations]
 /----------\
/ UNIT       \   [Z tests - business logic]
--------------
```

### Test Scenarios

#### Unit Tests

**Coverage Target**: [PLACEHOLDER: e.g., 80% for business logic]

| Scenario                  | Test Case          | Expected Outcome  |
| ------------------------- | ------------------ | ----------------- |
| [PLACEHOLDER: Scenario 1] | [Test description] | [Expected result] |
| [PLACEHOLDER: Scenario 2] | [Test description] | [Expected result] |

#### Integration Tests

**Coverage Target**: [PLACEHOLDER: e.g., All API endpoints]

| Scenario      | Test Case          | Dependencies      | Expected Outcome  |
| ------------- | ------------------ | ----------------- | ----------------- |
| [PLACEHOLDER] | [Test description] | [Mocked services] | [Expected result] |

---

## Task Breakdown

<!--
Break down implementation into discrete tasks.
These tasks will be extracted by /plan:to-vtm for VTM ingestion.
-->

### Task 1: [Task Title]

**Description**: [PLACEHOLDER: What needs to be built]

**Acceptance Criteria**:

- [PLACEHOLDER: AC1 - Specific, testable criterion]
- [PLACEHOLDER: AC2 - Another testable criterion]

**Dependencies**: [None | Task X]

**Test Strategy**: [TDD | Unit | Integration | Direct]

**Estimated Hours**: [X]

**Files**:

- Create: [PLACEHOLDER: path/to/new/file.ts]
- Modify: [PLACEHOLDER: path/to/existing/file.ts]

---

### Task 2: [Task Title]

**Description**: [PLACEHOLDER]

**Acceptance Criteria**:

- [PLACEHOLDER]

**Dependencies**: [Task 1]

**Test Strategy**: [TDD | Unit | Integration | Direct]

**Estimated Hours**: [X]

**Files**:

- Create: [PLACEHOLDER]
- Modify: [PLACEHOLDER]

---

## Risks & Mitigations

| Risk                                 | Impact  | Probability | Mitigation                    |
| ------------------------------------ | ------- | ----------- | ----------------------------- |
| [PLACEHOLDER: e.g., "Token leakage"] | High    | Low         | [Use httpOnly cookies, HTTPS] |
| [PLACEHOLDER: Risk 2]                | [H/M/L] | [H/M/L]     | [Mitigation strategy]         |

---

## Performance Considerations

- **[Metric 1]**: [PLACEHOLDER: e.g., "Authentication < 200ms p95"]
- **[Metric 2]**: [PLACEHOLDER: e.g., "Support 1000 concurrent auth requests"]

**Bottlenecks**:

- [PLACEHOLDER: Known performance constraint]

**Optimization Strategy**:

- [PLACEHOLDER: How addressed]

---

## Security & Compliance

- **Authentication**: [PLACEHOLDER: e.g., "JWT with RS256 signing"]
- **Data Handling**: [PLACEHOLDER: e.g., "Passwords never logged or stored plain-text"]
- **Secrets Management**: [PLACEHOLDER: e.g., "Environment variables for secrets"]

---

## Monitoring & Observability

- **Logs**: [PLACEHOLDER: What's logged, e.g., "Auth attempts with user ID (not password)"]
- **Metrics**: [PLACEHOLDER: What's measured, e.g., "Success/failure rate, latency"]
- **Alerts**: [PLACEHOLDER: What triggers alerts, e.g., "Failure rate >5%"]

---

## Open Questions

<!-- Track unresolved decisions -->

- [ ] **[Question 1]**: [PLACEHOLDER: e.g., "Should we support OAuth2 providers?"]
  - **Owner**: [PLACEHOLDER: Who's investigating]
  - **Due**: [PLACEHOLDER: When answer needed]

---

## Appendix

### Related Documentation

- **ADRs**:
  - [ADR-XXX: Decision Title](../adr/ADR-XXX-decision.md)
- **Related Specs**:
  - [Spec Title](./spec-related-feature.md)

### Glossary

- **[Term 1]**: [PLACEHOLDER: Definition]
- **[Term 2]**: [PLACEHOLDER: Definition]

---

## Version History

| Version | Date       | Author   | Changes       |
| ------- | ---------- | -------- | ------------- |
| 0.1.0   | YYYY-MM-DD | [Author] | Initial draft |
