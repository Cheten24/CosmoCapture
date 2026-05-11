const SystemStatus = () => {
  // Static placeholder data for system status
  const systemStatus = [
    { component: "Telescope", status: "Online", color: "text-green-600" },
    { component: "Camera", status: "Online", color: "text-green-600" },
    { component: "Mount", status: "Tracking", color: "text-yellow-600" },
    { component: "Weather Station", status: "Online", color: "text-green-600" },
    { component: "Network", status: "Stable", color: "text-green-600" },
  ]

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 border-b border-slate-600 pb-3 text-white">System Status</h3>

      <div className="space-y-2">
        {systemStatus.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0">
            <span className="text-sm font-semibold text-slate-300">{item.component}</span>
            <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SystemStatus
