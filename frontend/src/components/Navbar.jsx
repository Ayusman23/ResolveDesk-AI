import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  Terminal, 
  Kanban, 
  BarChart3, 
  LogOut, 
  Sparkles,
  ChevronDown,
  ArrowRight,
  Sun,
  Moon,
  User,
  Radio,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const { isConnected } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const demoRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSwitch = async (roleName, targetPath) => {
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    const res = await quickDemoLogin(roleName);
    if (res?.success) {
      navigate(targetPath);
    }
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const isLanding = location.pathname === '/';
  const isPortal = ['/client', '/developer', '/manager'].includes(location.pathname);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-[#8B7CFA]/15 dark:text-[#8B7CFA] dark:border-[#8B7CFA]/30';
      case 'developer':
        return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] dark:border-[#38BDF8]/30';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-[#22E6B8]/15 dark:text-[#22E6B8] dark:border-[#22E6B8]/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#080A10]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.07] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center space-x-6 shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-gradient-to-br dark:from-[#22E6B8]/25 dark:to-[#8B7CFA]/25 border border-emerald-500 dark:border-[#22E6B8]/40 flex items-center justify-center text-white dark:text-[#22E6B8] shadow-xs dark:shadow-[0_0_16px_-4px_rgba(34,230,184,0.4)] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-display font-bold tracking-tight text-[17px] text-slate-900 dark:text-[#EDF1F7]">
                  DeskFlow<span className="text-emerald-600 dark:text-[#22E6B8]">.ai</span>
                </span>
                <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-[#8791A3] border border-slate-200 dark:border-white/[0.08]">
                  Zero-Trust
                </span>
              </div>
            </Link>

            {/* Landing Page Internal Section Nav Links (Only when on Landing Page) */}
            {isLanding && (
              <nav className="hidden xl:flex items-center space-x-6 font-mono text-[13px] text-slate-600 dark:text-[#8791A3]">
                <a href="#capabilities" className="hover:text-slate-900 dark:hover:text-[#EDF1F7] transition-colors">Capabilities</a>
                <a href="#architecture" className="hover:text-slate-900 dark:hover:text-[#EDF1F7] transition-colors">Architecture</a>
                <a href="#access" className="hover:text-slate-900 dark:hover:text-[#EDF1F7] transition-colors">Simulation</a>
              </nav>
            )}
          </div>

          {/* 2. Center: Role Portal Tabs (When user is authenticated and in dashboard) */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 dark:bg-[#0D1119] p-1 rounded-xl border border-slate-200 dark:border-white/[0.07] shrink-0">
              <Link
                to="/client"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  location.pathname === '/client'
                    ? 'bg-emerald-600 text-white dark:bg-[#22E6B8]/15 dark:text-[#22E6B8] font-semibold dark:border dark:border-[#22E6B8]/30 shadow-xs'
                    : 'text-slate-600 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] hover:bg-white/70 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Client</span>
              </Link>

              {(user.role === 'developer' || user.role === 'manager') && (
                <Link
                  to="/developer"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    location.pathname === '/developer'
                      ? 'bg-sky-600 text-white dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] font-semibold dark:border dark:border-[#38BDF8]/30 shadow-xs'
                      : 'text-slate-600 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] hover:bg-white/70 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Developer</span>
                </Link>
              )}

              {user.role === 'manager' && (
                <Link
                  to="/manager"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    location.pathname === '/manager'
                      ? 'bg-purple-600 text-white dark:bg-[#8B7CFA]/15 dark:text-[#8B7CFA] font-semibold dark:border dark:border-[#8B7CFA]/30 shadow-xs'
                      : 'text-slate-600 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] hover:bg-white/70 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Manager</span>
                </Link>
              )}
            </nav>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* 3. Right: Sleek Action Bar & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            
            {/* Live Socket.IO Status Pill */}
            <div 
              title={isConnected ? "WebSocket X-Ray Telemetry Channel Live" : "Connecting to Socket.IO..."}
              className={`hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[10.5px] font-mono border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#22E6B8]/10 dark:text-[#22E6B8] dark:border-[#22E6B8]/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#FFB454]/10 dark:text-[#FFB454] dark:border-[#FFB454]/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 dark:bg-[#22E6B8] pulse-dot' : 'bg-amber-500 dark:bg-[#FFB454]'}`} />
              <span className="font-semibold">{isConnected ? 'LIVE' : 'SYNC'}</span>
            </div>

            {/* Quick Demo Simulator Dropdown */}
            <div className="relative" ref={demoRef}>
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-700 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] bg-slate-100 dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-[#22E6B8]" />
                <span className="hidden sm:inline">Simulate</span>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#565F70]" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-[#565F70] border-b border-slate-100 dark:border-white/[0.06] mb-1">
                    Instant Role Simulator
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('client', '/client')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between text-xs group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-[#EDF1F7] group-hover:text-emerald-600 dark:group-hover:text-[#22E6B8]">Alice (Client)</div>
                      <div className="text-[10.5px] font-mono text-slate-500 dark:text-[#565F70]">Self-Service Ingestion</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-emerald-600 dark:group-hover:text-[#22E6B8] transition-transform" />
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('developer', '/developer')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between text-xs group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-[#EDF1F7] group-hover:text-sky-600 dark:group-hover:text-[#38BDF8]">Sarah (Developer)</div>
                      <div className="text-[10.5px] font-mono text-slate-500 dark:text-[#565F70]">ITSM Kanban & Runbooks</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] transition-transform" />
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('manager', '/manager')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between text-xs group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-[#EDF1F7] group-hover:text-purple-600 dark:group-hover:text-[#8B7CFA]">David (Manager)</div>
                      <div className="text-[10.5px] font-mono text-slate-500 dark:text-[#565F70]">SLA Risk & Intelligence</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-purple-600 dark:group-hover:text-[#8B7CFA] transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-lg bg-slate-100 dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#EDF1F7] hover:border-slate-300 dark:hover:border-white/[0.2] transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#FFB454]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Authenticated User Menu or Guest Buttons */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-100 dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] transition-colors cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-white/[0.1]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-[#22E6B8]/15 text-emerald-700 dark:text-[#22E6B8] border border-emerald-200 dark:border-[#22E6B8]/30 flex items-center justify-center font-mono font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-[#8791A3]" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                      <p className="font-semibold text-slate-900 dark:text-[#EDF1F7] truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-[#8791A3] truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <span className={`inline-block text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user.role)}`}>
                          {user.role} role
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/client"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-[#EDF1F7] transition-colors"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-[#22E6B8]" />
                      <span>Client Portal</span>
                    </Link>

                    {(user.role === 'developer' || user.role === 'manager') && (
                      <Link
                        to="/developer"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-[#EDF1F7] transition-colors"
                      >
                        <Kanban className="w-3.5 h-3.5 text-sky-600 dark:text-[#38BDF8]" />
                        <span>Developer Kanban</span>
                      </Link>
                    )}

                    {user.role === 'manager' && (
                      <Link
                        to="/manager"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-[#EDF1F7] transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-[#8B7CFA]" />
                        <span>Manager Analytics</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-white/[0.06] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-600 dark:text-[#FF5C6C] hover:bg-rose-50 dark:hover:bg-[#FF5C6C]/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="font-mono text-xs text-slate-600 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="font-mono text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#22E6B8] dark:text-[#080A10] px-3.5 py-1.5 rounded-lg dark:hover:bg-[#5CF2CE] transition-all shadow-xs dark:shadow-[0_0_20px_-6px_rgba(34,230,184,0.6)]"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#EDF1F7]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/[0.08] py-3 space-y-2 font-mono text-xs animate-in slide-in-from-top-2">
            {isLanding && (
              <div className="flex flex-col space-y-1.5 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 text-slate-600 dark:text-[#8791A3]">Capabilities</a>
                <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 text-slate-600 dark:text-[#8791A3]">Architecture</a>
                <a href="#access" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 text-slate-600 dark:text-[#8791A3]">Simulation</a>
              </div>
            )}

            {user && (
              <div className="flex flex-col space-y-1">
                <Link to="/client" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-800 dark:text-[#EDF1F7] flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
                  <span>Client Portal</span>
                </Link>
                {(user.role === 'developer' || user.role === 'manager') && (
                  <Link to="/developer" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-800 dark:text-[#EDF1F7] flex items-center space-x-2">
                    <Kanban className="w-4 h-4 text-sky-600 dark:text-[#38BDF8]" />
                    <span>Developer Board</span>
                  </Link>
                )}
                {user.role === 'manager' && (
                  <Link to="/manager" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-800 dark:text-[#EDF1F7] flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-purple-600 dark:text-[#8B7CFA]" />
                    <span>Manager Analytics</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
