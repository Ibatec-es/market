import { useAuth } from '@hooks/useAuth'
import styles from './index.module.css'

export default function LogoutButton() {
  const { logout, isLoading, user } = useAuth()

  if (!user) return null

  return (
    <button
      onClick={() => logout()}
      disabled={isLoading}
      className={styles.logoutButton}
    >
      {isLoading ? (
        <span className={styles.spinner}></span>
      ) : (
        <>
          <svg
            className={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sign Out</span>
        </>
      )}
    </button>
  )
}
