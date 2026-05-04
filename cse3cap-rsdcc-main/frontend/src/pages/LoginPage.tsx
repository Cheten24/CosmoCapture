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

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setMessage("Please enter the verification code.")
      setIsError(true)
      return
    }

    if (code === "123456") {
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
            Enter your username and email to access telescope bookings and live observation features.
          </p>

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-white font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email"
                  className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition duration-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
              >
                Send Verification Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-white font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  className="w-full rounded-xl bg-slate-900 border border-slate-600 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 transition duration-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
              >
                Verify and Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false)
                  setCode("")
                  setMessage("")
                }}
                className="w-full border border-slate-600 text-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700/50 transition duration-300"
              >
                Back
              </button>
            </form>
          )}

          {message && (
            <div
              className={`mt-5 rounded-xl border px-4 py-3 font-medium ${
                isError
                  ? "bg-red-500/10 border-red-400 text-red-300"
                  : "bg-green-500/10 border-green-400 text-green-300"
              }`}
            >
              {message}
            </div>
          )}

          <p className="text-slate-500 text-xs text-center mt-3 leading-relaxed">
            A verification code will be sent to your email to securely access your account.
          </p>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-indigo-300 hover:text-indigo-200 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}