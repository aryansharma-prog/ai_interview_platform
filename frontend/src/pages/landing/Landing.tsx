import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  ArrowRight,
  Sparkles,
  Terminal,
  Layers,
  BookOpen,
  CheckCircle2,
  Cpu,
  Shield,
  FileText,
  Target,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SignalBars from '@/components/ui/SignalBars';
import Badge from '@/components/ui/Badge';

const corePillars = [
  {
    icon: FileText,
    title: 'Resume & JD Intelligence',
    desc: 'Extracts real project claims, metrics, and technologies to challenge your actual architectural decisions rather than asking generic trivia.',
  },
  {
    icon: Sparkles,
    title: 'Adaptive Cross-Questioning',
    desc: 'Actively scrutinizes your answers. Steps up difficulty when you demonstrate depth and tests foundational mechanics when you struggle.',
  },
  {
    icon: Terminal,
    title: 'AI Coding Studio & Big-O',
    desc: 'Integrated code editor with isolated sandbox test runners, runtime profiling, Big-O complexity analysis, and optimization challenges.',
  },
  {
    icon: Layers,
    title: '8-Dimension Evidence Evaluation',
    desc: 'Evaluates Technical Accuracy, DSA, System Design, Communication, Problem Solving, and Claim Defense with cited answer quotes.',
  },
  {
    icon: BookOpen,
    title: 'Personalized Learning Engine',
    desc: 'Converts identified skill gaps directly into actionable modular learning paths with interactive targeted practice drills.',
  },
  {
    icon: Shield,
    title: 'Privacy-Conscious Integrity',
    desc: 'Non-punitive proctoring signals with tab switch and focus loss telemetry for high-trust interview rehearsal.',
  },
];

const loopSteps = [
  { title: 'Resume + JD Fit', desc: 'AI extracts candidate claims & matches requirements' },
  { title: 'Adaptive Interview', desc: 'Dynamic difficulty & real-time cross-questioning' },
  { title: 'Coding Evaluation', desc: 'Sandbox test runner + Big-O complexity analysis' },
  { title: 'Skill Gap Detection', desc: 'Identifies specific weak competencies' },
  { title: 'Targeted Practice', desc: 'Interactive drills & personalized curriculum' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink text-paper selection:bg-signal selection:text-oninverse">
      {/* 1. Navigation Header */}
      <header className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-neutral/5">
        <div className="flex items-center gap-2.5">
          <div className="signal-bars h-5 text-signal">
            <span /><span /><span /><span /><span />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Interview<span className="text-signal">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-light hover:text-paper transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm" className="shadow-glow">Get started free</Button>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-signal/20 bg-signal/5 px-4 py-1.5 text-xs text-signal font-mono font-medium"
        >
          <Sparkles className="h-3.5 w-3.5" /> AI Interview Simulation & Personalized Learning
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight text-paper"
        >
          Practice Interviews That <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-signal via-signal-soft to-amber-300">
            Adapt To You.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-light leading-relaxed"
        >
          AI-powered interviews that understand your resume, challenge your technical decisions, identify skill gaps, and build a personalized learning path.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <Button size="lg" className="shadow-glow gap-2">
              Start Interview <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="secondary">
              Explore How It Works
            </Button>
          </a>
        </motion.div>

        {/* 3. Hero Visual Mockup: The Adaptive Loop */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 rounded-2xl border border-neutral/10 bg-ink-800 p-6 sm:p-8 text-left shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-neutral/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-signal">
              <span className="h-2.5 w-2.5 rounded-full bg-signal animate-pulse" />
              LIVE SIMULATION LOOP
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="signal" className="text-[10px]">Groq & Gemini Dual Engine</Badge>
              <Badge tone="mint" className="text-[10px]">Production Grade</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {loopSteps.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-neutral/10 bg-ink-700/60 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-signal">0{idx + 1}</span>
                  <h4 className="font-semibold text-xs text-paper mt-1">{step.title}</h4>
                </div>
                <p className="text-[11px] text-slate-light mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 border-t border-neutral/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <Badge tone="signal">Engineered For High Quality</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper">
            Built Like a Real Senior Tech Lead
          </h2>
          <p className="text-sm text-slate-light">
            Designed to simulate top tech company hiring bars with adaptive reasoning and persistent skill feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corePillars.map(({ icon: Icon, title, desc }, i) => (
            <Card key={i} className="p-6 space-y-3 hover:border-signal/40 transition-all">
              <div className="p-3 rounded-xl bg-signal/10 text-signal w-fit">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-paper">{title}</h3>
              <p className="text-xs text-slate-light leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Card className="p-10 sm:p-16 border-signal/20 bg-gradient-to-b from-signal/10 to-ink-800 space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper">
            Transform Your Interview Preparation Today
          </h2>
          <p className="text-sm text-slate-light max-w-lg mx-auto">
            Upload your resume, analyze target job descriptions, and experience interviews that challenge your actual engineering trade-offs.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" className="shadow-glow gap-2">
                Start Practicing Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-neutral/5 py-8 text-center text-xs text-slate">
        <p>© 2026 Interview.AI — Adaptive AI Interview Simulation & Career Learning Engine</p>
      </footer>
    </div>
  );
}
