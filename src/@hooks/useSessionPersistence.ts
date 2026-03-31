import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { authConfig } from '../config/auth.config'

const getEndpoints = (issuer: string) => {
  const isAuthentik = issuer.includes('/application/o/')
  const isKeycloak = issuer.includes('/realms/')

  let baseUrl: string
  if (isAuthentik) {
    const match = issuer.match(/(.*\/application\/o\/)[^/]+\/?$/)
    baseUrl = match
      ? match[1].replace(/\/$/, '')
      : issuer.replace(/\/[^/]+?\/?$/, '')
  } else {
    baseUrl = issuer.endsWith('/') ? issuer.slice(0, -1) : issuer
  }

  return {
    token: `${baseUrl}/token/`,
    isKeycloak,
    isAuthentik
  }
}

export function useSessionPersistence() {
  const { user, logout } = useAuth()

  const refreshToken = async (refreshTokenString: string) => {
    try {
      const config = authConfig.oidc
      const endpoints = getEndpoints(config.issuer)
      const tokenEndpoint = endpoints.token

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.clientId,
          client_secret: config.clientSecret || '',
          refresh_token: refreshTokenString
        })
      })

      if (response.ok) {
        const newTokens = await response.json()
        localStorage.setItem('oidc_tokens', JSON.stringify(newTokens))
      } else {
        console.error('Token refresh failed, logging out')
        logout()
      }
    } catch (error) {
      console.error('Token refresh error:', error)
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }

    const interval = setInterval(() => {
      const tokens = localStorage.getItem('oidc_tokens')
      if (tokens) {
        try {
          const tokenData = JSON.parse(tokens)
          const expiresIn = tokenData.expires_in
          const refreshTokenValue = tokenData.refresh_token

          if (expiresIn && expiresIn < 60 && refreshTokenValue) {
            refreshToken(refreshTokenValue)
          }
        } catch (e) {
          console.error('Session check error:', e)
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, logout])

  return null
}
