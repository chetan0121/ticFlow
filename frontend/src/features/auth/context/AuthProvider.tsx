import { useEffect, useMemo, useState, type ReactNode } from 'react'

import * as authApi from '../api'
import type { AuthUser } from '../types'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    authApi
      .getMe()
      .then(response => {
        if (isMounted) setUser(response.user)
      })
      .catch(() => {
        if (isMounted) setUser(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      user,
      login: async (identifier: string, password: string) => {
        const response = await authApi.login(identifier, password)
        setUser(response.user)
      },
      signup: async (username: string, email: string, password: string) => {
        const response = await authApi.signup(username, email, password)
        setUser(response.user)
      },
      logout: async () => {
        await authApi.logout()
        setUser(null)
      },
    }),
    [isLoading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
