import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Radio, ShieldAlert, Lock, User, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoUser, demoPass) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(demoUser, demoPass);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-sky-500 selection:text-black">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 shadow-xl shadow-sky-500/20 mb-2">
            <Radio className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-mono flex items-center justify-center gap-2">
            TRACE <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">L4/L7 AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Wire-Telemetry &amp; Chameleon Risk Gateway
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl custom-glass border border-cyber-border space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" /> RISK ANALYST AUTHENTICATION
            </h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to access live network telemetry &amp; SAR forensics.</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="analyst or admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN TO COCKPIT'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-mono text-slate-400 text-center">Instant 1-Click Evaluation Access:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("analyst", "razorpay2026")}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                Risk Analyst
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin", "admin123")}
                className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Lead Officer
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs font-mono text-slate-500">
          Razorpay AI Builder Track 2 • Dual-Speed L4/L7 Wire Architecture
        </p>
      </div>
    </div>
  );
}
