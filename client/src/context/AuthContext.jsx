import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API = 'http://localhost:4000'

export function AuthProvider({ children }) {
  // user: { email, name, trainerId, hasProfile, id } | null
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const register = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUser({ email: data.email, name: null, trainerId: null, hasProfile: false })
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    const me = await fetch(`${API}/auth/me`, { credentials: 'include' }).then(r => r.json())
    setUser(me)
  }, [])

  const logout = useCallback(async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    const me = await fetch(`${API}/auth/me`, { credentials: 'include' }).then(r => r.json())
    setUser(me)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}