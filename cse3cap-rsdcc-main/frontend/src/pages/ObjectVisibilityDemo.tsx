import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Telescope,
  MapPin,
  Clock,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import EnhancedObjectList from "../components/EnhancedObjectList";
import type { VisibleObject } from "../types/visibility";

const ObjectVisibilityDemo: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<VisibleObject | null>(null);
  const currentTime = new Date();

  const handleObjectSelect = (object: VisibleObject) => {
    setSelectedObject(object);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10" style={{ pointerEvents: "all" }}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="h-6 w-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Object Visibility</h1>
              <p className="text-slate-400">
                See which celestial objects are visible right now from Melbourne Observatory
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-slate-400">
            <Telescope className="h-6 w-6" />
            <span className="text-sm">Melbourne Observatory</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur-md p-6 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                <Eye className="h-8 w-8 text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Currently Visible Right Now</h2>
                <p className="text-slate-400">
                  Objects are shown according to current time and viewing conditions.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white hover:bg-slate-700 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p className="text-white font-semibold">Melbourne, Australia</p>
              <p className="text-slate-500 text-sm">Melbourne Observatory</p>
            </div>

            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <Clock className="h-4 w-4" />
                Current Time
              </div>
              <p className="text-white font-semibold">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-slate-500 text-sm">
                {currentTime.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/60 p-4">
              <p className="text-emerald-300 text-sm mb-2">Visibility Status</p>
              <p className="text-white font-semibold">Live Object Filtering</p>
              <p className="text-slate-400 text-sm">Moon, Mars, Jupiter, Saturn, Orion Nebula</p>
            </div>
          </div>
        </motion.div>

        {selectedObject && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Selected Object</h3>
            <p className="text-white">
              <strong>{selectedObject.name}</strong> - {selectedObject.type} in{" "}
              {selectedObject.metadata.constellation}
            </p>
            <p className="text-slate-300 text-sm mt-1">
              Elevation: {selectedObject.visibility.elevation.toFixed(1)}° | Visibility:{" "}
              {selectedObject.visibility.isVisible ? "Visible" : "Not Visible"}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur-md p-4 shadow-xl"
        >
          <EnhancedObjectList
            onObjectSelect={handleObjectSelect}
            showFilters={true}
            showDetailView={true}
            maxItems={50}
            className="w-full"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 p-6 bg-slate-900/60 backdrop-blur-sm border border-slate-700 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-3">How it helps students</h3>
          <p className="text-slate-400 text-sm leading-6">
            This page tells students which celestial objects they can observe right now,
            based on current time, location, and visibility status. It will later connect
            directly to the backend API for live object visibility data.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ObjectVisibilityDemo;