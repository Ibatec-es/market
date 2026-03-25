export const authConfig = {
  enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
  provider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'mock',

  keycloak: {
    issuer:
      process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ||
      'http://localhost:8080/realms/ocean-enterprise',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'ocean-market',
    clientSecret: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || '',
    redirectUri:
      process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI ||
      'http://localhost:3000/auth/callback',
    scope: 'openid profile email',
    responseType: 'code',
    pkceMethod: 'S256'
  }
}
