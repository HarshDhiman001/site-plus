
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { IconUsers, IconGlobe, IconSmartphone, IconActivity, IconGoogle, IconRefresh, IconCheckCircle } from './Icons';

export const RealtimeDashboard: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState(42);
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Simulated Live Data
  const [trafficSourceData, setTrafficSourceData] = useState([
    { name: 'Direct', value: 65 },
    { name: 'Organic Search', value: 45 },
    { name: 'Referral', value: 25 },
    { name: 'Social', value: 15 },
  ]);

  const [topCountries, setTopCountries] = useState([
    { name: 'United States', value: 35, flag: '🇺🇸' },
    { name: 'India', value: 28, flag: '🇮🇳' },
    { name: 'United Kingdom', value: 15, flag: '🇬🇧' },
    { name: 'Canada', value: 12, flag: '🇨🇦' },
    { name: 'Germany', value: 8, flag: '🇩🇪' },
  ]);

  const [userActivity, setUserActivity] = useState(
    Array.from({ length: 30 }, (_, i) => ({ time: i, users: Math.floor(Math.random() * 20) + 10 }))
  );

  const eventsData = [
    { name: 'page_view', count: 184 },
    { name: 'session_start', count: 62 },
    { name: 'user_engagement', count: 58 },
    { name: 'scroll', count: 45 },
    { name: 'click', count: 23 },
  ];

  // Simulate Realtime Updates
  useEffect(() => {
    if (!demoMode) return;

    const interval = setInterval(() => {
      // Fluctuating active users
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(10, prev + change);
      });

      // Update Chart Data (Shift left)
      setUserActivity(prev => {
        const newData = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, users: Math.floor(Math.random() * 30) + 5 }];
        return newData;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [demoMode]);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("To view your exact data, you need to configure the Google Analytics Data API. For this demo, we will continue showing simulated live data.");
    }, 1500);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">Realtime Overview</h2>
              {demoMode && (
                <span className="px-2 py-0.5 bg-blue-100 text-primary text-xs font-bold uppercase rounded border border-blue-200">
                  Demo Mode
                </span>
              )}
           </div>
           <p className="text-slate-500 text-sm mt-1">Monitor activity on your site as it happens.</p>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={handleConnect}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
           >
             {loading ? <IconRefresh className="w-4 h-4 animate-spin" /> : <IconGoogle className="w-4 h-4" />}
             Connect GA4
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
         
         {/* Active Users Card (Big Counter) */}
         <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div>
               <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Users in last 30 minutes</h3>
               <div className="text-7xl font-extrabold text-slate-900 tracking-tighter mb-2 animate-in fade-in duration-300">
                  {activeUsers}
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6">
                  <span className="text-xs uppercase">Users per minute</span>
               </div>
            </div>
            
            {/* Tiny Bar Chart mimicking GA */}
            <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userActivity}>
                     <Bar dataKey="users" fill="#3b82f6" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="absolute top-6 right-6 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
         </div>

         {/* Middle Section: Audience & Sources */}
         <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            
            {/* Device & Platform (Simulated Map/List) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-slate-900 font-bold text-sm">Top Locations</h3>
                  <IconGlobe className="w-4 h-4 text-slate-400" />
               </div>
               
               <div className="space-y-4">
                  {topCountries.map((country, idx) => (
                     <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 text-center text-lg">{country.flag}</div>
                        <div className="flex-1">
                           <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-700">{country.name}</span>
                              <span className="text-slate-500">{country.value} users</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${(country.value / 40) * 100}%` }}></div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-slate-900 font-bold text-sm">User Source / Medium</h3>
                  <IconActivity className="w-4 h-4 text-slate-400" />
               </div>
               <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart layout="vertical" data={trafficSourceData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={12}>
                           {trafficSourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : '#93c5fd'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Right Column: Events */}
         <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-900 font-bold text-sm">Event Count</h3>
                <span className="text-xs font-bold text-slate-400">Last 30m</span>
            </div>
            
            <div className="flex-1 space-y-2">
               {eventsData.map((event, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 group">
                     <span className="text-xs font-mono text-slate-600 group-hover:text-primary transition-colors">{event.name}</span>
                     <span className="text-sm font-bold text-slate-900">{event.count}</span>
                  </div>
               ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
               <button className="text-xs font-bold text-primary hover:underline">View All Events</button>
            </div>
         </div>
      </div>

      {/* User Activity Over Time (Line Chart) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-900 font-bold text-sm">User Activity Over Time</h3>
            <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs text-slate-500 font-bold">Active Users</span>
            </div>
         </div>
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={userActivity}>
                  <defs>
                     <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                     itemStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
