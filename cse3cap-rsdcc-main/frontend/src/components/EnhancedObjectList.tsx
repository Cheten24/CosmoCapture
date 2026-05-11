/**
 * Enhanced Object List Component
 * Displays dynamically filtered visible objects with real-time visibility filtering
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Star, Circle, Telescope, Filter, Search, Maximize2 } from 'lucide-react';
import type { VisibleObject, ObjectVisibilityFilter } from '../types/visibility';
import { apiService } from '../services/api';
import ObjectDetailView from './ObjectDetailView';

interface EnhancedObjectListProps {
  className?: string;
  onObjectSelect?: (object: VisibleObject) => void;
  showFilters?: boolean;
  maxItems?: number;
  showDetailView?: boolean;
}

const EnhancedObjectList: React.FC<EnhancedObjectListProps> = ({
  className = '',
  onObjectSelect,
  showFilters = true,
  maxItems = 20,
  showDetailView = false
}) => {
  const [objects, setObjects] = useState<VisibleObject[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<VisibleObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showDetailViewModal, setShowDetailViewModal] = useState(false);
  const [selectedDetailObject, setSelectedDetailObject] = useState<VisibleObject | undefined>();
  const [filters, setFilters] = useState<ObjectVisibilityFilter>({
    minElevation: 20,
    objectTypes: [],
    constellations: [],
  });

  // Fetch objects from API
  useEffect(() => {
    const fetchObjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, use the existing API and transform the data
        // In a real implementation, this would call the enhanced visibility API
        const celestialObjects = await apiService.getVisibleObjects();
        
        // Ensure we have a valid array before mapping
        if (!Array.isArray(celestialObjects)) {
          console.error('Invalid response from getVisibleObjects:', celestialObjects);
          throw new Error('Invalid data format received from API');
        }
        
        // Transform CelestialObject[] to VisibleObject[]
        const transformedObjects: VisibleObject[] = celestialObjects.map(obj => ({
          name: obj.name,
          type: obj.type,
          coordinates: {
            ra: obj.ra,
            dec: obj.dec,
            alt: Math.random() * 90, // Mock altitude for demo
            az: Math.random() * 360, // Mock azimuth for demo
          },
          visibility: {
            isVisible: Math.random() > 0.3, // Mock visibility
            elevation: Math.random() * 90,
            magnitude: Math.random() * 6,
            riseTime: new Date(Date.now() + Math.random() * 86400000),
            setTime: new Date(Date.now() + Math.random() * 86400000 + 86400000),
          },
          metadata: {
            constellation: `Constellation ${Math.floor(Math.random() * 88) + 1}`,
            distance: `${(Math.random() * 1000).toFixed(1)} ly`,
            description: `A ${obj.type.toLowerCase()} in the night sky`,
          },
        }));
        
        setObjects(transformedObjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch objects');
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchObjects, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = objects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.metadata.constellation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply visibility filters
    if (filters.minElevation !== undefined) {
      filtered = filtered.filter(obj => obj.visibility.elevation >= filters.minElevation!);
    }

    if (filters.objectTypes && filters.objectTypes.length > 0) {
      filtered = filtered.filter(obj => filters.objectTypes!.includes(obj.type));
    }

    if (filters.constellations && filters.constellations.length > 0) {
      filtered = filtered.filter(obj => 
        obj.metadata.constellation && filters.constellations!.includes(obj.metadata.constellation)
      );
    }

    // Sort by visibility and elevation
    filtered.sort((a, b) => {
      if (a.visibility.isVisible !== b.visibility.isVisible) {
        return a.visibility.isVisible ? -1 : 1;
      }
      return b.visibility.elevation - a.visibility.elevation;
    });

    // Limit results
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    setFilteredObjects(filtered);
  }, [objects, searchTerm, filters, maxItems]);

  const getObjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'star':
        return Star;
      case 'planet':
        return Circle;
      default:
        return Telescope;
    }
  };

  const getVisibilityColor = (isVisible: boolean, elevation: number) => {
    if (!isVisible) return 'text-slate-500';
    if (elevation > 60) return 'text-green-400';
    if (elevation > 30) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const handleObjectClick = (object: VisibleObject) => {
    if (showDetailView) {
      setSelectedDetailObject(object);
      setShowDetailViewModal(true);
    } else if (onObjectSelect) {
      onObjectSelect(object);
    }
  };

  const handleDetailViewSelect = (object: VisibleObject) => {
    if (onObjectSelect) {
      onObjectSelect(object);
    }
    setShowDetailViewModal(false);
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-slate-300">Loading visible objects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <p className="text-lg font-semibold mb-2">Error: {error}</p>
          <p className="text-sm text-slate-400">Please check if the backend API is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Visible Objects</h2>
          <p className="text-slate-400">
            {filteredObjects.length} of {objects.length} objects visible
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {showDetailView && (
            <button
              onClick={() => setShowDetailViewModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
              Detail View
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search objects, types, or constellations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Min Elevation (°)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={filters.minElevation || 0}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    minElevation: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Object Types
                </label>
                <select
                  multiple
                  value={filters.objectTypes || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, objectTypes: values }));
                  }}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="star">Stars</option>
                  <option value="planet">Planets</option>
                  <option value="galaxy">Galaxies</option>
                  <option value="nebula">Nebulae</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ minElevation: 20, objectTypes: [], constellations: [] })}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Object List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredObjects.map((object, index) => {
            const ObjectIcon = getObjectTypeIcon(object.type);
            const visibilityColor = getVisibilityColor(object.visibility.isVisible, object.visibility.elevation);
            
            return (
              <motion.div
                key={`${object.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleObjectClick(object)}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg cursor-pointer transition-all duration-200 hover:border-slate-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <ObjectIcon className={`h-5 w-5 ${visibilityColor}`} />
                      {object.visibility.isVisible ? (
                        <Eye className="h-4 w-4 text-green-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white">{object.name}</h3>
                      <p className="text-sm text-slate-400">
                        {object.type} • {object.metadata.constellation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${visibilityColor}`}>
                      {object.visibility.elevation.toFixed(1)}°
                    </div>
                    <div className="text-xs text-slate-400">
                      {object.visibility.magnitude ? `Mag ${object.visibility.magnitude.toFixed(1)}` : 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Additional details on hover/expanded state */}
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>
                      <span className="font-medium">RA:</span> {object.coordinates.ra.toFixed(2)}°
                    </div>
                    <div>
                      <span className="font-medium">Dec:</span> {object.coordinates.dec.toFixed(2)}°
                    </div>
                    {object.metadata.distance && (
                      <div>
                        <span className="font-medium">Distance:</span> {object.metadata.distance}
                      </div>
                    )}
                    {object.visibility.riseTime && (
                      <div>
                        <span className="font-medium">Rise:</span> {object.visibility.riseTime.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredObjects.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Telescope className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No objects match your current filters</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {showDetailViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl"
            >
              <ObjectDetailView
                objects={filteredObjects}
                selectedObject={selectedDetailObject}
                onObjectSelect={handleDetailViewSelect}
                onClose={() => setShowDetailViewModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedObjectList;