import React from 'react';
import SafetyStatusDisplay from './SafetyStatusDisplay';
import ControlLockOverlay from './ControlLockOverlay';
import TelescopeControlPanel from './TelescopeControlPanel';

/**
 * Example component demonstrating how to use the safety components together
 * This shows the integration pattern for existing telescope control components
 */
const SafetyExample: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Safety Status Display - Shows current status */}
      <SafetyStatusDisplay className="max-w-md" />
      
      {/* Control Lock Overlay - Wraps existing controls */}
      <ControlLockOverlay className="max-w-2xl">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Telescope Controls</h3>
          
          {/* Example controls that will be locked when safety status is not ACTIVE */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Connect Telescope
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Start Tracking
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
              Slew to Target
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              Park Telescope
            </button>
          </div>
          
          {/* You can also wrap the existing TelescopeControlPanel */}
          <div className="mt-6">
            <TelescopeControlPanel />
          </div>
        </div>
      </ControlLockOverlay>
    </div>
  );
};

export default SafetyExample;