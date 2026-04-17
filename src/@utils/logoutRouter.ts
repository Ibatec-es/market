export const getAuthMeta = () => {
  try {
    return JSON.parse(localStorage.getItem('auth_meta') || '{}')
  } catch {
    return {}
  }
}

export const isVM3User = () => {
  const meta = getAuthMeta()

  return (
    meta?.upstream_idp?.toLowerCase?.().includes('vm3') ||
    meta?.issuer?.includes('vm3')
  )
}

export const getLogoutRedirect = () => {
  return `${window.location.origin}/auth/callback/logout`
}

export const getVM3LogoutUrl = () => {
  return 'https://ocean-node-vm3.oceanenterprise.io:8443/application/o/vm2-federation/end-session/'
}
