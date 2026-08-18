import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Search, 
  Radio, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  Kanban, 
  BarChart3, 
  Layers,
  CheckCircle,
  Database,
  Server,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NOVEL_FEATURES = [
  {
    num: '01',
    title: 'In-Flight PII Redaction',
    desc: 'Scans and scrubs passwords, API keys, AWS credentials, and emails using spaCy NER before DB persistence.',
    icon: Lock,
    badge: 'Zero-Trust Security',
  },
  {
    num: '02',
    title: 'NLP Triage Engine',
    desc: 'Auto-classifies incoming incidents into Hardware, Network, Access, Software, Security, and computes priority.',
    icon: Activity,
    badge: 'FastAPI NLP',
  },
  {
    num: '03',
    title: 'Semantic Duplicate Detection',
    desc: 'Computes cosine similarity on incoming ticket embeddings to warn users of existing outages as they type.',
    icon: Search,
    badge: 'Vector Cosine',
  },
  {
    num: '04',
    title: 'Role-Enforced Vector Security',
    desc: 'Injects JWT role into DB projections to physically block clients from seeing developer-level diagnostic metadata.',
    icon: ShieldCheck,
    badge: 'Data Isolation',
  },
  {
    num: '05',
    title: 'Contextual Indexing',
    desc: 'Automatically prepends client device OS, browser, resolution, and network diagnostics into the incident context.',
    icon: Cpu,
    badge: 'Client Telemetry',
  },
  {
    num: '06',
    title: 'Agentic Fallback',
    desc: 'When AI confidence is < 0.65, triggers automated runbook retrieval and synthesizes technical remediation steps.',
    icon: Sparkles,
    badge: 'Autonomous Runbooks',
  },
  {
    num: '07',
    title: 'WebSocket "X-Ray" Telemetry',
    desc: 'Streams internal AI triage stages in real-time to the frontend over Socket.IO during ticket ingestion.',
    icon: Radio,
    badge: 'Real-Time Pipeline',
  },
  {
    num: '08',
    title: 'SLA Breach Predictor',
    desc: 'Dynamic mathematical model forecasting breach probabilities based on priority, queue backlog, and dev capacity.',
    icon: BarChart3,
    badge: 'Predictive Math',
  },
];

const LandingPage = () => {
  const { user, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoLaunch = async (role, path) => {
    await quickDemoLogin(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
            <span>Enterprise-Grade Zero-Trust ITSM Platform</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-brand-800">React + Node.js + FastAPI</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            Next-Gen Autonomous IT Service Desk Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">Zero-Trust AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            DeskFlow-AI integrates real-time NLP triage, in-flight PII redaction, semantic outage correlation, and WebSocket telemetry into a unified IT service management suite.
          </p>

          {/* Quick Demo Access Bar */}
          <div className="mt-10 max-w-3xl mx-auto p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-enterprise-md">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> One-Click Role Simulator (Instant Login)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoLaunch('client', '/client')}
                className="group p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all hover:scale-[1.02] shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Client Portal</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Submit tickets with PII scrub & live X-Ray</p>
              </button>

              <button
                onClick={() => handleDemoLaunch('developer', '/developer')}
                className="group p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-all hover:scale-[1.02] shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Kanban className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Dev Kanban</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Deep-dive triage, runbooks & notes</p>
              </button>

              <button
                onClick={() => handleDemoLaunch('manager', '/manager')}
                className="group p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition-all hover:scale-[1.02] shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Manager Analytics</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Recharts SLA risk & AI confidence</p>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Novel Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Core Innovations
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              The 8 Novel Enterprise Features
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Engineered from the ground up for mission-critical enterprise infrastructure and SOC2/Zero-Trust compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NOVEL_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.num}
                  className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 hover:shadow-enterprise-md hover:border-brand-300 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {feat.num}
                      </span>
                    </div>

                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 mb-2">
                      {feat.badge}
                    </span>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center text-[11px] font-semibold text-brand-600">
                    <span>Engineered Zero-Trust</span>
                    <CheckCircle className="w-3.5 h-3.5 ml-1 text-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Monorepo Architecture Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
                Monorepo Microservices Blueprint
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                Distributed High-Throughput Pipeline
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                DeskFlow-AI partitions workloads across specialized runtimes: Node.js handles real-time WebSocket orchestration and Zero-Trust database projections, while Python FastAPI executes vectorized NLP pipelines and PII scrubbing.
              </p>

              <div className="mt-8 space-y-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                  <Server className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Node.js Express + Socket.IO (Port 5000)</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      JWT authentication, Role-Enforced Vector Security, and SLA breach predictor.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                  <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Python FastAPI AI Engine (Port 8000)</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      In-flight PII redaction, TF-IDF cosine similarity, and agentic runbook fallback.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                  <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">MongoDB Mongoose Cluster</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Compound indexed storage with dual raw/sanitized payload isolation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Flow Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400">
                <span>ITSM Ingestion Stream Topology</span>
                <span className="text-[10px] text-emerald-400 font-bold">200 OK</span>
              </div>

              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-brand-400">1. Client Ingest</span>
                  <span className="text-slate-400">Device Context Harvested</span>
                </div>
                <div className="text-center text-slate-600">↓ (Socket.IO Handshake)</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-indigo-400">2. PII Redaction Microservice</span>
                  <span className="text-slate-400">Regex + spaCy Scrub</span>
                </div>
                <div className="text-center text-slate-600">↓ (Vector Embeddings)</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-emerald-400">3. Outage Correlation</span>
                  <span className="text-slate-400">Cosine Similarity Warning</span>
                </div>
                <div className="text-center text-slate-600">↓ (Confidence Evaluation)</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-amber-400">4. Agentic Fallback & SLA</span>
                  <span className="text-slate-400">&lt; 0.65 Trigger Runbooks</span>
                </div>
                <div className="text-center text-slate-600">↓ (Zero-Trust Projection)</div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-purple-400">5. Kanban & Analytics Push</span>
                  <span className="text-slate-400">Real-time Telemetry Complete</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>DeskFlow-AI Enterprise Zero-Trust ITSM</span>
          </div>
          <p>© 2026 DeskFlow-AI Engineering. All enterprise rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
