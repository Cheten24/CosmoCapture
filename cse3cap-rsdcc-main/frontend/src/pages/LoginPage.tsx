import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  // BACKEND LOGIN
  const handleLogin = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch("http://127.0.0.1:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: username,
          email: email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Login failed")
        setIsError(true)
        return
      }

      // SAVE LOGIN STATE
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("username", username)
      localStorage.setItem("userEmail", email)

      setMessage("Access granted.")
      setIsError(false)

      setTimeout(() => {
        navigate("/")
      }, 1000)

    } catch (error) {
      console.error(error)
      setMessage("Server error. Please try again.")
      setIsError(true)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-6">

      {/* 🎥 BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/bg-space.mp4" type="video/mp4" />
      </video>

      {/* 🌑 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* ✨ GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-black/40 to-black"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md">

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(37,99,235,0.15)]">

          {/* TITLE */}
          <div className="text-center mb-8">

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">
              CosmoCapture
            </h1>

            <p className="text-blue-200 text-lg font-light mb-3">
              Observatory Access Portal
            </p>

            <p className="text-white/60 text-sm leading-relaxed">
              Secure access to remote telescope systems, observatory monitoring,
              and astronomical data capture.
            </p>

          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
            />

            <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 shadow-[0_0_25px_rgba(37,99,235,0.35)]">
              Access Platform
            </button>

          </form>

          {/* MESSAGE */}
          {message && (
            <p
              className={`mt-5 text-sm text-center ${
                isError ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </p>
          )}

          {/* BACK BUTTON */}
          <Link
            to="/"
            className="block mt-8 text-center text-blue-300 hover:text-blue-200 transition"
          >
            ← Return to Homepage
          </Link>

        </div>

      </div>

    </div>
  )
}