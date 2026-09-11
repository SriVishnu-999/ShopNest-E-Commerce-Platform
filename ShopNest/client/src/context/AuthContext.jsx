import { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('shopnest_user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  const saveSession = (data) => {
    localStorage.setItem('shopnest_token', data.token)
    const nextUser = { fullName: data.fullName, email: data.email, role: data.role }
    localStorage.setItem('shopnest_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return saveSession(data)
  }

  const register = async (fullName, email, password) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    })
    return saveSession(data)
  }

  const logout = () => {
    localStorage.removeItem('shopnest_token')
    localStorage.removeItem('shopnest_user')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, login, register, logout, isAdmin: user?.role === 'Admin' }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
