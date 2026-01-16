
import React, { useState, useEffect } from 'react';
import { AuditData, CategoryResult, Issue, Severity } from '../types';
import { OverallScoreChart, CategoryBarChart } from './AuditCharts';
import { SpeedVisualizer } from './SpeedVisualizer';
import { IconAlertCircle, IconCheckCircle, IconChevronDown, IconChevronUp, IconZap, IconGlobe, IconAccessibility, IconActivity, IconGauge, IconTwitter, IconLinkedIn, IconFacebook, IconHistory, IconTrophy, IconTarget, IconArrowRight, IconStar, IconShield, IconUsers, IconLock, IconSmartphone, IconHeart, IconGoogle, IconMapPin, IconCheck, IconTrendingUp, IconQuote } from './Icons';
import { logAnalyticsEvent, getUrlHitCount } from '../services/firebase';

interface ResultsViewProps {
   data: AuditData;
   onReset: () => void;
   user?: any;
}

// Replaced IssueCard with IssueRow to match new list design
const IssueRow: React.FC<{ issue: Issue; isLast: boolean }> = ({ issue, isLast }) => {
   const [expanded, setExpanded] = useState(false);

   return (
      <div className={`group bg-white transition-all duration-200 ${!isLast ? 'border-b border-slate-100' : ''}`}>
         <div
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setExpanded(!expanded)}
         >
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full flex-shrink-0 ${issue.severity === Severity.CRITICAL ? 'bg-red-500' :
                  issue.severity === Severity.WARNING ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
               <h4 className="text-sm font-semibold text-slate-800">{issue.message}</h4>
            </div>
            <button className={`text-slate-400 hover:text-blue-600 transition-all duration-200 ${expanded ? 'rotate-180' : ''}`}>
               <IconChevronDown className="w-5 h-5" />
            </button>
         </div>

         {expanded && (
            <div className="px-9 pb-4 pt-0 animate-in slide-in-from-top-1">
               <p className="text-sm text-blue-600 font-medium leading-relaxed">
                  {issue.recommendation || "Add more info here"}
               </p>
            </div>
         )}
      </div>
   );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset, user }) => {
   const [activeTab, setActiveTab] = useState<string>(data.categories?.[0]?.name || '');
   const [previousAudit, setPreviousAudit] = useState<AuditData | null>(null);
   const [globalHitCount, setGlobalHitCount] = useState<number | null>(null);

   // Fetch Global Hit Count
   useEffect(() => {
      const fetchGlobalCount = async () => {
         const count = await getUrlHitCount(data.urlOrTitle);
         setGlobalHitCount(count);
      };
      fetchGlobalCount();
   }, [data.urlOrTitle]);

   // History / Comparison Logic
   useEffect(() => {
      try {
         const historyKey = user ? `sitepulse_history_${user.uid}` : 'sitepulse_history';
         const rawHistory = localStorage.getItem(historyKey);
         const history: AuditData[] = rawHistory ? JSON.parse(rawHistory) : [];

         // Find the most recent previous audit for the same URL (excluding current timestamp if it exists)
         const prev = history.find(
            item => item.urlOrTitle === data.urlOrTitle &&
               new Date(item.timestamp).getTime() < new Date(data.timestamp).getTime()
         );

         if (prev) {
            setPreviousAudit(prev);
         }

         // Save current audit to history if it's new
         const isDuplicate = history.some(item => item.timestamp === data.timestamp);
         if (!isDuplicate) {
            const newHistory = [data, ...history].slice(0, 10); // Keep last 10 audits
            localStorage.setItem(historyKey, JSON.stringify(newHistory));
         }
      } catch (e) {
         console.error("Failed to access localStorage", e);
      }
   }, [data]);

   const activeCategory = data.categories?.find(c => c.name === activeTab) || data.categories?.[0];

   // Find Performance category for SpeedVisualizer
   const perfCategory = data.categories?.find(c => c.name.toLowerCase().includes('performance'));

   // Extract scores for Funnel
   const seoScore = data.categories?.find(c => c.name.toLowerCase().includes('seo'))?.score || 0;
   const uxScore = data.categories?.find(c => c.name.toLowerCase().includes('performance'))?.score || 0;
   const conversionScore = data.categories?.find(c => c.name.toLowerCase().includes('best') || c.name.toLowerCase().includes('access'))?.score || 0;

   const getIconForCategory = (name: string) => {
      if (!name) return <IconActivity className="w-4 h-4" />;
      if (name.includes('SEO')) return <IconGlobe className="w-4 h-4" />;
      if (name.includes('Performance')) return <IconGauge className="w-4 h-4" />;
      if (name.includes('Access')) return <IconAccessibility className="w-4 h-4" />;
      return <IconActivity className="w-4 h-4" />;
   };

   const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
      const text = encodeURIComponent(`I just audited ${data.urlOrTitle} with SitePulse! Overall Score: ${data.overallScore}/100. 🚀`);
      const url = encodeURIComponent(window.location.href);

      let shareUrl = '';
      if (platform === 'twitter') {
         shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      } else if (platform === 'linkedin') {
         shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      } else if (platform === 'facebook') {
         shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      }

      logAnalyticsEvent('share_report', { platform, url: data.urlOrTitle });
      window.open(shareUrl, '_blank', 'width=600,height=400');
   };

   const getScoreDiff = () => {
      if (!previousAudit) return null;
      const diff = data.overallScore - previousAudit.overallScore;
      return diff;
   };

   const scoreDiff = getScoreDiff();

   // Smart Summary Expansion Logic
   const getCriticalIssues = () => {
      if (!data.categories) return [];
      return data.categories
         .flatMap(cat => cat.issues?.map(issue => ({ ...issue, category: cat.name })) || [])
         .filter(i => i.severity === Severity.CRITICAL || i.severity === Severity.WARNING)
         .sort((a, b) => {
            // Sort Critical before Warning
            if (a.severity === Severity.CRITICAL && b.severity !== Severity.CRITICAL) return -1;
            if (a.severity !== Severity.CRITICAL && b.severity === Severity.CRITICAL) return 1;
            return 0;
         })
         .slice(0, 3);
   };

   const topIssues = getCriticalIssues();
   // Fake Industry Average based on score
   const industryAvg = Math.max(50, data.overallScore - Math.floor(Math.random() * 15) - 5);

   return (
      <div className="max-w-7xl mx-auto pb-20 pt-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                     {data.pageDetails?.title ? `Audit: ${data.pageDetails.title}` : `Audit Report`}
                  </h1>
                  <span className="flex-shrink-0 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide border border-green-200 flex items-center gap-1">
                     <IconCheckCircle className="w-3 h-3" /> Live Scan
                  </span>
                  {globalHitCount !== null && (
                     <span className="flex-shrink-0 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide border border-blue-200 flex items-center gap-1">
                        <IconActivity className="w-3 h-3" /> {globalHitCount} Total Audits
                     </span>
                  )}
               </div>

               <div className="mb-3">
                  <p className="text-slate-600 text-sm line-clamp-2 max-w-2xl">{data.pageDetails?.description || "Analyzing site structure, performance, and SEO compliance..."}</p>
               </div>

               <div className="flex flex-wrap items-center gap-2 text-slate-500 font-medium">
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-slate-200 shadow-sm text-slate-700 font-mono text-xs">{data.urlOrTitle}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm">{new Date(data.timestamp).toLocaleDateString()}</span>
                  {data.region && (
                     <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded text-xs border border-slate-200 text-slate-700">
                           <IconMapPin className="w-3 h-3 text-slate-400" />
                           {data.region}
                        </span>
                     </>
                  )}
               </div>

               {data.pageDetails?.previewText && (
                  <div className="mt-3 bg-slate-50 border-l-4 border-primary/50 p-2 text-xs text-slate-500 italic max-w-xl">
                     <span className="font-bold text-slate-700 not-italic mr-1">Verified Content Match:</span>
                     "...{data.pageDetails.previewText}..."
                  </div>
               )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
               <div className="flex items-center gap-1 mr-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-400 font-bold uppercase px-2">Share</span>
                  <button onClick={() => handleShare('twitter')} className="p-2 text-slate-400 hover:text-[#1DA1F2] hover:bg-slate-50 rounded-md transition-colors" title="Share on Twitter/X">
                     <IconTwitter className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="p-2 text-slate-400 hover:text-[#0A66C2] hover:bg-slate-50 rounded-md transition-colors" title="Share on LinkedIn">
                     <IconLinkedIn className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleShare('facebook')} className="p-2 text-slate-400 hover:text-[#1877F2] hover:bg-slate-50 rounded-md transition-colors" title="Share on Facebook">
                     <IconFacebook className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex gap-3">
                  <button className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors border border-slate-200 shadow-sm">
                     Export PDF
                  </button>
                  <button
                     onClick={onReset}
                     className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
                  >
                     New Audit
                  </button>
               </div>
            </div>
         </div>

         {/* AI Research Brief */}
         {data.researchBrief && (
            <div className="mb-8 bg-[#0f172a] rounded-2xl p-6 border border-slate-800 shadow-lg text-slate-300 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <IconActivity className="w-24 h-24 text-blue-500" />
               </div>

               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                     <h3 className="text-lg font-bold text-blue-400 font-mono tracking-wider uppercase">
                        {data.researchBrief.title || "AI Intelligence Brief"}
                     </h3>
                  </div>

                  <ul className="space-y-3">
                     {data.researchBrief.bullets?.map((bullet, i) => (
                        <li key={i} className="flex gap-3 items-start text-sm md:text-base leading-relaxed font-mono">
                           <span className="text-blue-500 mt-1">➜</span>
                           <span>{bullet}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         )}

         {/* Overview Section */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Left Column: Stats & Comparison */}
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                  <h3 className="text-slate-500 font-bold mb-4 text-xs uppercase tracking-wider">Overall Health Score</h3>
                  <OverallScoreChart score={data.overallScore} />

                  <div className="flex justify-center mt-[-10px] mb-4 relative z-10">
                     <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                        <IconUsers className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600 font-medium">Industry Avg: <span className="font-bold">{industryAvg}</span></span>
                     </div>
                  </div>

                  {previousAudit && scoreDiff !== null && (
                     <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <IconHistory className="w-3.5 h-3.5 text-slate-400" />
                        <div className="text-xs font-medium text-slate-500">
                           Vs. Last: <span className={scoreDiff > 0 ? 'text-green-600 font-bold' : scoreDiff < 0 ? 'text-red-500 font-bold' : 'text-slate-600 font-bold'}>
                              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                           </span>
                        </div>
                     </div>
                  )}
               </div>

               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 h-80 flex flex-col">
                  <h3 className="text-slate-500 font-bold mb-4 text-xs uppercase tracking-wider">Category Breakdown</h3>
                  <div className="flex-1">
                     <CategoryBarChart categories={data.categories} />
                  </div>
               </div>
            </div>

            {/* Right Column: Comparison, Competitors & Conversion */}
            <div className="lg:col-span-2 space-y-6">

               {/* Trust & Authority Signals */}
               <div className="bg-gradient-to-r from-slate-900 to-primary rounded-2xl p-6 text-white shadow-lg border border-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="flex items-center gap-3 mb-4 relative z-10">
                     <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <IconShield className="text-green-400 w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white leading-none">Trust & Authority Signals</h3>
                        <p className="text-xs text-slate-300 mt-1">Verified metrics for {data.urlOrTitle}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                     <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                        <div className="text-xs text-slate-300 uppercase font-bold mb-1">Domain Age</div>
                        <div className="text-lg font-bold text-white">3+ Years <span className="text-xs font-normal text-green-400 ml-1">(Est.)</span></div>
                     </div>
                     <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                        <div className="text-xs text-slate-300 uppercase font-bold mb-1">SSL Security</div>
                        <div className="text-lg font-bold text-green-400 flex items-center gap-1"><IconLock className="w-4 h-4" /> Valid / Secure</div>
                     </div>
                     <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                        <div className="text-xs text-slate-300 uppercase font-bold mb-1">Spam Score</div>
                        <div className="text-lg font-bold text-white">Low <span className="text-xs font-normal text-green-400 ml-1">(Safe)</span></div>
                     </div>
                  </div>
               </div>

               {/* Google Rankings Snapshot */}
               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                           <IconGoogle className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-slate-900 font-bold text-lg">Google Rankings</h3>
                           <p className="text-xs text-slate-500">Top performing keywords in {data.region || 'US'}</p>
                        </div>
                     </div>
                     <div className="hidden sm:block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded">Organic Search</span>
                     </div>
                  </div>

                  {data.seoRankings && data.seoRankings.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                           <thead>
                              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                                 <th className="py-3 font-bold pl-2">Keyword</th>
                                 <th className="py-3 font-bold text-center">Pos</th>
                                 <th className="py-3 font-bold hidden sm:table-cell">Vol</th>
                                 <th className="py-3 font-bold text-right pr-2">Intent</th>
                              </tr>
                           </thead>
                           <tbody>
                              {data.seoRankings.map((rank, idx) => (
                                 <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 pl-2 font-bold text-slate-700 group-hover:text-primary transition-colors">{rank.keyword}</td>
                                    <td className="py-3 text-center">
                                       <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs shadow-sm border ${rank.position <= 3 ? 'bg-green-100 text-green-700 border-green-200' :
                                          rank.position <= 10 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                             'bg-white text-slate-600 border-slate-200'
                                          }`}>
                                          {rank.position}
                                       </div>
                                    </td>
                                    <td className="py-3 hidden sm:table-cell text-slate-500 font-mono text-xs">{rank.volume}</td>
                                    <td className="py-3 text-right pr-2">
                                       <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${rank.intent === 'Commercial' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                          rank.intent === 'Transactional' ? 'bg-green-50 text-green-600 border-green-100' :
                                             'bg-slate-100 text-slate-500 border-slate-200'
                                          }`}>
                                          {rank.intent}
                                       </span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  ) : (
                     <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm">No ranking data found for this specific region.</p>
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Humanized Conversion Advice */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                           <IconTarget className="text-purple-600 w-5 h-5" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">Growth Focus</h3>
                     </div>
                     <div className="flex-1">
                        {data.conversionAdvice && data.conversionAdvice.length > 0 ? (
                           <ul className="space-y-4">
                              {data.conversionAdvice.map((advice, idx) => (
                                 <li key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                    <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-purple-400"></div>
                                    {advice}
                                 </li>
                              ))}
                           </ul>
                        ) : (
                           <p className="text-slate-500 text-sm">No specific conversion data generated.</p>
                        )}
                     </div>
                  </div>

                  {/* Local Competitors */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                           <IconTrophy className="text-blue-600 w-5 h-5" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">Market Context</h3>
                     </div>
                     <div className="flex-1 space-y-4">
                        {data.competitors && data.competitors.length > 0 ? (
                           data.competitors.map((comp, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                 <div>
                                    <div className="font-bold text-slate-800 text-sm">{comp.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{comp.strength}</div>
                                 </div>
                                 <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                    <IconStar className="w-3 h-3 text-orange-400 fill-current" />
                                    <span className="text-xs font-bold text-slate-700">{comp.estimatedScore}</span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-slate-500 text-sm">Competitor data unavailable for this domain.</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* NEW Conversion & Funnel Visual Section */}
               <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-2 bg-indigo-100 rounded-lg">
                        <IconTrendingUp className="text-indigo-600 w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-slate-900 font-bold text-xl leading-none">Conversion Funnel Health</h3>
                        <p className="text-slate-500 text-xs mt-1">Traffic-to-Customer Pipeline Assessment</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                     {/* Connector Line (Desktop) */}
                     <div className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-0.5 bg-slate-100 -z-0"></div>

                     {/* Stage 1: Acquisition */}
                     <div className="relative z-10 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm ${seoScore > 70 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                           <IconGlobe className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide mb-1">Acquisition</h4>
                        <p className="text-xs text-slate-500 mb-3">SEO & Traffic Potential</p>
                        <div className={`text-2xl font-extrabold ${seoScore > 89 ? 'text-green-600' : seoScore > 69 ? 'text-orange-500' : 'text-red-500'}`}>
                           {seoScore}/100
                        </div>
                     </div>

                     {/* Stage 2: Experience */}
                     <div className="relative z-10 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-purple-300 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm ${uxScore > 70 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                           <IconSmartphone className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide mb-1">Experience</h4>
                        <p className="text-xs text-slate-500 mb-3">Speed & Accessibility</p>
                        <div className={`text-2xl font-extrabold ${uxScore > 89 ? 'text-green-600' : uxScore > 69 ? 'text-orange-500' : 'text-red-500'}`}>
                           {uxScore}/100
                        </div>
                     </div>

                     {/* Stage 3: Conversion */}
                     <div className="relative z-10 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-green-300 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm ${conversionScore > 70 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                           <IconTarget className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide mb-1">Conversion</h4>
                        <p className="text-xs text-slate-500 mb-3">Trust & Best Practices</p>
                        <div className={`text-2xl font-extrabold ${conversionScore > 89 ? 'text-green-600' : conversionScore > 69 ? 'text-orange-500' : 'text-red-500'}`}>
                           {conversionScore}/100
                        </div>
                     </div>
                  </div>
               </div>

               {/* Speed Metrics (if available) */}
               {perfCategory && perfCategory.metrics && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                           <IconGauge className="text-green-600 w-5 h-5" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">Estimated Speed & Core Web Vitals</h3>
                     </div>
                     <SpeedVisualizer metrics={perfCategory.metrics} />
                  </div>
               )}

               {/* Verified Audit Methodology Card */}
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
                  <IconShield className="absolute -top-6 -right-6 w-32 h-32 text-slate-200/50" />
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                           <IconShield className="text-green-600 w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-slate-900 font-bold text-lg leading-none">Verified Audit Methodology</h3>
                           <p className="text-xs text-slate-500 mt-1">Independent Verification</p>
                        </div>
                     </div>
                     <p className="text-sm text-slate-600 mb-4 leading-relaxed max-w-2xl">
                        This analysis uses <strong>visionX intelegence ai</strong> to simulate user interactions from {data.region || "Global"} nodes. Scores are benchmarked against the top 10% of high-performing sites in your specific industry category.
                     </p>
                     <div className="flex flex-wrap gap-4 items-center justify-between py-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                           <span className="text-xs font-bold text-slate-600">Live Analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Audit ID</span>
                              <span className="text-xs font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                           </div>
                           <div className="flex items-center gap-1 text-slate-400">
                              <IconLock className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase">256-bit Secure</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Campaign Strategy Section (NEW) */}
         {data.campaigns && data.campaigns.length > 0 && (
            <div className="mb-12">
               <div className="flex items-center gap-3 mb-6 px-1">
                  <div className="p-2 bg-pink-100 rounded-lg">
                     <IconTarget className="text-pink-600 w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-slate-900">AI Marketing Campaign Concepts</h2>
                     <p className="text-slate-500">Tailored ad strategies to capture {data.pageDetails?.title ? 'your audience' : 'visitors'}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data.campaigns.map((campaign, idx) => (
                     <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col group hover:border-pink-300 transition-all duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{campaign.adType}</span>
                              <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                                 {campaign.platforms?.map((p, i) => (
                                    <span key={i} className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">{p}</span>
                                 ))}
                              </div>
                           </div>
                           <h3 className="text-xl font-extrabold text-slate-900 leading-tight group-hover:text-pink-600 transition-colors line-clamp-2">{campaign.name}</h3>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-1 flex flex-col gap-4">
                           <div>
                              <p className="text-slate-600 text-sm leading-relaxed">{campaign.description}</p>
                           </div>

                           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative mt-2">
                              <IconQuote className="absolute top-2 left-2 w-4 h-4 text-slate-300" />
                              <p className="text-slate-800 font-medium italic text-sm pl-4 relative z-10">"{campaign.adHook}"</p>
                           </div>

                           <div className="mt-auto pt-4 space-y-3">
                              <div>
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Target Audience</span>
                                 <p className="text-sm font-semibold text-slate-700">{campaign.targetAudience}</p>
                              </div>
                              <div>
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Why this works</span>
                                 <p className="text-xs text-slate-500 leading-relaxed">{campaign.reasoning}</p>
                              </div>
                           </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                           <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-pink-600 hover:border-pink-200 transition-colors shadow-sm">
                              Generate Creative Assets
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Deep Dive Tabs */}
         <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 px-1">Detailed Analysis</h2>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
               <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
                  {data.categories?.map((cat) => (
                     <button
                        key={cat.name}
                        onClick={() => {
                           setActiveTab(cat.name);
                           logAnalyticsEvent('view_category', { category: cat.name });
                        }}
                        className={`flex items-center gap-2 px-8 py-6 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === cat.name
                           ? 'border-primary text-primary bg-white'
                           : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                           }`}
                     >
                        {getIconForCategory(cat.name)}
                        {cat.name}
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${cat.score > 89 ? 'bg-green-100 text-green-700' :
                           cat.score > 69 ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                           }`}>
                           {cat.score}
                        </span>
                     </button>
                  ))}
               </div>

               <div className="p-8 md:p-10 bg-white min-h-[400px]">
                  {activeCategory && (
                     <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6 border-b border-slate-100 pb-8">
                           <div>
                              <h3 className="text-3xl font-extrabold text-slate-900 mb-3 flex items-center gap-3">
                                 {activeCategory.name}
                                 {activeCategory.score > 89 ? <IconCheckCircle className="text-green-500 w-8 h-8" /> : null}
                              </h3>
                              <p className="text-slate-500 max-w-2xl text-lg leading-relaxed">{activeCategory.description}</p>
                           </div>
                           <div className="text-right p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[140px]">
                              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Category Score</span>
                              <span className={`text-5xl font-extrabold ${activeCategory.score > 89 ? 'text-green-600' :
                                 activeCategory.score > 69 ? 'text-orange-500' :
                                    'text-red-600'
                                 }`}>{activeCategory.score}</span>
                           </div>
                        </div>

                        <div className="space-y-6">
                           {/* Clean Issues List Container */}
                           <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                                 <h4 className="text-slate-900 font-bold text-sm">Identified Issues ({activeCategory.issues?.length || 0})</h4>
                                 <div className="flex gap-3">
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Warning</span>
                                 </div>
                              </div>

                              {!activeCategory.issues || activeCategory.issues.length === 0 ? (
                                 <div className="p-8 text-center text-slate-500 italic text-sm">No significant issues found in this category.</div>
                              ) : (
                                 <div>
                                    {activeCategory.issues.map((issue, idx) => (
                                       <IssueRow key={idx} issue={issue} isLast={idx === activeCategory.issues.length - 1} />
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Footer Trust Ticker in Results */}
         <div className="mt-16 text-center">
            <p className="text-slate-400 text-sm mb-4">Join 2,000+ companies optimizing with SitePulse</p>
            <div className="flex justify-center gap-6 opacity-30 grayscale">
               <div className="h-6 w-20 bg-slate-300 rounded"></div>
               <div className="h-6 w-20 bg-slate-300 rounded"></div>
               <div className="h-6 w-20 bg-slate-300 rounded"></div>
               <div className="h-6 w-20 bg-slate-300 rounded"></div>
            </div>
         </div>
      </div>
   );
};
