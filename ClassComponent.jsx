/* eslint-disable prettier/prettier */

import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

import { context as configContext } from 'core/config'
import { toggleMenu, toggleDebugMode } from 'core/layout/actions/layoutActions'
import InnerLayout from 'web/layout/components/InnerLayout'
import style from 'web/layout/styles/innerLayout'
import routes from 'web/shared/routes'
import { withTranslation } from 'react-i18next'
import i18next from 'i18next'

class InnerLayoutContainer extends React.Component {
  componentDidMount() {
    this.initLanguage()
  }

  componentDidUpdate = (prevProps) => {
    const { location, menuOpen, actions } = this.props
    if (location.pathname !== prevProps.location.pathname) {
      if (menuOpen) {
        actions.toggleMenu()
      }
    }
  }

  static contextType = configContext

  initLanguage() {
    const { config } = this.props

    i18next.changeLanguage(config.global.lang.toLowerCase())
  }

  render() {
    const { location } = this.props
    const adminView = location.pathname === routes.ADMIN.path

    return <InnerLayout adminView={adminView} {...this.props} />
  }
}

const mapStateToProps = (state, ownProps) => ({
  menuOpen: state.layout.menuOpen,
  isClient: ownProps.location.pathname.split('/')[1] === routes.CLIENT_DASHBOARD.path.split('/')[1],
  whoami: state.authentication.whoami,
  getWhoamiHasInit: state.authentication.getWhoamiHasInit,
  getWhoamiPending: state.authentication.getWhoamiPending,
  config: state.authentication.config,
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    toggleMenu: () => dispatch(toggleMenu()),
    toggleDebugMode: () => dispatch(toggleDebugMode()),
  },
})

export default compose(
  withStyles(style, { withTheme: true }),
  withRouter,
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(InnerLayoutContainer)
