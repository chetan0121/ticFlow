import { lazy } from 'react'

// Lazy load pages
const Home = lazy(() => import('../pages/main/Home'))
const GameBoard = lazy(() => import('../pages/game/GameBoard'))
const LoadingScreen = lazy(() => import('../pages/main/LoadingScreen'))
const NotFoundPage = lazy(() => import('../pages/main/NotFound'))
const GameMenu = lazy(() => import('../pages/game/GameMenu'))
const AuthPage = lazy(() => import('../pages/main/AuthPage'))

// Mapping routes
const AppRoutes = {
  home: {
    path: '/',
    page: Home,
  },
  gameBoard: {
    path: '/board',
    page: GameBoard,
  },
  loading: {
    path: '/loading',
    page: LoadingScreen,
  },
  gameMenu: {
    path: '/gamesetup',
    page: GameMenu,
  },
  auth: {
    path: '/auth',
    page: AuthPage,
  },
  notFound: {
    path: '*',
    page: NotFoundPage,
  },
}

export default AppRoutes
