import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import appConfig from 'app.config.cjs'
import { useSsiWallet } from '@context/SsiWallet'
import { useEthersSigner } from './useEthersSigner'
import useSsiAllowedChain from './useSsiAllowedChain'
import { useUserPreferences } from '@context/UserPreferences'
import { useAuth } from './useAuth'
import { hasPendingAuthMode } from '@utils/authFlow'

export default function useSsiAutoConnectPrompt(): void {
  const { isConnected } = useAccount()
  const { isSsiChainAllowed, isSsiChainReady } = useSsiAllowedChain()
  const walletClient = useEthersSigner()
  const { setShowSsiWalletModule } = useUserPreferences()
  const { isAuthenticated } = useAuth()
  const {
    sessionToken,
    isSsiStateHydrated,
    tryAcquireSsiAutoConnectLock,
    resetSsiAutoConnectLock
  } = useSsiWallet()

  useEffect(() => {
    if (!appConfig.ssiEnabled) return
    if (!isSsiStateHydrated) return

    const canAutoPrompt = isAuthenticated || hasPendingAuthMode()

    if (!isConnected || !isSsiChainReady || !isSsiChainAllowed) {
      resetSsiAutoConnectLock()
      setShowSsiWalletModule(false)
      return
    }

    if (!canAutoPrompt) {
      resetSsiAutoConnectLock()
      setShowSsiWalletModule(false)
      return
    }

    if (!walletClient || sessionToken) return
    if (!tryAcquireSsiAutoConnectLock()) return

    setShowSsiWalletModule(true)
  }, [
    isConnected,
    isAuthenticated,
    isSsiChainAllowed,
    isSsiChainReady,
    walletClient,
    sessionToken,
    isSsiStateHydrated,
    tryAcquireSsiAutoConnectLock,
    resetSsiAutoConnectLock,
    setShowSsiWalletModule
  ])
}
