import { Link } from "react-router-dom"


function HomePage() {
 return (
   <div className="relative flex flex-col items-center justify-center text-center min-h-[80vh] px-6 overflow-hidden">


     {/* 🌍 EARTH */}
     <img
       src="/planets/earth.png"
       className="absolute left-[-120px] top-20 w-[450px] opacity-80 pointer-events-none"
      style={{
 animation: "float1 11s ease-in-out infinite",
 filter: "drop-shadow(0 0 40px rgba(255,255,255,0.15))"
}}
     />


     {/* 🪐 SATURN */}
     <img
       src="/planets/saturn.png"
       className="absolute right-[-150px] bottom-0.5 w-[500px] opacity-90 pointer-events-none"
       style={{
 animation: "float2 10s ease-in-out infinite",
 filter: "drop-shadow(0 0 40px rgba(255,255,255,0.15))"
}}
     />


     {/* 🌕 JUPITER */}
     <img
       src="/planets/jupiter.png"
       className="absolute left-[40%] top-[25%] w-[300px] opacity-85 pointer-events-none"
       style={{
 animation: "float3 8s ease-in-out infinite",
 filter: "drop-shadow(0 0 40px rgba(255,255,255,0.15))"
}}
     />


     {/* 🌑 MOON */}
     <img
 src="/planets/moon.png"
 className="absolute right-10 top-10 w-[300px] opacity-85 pointer-events-none"
 style={{
   animation: "float4 12s ease-in-out infinite",
   filter: "drop-shadow(0 0 40px rgba(255,255,255,0.15))"
 }}
/>


     {/* CONTENT */}
     <div className="relative z-10">


<h1 className="text-4xl md:text-6xl font-semibold text-white mb-4">
 CosmoCapture – LogicLoop
</h1>


<h2 className="text-3xl md:text-5xl text-white/80 mb-8">
 Remote Telescope Control System
</h2>


      <p className="text-white/60 max-w-2xl text-lg mb-10 text-center mx-auto">
       Book a session, join the observation queue, and access the telescope remotely in real time.
       </p>


       <div className="flex flex-col sm:flex-row gap-4 justify-center">
         <Link to="/telescope-feed">
           <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition">
             Book a Session
           </button>
         </Link>


         <Link to="/observability">
           <button className="px-6 py-3 border border-white/20 text-white/80 rounded-md hover:bg-white/10 transition">
             View Queue
           </button>
         </Link>
       </div>

     </div>
   </div>
 )
}


export default HomePage

