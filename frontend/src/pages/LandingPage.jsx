import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Search,
  Radio,
  Activity,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Terminal,
  Kanban,
  BarChart3,
  Database,
  Server,
  ChevronRight,
  Fingerprint,
  Gauge,
  Eye,
  Zap,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { category: 'Security & Isolation', title: 'In-flight PII redaction', desc: 'Scans and scrubs passwords, API keys, AWS credentials, and email addresses using spaCy NER before anything touches the database.', icon: Lock },
  { category: 'Security & Isolation', title: 'Role-enforced vector security', desc: 'JWT role claims are injected directly into DB projections, physically blocking clients from ever seeing developer-level diagnostics.', icon: ShieldCheck },
  { category: 'Intelligence', title: 'NLP triage engine', desc: 'Auto-classifies incoming incidents into Hardware, Network, Access, Software, or Security, and computes a priority score.', icon: Activity },
  { category: 'Intelligence', title: 'Semantic duplicate detection', desc: 'Computes cosine similarity across incoming ticket embeddings to surface existing outages while the user is still typing.', icon: Search },
  { category: 'Intelligence', title: 'Agentic fallback', desc: 'When model confidence drops below 0.65, the system triggers runbook retrieval and synthesizes remediation steps automatically.', icon: Sparkles },
  { category: 'Intelligence', title: 'SLA breach predictor', desc: 'A live forecasting model estimates breach probability from ticket priority, queue backlog, and current developer capacity.', icon: BarChart3 },
  { category: 'Real-time systems', title: 'Contextual indexing', desc: 'Device OS, browser, resolution, and network diagnostics are captured and prepended to every incident automatically.', icon: Cpu },
  { category: 'Real-time systems', title: 'WebSocket X-Ray telemetry', desc: 'Streams every internal triage stage to the client in real time over Socket.IO as a ticket moves through the pipeline.', icon: Radio },
];

const PIPELINE = [
  { stage: 'Client ingest', detail: 'Device and network context is harvested at the point of submission.', icon: Terminal, elapsed: '+0ms' },
  { stage: 'PII redaction', detail: 'Regex and spaCy passes scrub sensitive fields before persistence.', icon: Lock, elapsed: '+40ms' },
  { stage: 'Outage correlation', detail: 'Cosine similarity check against open tickets and known incidents.', icon: Search, elapsed: '+95ms' },
  { stage: 'Confidence evaluation', detail: 'Below 0.65, the agentic fallback pulls a runbook and drafts steps.', icon: Sparkles, elapsed: '+140ms' },
  { stage: 'Zero-trust projection', detail: 'Role-scoped payload is written and pushed to Kanban and analytics.', icon: ShieldCheck, elapsed: '+180ms' },
];

const ROLES = [
  { key: 'client', label: 'Client portal', detail: 'Submit tickets, watch redaction and triage happen live', icon: Terminal, path: '/client' },
  { key: 'developer', label: 'Developer kanban', detail: 'Full triage depth, runbooks, and internal notes', icon: Kanban, path: '/developer' },
  { key: 'manager', label: 'Manager analytics', detail: 'SLA risk, queue health, and model confidence over time', icon: BarChart3, path: '/manager' },
];

const CATEGORIES = ['Security & Isolation', 'Intelligence', 'Real-time systems'];

const TRUST_BADGES = [
  { icon: Fingerprint, label: 'PII scrubbed pre-write' },
  { icon: ShieldCheck, label: 'Role-scoped by JWT claim' },
  { icon: Eye, label: 'Every stage observable' },
  { icon: Lock, label: 'No plaintext secrets stored' },
];

const STATS = [
  { value: 180, suffix: 'ms', label: 'ingest → routed', decimals: 0 },
  { value: 99.9, suffix: '%', label: 'target uptime', decimals: 1 },
  { value: 0, suffix: '', label: 'plaintext PII fields stored', decimals: 0 },
  { value: 8, suffix: '', label: 'independent triage systems', decimals: 0 },
];

const TECH_STACK = ['Node.js', 'Express', 'Socket.IO', 'FastAPI', 'spaCy', 'MongoDB', 'JWT', 'React'];

