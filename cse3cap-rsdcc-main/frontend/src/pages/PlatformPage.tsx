import { Link } from "react-router-dom"

function PlatformPage() {
  const username = localStorage.getItem("username") || "Explorer"

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-6 py-20">

      {/* 🌍 EARTH */}
      <img
        src="/planets/earth.png"
        className="absolute left-[-120px] top-20 w-[420px] opacity-70 pointer-events-none"
        style={{
          animation: "float1 11s ease-in-out infinite",
          filter: "drop-shadow(0 0 40px rgba(255,255,255,0.12))"
        }}
      />

      {/* 🪐 SATURN */}
      <img
        src="/planets/saturn.png"
        className="absolute right-[-140px] bottom-0 w-[450px] opacity-75 pointer-events-none"
        style={{
          animation: "float2 10s ease-in-out infinite",
          filter: "drop-shadow(0 0 40px rgba(255,255,255,0.12))"
        }}
      />

      {/* 🌕 JUPITER */}
      <img
        src="/planets/jupiter.png"
        className="absolute left-[42%] top-[18%] w-[240px] opacity-70 pointer-events-none"
        style={{
          animation: "float3 8s ease-in-out infinite",
          filter: "drop-shadow(0 0 40px rgba(255,255,255,0.12))"
        }}
      />

      {/* 🌑 MOON */}
      <img
        src="/planets/moon.png"
        className="absolute right-10 top-10 w-[240px] opacity-75 pointer-events-none"
        style={{
          animation: "float4 12s ease-in-out infinite",
          filter: "drop-shadow(0 0 40px rgba(255,255,255,0.12))"
        }}
      />

      {/* 🌌 OVERLAY */}
      <div className="absolute inset-0 bg-black/40" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-5 tracking-wide">
            Welcome back, {username}
          </h1>

          <p className="text-blue-200 text-xl md:text-2xl font-light mb-6">
            CosmoCapture Observatory Platform
          </p>

          <p className="text-white/65 max-w-3xl mx-auto text-lg leading-relaxed">
            Access remote telescope systems, monitor observatory conditions,
            manage observation sessions, and explore astronomical data
            through the CosmoCapture platform.
          </p>

        </div>

        {/* MAIN DASHBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">

          {/* BOOK SESSION */}
          <Link to="/telescope-feed">

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition duration-300 shadow-[0_0_40px_rgba(37,99,235,0.15)] min-h-[280px] flex flex-col justify-between">

              <div>
                <h2 className="text-3xl text-white font-semibold mb-5">
                  Booking & Queue Portal
                </h2>

                <p className="text-white/65 text-lg leading-relaxed">
                  Schedule telescope observation sessions, manage observation
                  timings, and monitor the live observatory queue.
                </p>
              </div>

              <div className="mt-10">
                <span className="text-blue-300 text-lg font-medium">
                  Enter Session Portal →
                </span>
              </div>

            </div>

          </Link>

          {/* WEATHER */}
          <Link to="/weather">

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition duration-300 shadow-[0_0_40px_rgba(37,99,235,0.15)] min-h-[280px] flex flex-col justify-between">

              <div>
                <h2 className="text-3xl text-white font-semibold mb-5">
                  Weather Monitoring
                </h2>

                <p className="text-white/65 text-lg leading-relaxed">
                  Monitor atmospheric conditions, humidity, visibility,
                  and environmental observatory data in real time.
                </p>
              </div>

              <div className="mt-10">
                <span className="text-blue-300 text-lg font-medium">
                  View Weather Systems →
                </span>
              </div>

            </div>

          </Link>

        </div>

      </div>

    </div>
  )
}

export default PlatformPage