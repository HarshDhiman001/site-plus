import React, { useState, useEffect } from 'react';
import { AnalysisType, AuditData } from './types';
import { analyzeWebsite } from './services/geminiService';
import { ResultsView } from './components/ResultsView';
import { PricingSection } from './components/PricingSection';
import { DemoPreview } from './components/DemoPreview';
import { LoginModal } from './components/LoginModal';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ClinicLandingView } from './components/ClinicLandingView';
import { Dashboard } from './components/Dashboard';
import { IconSearch, IconCode, IconActivity, IconAlertCircle, IconZap, IconAccessibility, IconGlobe, IconTrendingUp, IconCheckCircle, IconMapPin, IconUsers, IconShield, IconStar, IconUser, IconLogOut } from './components/Icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout, saveAuditResult, getUserAudits, logAnalyticsEvent } from './services/firebase';

interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
}

const REGIONS = [
  "Global (Worldwide)",
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "European Union",
  "Germany",
  "France",
  "Japan",
  "Brazil"
];

const LOADING_MESSAGES = [
  "Initializing global agents...",
  "Scanning target URL structure...",
  "Fetching regional competitors...",
  "Running deep-dive SEO diagnostics...",
  "Analyzing UX friction points...",
  "Compiling Grok-style intelligence...",
  "Finalizing report..."
];

