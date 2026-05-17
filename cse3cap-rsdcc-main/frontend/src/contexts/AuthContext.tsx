import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  username: string | null
  userEmail: string | null
  login: (username: string, email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Retrieve user on page reload
  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn")
    const storedUsername = localStorage.getItem("username")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedLogin === "true" && storedUsername) {
      setIsLoggedIn(true)
      setUsername(storedUsername)
      setUserEmail(storedEmail)
    }
  }, [])

  const login = (username: string, email: string) => {
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("username", username)
    localStorage.setItem("userEmail", email)
    setIsLoggedIn(true)
    setUsername(username)
    setUserEmail(email)
  }

  const logout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")
    localStorage.removeItem("userEmail")
    setIsLoggedIn(false)
    setUsername(null)
    setUserEmail(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
