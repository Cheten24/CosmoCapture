import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Telescope, CloudSun, Camera, Activity, Eye, Menu, X, LogOut } from "lucide-react"

const menuItems = [
  { icon: <Home className="h-5 w-5" />, label: "Home", path: "/" },
  { icon: <Activity className="h-5 w-5" />, label: "Dashboard", path: "/Platform" },
  { icon: <Telescope className="h-5 w-5" />, label: "Book Session", path: "/telescope-feed" },
  { icon: <Telescope className="h-5 w-5" />, label: "Telescope View", path: "/telescope-view" },
  { icon: <CloudSun className="h-5 w-5" />, label: "Weather", path: "/weather" },
  { icon: <Camera className="h-5 w-5" />, label: "Captures", path: "/recent-captures" },
  { icon: <Eye className="h-5 w-5" />, label: "Object Visibility", path: "/object-visibility" },
]

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
  const username = localStorage.getItem("username")

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")
    localStorage.removeItem("userEmail")
    navigate("/login")
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img src="/latrobe-white.png" className="h-14 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="text-white/70">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm">Hi, {username}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Login
              </Link>
            )}
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="text-white" /> : <Menu className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-black/90 backdrop-blur-md px-4 py-4 space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-white/70 hover:text-white px-3 py-2 rounded-md hover:bg-white/10"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-red-400 hover:text-white px-3 py-2 rounded-md hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full border border-white/20 text-white py-2 rounded-md text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navigation
