import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  PieChart as PieIcon,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const ManagerAnalytics = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/overview');
      if (res.data.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Real-time update on ticket changes
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchAnalytics();
    };
    socket.on('ticket:created', handleUpdate);
    socket.on('ticket:updated', handleUpdate);

    return () => {
      socket.off('ticket:created', handleUpdate);
      socket.off('ticket:updated', handleUpdate);
    };
  }, [socket]);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-500">Calculating Enterprise ITSM Metrics...</p>
        </div>
      </div>
    );
  }

  const { summary, categoryData, slaRiskData, priorityData, piiDistribution } = analytics || {};

  const CATEGORY_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const PII_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#06b6d4'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-brand-500 selection:text-white">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Manager Operational Telemetry & Analytics
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Executive SOC2 View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Recharts analytics tracking SLA compliance, AI triage accuracy, and in-flight PII redaction audits.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* SLA Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SLA Compliance Rate
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary?.slaComplianceRate}%
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Target &gt;95% on SLA
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* AI Triage Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg AI Confidence
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {Math.round((summary?.avgAiConfidence || 0.85) * 100)}%
            </h3>
            <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> {summary?.agenticFallbackRate}% fallback rate
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center border border-indigo-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* In-Flight PII Redacted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              PII Credentials Scrubbed
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary?.piiScrubbedTotal || 0}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3" /> Zero-Trust In-Flight Safe
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Active Backlog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-enterprise-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Incident Queue
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {summary?.activeTickets || 0}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
              <Users className="w-3 h-3" /> {summary?.activeDevelopersCount || 2} Active SREs
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Chart 1: SLA Breach Risk Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Novel Feature 8: SLA Risk Distribution
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Dynamic Real-time
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaRiskData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(slaRiskData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Tickets`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incident Volume by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              Novel Feature 2: NLP Category Ingestion Volume
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Multi-Class Triage
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="Incidents" radius={[6, 6, 0, 0]}>
                  {(categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Priority Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Incident Priority Breakdown
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Severity Ranking
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="priority" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Ticket Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: In-Flight PII Redaction Audit */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-enterprise-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" />
              Novel Feature 1: PII Entity Redaction Audit Breakdown
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              SOC2 In-Flight Scrub
            </span>
          </div>

          <div className="h-64">
            {(piiDistribution || []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                No PII entities detected in current dataset
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={piiDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="type"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {piiDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PII_COLORS[index % PII_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ManagerAnalytics;
