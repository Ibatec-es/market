import { MouseEventHandler, ReactElement, ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@hooks/useAuth'
import { useRouter } from 'next/router'

interface AuthEntryProps {
  authenticatedContent: ReactNode
  loginClassName: string
  buttonContentClassName: string
  buttonTextClassName: string
  loginLabel?: string
  onLoginClick?: MouseEventHandler<HTMLButtonElement>
}

export default function AuthEntry({
  authenticatedContent,
  loginClassName,
  buttonContentClassName,
  buttonTextClassName,
  loginLabel = 'Login',
  onLoginClick
}: AuthEntryProps): ReactElement {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const path = router.asPath.split('?')[0]
  const isAuthRoute = path.startsWith('/auth/')

  if (isAuthenticated) {
    return <>{authenticatedContent}</>
  }

  if (isAuthRoute) {
    return <></>
  }

  const content = (
    <span className={buttonContentClassName}>
      <span className={buttonTextClassName}>{loginLabel}</span>
    </span>
  )

  if (onLoginClick) {
    return (
      <button type="button" className={loginClassName} onClick={onLoginClick}>
        {content}
      </button>
    )
  }

  return (
    <Link className={loginClassName} href="/auth/login">
      {content}
    </Link>
  )
}
