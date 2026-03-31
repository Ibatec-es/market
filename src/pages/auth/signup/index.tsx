import { ReactElement } from 'react'
import Signup from '../../../components/Auth/Signup'
import Page from '../../../components/@shared/Page'
import content from '../../../../content/auth/signup.json'
import router from 'next/router'

export default function AuthSignup(): ReactElement {
  const { title, description, benefits } = content

  return (
    <Page
      title={title}
      description={description}
      uri={router.route}
      noPageHeader
    >
      <Signup content={{ title, description, benefits }} />
    </Page>
  )
}
