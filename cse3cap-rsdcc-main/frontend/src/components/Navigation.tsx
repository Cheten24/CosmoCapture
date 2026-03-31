import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Telescope, CloudSun, Camera, Activity, Eye, Menu, X } from "lucide-react"


const menuItems = [
 { icon: <Home className="h-5 w-5" />, label: "Home", path: "/" },
 { icon: <Telescope className="h-5 w-5" />, label: "Telescope Feed", path: "/telescope-feed" },
 { icon: <Telescope className="h-5 w-5" />, label: "Telescope View", path: "/telescope-view" },
 { icon: <CloudSun className="h-5 w-5" />, label: "Weather", path: "/weather" },
 { icon: <Camera className="h-5 w-5" />, label: "Captures", path: "/recent-captures" },
 { icon: <Activity className="h-5 w-5" />, label: "Observability", path: "/observability" },
 { icon: <Eye className="h-5 w-5" />, label: "Object Visibility", path: "/object-visibility" },
]


const Navigation = () => {
 const location = useLocation()
 const [isOpen, setIsOpen] = useState(false)


 return (
   <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
     <div className="w-full px-6 lg:px-12">
       <div className="flex justify-between items-center h-20">


         {/* LOGO */}
         <Link to="/" className="flex items-center">
           <img src="/latrobe-white.png" className="h-14 w-auto" />
         </Link>


         {/* NAV ITEMS */}
         <div className="hidden lg:flex items-center gap-8">
           {menuItems.map((item) => {
             const isActive = location.pathname === item.path


             return (
               <Link
                 key={item.path}
                 to={item.path}
                 className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                   isActive
                     ? "bg-white/10 text-white"
                     : "text-white/60 hover:text-white"
                 }`}
               >
                 {/* ✅ ALL ICONS SAME COLOR */}
                 <span className="text-white/70">
                   {item.icon}
                 </span>


                 {item.label}
               </Link>
             )
           })}
         </div>


         {/* ✅ ONLY LOGIN (PROFESSIONAL WAY) */}
         <div className="hidden lg:flex items-center">
           <button className="px-4 py-2 text-sm text-white/80 border border-white/20 rounded-md hover:bg-white/10 transition">
             Login
           </button>
         </div>


         {/* MOBILE MENU */}
         <div className="lg:hidden">
           <button onClick={() => setIsOpen(!isOpen)}>
             {isOpen ? <X /> : <Menu />}
           </button>
         </div>


       </div>
     </div>


     {/* MOBILE MENU */}
     {isOpen && (
       <div className="lg:hidden bg-black/90 backdrop-blur-md px-4 py-4 space-y-3">
         {menuItems.map((item) => (
           <Link
             key={item.path}
             to={item.path}
             onClick={() => setIsOpen(false)}
             className="flex items-center gap-3 text-white/70 hover:text-white px-3 py-2 rounded-md hover:bg-white/10"
           >
             {item.icon}
             {item.label}
           </Link>
         ))}


         <button className="w-full border border-white/20 text-white py-2 rounded-md">
           Login
         </button>
       </div>
     )}
   </nav>
 )
}


export default Navigation

