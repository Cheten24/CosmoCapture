/**
 * Object Detail View Component
 * Displays detailed views of celestial objects with enhanced visibility information
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid, List, Filter, SortAsc, SortDesc } from 'lucide-react';
import type { VisibleObject } from '../types/visibility';
import ObjectDetailCard from './ObjectDetailCard';

interface ObjectDetailViewProps {
  objects: VisibleObject[];
  selectedObject?: VisibleObject;
  onObjectSelect?: (object: VisibleObject) => void;
  onClose?: () => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

type SortOption = 'name' | 'elevation' | 'magnitude' | 'type' | 'visibility';
type SortDirection = 'asc' | 'desc';

const ObjectDetailView: React.FC<ObjectDetailViewProps> = ({
  objects,
  selectedObject,
  onObjectSelect,
  onClose,
  className = '',
  viewMode: initialViewMode = 'grid'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [sortBy, setSortBy] = useState<SortOption>('elevation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterVisible, setFilterVisible] = useState<boolean | null>(null);

  // Sort objects based on current sort settings
  const sortedObjects = [...objects].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'elevation':
        aValue = a.visibility.elevation;
        bValue = b.visibility.elevation;
        break;
      case 'magnitude':
        aValue = a.visibility.magnitude || 999;
        bValue = b.visibility.magnitude || 999;
        break;
      case 'type':
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case 'visibility':
        aValue = a.visibility.isVisible ? 1 : 0;
        bValue = b.visibility.isVisible ? 1 : 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter objects based on visibility filter
  const filteredObjects = filterVisible === null 
    ? sortedObjects 
    : sortedObjects.filter(obj => obj.visibility.isVisible === filterVisible);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return null;
    return sortDirection === 'asc' ? SortAsc : SortDesc;
  };

  return (
    <div className={`bg-slate-900/95 backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Object Details</h2>
            <p className="text-slate-400">
              {filteredObjects.length} of {objects.length} objects
              {filterVisible !== null && (filterVisible ? ' (visible only)' : ' (not visible only)')}
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-slate-400" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-slate-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-slate-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            {(['elevation', 'name', 'magnitude', 'type', 'visibility'] as SortOption[]).map((option) => {
              const SortIcon = getSortIcon(option);
              return (
                <button
                  key={option}
                  onClick={() => handleSortChange(option)}
                  className={`px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 ${
                    sortBy === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="capitalize">{option}</span>
                  {SortIcon && <SortIcon className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          {/* Visibility Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterVisible === null ? 'all' : filterVisible ? 'visible' : 'hidden'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterVisible(
                  value === 'all' ? null : value === 'visible'
                );
              }}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Objects</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Not Visible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Object Grid/List */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filteredObjects.map((object, index) => (
                <motion.div
                  key={`${object.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ObjectDetailCard
                    object={object}
                    onSelect={onObjectSelect}
                    expanded={selectedObject?.name === object.name}
                    showTimeline={selectedObject?.name === object.name}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredObjects.map((object, index) => (
                <motion.div
                  key={`${object.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ObjectDetailCard
                    object={object}
                    onSelect={onObjectSelect}
                    expanded={selectedObject?.name === object.name}
                    showTimeline={selectedObject?.name === object.name}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredObjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-slate-400 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No objects match your current filters</p>
              <p className="text-sm mt-1">Try adjusting your filter or sort criteria</p>
            </div>
            
            {filterVisible !== null && (
              <button
                onClick={() => setFilterVisible(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Show All Objects
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetailView;