import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  Terminal,
  Kanban,
  BarChart3
} from 'lucide-react';

const LoginPage = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/client';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (res.user.role === 'developer') navigate('/developer');
      else if (res.user.role === 'manager') navigate('/manager');
      else navigate(from === '/login' ? '/client' : from);
    } else {
      setError(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleDemoSelect = async (role, destination) => {
    setError('');
    setSubmitting(true);
    const res = await quickDemoLogin(role);
    setSubmitting(false);
    if (res.success) {
      navigate(destination);
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#22E6B8] selection:text-[#080A10] overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-40" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-[380px] h-[380px] rounded-full bg-emerald-500/[0.08] dark:bg-[#22E6B8]/[0.12] blur-[100px]" />
        <div className="absolute bottom-10 right-0 w-[420px] h-[420px] rounded-full bg-purple-500/[0.08] dark:bg-[#8B7CFA]/[0.12] blur-[110px]" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-gradient-to-br dark:from-[#22E6B8]/20 dark:to-[#8B7CFA]/20 border border-emerald-200 dark:border-[#22E6B8]/40 dark:text-[#22E6B8] shadow-sm dark:shadow-[0_0_24px_-6px_rgba(34,230,184,0.5)] mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#EDF1F7]">
          Sign in to DeskFlow<span className="text-emerald-600 dark:text-[#22E6B8]">.ai</span>
        </h1>
        <p className="mt-1.5 font-mono text-[12.5px] text-slate-500 dark:text-[#8791A3]">
          Zero-Trust Ingress · Role-Scoped Vector Isolation
        </p>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Quick Role Simulator Card */}
        <div className="mb-5 p-4 rounded-xl bg-white dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8791A3] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#22E6B8]" /> Instant Role Simulator
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#22E6B8]/10 dark:text-[#22E6B8] dark:border-[#22E6B8]/30 font-semibold">
              1-Click Demo
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('client', '/client')}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-emerald-200 dark:border-[#22E6B8]/20 bg-emerald-50/50 dark:bg-[#22E6B8]/[0.04] hover:bg-emerald-100/60 dark:hover:bg-[#22E6B8]/[0.09] hover:border-emerald-300 dark:hover:border-[#22E6B8]/40 transition-all flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-[#22E6B8]" />
                <div>
                  <span className="text-slate-900 dark:text-[#EDF1F7] group-hover:text-emerald-600 dark:group-hover:text-[#22E6B8] transition-colors">Alice (Client Portal)</span>
                  <p className="font-mono text-[10.5px] text-slate-500 dark:text-[#565F70]">End-user · PII Ingestion</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-emerald-600 dark:group-hover:text-[#22E6B8] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('developer', '/developer')}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-sky-200 dark:border-[#38BDF8]/20 bg-sky-50/50 dark:bg-[#38BDF8]/[0.04] hover:bg-sky-100/60 dark:hover:bg-[#38BDF8]/[0.09] hover:border-sky-300 dark:hover:border-[#38BDF8]/40 transition-all flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Kanban className="w-3.5 h-3.5 text-sky-600 dark:text-[#38BDF8]" />
                <div>
                  <span className="text-slate-900 dark:text-[#EDF1F7] group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] transition-colors">Sarah (Developer Kanban)</span>
                  <p className="font-mono text-[10.5px] text-slate-500 dark:text-[#565F70]">SRE Lead · Full Triage & Runbooks</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('manager', '/manager')}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-purple-200 dark:border-[#8B7CFA]/20 bg-purple-50/50 dark:bg-[#8B7CFA]/[0.04] hover:bg-purple-100/60 dark:hover:bg-[#8B7CFA]/[0.09] hover:border-purple-300 dark:hover:border-[#8B7CFA]/40 transition-all flex items-center justify-between text-xs font-semibold group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-[#8B7CFA]" />
                <div>
                  <span className="text-slate-900 dark:text-[#EDF1F7] group-hover:text-purple-600 dark:group-hover:text-[#8B7CFA] transition-colors">David (Manager Analytics)</span>
                  <p className="font-mono text-[10.5px] text-slate-500 dark:text-[#565F70]">IT Director · SLA Risk & Trends</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-purple-600 dark:group-hover:text-[#8B7CFA] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Standard Email Login Card */}
        <div className="bg-white dark:bg-[#0D1119] py-7 px-6 sm:px-8 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-[#FF5C6C]/10 border border-rose-200 dark:border-[#FF5C6C]/30 flex items-center space-x-2 text-xs text-rose-700 dark:text-[#FF5C6C]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-mono text-[11px] font-semibold text-slate-600 dark:text-[#8791A3] uppercase tracking-wider mb-1.5">
                Enterprise Email
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#565F70]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice.client@enterprise.corp"
                  className="block w-full pl-9 pr-3 py-2 text-[13.5px] font-mono border border-slate-300 dark:border-white/[0.09] rounded-lg bg-slate-50 dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] placeholder-slate-400 dark:placeholder-[#565F70] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#22E6B8] focus:border-emerald-500 dark:focus:border-[#22E6B8] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-semibold text-slate-600 dark:text-[#8791A3] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#565F70]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-[13.5px] font-mono border border-slate-300 dark:border-white/[0.09] rounded-lg bg-slate-50 dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] placeholder-slate-400 dark:placeholder-[#565F70] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#22E6B8] focus:border-emerald-500 dark:focus:border-[#22E6B8] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg font-mono text-[13px] font-semibold text-white dark:text-[#080A10] bg-emerald-600 hover:bg-emerald-700 dark:bg-[#22E6B8] dark:hover:bg-[#5CF2CE] transition-all shadow-sm dark:shadow-[0_0_20px_-6px_rgba(34,230,184,0.6)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Authenticating...' : 'Sign In with Email'}
            </button>
          </form>

          {/* Google Sign In Divider */}
          <div className="mt-5 mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/[0.07]" />
              </div>
              <div className="relative flex justify-center font-mono text-[10.5px] uppercase">
                <span className="bg-white dark:bg-[#0D1119] px-2 text-slate-400 dark:text-[#565F70] tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <GoogleAuthButton
                role="client"
                text="Sign in with Google Workspace"
                onError={(msg) => setError(msg)}
              />
            </div>
          </div>

          <div className="text-center font-mono text-[12px] text-slate-500 dark:text-[#565F70]">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-[#22E6B8] hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
