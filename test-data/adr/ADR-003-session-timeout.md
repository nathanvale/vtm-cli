# ADR-003: Session Timeout Strategy

## Status

Proposed

## Context

Need to balance security with user experience for session management.

## Decision

Implement sliding session timeout with 30-minute inactivity window.

## Alternatives Considered

1. **Fixed timeout** - Poor UX, logs users out unexpectedly
2. **No timeout** - Security risk
3. **Sliding timeout** - Good balance of security and UX

## Consequences

### Positive

- Better user experience
- Maintains security
- Industry best practice

### Negative

- Requires activity tracking
- More complex than fixed timeout
