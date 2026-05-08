import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  //  NEW: Backend login function
  const callBackendLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: username,   // IMPORTANT
          email: email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Login failed")
        setIsError(true)
        return false
      }

      return true
    } catch (error) {
      console.error(error)
      setMessage("Server error. Please try again.")
      setIsError(true)
      return false
    }
  }

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !email.trim()) {
      setMessage("Please enter both username and email.")
      setIsError(true)
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid email address.")
      setIsError(true)
      return
    }

    setCodeSent(true)
    setMessage(`Verification code sent to ${email}.`)
    setIsError(false)
  }

  // 🔥 UPDATED: now async + backend call
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setMessage("Please enter the verification code.")
      setIsError(true)
      return
    }

    if (code === "123456") {
      const success = await callBackendLogin()

      if (!success) return

      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("username", username)
      localStorage.setItem("userEmail", email)

      setMessage("Login successful.")
      setIsError(false)

      setTimeout(() => {
        navigate("/")
      }, 1000)
    } else {
      setMessage("Invalid verification code.")
      setIsError(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl border border-slate-700 bg-slate-800/50 backdrop-blur-md p-8 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">
            Student Login
          </h1>

          <p className="text-slate-300 text-center mb-8 leading-relaxed">
            Enter your username and email to access telescope bookings.
          </p>

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-3 rounded bg-slate-900 border"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 rounded bg-slate-900 border"
              />

              <button className="w-full bg-indigo-500 p-3 rounded">
                Send Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Verification Code"
                className="w-full p-3 rounded bg-slate-900 border"
              />

              <button className="w-full bg-green-500 p-3 rounded">
                Verify & Login
              </button>
            </form>
          )}

          {message && (
            <p className={isError ? "text-red-400" : "text-green-400"}>
              {message}
            </p>
          )}

          <Link to="/" className="block mt-4 text-center text-blue-400">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}