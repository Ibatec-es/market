import { ReactElement, ReactNode } from 'react'
import Button from '@shared/atoms/Button'
import { useDisconnect, useAccount } from 'wagmi'
import styles from './Details.module.css'
import Avatar from '@components/@shared/atoms/Avatar'
import Bookmark from '@images/bookmark.svg'
import DisconnectWallet from '@images/disconnect.svg'
import LogoutIcon from '@images/logout.svg'
import AddTokenList from './AddTokenList'
import { useSsiWallet } from '@context/SsiWallet'
import { disconnectFromWallet } from '@utils/wallet/ssiWallet'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useAuth } from '@hooks/useAuth'
import { useModal } from 'connectkit'
import { useRouter } from 'next/router'
import { accountTruncate } from '@utils/wallet'

interface DetailsProps {
  onRequestClose?: () => void
}

interface MenuRowProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

function MenuRow({
  icon,
  label,
  onClick,
  disabled = false,
  className
}: MenuRowProps): ReactElement {
  return (
    <button
      type="button"
      className={`${styles.menuRow} ${disabled ? styles.menuRowDisabled : ''} ${
        className || ''
      }`}
      onClick={() => {
        if (disabled) return
        onClick?.()
      }}
      disabled={disabled}
    >
      <span className={styles.menuRowIcon}>{icon}</span>
      <span className={styles.menuRowLabel}>{label}</span>
    </button>
  )
}

export default function Details({
  onRequestClose
}: DetailsProps): ReactElement {
  const { connector: activeConnector, address: accountId } = useAccount()
  const { disconnect } = useDisconnect()
  const { logout, isAuthenticated, user, authEnabled } = useAuth()
  const { setOpen } = useModal()
  const router = useRouter()

  const {
    setSessionToken,
    ssiWalletCache,
    setCachedCredentials,
    clearVerifierSessionCache
  } = useSsiWallet()

  async function disconnectSsiWallet() {
    try {
      ssiWalletCache.clearCredentials()
      setCachedCredentials([])
      clearVerifierSessionCache()
      disconnectFromWallet()
      setSessionToken(undefined)
    } catch (error) {
      LoggerInstance.error(error)
    }
  }

  const isWalletConnected = Boolean(accountId)
  const hasMarketplaceSession = authEnabled && isAuthenticated && Boolean(user)
  const walletLabel = activeConnector?.name || 'Web3 wallet disconnected'
  const walletDescription = isWalletConnected
    ? accountTruncate(accountId)
    : 'Connect your web3 wallet to restore marketplace actions'
  const showTokenList =
    isWalletConnected && activeConnector?.name === 'MetaMask'

  const handleNavigation = async (href: string) => {
    onRequestClose?.()
    await router.push(href)
  }

  const handleConnectWallet = () => {
    onRequestClose?.()
    setOpen(true)
  }

  const handleDisconnectWallet = async () => {
    disconnect()
    // eslint-disable-next-line promise/param-names
    await new Promise((r) => setTimeout(r, 500))
    await disconnectSsiWallet()
  }

  const handleLogout = async () => {
    try {
      if (isWalletConnected) {
        await handleDisconnectWallet()
      } else {
        await disconnectSsiWallet()
      }
    } catch (error) {
      console.error('Error disconnecting wallet/SSI:', error)
    }

    await logout()
    onRequestClose?.()
  }

  return (
    <div className={styles.details}>
      <div className={styles.section}>
        <MenuRow
          icon={
            accountId ? (
              <Avatar accountId={accountId} />
            ) : (
              <span className={styles.placeholderAvatar} aria-hidden="true" />
            )
          }
          label="View Profile"
          onClick={() => handleNavigation('/profile')}
          disabled={!isWalletConnected}
        />
        <MenuRow
          icon={<Bookmark />}
          label="View Bookmarks"
          onClick={() => handleNavigation('/bookmarks')}
          disabled={!isWalletConnected}
          className={styles.bookmarksRow}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.walletInfo}>
          <div className={styles.walletHeading}>{walletLabel}</div>
          <div className={styles.walletDescription}>{walletDescription}</div>
          {showTokenList && <AddTokenList disabled={!isWalletConnected} />}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.walletActionRow}>
          <DisconnectWallet className={styles.walletActionIcon} />
          <Button
            style="text"
            size="small"
            onClick={
              isWalletConnected ? handleDisconnectWallet : handleConnectWallet
            }
          >
            {isWalletConnected
              ? 'Disconnect web3 wallet'
              : 'Connect web3 wallet'}
          </Button>
        </div>
        {hasMarketplaceSession && (
          <div className={styles.walletActionRow}>
            <LogoutIcon className={styles.walletActionIcon} />
            <Button
              style="text"
              size="small"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Marketplace sign-out
            </Button>
          </div>
        )}
      </div>

      {hasMarketplaceSession && user && (
        <div className={styles.userInfo}>
          <div className={styles.userEmail}>{user.email}</div>
          <div className={styles.userProvider}>
            Signed in with {user.authProvider}
          </div>
        </div>
      )}
    </div>
  )
}
