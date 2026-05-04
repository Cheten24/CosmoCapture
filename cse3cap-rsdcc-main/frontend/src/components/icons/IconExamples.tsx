import React from 'react';
import { StatusIcon, WeatherIcon, ObjectTypeIcon } from './index';

/**
 * Example component demonstrating the usage of reusable icon components
 * This can be used for testing and as a reference for developers
 */
export const IconExamples: React.FC = () => {
  return (
    <div className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-white">Icon Components Examples</h3>
      
      {/* Status Icons */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-slate-300">Safety Status Icons</h4>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <StatusIcon status="ACTIVE" size="md" />
            <span className="text-slate-300">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="UNSAFE" size="md" />
            <span className="text-slate-300">UNSAFE</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="CLOSED" size="md" />
            <span className="text-slate-300">CLOSED</span>
          </div>
        </div>
      </div>

      {/* Weather Icons */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-slate-300">Weather Icons</h4>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <WeatherIcon condition="sun" size="md" />
            <span className="text-slate-300">Sun</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon condition="moon" size="md" />
            <span className="text-slate-300">Moon</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon condition="cloudRain" size="md" />
            <span className="text-slate-300">Rain</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon condition="wind" size="md" />
            <span className="text-slate-300">Wind</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon condition="thermometer" size="md" />
            <span className="text-slate-300">Temperature</span>
          </div>
        </div>
      </div>

      {/* Object Type Icons */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-slate-300">Object Type Icons</h4>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <ObjectTypeIcon type="star" size="md" />
            <span className="text-slate-300">Star</span>
          </div>
          <div className="flex items-center gap-2">
            <ObjectTypeIcon type="planet" size="md" />
            <span className="text-slate-300">Planet</span>
          </div>
          <div className="flex items-center gap-2">
            <ObjectTypeIcon type="telescope" size="md" />
            <span className="text-slate-300">Telescope</span>
          </div>
        </div>
      </div>

      {/* Size Examples */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-slate-300">Size Variations</h4>
        <div className="flex gap-4 items-center">
          <StatusIcon status="ACTIVE" size="xs" />
          <StatusIcon status="ACTIVE" size="sm" />
          <StatusIcon status="ACTIVE" size="md" />
          <StatusIcon status="ACTIVE" size="lg" />
          <StatusIcon status="ACTIVE" size="xl" />
          <StatusIcon status="ACTIVE" size="xxl" />
        </div>
      </div>
    </div>
  );
};

export default IconExamples;