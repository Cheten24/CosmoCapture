import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">

      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/bg-space.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/20"></div>


      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black/40 to-black"></div>

      {/* CONTENT */}
      <div className="relative z-10 text-center px-6 max-w-4xl">

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-wide mb-6">
          CosmoCapture
        </h1>

        <h2 className="text-xl md:text-3xl text-blue-200 font-light mb-6">
          Remote Scientific Data Capture & Observatory Control
        </h2>

        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Access real-time telescope feeds, monitor observatory conditions,
          and explore astronomical data from anywhere through a modern
          remote observatory platform.
        </p>

        {/* LOGIN BUTTON */}
        <Link to="/login">
          <button className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition duration-300 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            Login
          </button>
        </Link>

      </div>
    </div>
  );
}

export default HomePage;