const LEDGER_SCRIPT = [
  { tag: 'received', body: 'TCK-4471 · redacted 3 fields', tone: 'mid' },
  { tag: 'classified', body: 'TCK-4471 → Network · P2', tone: 'accent' },
  { tag: 'correlate', body: 'TCK-4471 · 0.82 match on OUT-1183', tone: 'warning' },
  { tag: 'confidence', body: 'TCK-4471 · 0.91 — no fallback needed', tone: 'accent' },
  { tag: 'routed', body: 'TCK-4471 → Developer queue', tone: 'mid' },
  { tag: 'received', body: 'TCK-4472 · redacted 1 field', tone: 'mid' },
  { tag: 'classified', body: 'TCK-4472 → Access · P3', tone: 'accent' },
  { tag: 'sla', body: 'TCK-4468 · breach risk 74% in 22m', tone: 'critical' },
  { tag: 'correlate', body: 'TCK-4472 · no match found', tone: 'mid' },
  { tag: 'routed', body: 'TCK-4472 → Developer queue', tone: 'mid' },
];

function useLedger(intervalMs = 1700) {
  const [rows, setRows] = useState(() => LEDGER_SCRIPT.slice(0, 5).map((r, i) => ({ ...r, id: i, t: tsOffset(i) })));
  const idxRef = useRef(5);
  const idRef = useRef(5);
  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const id = setInterval(() => {
      const next = LEDGER_SCRIPT[idxRef.current % LEDGER_SCRIPT.length];
      idxRef.current += 1;
      const row = { ...next, id: idRef.current, t: nowTs() };
      idRef.current += 1;
      setRows((prev) => [...prev.slice(1), row]);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return rows;
}

function nowTs() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}

function tsOffset(minusSec) {
  const d = new Date(Date.now() - minusSec * 2000);
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}

const TONE_DOT = {
  accent: 'bg-emerald-500 dark:bg-[#22E6B8]',
  mid: 'bg-slate-400 dark:bg-[#565F70]',
  warning: 'bg-amber-500 dark:bg-[#FFB454]',
  critical: 'bg-rose-500 dark:bg-[#FF5C6C]',
};

function useInView(options = { threshold: 0.15 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({ target, duration = 1200, decimals = 0, suffix = '' }) {
  const [ref, inView] = useInView();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return <span ref={ref}>{value.toFixed(decimals)}{suffix}</span>;
}

const LandingPage = () => {
  const navigate = useNavigate();
  const { quickDemoLogin } = useAuth();
  const ledger = useLedger();

  const handleDemoLaunch = useCallback(async (role) => {
    const res = await quickDemoLogin(role);
    if (res?.success) {
      navigate(role === 'manager' ? '/manager' : role === 'developer' ? '/developer' : '/client');
    }
  }, [quickDemoLogin, navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080A10] text-slate-900 dark:text-[#EDF1F7] font-sans antialiased selection:bg-[#22E6B8] selection:text-[#080A10] transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative border-b border-slate-200 dark:border-white/[0.06] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-60" aria-hidden="true">
          <div className="drift-a absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-emerald-500/[0.08] dark:bg-[#22E6B8]/[0.10] blur-[110px]" />
          <div className="drift-b absolute top-10 right-0 w-[460px] h-[460px] rounded-full bg-purple-500/[0.08] dark:bg-[#8B7CFA]/[0.10] blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-start">
          <Reveal>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-600 dark:text-[#22E6B8] mb-6">
              <span className="w-4 h-px bg-emerald-500 dark:bg-[#22E6B8]" />
              Zero-trust ITSM
            </div>
            <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] font-bold tracking-tight leading-[1.05] text-slate-900 dark:text-[#EDF1F7]">
              The service desk<br />that reads, redacts,<br />and routes itself.
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-slate-600 dark:text-[#8791A3] max-w-md">
              DeskFlow-AI pairs a Node.js control plane with a FastAPI inference layer to triage, de-duplicate, and route incidents in real time — stripping sensitive data before it ever reaches a document.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#access" className="inline-flex items-center gap-2 bg-emerald-600 text-white dark:bg-[#EDF1F7] dark:text-[#080A10] font-semibold text-[14px] px-5 py-3 rounded-md hover:bg-emerald-700 dark:hover:bg-white transition-colors shadow-sm">
                Launch a live instance <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#architecture" className="inline-flex items-center gap-2 font-mono text-[13px] text-slate-600 dark:text-[#8791A3] hover:text-slate-900 dark:hover:text-[#EDF1F7] transition-colors px-1">
                View the pipeline <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} className="flex items-center gap-2 text-slate-600 dark:text-[#8791A3]">
                    <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-[#22E6B8] shrink-0" />
                    <span className="font-mono text-[11.5px]">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0D1119]/90 overflow-hidden shadow-xl dark:shadow-[0_0_60px_-20px_rgba(34,230,184,0.15)]">
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-px overflow-hidden" aria-hidden="true">
                <div className="beam-travel h-24 w-full bg-gradient-to-b from-emerald-500/50 dark:from-[#22E6B8]/50 via-emerald-500/10 dark:via-[#22E6B8]/10 to-transparent" />
              </div>
              <div className="relative flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.08] font-mono text-[11px] text-slate-500 dark:text-[#8791A3]">
                <span className="uppercase tracking-[0.1em]">Ingestion ledger</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-[#22E6B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#22E6B8] pulse-dot" /> live
                </span>
              </div>
              <div className="relative px-4 py-3 font-mono text-[12.5px] leading-[1.9]">
                {ledger.map((row) => (
                  <div key={row.id} className="row-in flex items-baseline gap-3 border-b border-slate-100 dark:border-white/[0.05] last:border-0 py-1.5">
                    <span className="text-slate-400 dark:text-[#565F70] shrink-0">{row.t}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE_DOT[row.tone]}`} />
                    <span className="text-slate-600 dark:text-[#8791A3] shrink-0 w-[76px]">{row.tag}</span>
                    <span className="text-slate-900 dark:text-[#EDF1F7] truncate">{row.body}</span>
                  </div>
                ))}
              </div>
              <div className="relative px-4 py-3 border-t border-slate-100 dark:border-white/[0.08] font-mono text-[11px] text-slate-400 dark:text-[#565F70] flex items-center justify-between">
                <span>Socket.IO · ws://ingest/x-ray</span>
                <span className="text-emerald-600 dark:text-[#22E6B8]">200 OK</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 font-mono">
              <div className="rounded-lg border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] px-3 py-3 shadow-xs">
                <div className="text-[18px] font-semibold text-slate-900 dark:text-[#EDF1F7]">180ms</div>
                <div className="text-[10.5px] text-slate-500 dark:text-[#565F70] mt-1">ingest → routed</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] px-3 py-3 shadow-xs">
                <div className="text-[18px] font-semibold text-slate-900 dark:text-[#EDF1F7]">0.65</div>
                <div className="text-[10.5px] text-slate-500 dark:text-[#565F70] mt-1">fallback threshold</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] px-3 py-3 shadow-xs">
                <div className="text-[18px] font-semibold text-slate-900 dark:text-[#EDF1F7]">3</div>
                <div className="text-[10.5px] text-slate-500 dark:text-[#565F70] mt-1">isolated services</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problem / Fix Section */}
      <section className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-100/60 dark:bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-10">
          <Reveal>
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-rose-500 dark:text-[#FF5C6C]" />
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-[#8791A3]">The problem</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-slate-600 dark:text-[#8791A3] max-w-md">
              Service desks route tickets by hand, copy sensitive details into plaintext notes, and let the same outage get reported ten times before anyone notices the pattern.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-[#8791A3]">The fix</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-slate-600 dark:text-[#8791A3] max-w-md">
              DeskFlow-AI redacts, classifies, and correlates every ticket the moment it lands — so developers see a clean, prioritized queue and clients never have to wonder where their data went.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Numerical Stats */}
      <section className="border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="font-display text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-[#EDF1F7]">
                <CountUp target={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </div>
              <div className="font-mono text-[11.5px] text-slate-500 dark:text-[#565F70] mt-2">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Access Simulation */}
      <section id="access" className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#080A10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <Reveal>
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-500 dark:text-[#565F70]">Simulate access · instant login</h2>
              <span className="font-mono text-[11px] text-slate-400 dark:text-[#565F70]">No credentials required for this environment</span>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <Reveal key={role.key} delay={i * 90}>
                  <button onClick={() => handleDemoLaunch(role.key)} className="group w-full text-left bg-white dark:bg-[#0D1119] hover:bg-slate-50 dark:hover:bg-[#111726] border border-slate-200 dark:border-white/[0.07] hover:border-emerald-300 dark:hover:border-[#22E6B8]/30 rounded-xl p-6 transition-all hover:-translate-y-0.5 shadow-sm dark:shadow-md cursor-pointer">
                    <div className="flex items-center justify-between mb-5">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#565F70] group-hover:text-emerald-600 dark:group-hover:text-[#22E6B8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <div className="font-display font-semibold text-[14.5px] text-slate-900 dark:text-[#EDF1F7]">{role.label}</div>
                    <p className="font-mono text-[12px] text-slate-500 dark:text-[#565F70] mt-1.5 leading-relaxed">{role.detail}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <Reveal>
            <div className="max-w-xl mb-14">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-emerald-600 dark:text-[#22E6B8] mb-3">Capabilities</h2>
              <p className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight text-slate-900 dark:text-[#EDF1F7]">Eight systems, each with one job, none of them decorative.</p>
            </div>
          </Reveal>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-12 last:mb-0">
              <Reveal>
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="font-mono text-[12px] text-slate-500 dark:text-[#8791A3]">{cat}</h3>
                  <span className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
                </div>
              </Reveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
                {FEATURES.filter((f) => f.category === cat).map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <Reveal key={feat.title} delay={i * 70}>
                      <div className="group rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0D1119] p-5 hover:border-emerald-300 dark:hover:border-[#22E6B8]/35 hover:bg-slate-50/80 dark:hover:bg-[#111726] transition-colors flex gap-4 h-full shadow-xs">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] flex items-center justify-center group-hover:border-emerald-300 dark:group-hover:border-[#22E6B8]/40 group-hover:bg-emerald-50 dark:group-hover:bg-[#22E6B8]/[0.08] transition-colors">
                          <Icon className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
                        </div>
                        <div>
                          <h4 className="text-[14.5px] font-semibold text-slate-900 dark:text-[#EDF1F7]">{feat.title}</h4>
                          <p className="text-[13px] text-slate-600 dark:text-[#8791A3] mt-1.5 leading-relaxed">{feat.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-[1fr,1.2fr] gap-16">
          <Reveal>
            <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] text-emerald-600 dark:text-[#22E6B8] mb-3">Architecture</h2>
            <p className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight text-slate-900 dark:text-[#EDF1F7] mb-5">Two runtimes, split by what they're good at.</p>
            <p className="text-[14.5px] text-slate-600 dark:text-[#8791A3] leading-relaxed mb-8 max-w-md">Node handles everything stateful and real-time — auth, sockets, and zero-trust projections. Python handles everything numerical — embeddings, redaction, and the fallback model.</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0D1119] shadow-xs">
                <Server className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8] shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[12.5px] text-slate-900 dark:text-[#EDF1F7]">node · express + socket.io <span className="text-slate-400 dark:text-[#565F70]">:5000</span></div>
                  <p className="text-[12px] text-slate-600 dark:text-[#8791A3] mt-1">Auth, role-scoped projections, SLA prediction.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0D1119] shadow-xs">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-[#8B7CFA] shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[12.5px] text-slate-900 dark:text-[#EDF1F7]">python · fastapi <span className="text-slate-400 dark:text-[#565F70]">:8000</span></div>
                  <p className="text-[12px] text-slate-600 dark:text-[#8791A3] mt-1">PII redaction, cosine similarity, runbook synthesis.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0D1119] shadow-xs">
                <Database className="w-4 h-4 text-amber-600 dark:text-[#FFB454] shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-[12.5px] text-slate-900 dark:text-[#EDF1F7]">mongodb · mongoose</div>
                  <p className="text-[12px] text-slate-600 dark:text-[#8791A3] mt-1">Compound-indexed storage, dual raw/sanitized payloads.</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="relative pl-8">
            <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/[0.08]" />
            <div className="space-y-8">
              {PIPELINE.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.stage} delay={i * 90}>
                    <div className="relative">
                      <div className="absolute -left-8 top-0.5 w-[26px] h-[26px] rounded-full bg-white dark:bg-[#0D1119] border border-emerald-500 dark:border-[#22E6B8]/40 flex items-center justify-center shadow-xs">
                        <Icon className="w-3 h-3 text-emerald-600 dark:text-[#22E6B8]" />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-[14.5px] font-semibold text-slate-900 dark:text-[#EDF1F7]"><span className="font-mono text-slate-400 dark:text-[#565F70] mr-2">0{i + 1}</span>{step.stage}</h4>
                        <span className="font-mono text-[11px] text-slate-400 dark:text-[#565F70]">{step.elapsed}</span>
                      </div>
                      <p className="text-[13px] text-slate-600 dark:text-[#8791A3] mt-1.5 leading-relaxed max-w-md">{step.detail}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-100/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-[#8791A3]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#22E6B8]" />
              <span className="font-display font-semibold text-slate-900 dark:text-[#EDF1F7]">DeskFlow.ai</span>
              <span className="text-slate-400 dark:text-[#565F70]">— zero-trust IT service management</span>
            </div>
            <p className="font-mono text-[11.5px] text-slate-400 dark:text-[#565F70]">© 2026 DeskFlow-AI Engineering</p>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="font-mono text-[10.5px] text-slate-600 dark:text-[#8791A3] border border-slate-300 dark:border-white/[0.07] bg-white dark:bg-transparent rounded-full px-2.5 py-1">{tech}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;