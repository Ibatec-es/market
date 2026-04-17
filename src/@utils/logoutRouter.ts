export const getAuthMeta = () => {
  try {
    return JSON.parse(localStorage.getItem('auth_meta') || '{}')
  } catch {
    return {}
  }
}

export const isVM3User = () => {
  const meta = getAuthMeta()

  const issuer = (meta?.issuer || '').toLowerCase()
  const upstream = (meta?.upstream_idp || '').toLowerCase()

  return (
    issuer.includes('vm3') ||
    upstream.includes('vm3') ||
    upstream.includes('partner')
  )
}

export const getLogoutRedirect = () => {
  return `${window.location.origin}/auth/callback/logout`
}

export const getVM3LogoutUrl = () => {
  return 'https://ocean-node-vm3.oceanenterprise.io:8443/application/o/vm2-federation/end-session/'
}
