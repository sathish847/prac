import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      const userEmail = localStorage.getItem('userEmail')

      if (token && userData) {
        try {
          // Verify token with backend (using relative path for Netlify proxy)
          const response = await fetch(`/api/admin/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userInfo = JSON.parse(userData)
            setUser({
              ...userInfo,
              email: userEmail
            })
            setIsAuthenticated(true)
          } else {
            // Token is invalid, clear everything
            logout()
          }
        } catch (error) {
          // Network error or other issue, clear auth
          logout()
        }
      }

      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = (token, userData, email) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('userEmail', email)

    setUser({
      ...userData,
      email
    })
    setIsAuthenticated(true)
  }

  const logout = async () => {
    const token = localStorage.getItem('authToken')

    try {
      if (token) {
        // Make logout API call with bearer token (using relative path for Netlify proxy)
        await fetch(`/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      // Log error but continue with logout
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userEmail')
      sessionStorage.clear()

      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
