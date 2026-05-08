import ScrollReveal from "../components/ScrollReveal"

const RecentCapturesPage = () => {
  return (
    <div
      className="min-h-screen bg-transparent py-8 relative z-10"
      style={{ pointerEvents: "all" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal direction="down" delay={0.1}>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Recent Captures</h1>
            <p className="text-slate-400">Browse your recent telescope captures</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-8 min-h-[320px] hover:border-slate-600 transition-colors">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Photos
                </h2>

                <div className="h-[220px] rounded-xl border border-slate-700 bg-slate-950/40 flex items-center justify-center">
                  <p className="text-slate-400 text-lg">Photos will appear here</p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-8 min-h-[320px] hover:border-slate-600 transition-colors">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Videos
                </h2>

                <div className="h-[220px] rounded-xl border border-slate-700 bg-slate-950/40 flex items-center justify-center">
                  <p className="text-slate-400 text-lg">Videos will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}

export default RecentCapturesPage