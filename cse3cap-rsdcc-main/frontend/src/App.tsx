import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import Navigation from "./components/Navigation"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
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
  const hideNavigation = location.pathname === "/" || location.pathname === "/login"

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(circle at 20% 30%, rgba(80,0,255,0.4), transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,100,255,0.4), transparent 40%), radial-gradient(circle at 50% 50%, #020617, #000000)` }} />
      <div className="stars">
        {[...Array(200)].map((_, i) => (
          <div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, animationDuration: `${Math.random() * 3 + 2}s`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/20 z-[2]" />
      <div className="relative z-10">
        {!hideNavigation && <Navigation />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform" element={<ProtectedRoute><PlatformPage /></ProtectedRoute>} />
          <Route path="/telescope-feed" element={<ProtectedRoute><TelescopeFeedPage /></ProtectedRoute>} />
          <Route path="/telescope-view" element={<ProtectedRoute><TelescopeViewPage /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><WeatherMonitoringPage /></ProtectedRoute>} />
          <Route path="/recent-captures" element={<ProtectedRoute><RecentCapturesPage /></ProtectedRoute>} />
          <Route path="/object-visibility" element={<ProtectedRoute><ObjectVisibilityDemo /></ProtectedRoute>} />
        </Routes>
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
