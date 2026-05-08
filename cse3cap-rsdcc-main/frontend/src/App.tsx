import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"

import Navigation from "./components/Navigation"
import Footer from "./components/Footer"

import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import PlatformPage from "./pages/PlatformPage"

import TelescopeFeedPage from "./pages/TelescopeFeedPage"
import TelescopeViewPage from "./pages/TelescopeViewPage"
import WeatherMonitoringPage from "./pages/WeatherMonitoringPage"
import RecentCapturesPage from "./pages/RecentCapturesPage"
import ObjectVisibilityDemo from "./pages/ObjectVisibilityDemo"

import { SafetyProvider } from "./contexts/SafetyContext"

function AppContent() {
  const location = useLocation()

  const hideNavigation =
    location.pathname === "/" ||
    location.pathname === "/login"

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* 🌌 GALAXY BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(80,0,255,0.4), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0,100,255,0.4), transparent 40%),
            radial-gradient(circle at 50% 50%, #020617, #000000)
          `
        }}
      />

      {/* ⭐ STARS */}
      <div className="stars">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/20 z-[2]" />

      {/* 🌍 MAIN CONTENT */}
      <div className="relative z-10">

        {/* NAVIGATION */}
        {!hideNavigation && <Navigation />}

        {/* ROUTES */}
        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/platform" element={<PlatformPage />} />

          <Route path="/telescope-feed" element={<TelescopeFeedPage />} />

          <Route path="/telescope-view" element={<TelescopeViewPage />} />

          <Route path="/weather" element={<WeatherMonitoringPage />} />

          <Route path="/recent-captures" element={<RecentCapturesPage />} />

          <Route path="/object-visibility" element={<ObjectVisibilityDemo />} />

        </Routes>

        {/* FOOTER */}
        {!hideNavigation && <Footer />}

      </div>

    </div>
  )
}

function App() {
  return (
    <SafetyProvider updateInterval={30000}>
      <Router>
        <AppContent />
      </Router>
    </SafetyProvider>
  )
}

export default App