function App() {
  const [inputValue, setInputValue] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>(AnalysisType.URL);
  const [region, setRegion] = useState(REGIONS[0]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);
  const [result, setResult] = useState<AuditData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // View State
  const [currentView, setCurrentView] = useState<'home' | 'clinic'>('home');

  // User & Login State
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [history, setHistory] = useState<AuditData[]>([]);

  // Placeholder Animation State
  const [placeholderText, setPlaceholderText] = useState("www.mybusiness.com");

  // Fake Live Stats
  const [liveUsers, setLiveUsers] = useState(1240);

  // Check for persisted user session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || ''
        };
        setUser(userData);
        // Load history from Firestore first, fallback to localStorage
        const firestoreHistory = await getUserAudits(firebaseUser.uid);
        if (firestoreHistory.length > 0) {
          setHistory(firestoreHistory);
        } else {
          loadHistory(firebaseUser.uid);
        }
      } else {
        setUser(null);
        setHistory([]);
      }
    });

    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Placeholder Animation Effect
  useEffect(() => {
    const examples = [
      "www.london-consulting.co.uk",
      "www.bangalore-tech.in",
      "www.sydney-coffee.com.au",
      "www.berlin-tech-startup.de",
      "www.mumbai-dental.in",
      "www.sf-health.com"
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % examples.length;
      setPlaceholderText(examples[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Loading Text Cycle
  useEffect(() => {
    if (!loading) return;

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[msgIndex]);
    }, 800);

    return () => clearInterval(interval);
  }, [loading]);

  const loadHistory = async (uid: string) => {
    try {
      // Try Firestore first
      const firestoreHistory = await getUserAudits(uid);
      if (firestoreHistory.length > 0) {
        setHistory(firestoreHistory);
        return firestoreHistory;
      }

      // Fallback/Sync with localStorage
      const savedHistory = localStorage.getItem(`sitepulse_history_${uid}`);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [];
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsLoginOpen(false);
      logAnalyticsEvent('login', { method: 'google' });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      logAnalyticsEvent('logout');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGetApi = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      alert("Your API Key: sk-live-928374-sitepulse-demo\n\n(This is a simulated key for demo purposes)");
    }
  };

  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (currentView !== 'home' && id !== 'pricing') {
      setCurrentView('home');
      // allow render then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setError(null);
    setLoadingText(LOADING_MESSAGES[0]);
    logAnalyticsEvent('audit_start', { type: analysisType, region: region });

    try {
      // Pass the selected region to the service
      const data = await analyzeWebsite(inputValue, analysisType, region);
      setResult(data);
      logAnalyticsEvent('audit_success', {
        type: analysisType,
        region: region,
        score: data.overallScore
      });

      // Save to Firestore if logged in
      if (user) {
        await saveAuditResult(user.uid, data);
        await loadHistory(user.uid); // Refresh history
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during the analysis.");
      logAnalyticsEvent('audit_error', { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setInputValue('');
    setError(null);
    // Reload history because ResultsView saved a new one
    if (user) loadHistory(user.uid);
    // If we are in dashboard mode, ensure we scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prefillAndScroll = (text: string, newRegion?: string) => {
    setInputValue(text);
    if (newRegion) setRegion(newRegion);
    setAnalysisType(AnalysisType.URL);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus the input after scroll
    setTimeout(() => {
      const input = document.querySelector('input[type="url"]') as HTMLInputElement;
      if (input) input.focus();
    }, 800);
  };

  // If we have results, show the results view
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <ResultsView data={result} onReset={reset} user={user} />
      </div>
    );
  }

  // Otherwise show the Input/Landing view
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden flex flex-col font-sans text-slate-900">
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      {/* Live Activity Ticker */}
      <div className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs py-2 px-4 flex justify-center items-center gap-4 overflow-hidden relative z-50">
        <div className="flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
          <span className="font-mono text-green-700">LIVE: {liveUsers.toLocaleString()} audits running now</span>
        </div>
        <span className="hidden md:inline text-slate-300">|</span>
        <div className="hidden md:flex gap-6">
          <span>New analysis from <span className="text-primary font-bold">London, UK</span></span>
          <span>New analysis from <span className="text-primary font-bold">Mumbai, India</span></span>
          <span>New analysis from <span className="text-primary font-bold">New York, USA</span></span>
        </div>
      </div>

      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Light Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3 opacity-60"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentView('home'); window.scrollTo(0, 0); }}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <IconActivity className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">SitePulse</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Global AI Intelligence</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }} className={`hover:text-primary transition-colors ${currentView === 'home' ? 'text-primary' : ''}`}>Home</a>
          <a href="#features" onClick={(e) => scrollToSection('features', e)} className="hover:text-primary transition-colors">Features</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('clinic'); }} className={`hover:text-primary transition-colors ${currentView === 'clinic' ? 'text-primary' : ''}`}>Clinics</a>
          <a href="#pricing" onClick={(e) => scrollToSection('pricing', e)} className="hover:text-primary transition-colors">Pricing</a>

          <button
            onClick={handleGetApi}
            className="text-slate-600 hover:text-primary transition-colors font-medium"
          >
            Get API
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <IconUser className="w-4 h-4 text-primary" />
                {user.name}
              </span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800">
                <IconLogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-primary hover:bg-primaryDark text-white px-5 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20 font-bold"
            >
              Login
            </button>
          )}
        </nav>
      </header>

      {/* Main Content Switcher */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">

        {currentView === 'clinic' ? (
          <ClinicLandingView
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleAnalyze={handleAnalyze}
            loading={loading}
            error={error}
            regions={REGIONS}
            selectedRegion={region}
            setRegion={setRegion}
          />
        ) : (
          /* HOME VIEW CONTENT */
          <>
            {/* Hero Section */}
            <div className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12 text-center relative">

              <div className="flex flex-col items-center">
                <div className="min-h-[250px] flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm text-xs font-bold text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                    <span>#1 GLOBAL AI AUDIT STANDARD</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 drop-shadow-sm">
                    The Global Standard for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">AI Website Audits</span>.
                  </h1>

                  <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Instantly analyze SEO, Speed, and Global Compliance with <strong>visionX intelegence ai</strong>.
                    Select your region for localized checks (US, India, UK, EU, Asia).
                  </p>
                </div>
              </div>

              {/* Input Card */}
              <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-3 shadow-xl shadow-slate-200/50 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-10 duration-1000 z-20 mb-16">

                <div className="flex flex-wrap items-center gap-3 p-1.5 mb-3 bg-slate-50 rounded-xl w-full sm:w-fit mx-auto sm:mx-0 border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAnalysisType(AnalysisType.URL)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${analysisType === AnalysisType.URL
                      ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                      }`}
                  >
                    <IconSearch className="w-4 h-4" />
                    Website
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisType(AnalysisType.CODE)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${analysisType === AnalysisType.CODE
                      ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                      }`}
                  >
                    <IconCode className="w-4 h-4" />
                    Code
                  </button>

                  {/* Region Selector */}
                  <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>

                  <div className="relative flex-1 sm:flex-none">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <IconMapPin className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full sm:w-48 appearance-none bg-slate-50 text-slate-700 text-xs font-bold pl-8 pr-8 py-2.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors cursor-pointer"
                    >
                      {REGIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none text-[0.6rem]">
                      ▼
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="relative">
                  {analysisType === AnalysisType.URL ? (
                    <input
                      type="url"
                      placeholder={`Enter your website URL (e.g., ${placeholderText})`}
                      className="w-full bg-white text-slate-900 p-5 pl-6 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 h-20 text-lg font-medium shadow-inner"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      required
                    />
                  ) : (
                    <textarea
                      placeholder="Paste your HTML/CSS code snippet..."
                      className="w-full bg-white text-slate-900 p-5 pl-6 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-400 min-h-[160px] font-mono text-sm resize-none font-medium shadow-inner"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      required
                    />
                  )}

                  <div className="absolute bottom-3 right-3">
                    <button
                      type="submit"
                      disabled={loading || !inputValue.trim()}
                      className={`bg-primary hover:bg-primaryDark text-white px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] ${loading ? 'pr-6' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="animate-pulse">{loadingText}</span>
                        </>
                      ) : (
                        'Run Free Audit'
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

              {/* Dashboard - Only for logged in users, moved below input */}
              {user && (
                <div className="mt-8 mb-8 w-full">
                  <Dashboard
                    user={user}
                    history={history}
                    onViewReport={setResult}
                  />
                </div>
              )}

            </div>

            {/* Trusted By Bar */}
            <div className="w-full bg-slate-50 border-y border-slate-200 py-10">
              <div className="max-w-6xl mx-auto px-6 text-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Trusted by 2,000+ Global Agencies</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
                  {/* Fake Logos - Dark text for light mode */}
                  <div className="text-xl font-black text-slate-800 flex items-center gap-2 select-none"><div className="w-6 h-6 bg-slate-800 rounded"></div>TECHCLINIC</div>
                  <div className="text-xl font-black text-slate-800 flex items-center gap-2 select-none"><div className="w-6 h-6 bg-slate-800 rounded-full"></div>DENTALSEO</div>
                  <div className="text-xl font-black text-slate-800 flex items-center gap-2 select-none"><div className="w-6 h-6 border-2 border-slate-800 rounded"></div>AUSTINWEB</div>
                  <div className="text-xl font-black text-slate-800 flex items-center gap-2 select-none"><div className="w-6 h-6 bg-slate-800 rotate-45"></div>GROWFL</div>
                </div>
              </div>
            </div>

            {/* Demo Preview Section */}
            <div className="w-full bg-white py-20 border-b border-slate-100 relative overflow-hidden">
              <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold mb-4 border border-blue-100 shadow-sm">
                  <IconActivity className="w-3 h-3" />
                  LIVE PREVIEW
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">See exactly what needs fixing.</h2>
                <p className="text-slate-500 max-w-2xl mx-auto mb-10 text-lg">
                  Stop guessing. Get a prioritized checklist for your developer or SEO team.
                </p>

                <div className="cursor-pointer transition-transform hover:scale-[1.01] duration-500" onClick={() => scrollToSection('pricing')}>
                  <DemoPreview />
                </div>
              </div>
            </div>

            {/* International Regional Focus Section */}
            <div id="us-audit" className="w-full max-w-7xl mx-auto px-6 py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-block p-3 bg-blue-50 border border-blue-100 text-primary rounded-2xl mb-6">
                    <IconMapPin className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Optimized for <br /><span className="text-primary">International Search Engines</span>.</h2>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    Google, Bing, and Baidu prioritize local relevance. Our algorithms adapt to regional standards in the <strong>USA, India, Europe, Asia, and Oceania</strong>.
                  </p>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    SitePulse checks for Hreflang tags, GDPR/CCPA compliance, and local server latency to ensure you rank globally.
                  </p>
                  <ul className="space-y-4">
                    {[
                      'Global SEO Compliance Check',
                      'Regional Load Speed Optimization',
                      'GDPR, CCPA & Privacy Law Analysis',
                      'Hreflang & Localization Validation'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <IconCheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  {/* Abstract Map Visual */}
                  <div className="aspect-square bg-slate-50 rounded-full border border-slate-200 relative overflow-hidden flex items-center justify-center shadow-lg">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200 via-slate-100 to-white"></div>
                    <div className="text-slate-200 font-black text-9xl select-none tracking-tighter opacity-100">WORLD</div>

                    {/* Floating Cards */}
                    <div className="absolute top-1/4 left-10 bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-xs font-bold text-slate-700">London: 98/100</span>
                    </div>
                    <div className="absolute bottom-1/3 right-10 bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 animate-pulse" style={{ animationDelay: '1s' }}>
                      <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.6)]"></div>
                      <span className="text-xs font-bold text-slate-700">Mumbai: 84/100</span>
                    </div>
                    <div className="absolute top-1/2 right-1/3 bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.5s' }}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                      <span className="text-xs font-bold text-slate-700">New York: 92/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic & Industry Section */}
            <div id="clinics" className="w-full bg-slate-50 border-y border-slate-200 py-24 relative overflow-hidden">

              <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                  <span className="text-primary font-bold tracking-wider text-sm uppercase">Industry Specialization</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-3 mb-6">Clinic Website Audits & More</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    Medical clinics, dental practices, and local service businesses have unique UX and SEO requirements. We check what matters to your patients.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary transition-colors shadow-lg shadow-slate-200/50">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                      <IconUsers className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Clinic & Healthcare</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      HIPAA compliance indicators, patient booking flow analysis, and "Doctors near me" local SEO checks.
                    </p>
                    <button onClick={() => { setCurrentView('clinic'); window.scrollTo(0, 0); }} className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                      Audit my Clinic <span>→</span>
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary transition-colors shadow-lg shadow-slate-200/50">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                      <IconShield className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Law & Professional</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Trust signal verification, speed analysis for high-bounce sectors, and professional schema validation.
                    </p>
                    <button onClick={() => prefillAndScroll('www.example-lawfirm.com', 'New York, USA')} className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                      Audit Law Firm <span>→</span>
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary transition-colors shadow-lg shadow-slate-200/50">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                      <IconStar className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Local Service (HVAC/Home)</h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Service area map check, click-to-call functionality tests, and GMB alignment.
                    </p>
                    <button onClick={() => prefillAndScroll('www.example-hvac.com', 'Texas, USA')} className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                      Audit Service Biz <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose SitePulse Section (NEW) */}
            <div className="w-full bg-white py-24 border-b border-slate-100">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                  <span className="text-primary font-bold tracking-wider text-sm uppercase">The AI Advantage</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-3 mb-6">Why Choose SitePulse?</h2>
                  <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
                    Most audit tools just list technical errors. SitePulse uses the latest <strong>visionX intelegence ai</strong> to understand your specific business context, prioritizing fixes that actually drive revenue for US clinics and service providers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Feature 1: visionX intelegence ai */}
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <IconZap className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Powered by visionX intelegence ai</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Unlike basic scrapers, our AI analyzes semantic context. It understands the difference between a "medical disclaimer" and "missing content", ensuring HIPAA-aware suggestions for healthcare sites.
                    </p>
                  </div>

                  {/* Feature 2: US Market Focus */}
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <IconGlobe className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Global SEO Architecture</h3>
                    <p className="text-slate-600 leading-relaxed">
                      We simulate traffic from key global hubs (NY, London, Tokyo). We check for local schema compliance, state-specific privacy laws (CCPA), and speed connectivity across worldwide nodes.
                    </p>
                  </div>

                  {/* Feature 3: Actionable Insights */}
                  <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <IconTrendingUp className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Revenue-Driven Audits</h3>
                    <p className="text-slate-600 leading-relaxed">
                      We don't just say "fix JavaScript". We tell you "Your booking form is slow on mobile," directly connecting technical issues to lost patient appointments and sales leads.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Grid with Hover Effects */}
            <div id="features" className="w-full max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Comprehensive Analysis Suite</h2>
                <p className="text-slate-600 text-lg">Every metric you need, all in one dashboard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: IconZap, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', title: 'Performance', desc: 'Core Web Vitals & Speed Index analysis.' },
                  { icon: IconAccessibility, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', title: 'Accessibility', desc: 'ADA & WCAG 2.1 compliance checks.' },
                  { icon: IconGlobe, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', title: 'Global SEO', desc: 'Rank higher in Google Worldwide results.' },
                  { icon: IconTrendingUp, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', title: 'Conversion Audit', desc: 'Identify why users are leaving.' }
                ].map((item, idx) => (
                  <div key={idx} className="group p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all hover:-translate-y-1">
                    <div className={`w-14 h-14 ${item.bg} border ${item.border} rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:scale-110 duration-300`}>
                      <item.icon className={`${item.color} w-7 h-7`} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="w-full bg-slate-50 py-24 border-y border-slate-200">
              <TestimonialsSection />
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="w-full bg-white border-y border-slate-100">
              <PricingSection />
            </div>
          </>
        )}
      </main>

      <footer className="relative z-10 py-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <IconActivity className="text-white w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 font-bold text-lg leading-none">SitePulse AI</span>
                <span className="text-[0.6rem] text-slate-500 uppercase font-bold mt-0.5">Powered by visionX intelegence</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              The #1 Website & UX Audit tool designed specifically for Global Businesses, Clinics, and Agencies. Built with visionX intelegence ai.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Global Locations</h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><button onClick={() => prefillAndScroll('www.california-business.com', 'United States')} className="hover:text-primary text-left transition-colors">United States SEO</button></li>
              <li><button onClick={() => prefillAndScroll('www.london-business.co.uk', 'United Kingdom')} className="hover:text-primary text-left transition-colors">UK Website Check</button></li>
              <li><button onClick={() => prefillAndScroll('www.bangalore-tech.in', 'India')} className="hover:text-primary text-left transition-colors">India SEO Audit</button></li>
              <li><button onClick={() => prefillAndScroll('www.sydney-business.com.au', 'Australia')} className="hover:text-primary text-left transition-colors">Australia Analysis</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li><button onClick={() => { setCurrentView('clinic'); window.scrollTo(0, 0); }} className="hover:text-primary text-left transition-colors">Clinic Audit Guide</button></li>
              <li><button onClick={() => { setCurrentView('clinic'); window.scrollTo(0, 0); }} className="hover:text-primary text-left transition-colors">Conversion Rate Tips</button></li>
              <li><button onClick={handleGetApi} className="hover:text-primary text-left transition-colors">API Documentation</button></li>
              <li><button onClick={() => window.location.href = 'mailto:support@sitepulse.ai'} className="hover:text-primary text-left transition-colors">Contact Support</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} SitePulse Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="hover:text-slate-800 transition-colors">Privacy Policy</button>
            <button className="hover:text-slate-800 transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
