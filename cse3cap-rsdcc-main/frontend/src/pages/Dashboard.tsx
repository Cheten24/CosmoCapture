"use client"

import { motion } from "framer-motion"
import WeatherWidget from "../components/WeatherWidget"
import VideoPlayer from "../components/VideoPlayer"
import TelescopeControlPanel from "../components/TelescopeControlPanel"
import TelescopeOrientation from "../components/TelescopeOrientation"
import SystemStatus from "../components/SystemStatus"
import TelescopeView from "../components/TelescopeView"
import RecentCaptures from "../components/RecentCaptures"
import StatusDashboard from "../components/StatusDashboard"
import ErrorBoundary from "../components/ErrorBoundary"
import ScrollReveal from "../components/ScrollReveal"

const Dashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-transparent"> 
      <div className="p-6 relative z-10 bg-transparent text-white max-w-7xl mx-auto">

        <ScrollReveal direction="down" delay={0.2}>
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">Latrobe Observatory</h1>
            <p className="text-lg text-gray-200 mt-2">Telescope Control Dashboard</p>
          </div>
        </ScrollReveal>

        <motion.div
          className="space-y-6 lg:space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ScrollReveal direction="left" delay={0.1}>
              <VideoPlayer />
            </ScrollReveal>

            <div className="space-y-6 lg:space-y-8">
              <ScrollReveal direction="right" delay={0.2}>
                <TelescopeControlPanel />
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.3}>
                <WeatherWidget />
              </ScrollReveal>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ScrollReveal direction="left" delay={0.1}>
              <TelescopeOrientation />
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <SystemStatus />
            </ScrollReveal>
          </div>

          {/* Third row - Status Dashboard */}
          <ScrollReveal delay={0.1}>
            <ErrorBoundary>
              <StatusDashboard />
            </ErrorBoundary>
          </ScrollReveal>

          {/* Fourth row - View and Captures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ScrollReveal direction="left" delay={0.1}>
              <TelescopeView />
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <RecentCaptures />
            </ScrollReveal>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard