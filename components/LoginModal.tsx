import React, { useState } from 'react';
import { IconX, IconActivity, IconGoogle } from './Icons';
import { signInWithGoogle } from '../services/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

type AuthMode = 'signin' | 'signup';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Fallback for demo email login
    setTimeout(() => {
      const userName = mode === 'signup' ? name : (email.split('@')[0] || 'Demo User');
      onLogin({ uid: 'demo-' + Date.now(), name: userName, email: email || 'user@example.com' });
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setIsGoogleLoading(false);
      onClose();
    } catch (error) {
      console.error("Google Sign-in failed:", error);
      setIsGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    // Reset Validation/Error states here if implemented
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5 rotate-3">
            <IconActivity className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 text-center text-sm px-8">
            {mode === 'signin'
              ? 'Enter your credentials to access your audit history and reports.'
              : 'Join 2,000+ agencies optimizing their web presence with SitePulse.'}
          </p>
        </div>

        {/* Social Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mb-6 shadow-sm"
        >
          {isGoogleLoading ? (
            <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <IconGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-bold text-slate-400 uppercase">Or {mode === 'signin' ? 'Sign In' : 'Sign Up'} with Email</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide ml-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 bg-white font-medium placeholder:text-slate-400"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 bg-white font-medium placeholder:text-slate-400"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
              {mode === 'signin' && (
                <button type="button" className="text-xs text-primary font-bold hover:underline">Forgot?</button>
              )}
            </div>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 bg-white font-medium placeholder:text-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={switchMode}
              className="text-primary font-bold hover:underline ml-1"
            >
              {mode === 'signin' ? 'Create free account' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
