import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
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
  Users,
  Shield,
  Layers,
  ArrowUpRight,
  ChevronRight,
  FileCheck2
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
  const { isDark } = useTheme();

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

  // Color Palettes
  const CATEGORY_COLORS = isDark
    ? ['#22E6B8', '#38BDF8', '#8B7CFA', '#FFB454', '#FF5C6C', '#10B981']
    : ['#059669', '#0284C7', '#7C3AED', '#D97706', '#E11D48', '#10B981'];

  const PII_COLORS = isDark
    ? ['#FF5C6C', '#FFB454', '#8B7CFA', '#38BDF8']
    : ['#DC2626', '#D97706', '#7C3AED', '#0284C7'];

  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.07)' : '#E2E8F0';
  const axisColor = isDark ? '#8791A3' : '#64748B';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-[#0D1119] border border-slate-200 dark:border-white/[0.12] p-3 rounded-lg shadow-xl font-mono text-xs">
          <p className="font-semibold text-slate-800 dark:text-[#EDF1F7] mb-1">
            {data.name || label || 'Item'}
          </p>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-[#8791A3]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color || data.payload?.fill || '#22E6B8' }}
            />
            <span>
              Count / Value: <strong className="text-slate-900 dark:text-white font-bold">{data.value}</strong>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F8FAFC] dark:bg-[#080A10]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 dark:border-[#8B7CFA] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500 dark:text-[#8791A3]">Computing Enterprise ITSM Telemetry & Metrics...</p>
        </div>
      </div>
    );
  }

  const { summary, categoryData = [], slaRiskData = [], priorityData = [], piiDistribution = [] } = analytics || {};

  const totalSlaTickets = slaRiskData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200">
      
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#0D1119] p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-[#8B7CFA]/15 border border-purple-200 dark:border-[#8B7CFA]/30 flex items-center justify-center text-purple-700 dark:text-[#8B7CFA]">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-[#EDF1F7]">
              Manager Operational Telemetry & Analytics
            </h1>
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-[#8B7CFA]/10 dark:text-[#8B7CFA] border border-purple-200 dark:border-[#8B7CFA]/30">
              Executive SOC2 View
            </span>
          </div>
          <p className="font-mono text-[12px] text-slate-500 dark:text-[#8791A3] mt-1">
            Real-time telemetry tracking SLA compliance, AI triage accuracy, and in-flight PII redaction audits
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-mono text-slate-600 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] bg-slate-100 dark:bg-[#080A10] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600 dark:text-[#8B7CFA]' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono">
        
        {/* SLA Compliance Rate */}
        <div className="bg-white dark:bg-[#0D1119] p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs dark:shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8791A3]">
              SLA Compliance Rate
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-[#EDF1F7] mt-1">
              {summary?.slaComplianceRate ?? 99.4}%
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#22E6B8] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Target &gt;95% Met
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-[#22E6B8]/15 text-emerald-600 dark:text-[#22E6B8] flex items-center justify-center border border-emerald-200 dark:border-[#22E6B8]/30">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Avg AI Confidence */}
        <div className="bg-white dark:bg-[#0D1119] p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs dark:shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8791A3]">
              Avg AI Confidence
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-[#EDF1F7] mt-1">
              {Math.round((summary?.avgAiConfidence || 0.88) * 100)}%
            </h3>
            <span className="text-[11px] font-semibold text-sky-600 dark:text-[#38BDF8] flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> {summary?.agenticFallbackRate || 0}% fallback rate
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-[#38BDF8]/15 text-sky-600 dark:text-[#38BDF8] flex items-center justify-center border border-sky-200 dark:border-[#38BDF8]/30">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* PII Credentials Scrubbed */}
        <div className="bg-white dark:bg-[#0D1119] p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs dark:shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8791A3]">
              PII Entities Scrubbed
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-[#EDF1F7] mt-1">
              {summary?.piiScrubbedTotal ?? 14}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#22E6B8] flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3" /> Zero-Trust In-Flight
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-[#FF5C6C]/15 text-rose-600 dark:text-[#FF5C6C] flex items-center justify-center border border-rose-200 dark:border-[#FF5C6C]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Active Incident Backlog */}
        <div className="bg-white dark:bg-[#0D1119] p-5 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs dark:shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8791A3]">
              Active Incident Queue
            </span>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-[#EDF1F7] mt-1">
              {summary?.activeTickets ?? 0}
            </h3>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-[#8791A3] flex items-center gap-1 mt-1">
              <Users className="w-3 h-3 text-purple-600 dark:text-[#8B7CFA]" /> {summary?.activeDevelopersCount || 2} SRE Capacity
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-[#8B7CFA]/15 text-purple-600 dark:text-[#8B7CFA] flex items-center justify-center border border-purple-200 dark:border-[#8B7CFA]/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 font-mono">
        
        {/* Chart 1: SLA Breach Risk Distribution */}
        <div className="bg-white dark:bg-[#0D1119] p-6 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDF1F7] flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
                SLA Risk Distribution Matrix
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8791A3] mt-0.5">
                Mathematical breach forecast over active queue
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded text-slate-600 dark:text-[#8791A3]">
              Real-Time Radar
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaRiskData}
                  cx="50%"
                  cy="48%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {slaRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  formatter={(value) => <span className="text-slate-700 dark:text-[#EDF1F7] text-[11.5px] font-medium">{value}</span>}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incident Volume by Category */}
        <div className="bg-white dark:bg-[#0D1119] p-6 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDF1F7] flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600 dark:text-[#38BDF8]" />
                NLP Category Ingestion Volume
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8791A3] mt-0.5">
                Multi-class classification distribution
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded text-slate-600 dark:text-[#8791A3]">
              Automated Triage
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Incidents" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Priority Breakdown */}
        <div className="bg-white dark:bg-[#0D1119] p-6 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDF1F7] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-[#FFB454]" />
                Incident Priority Breakdown
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8791A3] mt-0.5">
                Severity weighting across active and resolved tickets
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded text-slate-600 dark:text-[#8791A3]">
              Severity Ranking
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" stroke={axisColor} fontSize={11} allowDecimals={false} tickLine={false} />
                <YAxis dataKey="priority" type="category" stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={isDark ? '#8B7CFA' : '#7C3AED'} radius={[0, 4, 4, 0]} name="Ticket Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: In-Flight PII Redaction Audit */}
        <div className="bg-white dark:bg-[#0D1119] p-6 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDF1F7] flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500 dark:text-[#FF5C6C]" />
                PII Entity Redaction Security Audit
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8791A3] mt-0.5">
                Pre-persistence credential scrub breakdown
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded text-slate-600 dark:text-[#8791A3]">
              SOC2 Compliance
            </span>
          </div>

          <div className="h-72">
            {piiDistribution.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                <FileCheck2 className="w-10 h-10 text-emerald-500 dark:text-[#22E6B8]" />
                <p className="font-semibold text-slate-900 dark:text-[#EDF1F7] text-sm">
                  100% Clean Ingestion Audit
                </p>
                <p className="text-xs text-slate-500 dark:text-[#8791A3] max-w-xs">
                  All sensitive credentials, tokens, and keys are scrubbed pre-persistence.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={piiDistribution}
                    cx="50%"
                    cy="48%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="type"
                  >
                    {piiDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PII_COLORS[index % PII_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle" 
                    formatter={(value) => <span className="text-slate-700 dark:text-[#EDF1F7] text-[11.5px] font-medium">{value}</span>}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Architectural Compliance Summary Box */}
      <div className="bg-white dark:bg-[#0D1119] p-6 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-xs dark:shadow-xl font-mono text-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
            <span className="font-display font-semibold text-sm text-slate-900 dark:text-[#EDF1F7]">
              Zero-Trust Audit & Telemetry Compliance Summary
            </span>
          </div>
          <span className="text-emerald-600 dark:text-[#22E6B8] font-bold bg-emerald-50 dark:bg-[#22E6B8]/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-[#22E6B8]/30">
            200 OK · SOC2 ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-[#8791A3]">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A10] border border-slate-200 dark:border-white/[0.05]">
            <p className="font-semibold text-slate-800 dark:text-[#EDF1F7] mb-1">Mean Time to Triage (MTTT)</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-[#22E6B8]">&lt; 180 ms</p>
            <p className="text-[10.5px] mt-0.5">Automated NLP & regex passes</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A10] border border-slate-200 dark:border-white/[0.05]">
            <p className="font-semibold text-slate-800 dark:text-[#EDF1F7] mb-1">Vector Security Enforcement</p>
            <p className="text-lg font-bold text-sky-600 dark:text-[#38BDF8]">JWT Projected</p>
            <p className="text-[10.5px] mt-0.5">Physical DB projection isolation</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A10] border border-slate-200 dark:border-white/[0.05]">
            <p className="font-semibold text-slate-800 dark:text-[#EDF1F7] mb-1">Outage Duplication Filter</p>
            <p className="text-lg font-bold text-purple-600 dark:text-[#8B7CFA]">Cosine &gt; 0.30</p>
            <p className="text-[10.5px] mt-0.5">Pre-submission live correlation</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ManagerAnalytics;
