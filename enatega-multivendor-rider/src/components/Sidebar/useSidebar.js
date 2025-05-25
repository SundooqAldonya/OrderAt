import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { gql, useMutation } from '@apollo/client'
import { toggleAvailablity, toggleMute } from '../../apollo/mutations'
import UserContext from '../../context/user'
import { profile } from '../../apollo/queries'
import { useTranslation } from 'react-i18next'
import { useSoundContext } from '../../context/sound'

const TOGGLE_RIDER = gql`
  ${toggleAvailablity}
`
const TOGGLE_Mute = gql`
  ${toggleMute}
`
const PROFILE = gql`
  ${profile}
`

const PRODUCT_URL = 'https://orderat.ai'
const PRIVACY_URL = 'https://orderat.ai/#/privacy'

const ABOUT_URL = 'https://orderat.ai'

// constants
/*const datas = [
  {
    title: 'Product Page',
    icon: 'product-hunt',
    navigateTo: PRODUCT_URL
  },
  {
    title: 'Privacy Policy',
    icon: 'lock',
    navigateTo: PRIVACY_URL
  },
  {
    title: 'About Us',
    icon: 'info-circle',
    navigateTo: ABOUT_URL
  }
]*/

const useSidebar = () => {
  const { t } = useTranslation()
  const datas = [
    {
      title: t('productPage'),
      icon: 'product-hunt',
      navigateTo: PRODUCT_URL
    },
    {
      title: t('privacyPolicy'),
      icon: 'lock',
      navigateTo: PRIVACY_URL
    },
    {
      title: t('aboutUs'),
      icon: 'info-circle',
      navigateTo: ABOUT_URL
    }
  ]
  const { logout } = useContext(AuthContext)
  const { dataProfile } = useContext(UserContext)
  const [isMuted, setIsMuted] = useState(dataProfile?.rider.muted)
  const [isEnabled, setIsEnabled] = useState(dataProfile?.rider.available)

  console.log({ dataProfileMuted: dataProfile?.rider.muted })
  console.log({ isEnabled })
  console.log({ isMuted })

  const toggleSwitch = () => {
    if (dataProfile?.rider?.isActive) {
      mutateToggle({ variables: { id: dataProfile.rider._id }, onCompleted })
      if (isEnabled) {
        setIsMuted(true)
      }
      setIsEnabled(previousState => !previousState)
    }
  }

  const toggleMute = async () => {
    mutateMute({
      variables: { id: dataProfile.rider._id },
      onCompleted: completedMute
    })
    setIsMuted(!isMuted)
  }

  useEffect(() => {
    if (!dataProfile) return
    setIsEnabled(dataProfile?.rider.available)
    setIsMuted(dataProfile?.rider.muted)
  }, [dataProfile])

  function onCompleted({ toggleAvailability }) {
    if (toggleAvailability) {
      setIsEnabled(toggleAvailability.available)
    }
  }
  function completedMute({ toggleAvailability }) {
    if (toggleAvailability) {
      setIsMuted(toggleAvailability.muted)
    }
  }
  const [mutateToggle] = useMutation(TOGGLE_RIDER, {
    refetchQueries: [{ query: PROFILE }]
  })
  const [mutateMute] = useMutation(TOGGLE_Mute, {
    refetchQueries: [{ query: PROFILE }]
  })
  return {
    logout,
    isEnabled,
    isMuted,
    datas,
    dataProfile,
    toggleSwitch,
    toggleMute
  }
}

export default useSidebar
