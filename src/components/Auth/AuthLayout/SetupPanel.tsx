import { useAccount } from 'wagmi'
import { useModal } from 'connectkit'
import appConfig from 'app.config.cjs'
import { useSsiWallet } from '@context/SsiWallet'
import useSsiAllowedChain from '@hooks/useSsiAllowedChain'
import useSsiChainGuard from '@hooks/useSsiChainGuard'
import { useAuth } from '@hooks/useAuth'
import { getPendingAuthMode } from '@utils/authFlow'
import useSsiConnect from '@hooks/useSsiConnect'
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
  const { connectSsi } = useSsiConnect()
  const { sessionToken, isSsiStateHydrated, isSsiSessionHydrating } =
    useSsiWallet()
  const { isSsiChainAllowed, isSsiChainReady } = useSsiAllowedChain()
  const { ensureAllowedChainForSsi } = useSsiChainGuard()
  const authMode = getPendingAuthMode()
  const isSsiEnabled = appConfig.ssiEnabled

  const isWalletReady = isConnected
  const isSsiReady = Boolean(sessionToken)
  const isSetupReady = isSsiEnabled
    ? isWalletReady && isSsiStateHydrated && isSsiReady
    : isWalletReady
  const needsNetworkSwitch =
    isSsiEnabled && isWalletReady && (!isSsiChainReady || !isSsiChainAllowed)

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
    : isSsiSessionHydrating
    ? authSetupCopy.ssiConnecting
    : authSetupCopy.ssiActive

  const actionLabel = !isWalletReady
    ? authSetupCopy.connectWallet
    : isSsiEnabled && needsNetworkSwitch
    ? authSetupCopy.switchNetwork
    : isSsiEnabled && isSsiSessionHydrating
    ? authSetupCopy.connectingSsi
    : isSsiEnabled && !isSsiReady
    ? authSetupCopy.connectSsi
    : null

  const handleAction = async () => {
    if (!isWalletReady) {
      setOpen(true)
      return
    }

    if (needsNetworkSwitch) {
      ensureAllowedChainForSsi()
      return
    }

    if (!isSsiReady) {
      await connectSsi()
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
      }, ${user.name}!`
    : authSetupCopy.title
  const subtitle =
    authMode === 'signup'
      ? isSsiEnabled
        ? authSetupCopy.signupSubtitle
        : authSetupCopy.signupWalletOnlySubtitle
      : isSsiEnabled
      ? authSetupCopy.subtitle
      : authSetupCopy.walletOnlySubtitle

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
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
          isLast={!isSsiEnabled}
        />
        {isSsiEnabled && (
          <SetupStep
            title={authSetupCopy.ssiStep}
            description={ssiDescription}
            status={ssiStatus}
            isLast
          />
        )}
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
                onClick={() => {
                  handleAction().catch((error) => {
                    console.error('SSI setup action failed:', error)
                  })
                }}
                disabled={isSsiSessionHydrating}
              >
                {actionLabel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
