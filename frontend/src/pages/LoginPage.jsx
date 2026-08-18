import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/25 mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Sign in to DeskFlow-AI
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Zero-Trust IT Service Management & Real-time Telemetry
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        
        {/* Quick Demo Simulator Box */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> One-Click Role Simulator
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              Demo Mode
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('client', '/client')}
              className="w-full text-left px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors flex items-center justify-between text-xs font-semibold text-slate-900"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Alice Henderson (Client - Marketing)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('developer', '/developer')}
              className="w-full text-left px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 transition-colors flex items-center justify-between text-xs font-semibold text-slate-900"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Sarah Connor (Developer - SRE Lead)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('manager', '/manager')}
              className="w-full text-left px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 transition-colors flex items-center justify-between text-xs font-semibold text-slate-900"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>David Vance (Manager - IT Director)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-enterprise-lg rounded-2xl border border-slate-200">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Enterprise Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice.client@enterprise.corp"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? 'Authenticating...' : 'Sign In with Email'}
            </button>
          </form>

          {/* Google Sign In Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <GoogleAuthButton
                role="client"
                text="Sign in with Google"
                onError={(msg) => setError(msg)}
              />
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 underline">
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
