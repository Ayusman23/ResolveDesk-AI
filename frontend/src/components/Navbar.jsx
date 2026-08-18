import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  ShieldCheck, 
  Terminal, 
  LayoutDashboard, 
  Kanban, 
  BarChart3, 
  LogOut, 
  User as UserIcon, 
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickSwitch = async (role) => {
    await quickDemoLogin(role);
    if (role === 'client') navigate('/client');
    else if (role === 'developer') navigate('/developer');
    else if (role === 'manager') navigate('/manager');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'developer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  DeskFlow<span className="text-brand-600 font-extrabold">.AI</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">Zero-Trust</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/client"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/client'
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Client Portal</span>
              </Link>

              {(user.role === 'developer' || user.role === 'manager') && (
                <Link
                  to="/developer"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/developer'
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                  <span>Dev Kanban</span>
                </Link>
              )}

              {(user.role === 'developer' || user.role === 'manager') && (
                <Link
                  to="/manager"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/manager'
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Manager Analytics</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right Area: Telemetry Status, Demo Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Real-time Socket Live Status */}
            <div 
              title={isConnected ? "WebSocket X-Ray Telemetry Channel Connected" : "Connecting to Socket.IO..."}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-mono text-[11px]">{isConnected ? 'X-RAY LIVE' : 'SYNCING'}</span>
            </div>

            {/* Quick Demo Switcher dropdown / buttons */}
            <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Switch:
              </span>
              <button
                onClick={() => handleQuickSwitch('client')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  user?.role === 'client'
                    ? 'bg-white shadow-xs text-brand-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => handleQuickSwitch('developer')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  user?.role === 'developer'
                    ? 'bg-white shadow-xs text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dev
              </button>
              <button
                onClick={() => handleQuickSwitch('manager')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  user?.role === 'manager'
                    ? 'bg-white shadow-xs text-purple-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manager
              </button>
            </div>

            {/* User Profile Pill & Logout */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <span className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-brand-600 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-1.5 rounded-lg shadow-sm shadow-brand-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
