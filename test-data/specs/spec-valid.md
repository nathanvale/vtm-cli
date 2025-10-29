# Technical Specification: OAuth2 Authentication

**Source:** ADR-001-valid.md
**Status:** Draft
**Owner:** Engineering Team

---

## Overview

This specification implements the OAuth2 authentication strategy defined in ADR-001-valid.md.

## Recommended Technology Stack

### Backend

- **OAuth2 Library:** `passport.js` with `passport-oauth2` strategy
- **JWT Handling:** `jsonwebtoken` (v9.0+)
- **Token Storage:** Redis for refresh token management
- **Identity Provider SDK:** Provider-specific SDKs (Okta SDK, Auth0 SDK)

### Frontend

- **Web:** `@auth0/auth0-react` or provider-specific SDK
- **Mobile iOS:** Native OAuth2 implementation with ASWebAuthenticationSession
- **Mobile Android:** AppAuth Android library

### Infrastructure

- **Token Storage:** Secure HTTP-only cookies for web, native secure storage for mobile
- **Session Management:** Redis with 15-minute TTL
- **API Gateway:** Kong or AWS API Gateway for token validation

## Implementation Approach

### Phase 1: Backend Authentication Service

1. **OAuth2 Authorization Flow:**

```typescript
// Authorization endpoint
app.get("/auth/authorize", (req, res) => {
  const authUrl = identityProvider.buildAuthorizationUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: "openid profile email",
    state: generateState(),
    codeChallenge: generatePKCEChallenge(),
  })
  res.redirect(authUrl)
})
```

2. **Token Exchange:**

```typescript
// Token exchange callback
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query

  // Validate state
  if (!validateState(state)) {
    return res.status(400).json({ error: "Invalid state" })
  }

  // Exchange code for tokens
  const tokens = await identityProvider.exchangeCode({
    code,
    codeVerifier: getCodeVerifier(state),
    redirectUri: config.redirectUri,
  })

  // Store refresh token securely
  await storeRefreshToken(tokens.refresh_token, tokens.user_id)

  // Return access token
  res.json({
    access_token: tokens.access_token,
    expires_in: tokens.expires_in,
  })
})
```

3. **Token Refresh:**

```typescript
// Refresh token endpoint
app.post("/auth/refresh", async (req, res) => {
  const { refresh_token } = req.body

  // Validate refresh token
  const userId = await validateRefreshToken(refresh_token)
  if (!userId) {
    return res.status(401).json({ error: "Invalid refresh token" })
  }

  // Request new access token
  const tokens = await identityProvider.refreshAccessToken(refresh_token)

  res.json({
    access_token: tokens.access_token,
    expires_in: tokens.expires_in,
  })
})
```

### Phase 2: Frontend Integration

4. **Web Client Implementation:**

```typescript
// React component with OAuth2
import { useAuth0 } from '@auth0/auth0-react'

function LoginButton() {
  const { loginWithRedirect } = useAuth0()

  return (
    <button onClick={() => loginWithRedirect()}>
      Log In
    </button>
  )
}

function LogoutButton() {
  const { logout } = useAuth0()

  return (
    <button onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  )
}
```

5. **Mobile Client Implementation (iOS):**

```swift
// iOS OAuth2 authentication
import AuthenticationServices

class AuthManager {
  func authenticate() {
    let authURL = buildAuthorizationURL()
    let callbackScheme = "myapp"

    let session = ASWebAuthenticationSession(
      url: authURL,
      callbackURLScheme: callbackScheme
    ) { callbackURL, error in
      if let code = extractCode(from: callbackURL) {
        self.exchangeCodeForTokens(code)
      }
    }

    session.start()
  }

  func exchangeCodeForTokens(_ code: String) {
    // Exchange authorization code for tokens
    // Store in Keychain
  }
}
```

## Testing Strategy

### Unit Tests

- OAuth2 flow state validation
- PKCE challenge/verifier generation
- Token expiration handling
- Refresh token rotation

### Integration Tests

- End-to-end authorization code flow
- Token refresh flow
- Token revocation
- Identity provider integration

### Security Tests

- CSRF protection (state parameter)
- Token leakage prevention
- Secure token storage
- Token expiration enforcement

## Acceptance Criteria

- [ ] Users can log in via OAuth2 authorization code flow
- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens work correctly for 30 days
- [ ] Tokens are stored securely (HTTP-only cookies for web)
- [ ] Mobile apps use native secure storage (Keychain/Keystore)
- [ ] Logout revokes all tokens
- [ ] PKCE is implemented for all clients
- [ ] State parameter prevents CSRF attacks
- [ ] Integration with at least one enterprise identity provider (Okta/Auth0)
- [ ] Comprehensive error handling for network failures
- [ ] Token refresh happens automatically before expiration

## Performance Considerations

- **Token validation:** Cache public keys from identity provider (1 hour TTL)
- **Refresh token lookups:** Use Redis for O(1) lookup time
- **Authorization redirects:** < 200ms response time
- **Token exchange:** < 500ms total flow time

## Security Considerations

- All tokens transmitted over HTTPS only
- Refresh tokens stored encrypted at rest
- Access tokens never stored in localStorage (XSS protection)
- PKCE prevents authorization code interception
- State parameter prevents CSRF attacks
- Token expiration enforced strictly
- Proper token revocation on logout

## Monitoring & Alerting

- Track failed authentication attempts
- Monitor token refresh failures
- Alert on unusual token usage patterns
- Log all authentication events for audit trail
