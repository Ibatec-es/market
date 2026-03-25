import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { authConfig } from '../config/auth.config'

export function useSessionPersistence() {
  const { user, logout } = useAuth()

  const refreshToken = async (refreshTokenString: string) => {
    try {
      const keycloakConfig = authConfig.keycloak
      const response = await fetch(
        `${keycloakConfig.issuer}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: keycloakConfig.clientId,
            refresh_token: refreshTokenString
          })
        }
      )

      const newTokens = await response.json()
      localStorage.setItem('keycloak_tokens', JSON.stringify(newTokens))
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const tokens = localStorage.getItem('keycloak_tokens')
      if (tokens) {
        try {
          const tokenData = JSON.parse(tokens)
          const expiresIn = tokenData.expires_in
          const refreshTokenValue = tokenData.refresh_token

          if (expiresIn < 60) {
            refreshToken(refreshTokenValue)
          }
        } catch (e) {
          console.error('Session check error:', e)
        }
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [refreshToken])

  return null
}
