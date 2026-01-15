
import React from 'react';
import { IconSearch, IconAlertCircle, IconUsers, IconSmartphone, IconShield, IconCalendar, IconCheckCircle, IconHeart, IconMapPin } from './Icons';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';

interface ClinicLandingViewProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  handleAnalyze: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  regions: string[];
  selectedRegion: string;
  setRegion: (val: string) => void;
}

export const ClinicLandingView: React.FC<ClinicLandingViewProps> = ({ 
  inputValue, setInputValue, handleAnalyze, loading, error, regions, selectedRegion, setRegion
}) => {
  return (
    <div className="w-full">
      {/* Clinic Hero */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 shadow-sm text-xs font-bold text-teal-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <IconHeart className="w-3.5 h-3.5" />
            <span>#1 WEBSITE AUDIT FOR HEALTHCARE CLINICS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Website audit for <br/>
            <span className="text-teal-600">Healthcare Clinics</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
             Optimize for <strong>Patient Experience</strong>, Mobile Booking, and Trust. 
             Stop losing appointments to booking friction and technical errors.
          </p>

          {/* Input Card */}
          <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-3 shadow-xl shadow-teal-500/10 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-10 duration-1000 z-20">
            
            {/* Region Selector for Clinic View */}
            <div className="flex justify-end px-2 mb-2">
                 <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                         <IconMapPin className="w-3.5 h-3.5" />
                      </div>
                      <select 
                        value={selectedRegion}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-slate-50 text-slate-700 text-xs font-bold pl-8 pr-8 py-2 rounded-lg border border-slate-200 hover:border-teal-200 hover:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors cursor-pointer appearance-none"
                      >
                         {regions.map(r => (
                           <option key={r} value={r}>{r}</option>
                         ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-[0.6rem]">
                         ▼
                      </div>
                   </div>
            </div>

            <form onSubmit={handleAnalyze} className="relative">
               <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-6 text-slate-400">
                     <IconSearch className="w-6 h-6" />
                  </div>
                  <input
                    type="url"
                    placeholder="Enter your clinic's website URL..."
                    className="w-full bg-white text-slate-900 p-5 pl-16 rounded-2xl border-2 border-slate-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition-all placeholder:text-slate-400 h-20 text-lg shadow-inner font-medium"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                  />
               </div>
               
               <div className="absolute bottom-3 right-3">
                 <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className={`bg-teal-600 hover:bg-teal-700 text-white px-6 md:px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] ${loading ? 'pr-6' : ''}`}
                 >
                   {loading ? (
                     <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analysing Clinic...
                     </>
                   ) : (
                     'Run a free clinic website audit'
                   )}
                 </button>
               </div>
            </form>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl max-w-2xl mx-auto flex items-center gap-3 shadow-sm">
              <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
      </div>

      {/* Specific Focus Areas */}
      <div className="w-full bg-slate-50 border-y border-slate-200 py-20">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Clinic Website UX & Conversion Audit</h2>
               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                 We analyze the 4 critical pillars that drive new patient bookings.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Patient Behaviour */}
                <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 transition-colors group shadow-sm">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-transform">
                       <IconUsers className="w-7 h-7" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">Patient Behaviour</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                       Do patients get lost? We check navigation flow to ensure they can easily find services and provider info.
                    </p>
                </div>

                {/* 2. Mobile Usage */}
                <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 transition-colors group shadow-sm">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                       <IconSmartphone className="w-7 h-7" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">Mobile Usage</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                       60% of health searches are on mobile. We audit tap targets, font sizes, and load speeds on 4G networks.
                    </p>
                </div>

                 {/* 3. Trust Signals */}
                <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 transition-colors group shadow-sm">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                       <IconShield className="w-7 h-7" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">Trust Signals</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                       We verify HIPAA badges, secure SSL, professional doctor photos, and social proof placement.
                    </p>
                </div>

                 {/* 4. Booking Friction */}
                <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 transition-colors group shadow-sm">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                       <IconCalendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">Booking Friction</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                       Healthcare website conversion audit focuses on reducing steps in your "Book Now" forms to increase intake.
                    </p>
                </div>
            </div>
         </div>
      </div>

      {/* SEO Section */}
      <div className="w-full py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Dominate "Near Me" Searches</h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                   When patients search for "dentist near me" or "urgent care clinic", Google looks for specific local schema markup. 
                   Our tool audits your NAP (Name, Address, Phone) consistency and Location Schema.
                </p>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-slate-700">
                        <IconCheckCircle className="text-teal-600 w-5 h-5" /> Local Business Schema Check
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                        <IconCheckCircle className="text-teal-600 w-5 h-5" /> Google Maps Embed Verification
                    </li>
                    <li className="flex items-center gap-3 text-slate-700">
                        <IconCheckCircle className="text-teal-600 w-5 h-5" /> Service Page Keywords
                    </li>
                </ul>
             </div>
             <div className="relative bg-slate-50 p-8 rounded-3xl border border-slate-200">
                 <div className="absolute -top-4 -right-4 bg-teal-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform rotate-3">
                    Success Story
                 </div>
                 <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-xl text-teal-700">S</div>
                    <div>
                       <div className="font-bold text-lg text-slate-900">Sunrise Pediatrics</div>
                       <div className="text-sm text-slate-500">Austin, TX</div>
                    </div>
                 </div>
                 <p className="text-slate-700 italic mb-4">"We didn't realize our mobile booking form was broken for Android users. SitePulse flagged it instantly. Our new patient appointments doubled the next month."</p>
                 <div className="flex text-orange-500 text-sm font-bold">★★★★★</div>
             </div>
          </div>
      </div>

      <div className="w-full bg-slate-50 py-24 border-t border-slate-200">
         <TestimonialsSection />
      </div>

      <div className="w-full bg-white border-y border-slate-100">
         <PricingSection />
      </div>
    </div>
  );
};
