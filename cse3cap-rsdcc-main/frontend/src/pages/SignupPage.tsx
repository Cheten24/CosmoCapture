import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../firebase"

export default function SignupPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !email || !password || !confirmPassword) {
      setMessage("Please fill in all fields.")
      setIsError(true)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setIsError(true)
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      setIsError(true)
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      await setDoc(doc(db, "users", userCredential.user.uid), {
        username,
        email,
        createdAt: new Date(),
      })

      setMessage("Account created successfully.")
      setIsError(false)

      setTimeout(() => {
        navigate("/login")
      }, 1000)
    } catch (error) {
      console.error(error)
      setMessage("Signup failed. Email may already be used.")
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 bg-black">
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(37,99,235,0.15)]">
          <h1 className="text-4xl font-bold text-white text-center mb-3">
            Create Account
          </h1>

          <p className="text-white/60 text-center mb-8">
            Sign up to book telescope sessions and save captures.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
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

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {message && (
            <p className={`mt-5 text-sm text-center ${isError ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}

          <Link to="/login" className="block mt-8 text-center text-blue-300 hover:text-blue-200">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}