
import React from 'react';
import { Metric } from '../types';

interface SpeedVisualizerProps {
  metrics: Metric[];
}

export const SpeedVisualizer: React.FC<SpeedVisualizerProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
      {metrics.map((metric, index) => {
        // Default style for 'Poor'
        let containerClass = 'bg-red-50 border-red-100';
        let textClass = 'text-red-900';
        let labelClass = 'text-red-400/80';
        let badgeClass = 'bg-red-200/50 text-red-700 border-red-200';
        let barTrack = 'bg-red-200/50';
        let barFill = 'bg-red-500';
        let width = '30%';

        if (metric.status === 'Needs Improvement') {
          containerClass = 'bg-orange-50 border-orange-100';
          textClass = 'text-orange-900';
          labelClass = 'text-orange-400/80';
          badgeClass = 'bg-orange-200/50 text-orange-700 border-orange-200';
          barTrack = 'bg-orange-200/50';
          barFill = 'bg-orange-500';
          width = '60%';
        } else if (metric.status === 'Good') {
          containerClass = 'bg-emerald-50 border-emerald-100';
          textClass = 'text-emerald-900';
          labelClass = 'text-emerald-500/80';
          badgeClass = 'bg-emerald-200/50 text-emerald-700 border-emerald-200';
          barTrack = 'bg-emerald-200/50';
          barFill = 'bg-emerald-500';
          width = '90%';
        }

        return (
          <div key={index} className={`relative p-6 rounded-2xl border ${containerClass} overflow-hidden shadow-sm flex flex-col justify-between min-h-[160px]`}>
            <div className="flex justify-between items-start mb-4">
              <h4 className={`font-bold text-sm uppercase tracking-wider ${labelClass}`}>{metric.name}</h4>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold border ${badgeClass}`}>
                {metric.status === 'Needs Improvement' ? 'FAIR' : metric.status.toUpperCase()}
              </span>
            </div>
            
            <div className="mb-6">
               <span className={`text-4xl md:text-5xl font-extrabold ${textClass}`}>{metric.value}</span>
            </div>
            
            {/* Visual Indicator Bar */}
            <div className={`w-full h-2.5 ${barTrack} rounded-full overflow-hidden`}>
               <div className={`h-full ${barFill} rounded-full transition-all duration-1000 ease-out`} style={{ width }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
