import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-sky-500 selection:text-black">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 shadow-xl shadow-sky-500/20 mb-2">
            <Icon icon="solar:radar-2-bold-duotone" className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-mono flex items-center justify-center gap-2">
            TRACE <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">AI RISK</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Wire-Telemetry &amp; Chameleon Risk Gateway
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl custom-glass border border-slate-800 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Icon icon="solar:lock-password-bold-duotone" className="w-4 h-4 text-sky-400" /> RISK ANALYST AUTHENTICATION
            </h2>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Analyst Username</label>
              <div className="relative">
                <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="analyst or admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Access Token / Password</label>
              <div className="relative">
                <Icon icon="solar:lock-password-bold-duotone" className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <Icon icon="solar:plain-bold-duotone" className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Instant Demo Credentials */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <p className="text-[11px] font-mono text-slate-400 text-center">
              1-Click Instant Evaluation Login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('analyst', 'razorpay2026')}
                className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <span className="text-sky-400 font-bold block">Sidharth</span>
                  <span className="text-[10px] text-slate-500">Risk Analyst</span>
                </div>
                <Icon icon="solar:plain-bold-duotone" className="w-3 h-3 text-sky-400" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin', 'admin123')}
                className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <span className="text-purple-400 font-bold block">Admin</span>
                  <span className="text-[10px] text-slate-500">Full Access</span>
                </div>
                <Icon icon="solar:plain-bold-duotone" className="w-3 h-3 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
