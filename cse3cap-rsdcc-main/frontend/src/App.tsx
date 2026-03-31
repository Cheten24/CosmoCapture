import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation"
import HomePage from "./pages/HomePage"
import TelescopeFeedPage from "./pages/TelescopeFeedPage"
import WeatherMonitoringPage from "./pages/WeatherMonitoringPage"
import RecentCapturesPage from "./pages/RecentCapturesPage"
import ObservabilityPage from "./pages/ObservabilityPage"
import TelescopeViewPage from "./pages/TelescopeViewPage"
import ObjectVisibilityDemo from "./pages/ObjectVisibilityDemo"
import { SafetyProvider } from "./contexts/SafetyContext"
import Footer from "./components/Footer"



function App() {
  return (
    <SafetyProvider updateInterval={30000}>
      <Router>
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

          {/* ⭐ 200+ RANDOM STARS */}
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

          {/* 🌑 DARK OVERLAY (lighter so stars visible) */}
          <div className="absolute inset-0 bg-black/20 z-[2]" />

          {/* 🌍 MAIN CONTENT */}
          <div className="relative z-10">
            <Navigation />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/telescope-feed" element={<TelescopeFeedPage />} />
              <Route path="/telescope-view" element={<TelescopeViewPage />} />
              <Route path="/weather" element={<WeatherMonitoringPage />} />
              <Route path="/recent-captures" element={<RecentCapturesPage />} />
              <Route path="/observability" element={<ObservabilityPage />} />
              <Route path="/object-visibility" element={<ObjectVisibilityDemo />} />
            </Routes>

            <Footer />
          </div>

        </div>
      </Router>
    </SafetyProvider>
  )
}

export default App