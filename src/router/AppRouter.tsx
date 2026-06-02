import { Suspense } from 'react'
import AppRoutes from './AppRoutes'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingScreen from '../pages/Main/LoadingScreen'
import BasePage from '../pages/BasePage'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <BasePage>
            <LoadingScreen />
          </BasePage>
        }
      >
        <Routes>
          {Object.entries(AppRoutes).map(([key, route]) => (
            <Route
              key={key}
              path={route.path}
              element={
                <BasePage>
                  <route.page />
                </BasePage>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
