# Technical Specification: OAuth2 Authentication

## Overview

Implementation of OAuth2 authentication with JWT tokens.

## Technology Stack

- jsonwebtoken: JWT signing and verification
- passport: Authentication middleware
- bcrypt: Password hashing

## Implementation

[Full implementation details...]

## Acceptance Criteria

- [ ] AC1: Users can authenticate with username/password
- [ ] AC2: JWT tokens are issued on successful authentication
- [ ] AC3: Tokens expire after 1 hour
- [ ] AC4: Refresh tokens enable token renewal
- [ ] AC5: Invalid tokens are rejected

## Code Examples

```typescript
// Example 1: Generate JWT
const token = jwt.sign({ userId }, secret, { expiresIn: "1h" })
```

```typescript
// Example 2: Verify JWT
const decoded = jwt.verify(token, secret)
```

```typescript
// Example 3: Middleware
app.use(passport.authenticate("jwt", { session: false }))
```
