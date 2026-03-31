import type { BrandPanelIconVariant } from './AuthLayout/BrandPanelArtwork'

export type AuthTab = 'login' | 'signup'

export interface AuthFeature {
  icon: BrandPanelIconVariant
  text: string
}

export interface AuthPanelContent {
  title: string
  description: string
  features?: AuthFeature[]
}

export const authTabLabels: Record<AuthTab, string> = {
  login: 'Sign in',
  signup: 'Create account'
}

export const authBrandDefaults: {
  title: string
  description: string
  features: AuthFeature[]
  trustLabel: string
  trustBadges: string[]
} = {
  title: 'Ocean Enterprise Marketplace',
  description:
    'Discover, publish and manage data, software and AI services with enterprise-grade governance and trusted access control.',
  features: [
    { icon: 'marketplace', text: 'Publish and discover service offerings' },
    { icon: 'access', text: 'Control access with verified credentials' },
    { icon: 'interop', text: 'Standardized, interoperable metadata' },
    { icon: 'compute', text: 'Private computation with Compute-to-Data' }
  ],
  trustLabel: 'Built for trusted data exchange',
  trustBadges: ['SSI Verification', 'Gaia-X Aligned', 'Compute-to-Data']
}

export const authLoginCopy = {
  title: 'Welcome back',
  subtitle: "Sign in to your organization's data marketplace",
  ssoLabel: 'Continue with Company SSO',
  ssoLoadingLabel: 'Redirecting to login...',
  demoNotice: 'Demo Mode: No real authentication required'
}

export const authSignupCopy = {
  title: 'Get started',
  subtitle: "Create your organization's marketplace account",
  ssoLabel: 'Sign up with Company SSO',
  ssoLoadingLabel: 'Redirecting to signup...',
  termsIntro: 'By creating an account, you agree to our',
  termsLabel: 'Terms of Service',
  privacyLabel: 'Privacy Policy'
}
