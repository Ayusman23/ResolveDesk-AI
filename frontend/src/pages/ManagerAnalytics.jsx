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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#080A10]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#8B7CFA] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-[#8791A3]">Computing Enterprise ITSM Telemetry & Metrics...</p>
        </div>
      </div>
    );
  }

  const { summary, categoryData, slaRiskData, priorityData, piiDistribution } = analytics || {};

  const CATEGORY_COLORS = ['#22E6B8', '#38BDF8', '#8B7CFA', '#FFB454', '#FF5C6C', '#10B981'];
  const PII_COLORS = ['#FF5C6C', '#FFB454', '#8B7CFA', '#38BDF8'];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080A10] text-[#EDF1F7] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-[#22E6B8] selection:text-[#080A10]">
      
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B7CFA]/15 border border-[#8B7CFA]/30 flex items-center justify-center text-[#8B7CFA]">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#EDF1F7]">
              Manager Operational Telemetry & Analytics
            </h1>
            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#8B7CFA]/10 text-[#8B7CFA] border border-[#8B7CFA]/30">
              Executive SOC2 View
            </span>
          </div>
          <p className="font-mono text-[12px] text-[#8791A3] mt-1">
            Real-time telemetry tracking SLA compliance, AI triage accuracy, and in-flight PII redaction audits
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-mono text-[#8791A3] hover:text-[#EDF1F7] bg-[#080A10] border border-white/[0.08] hover:border-white/[0.2] rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8B7CFA]' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono">
        
        {/* SLA Compliance */}
        <div className="bg-[#0D1119] p-5 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8791A3]">
              SLA Compliance Rate
            </span>
            <h3 className="font-display text-2xl font-bold text-[#EDF1F7] mt-1">
              {summary?.slaComplianceRate}%
            </h3>
            <span className="text-[11px] font-semibold text-[#22E6B8] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Target &gt;95% on SLA
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#22E6B8]/15 text-[#22E6B8] flex items-center justify-center border border-[#22E6B8]/30">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* AI Triage Accuracy */}
        <div className="bg-[#0D1119] p-5 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8791A3]">
              Avg AI Confidence
            </span>
            <h3 className="font-display text-2xl font-bold text-[#EDF1F7] mt-1">
              {Math.round((summary?.avgAiConfidence || 0.85) * 100)}%
            </h3>
            <span className="text-[11px] font-semibold text-[#38BDF8] flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> {summary?.agenticFallbackRate || 0}% fallback rate
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center border border-[#38BDF8]/30">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* In-Flight PII Redacted */}
        <div className="bg-[#0D1119] p-5 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8791A3]">
              PII Credentials Scrubbed
            </span>
            <h3 className="font-display text-2xl font-bold text-[#EDF1F7] mt-1">
              {summary?.piiScrubbedTotal || 0}
            </h3>
            <span className="text-[11px] font-semibold text-[#22E6B8] flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3" /> Zero-Trust In-Flight
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FF5C6C]/15 text-[#FF5C6C] flex items-center justify-center border border-[#FF5C6C]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Active Backlog */}
        <div className="bg-[#0D1119] p-5 rounded-xl border border-white/[0.08] shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8791A3]">
              Active Incident Queue
            </span>
            <h3 className="font-display text-2xl font-bold text-[#EDF1F7] mt-1">
              {summary?.activeTickets || 0}
            </h3>
            <span className="text-[11px] font-semibold text-[#8791A3] flex items-center gap-1 mt-1">
              <Users className="w-3 h-3 text-[#8B7CFA]" /> {summary?.activeDevelopersCount || 2} SRE Capacity
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#8B7CFA]/15 text-[#8B7CFA] flex items-center justify-center border border-[#8B7CFA]/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 font-mono">
        
        {/* Chart 1: SLA Breach Risk Distribution */}
        <div className="bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-[#EDF1F7] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22E6B8]" />
              SLA Risk Distribution Matrix
            </h3>
            <span className="text-[10px] font-mono uppercase bg-white/[0.05] px-2 py-0.5 rounded text-[#8791A3]">
              Real-Time Radar
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slaRiskData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(slaRiskData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Incidents`, name]}
                  contentStyle={{ backgroundColor: '#0D1119', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#EDF1F7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8791A3' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incident Volume by Category */}
        <div className="bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-[#EDF1F7] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#38BDF8]" />
              NLP Category Ingestion Volume
            </h3>
            <span className="text-[10px] font-mono uppercase bg-white/[0.05] px-2 py-0.5 rounded text-[#8791A3]">
              Multi-Class Triage
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#565F70" fontSize={10.5} />
                <YAxis stroke="#565F70" fontSize={10.5} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1119', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#EDF1F7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="value" name="Incidents" radius={[4, 4, 0, 0]}>
                  {(categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Priority Breakdown */}
        <div className="bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-[#EDF1F7] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FFB454]" />
              Incident Priority Breakdown
            </h3>
            <span className="text-[10px] font-mono uppercase bg-white/[0.05] px-2 py-0.5 rounded text-[#8791A3]">
              Severity Ranking
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#565F70" fontSize={10.5} allowDecimals={false} />
                <YAxis dataKey="priority" type="category" stroke="#565F70" fontSize={10.5} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1119', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#EDF1F7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="count" fill="#8B7CFA" radius={[0, 4, 4, 0]} name="Ticket Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: In-Flight PII Redaction Audit */}
        <div className="bg-[#0D1119] p-6 rounded-xl border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold text-[#EDF1F7] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF5C6C]" />
              PII Entity Redaction Audit Breakdown
            </h3>
            <span className="text-[10px] font-mono uppercase bg-white/[0.05] px-2 py-0.5 rounded text-[#8791A3]">
              SOC2 Compliance Audit
            </span>
          </div>

          <div className="h-64">
            {(piiDistribution || []).length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-[#565F70]">
                No PII entities detected in current dataset
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={piiDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="count"
                    nameKey="type"
                  >
                    {piiDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PII_COLORS[index % PII_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D1119', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#EDF1F7', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#8791A3' }} />
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
