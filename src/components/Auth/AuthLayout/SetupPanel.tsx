import { useAccount } from 'wagmi'
import { useModal } from 'connectkit'
import { useSsiWallet } from '@context/SsiWallet'
import { useUserPreferences } from '@context/UserPreferences'
import useSsiAllowedChain from '@hooks/useSsiAllowedChain'
import useSsiChainGuard from '@hooks/useSsiChainGuard'
import { useAuth } from '@hooks/useAuth'
import { getPendingAuthMode } from '@utils/authFlow'
import { authSetupCopy } from '../constants'
import styles from './SetupPanel.module.css'

type StepStatus = 'complete' | 'active' | 'pending'

function SetupStep({
  title,
  description,
  status,
  isLast = false
}: {
  title: string
  description: string
  status: StepStatus
  isLast?: boolean
}) {
  return (
    <div className={`${styles.step} ${isLast ? styles.stepLast : ''}`}>
      <div className={styles.stepRail}>
        <span
          className={`${styles.stepMarker} ${
            status === 'complete'
              ? styles.stepMarkerComplete
              : status === 'active'
              ? styles.stepMarkerActive
              : styles.stepMarkerPending
          }`}
        />
        {!isLast && <span className={styles.stepLine} />}
      </div>
      <div className={styles.stepBody}>
        <div className={styles.stepTitleRow}>
          <h3 className={styles.stepTitle}>{title}</h3>
          <span
            className={`${styles.stepBadge} ${
              status === 'complete'
                ? styles.stepBadgeComplete
                : status === 'active'
                ? styles.stepBadgeActive
                : styles.stepBadgePending
            }`}
          >
            {status === 'complete'
              ? 'Complete'
              : status === 'active'
              ? 'In progress'
              : 'Pending'}
          </span>
        </div>
        <p className={styles.stepDescription}>{description}</p>
      </div>
    </div>
  )
}

export default function SetupPanel() {
  const { isConnected } = useAccount()
  const { setOpen } = useModal()
  const { user, logout } = useAuth()
  const { setShowSsiWalletModule } = useUserPreferences()
  const { sessionToken, isSsiStateHydrated } = useSsiWallet()
  const { isSsiChainAllowed, isSsiChainReady } = useSsiAllowedChain()
  const { ensureAllowedChainForSsi } = useSsiChainGuard()
  const authMode = getPendingAuthMode()

  const isWalletReady = isConnected
  const isSsiReady = Boolean(sessionToken)
  const isSetupReady = isWalletReady && isSsiStateHydrated && isSsiReady
  const needsNetworkSwitch =
    isWalletReady && (!isSsiChainReady || !isSsiChainAllowed)

  const walletStatus: StepStatus = isWalletReady ? 'complete' : 'active'
  const ssiStatus: StepStatus = isSsiReady
    ? 'complete'
    : isWalletReady
    ? 'active'
    : 'pending'

  const walletDescription = isWalletReady
    ? authSetupCopy.walletComplete
    : authSetupCopy.walletActive

  const ssiDescription = isSsiReady
    ? authSetupCopy.ssiComplete
    : !isWalletReady
    ? authSetupCopy.ssiPending
    : needsNetworkSwitch
    ? authSetupCopy.ssiNetwork
    : authSetupCopy.ssiActive

  const actionLabel = !isWalletReady
    ? authSetupCopy.connectWallet
    : needsNetworkSwitch
    ? authSetupCopy.switchNetwork
    : !isSsiReady
    ? authSetupCopy.connectSsi
    : null

  const handleAction = () => {
    if (!isWalletReady) {
      setOpen(true)
      return
    }

    if (needsNetworkSwitch) {
      ensureAllowedChainForSsi()
      return
    }

    if (!isSsiReady) {
      setShowSsiWalletModule(true)
    }
  }

  const handleAccountSwitch = () => {
    logout().catch((error) => {
      console.error('Account switch logout failed:', error)
    })
  }

  const greeting = user?.name
    ? `${
        authMode === 'signup'
          ? authSetupCopy.signupGreeting
          : authSetupCopy.greeting
      }, ${user.name}`
    : authSetupCopy.title
  const subtitle =
    authMode === 'signup'
      ? authSetupCopy.signupSubtitle
      : authSetupCopy.subtitle

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{authSetupCopy.eyebrow}</p>
        <h2 className={styles.title}>{greeting}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <p className={styles.accountSwitch}>
          {authSetupCopy.wrongAccount}{' '}
          <button
            type="button"
            className={styles.accountSwitchButton}
            onClick={handleAccountSwitch}
          >
            {authSetupCopy.wrongAccountAction}
          </button>
        </p>
      </div>

      <div className={styles.progressCard}>
        <SetupStep
          title={authSetupCopy.ssoStep}
          description={authSetupCopy.ssoMeta}
          status="complete"
        />
        <SetupStep
          title={authSetupCopy.walletStep}
          description={walletDescription}
          status={walletStatus}
        />
        <SetupStep
          title={authSetupCopy.ssiStep}
          description={ssiDescription}
          status={ssiStatus}
          isLast
        />
      </div>

      <div className={styles.footer}>
        {isSetupReady ? (
          <div className={styles.readyState}>
            <span className={styles.readyDot} />
            <span>{authSetupCopy.redirecting}</span>
          </div>
        ) : (
          <>
            {actionLabel && (
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleAction}
              >
                {actionLabel}
              </button>
            )}
            <p className={styles.helperText}>
              {!isWalletReady ? authSetupCopy.walletPending : ssiDescription}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
