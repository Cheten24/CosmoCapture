/**
 * Object Visibility Demo Page
 * Demonstrates the enhanced object visibility components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Telescope } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnhancedObjectList from '../components/EnhancedObjectList';
import type { VisibleObject } from '../types/visibility';

const ObjectVisibilityDemo: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<VisibleObject | null>(null);

  const handleObjectSelect = (object: VisibleObject) => {
    setSelectedObject(object);
    console.log('Selected object:', object);
  };

  return (
    <div className="min-h-screen bg-transparent py-8 relative z-10" style={{ pointerEvents: 'all' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Object Visibility</h1>
              <p className="text-slate-400">Enhanced celestial object visibility with real-time filtering</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-400">
            <Telescope className="h-6 w-6" />
            <span className="text-sm">Melbourne Observatory</span>
          </div>
        </motion.div>

        {/* Selected Object Info */}
        {selectedObject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Selected Object</h3>
            <p className="text-white">
              <strong>{selectedObject.name}</strong> - {selectedObject.type} in {selectedObject.metadata.constellation}
            </p>
            <p className="text-slate-300 text-sm mt-1">
              Elevation: {selectedObject.visibility.elevation.toFixed(1)}° | 
              Visibility: {selectedObject.visibility.isVisible ? 'Visible' : 'Not Visible'}
            </p>
          </motion.div>
        )}

        {/* Enhanced Object List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedObjectList
            onObjectSelect={handleObjectSelect}
            showFilters={true}
            showDetailView={true}
            maxItems={50}
            className="w-full"
          />
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="font-medium text-white mb-2">Real-time Filtering</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Search by name, type, or constellation</li>
                <li>• Filter by minimum elevation angle</li>
                <li>• Filter by object type (stars, planets, etc.)</li>
                <li>• Automatic visibility status updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Enhanced Details</h4>
              <ul className="space-y-1 text-slate-400">
                <li>• Detailed coordinate information</li>
                <li>• Rise and set times</li>
                <li>• 24-hour visibility timeline</li>
                <li>• Object descriptions and metadata</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ObjectVisibilityDemo;