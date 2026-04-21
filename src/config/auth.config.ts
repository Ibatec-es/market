export const authConfig = {
  enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
  provider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'mock',
  oidc: {
    issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER || '',
    clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || '',
    clientSecret: process.env.NEXT_PUBLIC_OIDC_CLIENT_SECRET || '',
    redirectUri:
      process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI ||
      'http://localhost:8008/auth/callback',
    scope: 'openid profile email federated_identity',
    responseType: 'code',
    pkceMethod: 'S256'
  }
}
