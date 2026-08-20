import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { ShieldCheck, User, Mail, Lock, Building, AlertCircle, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [department, setDepartment] = useState('Engineering');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await register(name, email, password, role, department);
    setSubmitting(false);

    if (res.success) {
      if (role === 'developer') navigate('/developer');
      else if (role === 'manager') navigate('/manager');
      else navigate('/client');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#22E6B8] selection:text-[#080A10] overflow-hidden transition-colors duration-200">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-40" aria-hidden="true">
        <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-purple-500/[0.08] dark:bg-[#8B7CFA]/[0.12] blur-[110px]" />
        <div className="absolute bottom-10 left-0 w-[420px] h-[420px] rounded-full bg-emerald-500/[0.08] dark:bg-[#22E6B8]/[0.12] blur-[110px]" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-gradient-to-br dark:from-[#22E6B8]/20 dark:to-[#8B7CFA]/20 border border-emerald-200 dark:border-[#22E6B8]/40 dark:text-[#22E6B8] shadow-sm dark:shadow-[0_0_24px_-6px_rgba(34,230,184,0.5)] mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#EDF1F7]">
          Create Enterprise Identity
        </h1>
        <p className="mt-1.5 font-mono text-[12.5px] text-slate-500 dark:text-[#8791A3]">
          Join the DeskFlow-AI Zero-Trust Network
        </p>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
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
                Full Name
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#565F70]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="block w-full pl-9 pr-3 py-2 text-[13.5px] font-mono border border-slate-300 dark:border-white/[0.09] rounded-lg bg-slate-50 dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] placeholder-slate-400 dark:placeholder-[#565F70] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#22E6B8] focus:border-emerald-500 dark:focus:border-[#22E6B8] transition-colors"
                />
              </div>
            </div>

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
                  placeholder="elena.rostova@enterprise.corp"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] font-semibold text-slate-600 dark:text-[#8791A3] uppercase tracking-wider mb-1.5">
                  Role Assignment
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3 py-2 text-[13px] font-mono border border-slate-300 dark:border-white/[0.09] rounded-lg bg-slate-50 dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#22E6B8] focus:border-emerald-500 dark:focus:border-[#22E6B8] transition-colors"
                >
                  <option value="client">Client End-User</option>
                  <option value="developer">Developer / SRE</option>
                  <option value="manager">ITSM Manager</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold text-slate-600 dark:text-[#8791A3] uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative rounded-lg">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Engineering"
                    className="block w-full px-3 py-2 text-[13px] font-mono border border-slate-300 dark:border-white/[0.09] rounded-lg bg-slate-50 dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] placeholder-slate-400 dark:placeholder-[#565F70] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#22E6B8] focus:border-emerald-500 dark:focus:border-[#22E6B8] transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex justify-center items-center py-2.5 px-4 rounded-lg font-mono text-[13px] font-semibold text-white dark:text-[#080A10] bg-emerald-600 hover:bg-emerald-700 dark:bg-[#22E6B8] dark:hover:bg-[#5CF2CE] transition-all shadow-sm dark:shadow-[0_0_20px_-6px_rgba(34,230,184,0.6)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating Identity...' : 'Register Profile'}
            </button>
          </form>

          {/* Google Sign Up Divider */}
          <div className="mt-5 mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/[0.07]" />
              </div>
              <div className="relative flex justify-center font-mono text-[10.5px] uppercase">
                <span className="bg-white dark:bg-[#0D1119] px-2 text-slate-400 dark:text-[#565F70] tracking-wider">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <GoogleAuthButton
                role={role}
                text="Sign up with Google Workspace"
                onError={(msg) => setError(msg)}
              />
            </div>
          </div>

          <div className="text-center font-mono text-[12px] text-slate-500 dark:text-[#565F70]">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-[#22E6B8] hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
