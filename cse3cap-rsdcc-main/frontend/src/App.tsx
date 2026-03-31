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

const BACKGROUND_VIDEO_SRC = '/videos/bg-earth.mp4';

function App() {
  return (
    <SafetyProvider updateInterval={30000}>
      <Router>
        <div className="relative min-h-screen bg-transparent overflow-hidden">

          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ zIndex: -1 }}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={BACKGROUND_VIDEO_SRC} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div 
              className="absolute top-0 left-0 w-full h-full"
              style={{ zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} 
          />
          
          <div className="relative z-10" >
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