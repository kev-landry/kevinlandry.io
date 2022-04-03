---
title: 'Functional vs class components'
date: '2022-04-03'
summary: "Les différences entre class et function en tant que composant étudiés lors d'une refacto. Ainsi que montrer un des cas d'utilisation de useRef()"
tags: ['react']
draft: false
---

# Class vs functionnal component

Pouvoir utiliser les [hooks react](https://fr.reactjs.org/docs/hooks-intro.html) (v16.8) et custom dans nos composants.

Sur certains projets il m'arrive encore de tomber sur des composants react sous formes de classe. J'en profite pour montrer une refacto en fonction.
Ici ce composant est un container qui utilise _redux_ ainsi que _react-router-dom_ avec une certaine logique afin de rendre un composant visuel.

Prennons en exemple ce composant **InnerLayoutCContainer**.

Class component:

```jsx
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
```

Son refacto en function component:

```jsx
const InnerLayoutContainer = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const locationRef = useRef(location.pathname)
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
```

### useRef

Avec un functionnal component nous n’avons plus accès aux prevProps via le cycle de vie qu'avait les classes, en l'occcurence _componentDidUpdate_. Ici un des moyens d’imiter le comportement de ces prevProps est d’utiliser le hook react [useRef()](https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state).

De base `useRef()` et sa propriété _.current_ ne va jamais changer de valeur à travers les renders de nos composants. _.current._ étant mutable il va donc être possible de lui assigner une valeur et de pouvoir l'utiliser après le prochain render sans que celle-ci soit réinitilisée.

On initialise la ref avec par défaut l'url actuelle:

```jsx
const location = useLocation()
const locationRef = useRef(location.pathname)
```

A chaque changement d'url (_location.pathname_) on attribue l'url actuelle à _.current_.

```jsx
useEffect(() => {
  locationRef.current = location.pathname
}, [location.pathname])

const prevLocation = locationRef.current
```

Enfin, on peut maintenant faire la différence entre l'ancienne (_prevLocation_) et la nouvelle (_location.pathname_) url afin d'exécuter une certaine action, dans notre cas plier/déplier un menu.

```jsx
useEffect(() => {
  if (location.pathname !== prevLocation && menuOpen) {
    dispatch(toggleMenu())
  }
}, [location, prevLocation])
```

### Redux

Pour la partie redux, sous forme de classe, 2 fonctions sont créées en dehors du composants, `mapDispatchToProps` (dispatch) et `mapStateToProps` (state). on les passe enuiste en tant qu'arguments à `connect()` afin de pouvoir les utiliser dans notre classe et ainsi lier notre store redux à notre composant.

```jsx
// Class component
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

export default compose(connect(mapStateToProps, mapDispatchToProps))(InnerLayoutContainer)
```

En ce qui concerne notre function component on utilise 2 hooks qui proviennent de l'api Redux.
On retrouve ici l'équivalent (ou presque) du code d'au dessus, cette fois le scope de notre composant:

```jsx
// Function component
const dispatch = useDispatch()
const menuOpen = useSelector((state) => state.layout.menuOpen)
const auth = useSelector((state) => state.authentication)
```

### Cycle de vie

Avec cet exemple on voit que `useEffect()` remplace les différentes méthodes _componentDidMount_, _componentDidUpdate_ ou _componentWillUnmount_ (non présenté ici) afin de gérer les différents effet de bords.

Ce code par exemple peut être un équivalent à `componentDidMount()`. Il ne s'éxécutera qu'une fois après le **premier** render.

```jsx
useEffect(() => {
  i18n.changeLanguage(language)
  // On souhaite changer le langage seulement une fois
  // Tableau de dépendences vide
}, [])
```

### Conclusion

Au final le vrai but des _functional component_ introduit avec react v16.8 est d'éviter la duplication de code grâce aux custom hooks mais aussi de rendre plus clair la lisibilité des composants. Un `useEffect()` -> une responsabilité isolée (separation of concern). Et non pas un sujet dispatché entre les méthodes _componentDidMount_ _componentDidUpdate_ comme cela peut être le cas avec une classe.
