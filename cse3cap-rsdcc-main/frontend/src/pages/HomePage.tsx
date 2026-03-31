"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import ScrollReveal from "../components/ScrollReveal"
import { Telescope, Zap, Globe, Shield } from "lucide-react"

const HomePage = () => {
  return (
    <div className="min-h-screen bg-transparent"> 
      
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden z-10"> 
        
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0b5394]/30 via-[#093b67]/40 to-[#011120]/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <Telescope className="h-16 w-16 text-white" />
              </div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-poppins text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#0b5394] via-[#09467c] to-[#05294a]">
                La Trobe Observatory
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Remote Scientific Data Capture and Control System
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.6}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/telescope-feed"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Launch Telescope Control
              </Link>
              <Link
                to="/observability"
                className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border border-white hover:bg-white hover:text-slate-900 transition-all duration-300 hover:scale-[1.02]"
              >
                View System Status
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 px-4 relative z-10"> 
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl text-center text-white mb-16">Advanced Telescope Control</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Telescope className="h-8 w-8" />,
                title: "Real-Time Control",
                description: "Direct telescope control with live position tracking and status monitoring",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Instant Response",
                description: "Low-latency commands and immediate feedback for precise observations",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Weather Integration",
                description: "Live weather data to ensure optimal viewing conditions",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Full Observability",
                description: "Comprehensive logging, metrics, and tracing for system health",
                color: "from-green-500 to-emerald-500",
              },
            ].map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 transition-all duration-300 hover:scale-105">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage