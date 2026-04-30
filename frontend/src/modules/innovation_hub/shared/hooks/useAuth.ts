import { useState, useCallback } from 'react'
import { authApi } from '../api'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ih_user')
    return stored ? JSON.parse(stored) : null
  })

  const loginAsPersona = useCallback(async (persona: 'employee' | 'admin' | 'sponsor' | 'project_owner') => {
    const { data } = await authApi.persona(persona)
    localStorage.setItem('ih_token', data.token)
    localStorage.setItem('ih_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ih_token')
    localStorage.removeItem('ih_user')
    setUser(null)
  }, [])

  return { user, loginAsPersona, logout, isAdmin: user?.role === 'admin' }
}
