import { useState, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, type Variants, type Transition } from "framer-motion"
import { Home, Telescope, CloudSun, Camera, Activity, Eye, Menu, X} from "lucide-react"

interface MenuItem {
  icon: ReactNode
  label: string
  path: string
  gradient: string
  iconColor: string
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Home",
    path: "/",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <Telescope className="h-5 w-5" />,
    label: "Telescope Feed",
    path: "/telescope-feed",
    gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
    iconColor: "text-purple-500",
  },
{
    icon: <Telescope className="h-5 w-5" />,
    label: "Telescope View",
    path: "/telescope-view",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <CloudSun className="h-5 w-5" />,
    label: "Weather",
    path: "/weather",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: <Camera className="h-5 w-5" />,
    label: "Captures",
    path: "/recent-captures",
    gradient: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(219,39,119,0.06) 50%, rgba(190,24,93,0) 100%)",
    iconColor: "text-pink-500",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    label: "Observability",
    path: "/observability",
    gradient: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(2,132,199,0.06) 50%, rgba(3,105,161,0) 100%)",
    iconColor: "text-cyan-500",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    label: "Object Visibility",
    path: "/object-visibility",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
]

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

const Navigation = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="bg-transparent sticky top-0 z-50 transition-colors duration-300"> 
      {/* Pushing the logo further left by reducing left padding (pl) and ensuring good right spacing (pr) */}
      <div className="w-full px-4 sm:px-6 lg:pl-8 lg:pr-20">
        <div className="flex justify-between items-center h-24"> 
          <Link to="/" className="flex items-center h-24"> 
            
            {/* Reduced height to h-20 (80px) and kept w-auto for aspect ratio */}
            <div className="h-20 w-auto flex items-center justify-center">
              <img 
                src="/latrobe-white.png" 
                alt="Latrobe University Logo" 
                className="h-full w-auto object-contain" 
              />
            </div>
            
          </Link>

          <motion.div
            className="hidden lg:block relative overflow-visible"
            initial="initial"
            whileHover="hover"
          >
            <motion.div
              className="absolute -inset-2 bg-gradient-radial from-transparent via-blue-400/30 via-30% via-purple-400/30 via-60% via-red-400/30 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
              variants={navGlowVariants}
            />
            <ul className="flex items-center gap-4 relative z-10"> 
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <motion.li key={item.path} className="relative">
                    <motion.div
                      className="block rounded-xl overflow-visible group relative"
                      style={{ perspective: "600px" }}
                      whileHover="hover"
                      initial="initial"
                    >
                      <motion.div
                        className="absolute inset-0 z-0 pointer-events-none"
                        variants={glowVariants}
                        style={{
                          background: item.gradient,
                          opacity: isActive ? 1 : 0,
                          borderRadius: "16px",
                        }}
                      />
                      <motion.div
                        variants={itemVariants}
                        transition={sharedTransition}
                        style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center gap-2 px-5 py-2.5 relative z-10 rounded-xl transition-colors ${
                            isActive ? "text-white bg-slate-800/60 backdrop-blur-sm" : "text-white group-hover:text-white"
                          }`}
                        >
                          <span className={`transition-colors duration-300 ${isActive ? item.iconColor : ""}`}>
                            {item.icon}
                          </span>
                          <span className="text-base font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 z-10"
                        variants={backVariants}
                        transition={sharedTransition}
                        style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                      >
                        <Link to={item.path} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white">
                          <span className={item.iconColor}>{item.icon}</span>
                          <span className="text-base font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>

          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              style={{ pointerEvents: 'all' }} 
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`} 
        id="mobile-menu"
        style={{ pointerEvents: 'all' }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700 bg-slate-900/90 backdrop-blur-sm"> 
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={toggleMenu} 
              className="flex items-center gap-3 text-slate-200 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition duration-150"
            >
              <span className={item.iconColor}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
