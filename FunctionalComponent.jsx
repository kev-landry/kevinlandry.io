/* eslint-disable prettier/prettier */
import React, { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { toggleMenu } from 'core/layout/actions/layoutActions'
import InnerLayout from 'web/layout/components/InnerLayout'
import routes from 'web/shared/routes'
import useConfig from 'core/hooks/useConfig'

const InnerLayoutContainer = () => {
  const location = useLocation()
  const locationRef = useRef(location.pathname)
  const dispatch = useDispatch()
  const menuOpen = useSelector((state) => state.layout.menuOpen)
  const auth = useSelector((state) => state.authentication)
  const language = useConfig('global')?.lang?.toLowerCase()
  const { i18n } = useTranslation()

  const isClient = location.pathname.split('/')[1] === routes.CLIENT_DASHBOARD.path.split('/')[1]
  const adminView = location.pathname === routes.ADMIN.path
  const innerLayoutProps = {
    menuOpen,
    isClient,
    adminView,
    whoami: auth.whoami,
    getWhoamiHasInit: auth.getWhoamiHasInit,
    getWhoamiPending: auth.getWhoamiPending,
  }

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [])

  useEffect(() => {
    locationRef.current = location.pathname
  }, [location.pathname])

  const prevLocation = locationRef.current

  useEffect(() => {
    if (location.pathname !== prevLocation && menuOpen) {
      dispatch(toggleMenu())
    }
  }, [location, prevLocation])

  return <InnerLayout adminView={adminView} {...innerLayoutProps} />
}

export default InnerLayoutContainer
