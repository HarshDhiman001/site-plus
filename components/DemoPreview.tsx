
import React from 'react';
import { IconCheckCircle, IconGauge, IconGlobe, IconZap } from './Icons';

export const DemoPreview: React.FC = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      {/* Fake Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="ml-4 bg-white border border-slate-200 px-3 py-1 rounded text-xs text-slate-500 w-64 flex items-center gap-2">
          <IconCheckCircle className="w-3 h-3 text-green-500" />
          sitepulse.ai/demo/clinic-audit
        </div>
      </div>

      {/* Fake Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Radial */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100 border-t-primary border-r-primary">
                 <div className="text-center">
                     <span className="text-3xl font-extrabold text-slate-900">87</span>
                     <span className="block text-[10px] text-slate-500 uppercase">Excellent</span>
                 </div>
            </div>
            <p className="mt-4 font-bold text-slate-700">Overall Health</p>
        </div>

        {/* Metrics */}
        <div className="col-span-2 space-y-3">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-green-50 text-green-600 rounded"><IconZap className="w-4 h-4"/></div>
                     <div>
                         <p className="text-sm font-bold text-slate-800">Performance</p>
                         <p className="text-xs text-slate-500">LCP: 1.2s • CLS: 0.04</p>
                     </div>
                 </div>
                 <span className="text-green-600 font-bold text-lg">98</span>
             </div>
             
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-orange-50 text-orange-600 rounded"><IconGlobe className="w-4 h-4"/></div>
                     <div>
                         <p className="text-sm font-bold text-slate-800">SEO / Visibility</p>
                         <p className="text-xs text-slate-500">Missing meta tags on 2 pages</p>
                     </div>
                 </div>
                 <span className="text-orange-600 font-bold text-lg">74</span>
             </div>

             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-50 text-blue-600 rounded"><IconGauge className="w-4 h-4"/></div>
                     <div>
                         <p className="text-sm font-bold text-slate-800">Accessibility</p>
                         <p className="text-xs text-slate-500">Contrast ratio good</p>
                     </div>
                 </div>
                 <span className="text-blue-600 font-bold text-lg">92</span>
             </div>
        </div>
      </div>
      
      {/* Overlay to encourage click */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent flex items-end justify-center pb-8">
          <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
              View Full Sample Report ↓
          </span>
      </div>
    </div>
  );
};
