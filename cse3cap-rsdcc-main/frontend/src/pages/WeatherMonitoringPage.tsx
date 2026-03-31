import ScrollReveal from "../components/ScrollReveal"
import WeatherWidget from "../components/WeatherWidget"
import WebRTCStreamPlayer from "../components/WebRTCStreamPlayer"

const WeatherMonitoringPage = () => {
  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10" style={{ pointerEvents: 'all' }}>
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Weather Monitoring</h1>
            <p className="text-slate-400">Real-time atmospheric conditions for optimal observations</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScrollReveal>
            <WeatherWidget />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Observation Conditions</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300">Sky Clarity</span>
                  <span className="text-green-400 font-semibold">Excellent</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300">Seeing Conditions</span>
                  <span className="text-blue-400 font-semibold">Good</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300">Cloud Cover</span>
                  <span className="text-yellow-400 font-semibold">Minimal</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-300">Wind Speed</span>
                  <span className="text-green-400 font-semibold">Low</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* All Sky Camera Section */}
        <ScrollReveal delay={0.4}>
          <div className="mt-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">All Sky Camera</h2>
            <p className="text-slate-400 mb-4">Real-time view of the entire sky hemisphere</p>
            <div className="aspect-video bg-slate-900/50 rounded-lg overflow-hidden">
              <WebRTCStreamPlayer 
                whepUrl="http://localhost:8889/allsky/whep"
                label="All Sky Camera"
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}

export default WeatherMonitoringPage