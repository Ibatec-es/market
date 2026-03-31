import { ReactElement } from 'react'
import Login from '../../../components/Auth/Login'
import Page from '../../../components/@shared/Page'
import content from '../../../../content/auth/login.json'
import router from 'next/router'

export default function AuthLogin(): ReactElement {
  const { title, description, features } = content

  return (
    <Page
      title={title}
      description={description}
      uri={router.route}
      noPageHeader
    >
      <Login content={{ title, description, features }} />
    </Page>
  )
}
