
import React, { useMemo, useState } from 'react';
import { AuditData } from '../types';
import { IconActivity, IconArrowRight, IconCalendar, IconCheckCircle, IconGlobe, IconTrendingUp, IconZap, IconChartBar, IconHistory } from './Icons';
import { RealtimeDashboard } from './RealtimeDashboard';

interface DashboardProps {
  user: { name: string; email: string };
  history: AuditData[];
  onViewReport: (data: AuditData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, history, onViewReport }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');
  
  // Calculate stats and trends
  const stats = useMemo(() => {
    if (!history.length) return null;

    const totalAudits = history.length;
    const avgScore = Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / totalAudits);
    const uniqueSites = new Set(history.map(h => h.urlOrTitle)).size;

    return { totalAudits, avgScore, uniqueSites };
  }, [history]);

  // Group by URL to find trends
  const processedHistory = useMemo(() => {
    // Sort by date descending (newest first)
    const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return sorted.map((audit, index) => {
      // Find the *next* audit in the list (which is chronologically older) for the SAME URL
      const previousAudit = sorted.slice(index + 1).find(h => h.urlOrTitle === audit.urlOrTitle);
      
      let trend = 0;
      if (previousAudit) {
        trend = audit.overallScore - previousAudit.overallScore;
      }

      return { ...audit, trend, hasPrevious: !!previousAudit };
    });
  }, [history]);

  return (
    <div className="w-full max-w-6xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dashboard Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 text-sm">Welcome back, {user.name}</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
           <button
             onClick={() => setActiveTab('history')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
               activeTab === 'history' 
                 ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                 : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <IconHistory className="w-4 h-4" />
             Audit History
           </button>
           <button
             onClick={() => setActiveTab('analytics')}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
               activeTab === 'analytics' 
                 ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                 : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <IconChartBar className="w-4 h-4" />
             Live Analytics
           </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <RealtimeDashboard />
      ) : (
        <>
          {/* History Stats Bar */}
          {stats && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Total Audits</span>
                   <span className="text-2xl font-extrabold text-slate-900">{stats.totalAudits}</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Avg Score</span>
                   <span className={`text-2xl font-extrabold ${stats.avgScore >= 90 ? 'text-green-600' : stats.avgScore >= 70 ? 'text-orange-500' : 'text-red-600'}`}>
                     {stats.avgScore}
                   </span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                   <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Unique Sites</span>
                   <span className="text-2xl font-extrabold text-slate-900">{stats.uniqueSites}</span>
                </div>
             </div>
          )}

          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                 <IconActivity className="w-8 h-8" />
               </div>
               <h2 className="text-xl font-bold text-slate-900 mb-2">No audits yet</h2>
               <p className="text-slate-500 max-w-sm mx-auto">
                 Enter a URL above to generate your first AI-powered report using visionX intelegence ai.
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedHistory.map((audit, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onViewReport(audit)}
                  className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                         audit.overallScore >= 90 ? 'bg-green-600' : audit.overallScore >= 70 ? 'bg-orange-500' : 'bg-red-500'
                       }`}>
                         {audit.overallScore}
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{audit.urlOrTitle}</h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                             <IconCalendar className="w-3 h-3" />
                             {new Date(audit.timestamp).toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Improvement Indicator */}
                  <div className="mb-4">
                    {audit.hasPrevious ? (
                       <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                          audit.trend > 0 ? 'bg-green-50 text-green-600' : audit.trend < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                       }`}>
                          <IconTrendingUp className={`w-3 h-3 ${audit.trend < 0 ? 'rotate-180' : ''}`} />
                          {audit.trend > 0 ? 'Improved by ' : audit.trend < 0 ? 'Dropped by ' : 'No change'} 
                          {Math.abs(audit.trend)} pts
                       </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500">
                         <IconCheckCircle className="w-3 h-3" /> First Audit
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                     {audit.categories.slice(0, 3).map((cat, cIdx) => (
                       <div key={cIdx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{cat.name}</span>
                          <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${cat.score >= 90 ? 'bg-green-500' : cat.score >= 70 ? 'bg-orange-500' : 'bg-red-500'}`} 
                                  style={{ width: `${cat.score}%` }}
                                ></div>
                             </div>
                             <span className="font-mono font-medium w-6 text-right text-slate-700">{cat.score}</span>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-primary text-xs font-bold uppercase tracking-wider group-hover:underline">
                     View Report <IconArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
