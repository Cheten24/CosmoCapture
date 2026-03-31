import LogViewer from "../components/LogViewer"
import MetricsDashboard from "../components/MetricsDashboard"
import TraceExplorer from "../components/Explorer"
import ScrollReveal from "../components/ScrollReveal"

const ObservabilityPage = () => {
  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10" style={{ pointerEvents: 'all' }}>
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal direction="down" delay={0.1}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">System Observability</h1>
            <p className="text-slate-400">Logs, Metrics, and Distributed Traces</p>
          </div>
        </ScrollReveal>

        <div className="space-y-6 lg:space-y-8">
          <ScrollReveal direction="up" delay={0.2}>
            <MetricsDashboard />
          </ScrollReveal>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <ScrollReveal direction="left" delay={0.1}>
              <LogViewer />
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <TraceExplorer />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ObservabilityPage