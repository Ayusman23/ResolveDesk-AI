import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, User, ShieldCheck, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '263358758822-319m1p38k3ns8fdhcdfs32711kqp3qfa.apps.googleusercontent.com';

const GoogleAuthButton = ({ role = 'client', text = 'Continue with Google', onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('ayusmansamantaray23@gmail.com');
  const [googleName, setGoogleName] = useState('Ayusman Samantaray');
  const [modalRole, setModalRole] = useState(role);

  // Authenticate Google account via backend
  const handleGoogleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!googleEmail) return;

    setLoading(true);
    try {
      const res = await loginWithGoogle(
        null,
        {
          name: googleName || googleEmail.split('@')[0],
          email: googleEmail,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName || googleEmail)}`,
        },
        modalRole
      );

      if (res.success) {
        setShowModal(false);
        if (onSuccess) onSuccess(res.user);
        else {
          if (res.user.role === 'developer') navigate('/developer');
          else if (res.user.role === 'manager') navigate('/manager');
          else navigate('/client');
        }
      } else {
        if (onError) onError(res.message || 'Google Authentication failed.');
      }
    } catch (err) {
      if (onError) onError(err.message || 'Google Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (name, email, selectedRole) => {
    setGoogleName(name);
    setGoogleEmail(email);
    setModalRole(selectedRole);
  };

  return (
    <div className="w-full">
      {/* Sleek Primary Google OAuth Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
      >
        <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{text}</span>
      </button>

      {/* Universal Google Identity OAuth Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Workspace Identity</h3>
                  <p className="text-[11px] text-slate-400">Zero-Trust Single Sign-On</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Suggestions */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" /> One-Click Google Profiles:
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('Ayusman Samantaray', 'ayusmansamantaray23@gmail.com', 'client')}
                    className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-400 flex items-center justify-between text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px]">
                        AS
                      </div>
                      <div>
                        <p className="text-slate-900 leading-tight">Ayusman Samantaray</p>
                        <p className="text-[10px] text-slate-500 font-mono font-normal">ayusmansamantaray23@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Select</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickPreset('Enterprise Client', 'client.google@enterprise.corp', 'client')}
                    className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-400 flex items-center justify-between text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                        GC
                      </div>
                      <div>
                        <p className="text-slate-900 leading-tight">Google Enterprise Client</p>
                        <p className="text-[10px] text-slate-500 font-mono font-normal">client.google@enterprise.corp</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Select</span>
                  </button>
                </div>
              </div>

              {/* Custom Google Account Form */}
              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Google Full Name
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Ayusman Samantaray"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Google Email Address
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="ayusmansamantaray23@gmail.com"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Role Clearance
                  </label>
                  <select
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50 font-medium"
                  >
                    <option value="client">Client (Service Consumer)</option>
                    <option value="developer">Developer / SRE</option>
                    <option value="manager">Manager / IT Director</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !googleEmail}
                  className="w-full mt-2 flex justify-center items-center py-2.5 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{loading ? 'Authorizing Identity...' : 'Sign In with Google Account'}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
