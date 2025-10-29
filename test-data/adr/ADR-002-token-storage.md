# ADR-002: Token Storage Strategy

## Status

Proposed

## Context

OAuth2 tokens need secure client-side storage.

## Decision

Use HTTP-only cookies for refresh tokens and memory storage for access tokens.

## Alternatives Considered

1. **LocalStorage** - Vulnerable to XSS attacks
2. **SessionStorage** - Lost on tab close
3. **HTTP-only cookies** - Secure, protected from XSS

## Consequences

### Positive

- Protected against XSS
- Automatic CSRF protection
- Secure refresh token storage

### Negative

- Requires HTTPS
- More complex cookie management
