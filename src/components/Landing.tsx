import { motion } from 'framer-motion'
import {
  ArrowRight, Briefcase, CheckCircle2, FileUp, Gauge, Lightbulb, Menu,
  Moon, ScanLine, Shield, Sparkles, Sun, Target, X, Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store'
import { Button, Eyebrow } from './ui'
import { Donut } from './Charts'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="h-8 w-8 rounded-[10px] bg-[var(--accent)] text-white grid place-items-center shadow-[0_6px_18px_-8px_var(--accent)]">
        <Sparkles className="h-[17px] w-[17px]" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-[16.5px] font-extrabold tracking-[-0.035em] text-ink">
          Resume<span className="text-accent">AI</span>
        </span>
      )}
    </span>
  )
}

const NAV = [
  { label: 'Product', href: '#preview' },
  { label: 'How it works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
]

const STEPS = [
  {
    n: '01', icon: FileUp, title: 'Upload Resume',
    body: 'Drop in a PDF or DOCX. Optionally paste the job description you are targeting so every score is measured against that exact role.',
  },
  {
    n: '02', icon: ScanLine, title: 'AI Analysis',
    body: 'AI evaluates skills, experience, projects, formatting and keywords — the same signals an applicant tracking system and a recruiter both use.',
  },
  {
    n: '03', icon: Zap, title: 'Improve & Apply',
    body: 'Get personalized recommendations to improve your resume: rewritten bullets, patched keyword gaps and a matched job breakdown.',
  },
]

const FEATURES = [
  { icon: Gauge, title: 'ATS Compatibility Score', body: 'Seven checks covering headings, contact details, keywords, skills and education — with the exact fix for each failure.' },
  { icon: Target, title: 'Job Match Analyzer', body: 'Paste any posting. We return a match percentage, the skills you already have, and the ones costing you the screen.' },
  { icon: Lightbulb, title: 'AI Rewrite Suggestions', body: 'Before → after rewrites for your summary, skills block, projects and experience. Copy them straight into your document.' },
  { icon: Briefcase, title: 'Project Analyzer', body: 'Each project is graded on stack, action verbs, metrics and scale — then rewritten with a headline number.' },
  { icon: Shield, title: 'Keyword Gap Detection', body: 'We diff your vocabulary against the posting and rank every missing term by how much it is costing you.' },
  { icon: Sparkles, title: 'Score Tracking', body: 'Every analysis is saved. Watch your score climb from first draft to offer-ready across versions.' },
]

export default function Landing() {
  const { theme, toggleTheme, requestDemo, ready, analysis } = useApp()
  const nav = useNavigate()
  const [menu, setMenu] = useState(false)

  const startDemo = async () => {
    requestDemo()
    nav('/app/analyze')
  }

  const goAnalyze = () => nav('/app/analyze')

  return (
    <div className="min-h-screen bg-bg text-ink antialiased">
      {/* ---------------------------------------------------------- nav */}
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" aria-label="ResumeAI home"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="text-[13.5px] font-semibold text-muted hover:text-ink transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle colour theme"
              className="h-9 w-9 grid place-items-center rounded-lg border border-line text-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
            </button>
            <Button size="sm" className="hidden sm:inline-flex" onClick={goAnalyze}>
              Analyze My Resume
            </Button>
            <button
              className="md:hidden h-9 w-9 grid place-items-center rounded-lg border border-line text-muted"
              onClick={() => setMenu((m) => !m)}
              aria-label="Toggle menu"
            >
              {menu ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="md:hidden border-t border-line bg-bg px-5 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setMenu(false)} className="py-2.5 text-[14px] font-semibold text-muted">
                {n.label}
              </a>
            ))}
            <Button size="sm" className="mt-2" full onClick={goAnalyze}>Analyze My Resume</Button>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-paper pointer-events-none" />
        <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 grid lg:grid-cols-[1.02fr_1fr] gap-14 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-good animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
              </span>
              <span className="text-[11.5px] font-bold tracking-[0.02em] text-muted">
                AI Resume Analyzer · v2.4
              </span>
            </div>

            <h1 className="text-[38px] leading-[1.06] sm:text-[54px] sm:leading-[1.04] lg:text-[60px] font-extrabold tracking-[-0.04em] text-ink">
              Turn Your Resume Into Your{' '}
              <span className="font-serif italic font-normal text-accent tracking-[-0.01em]">Career Advantage.</span>
            </h1>

            <p className="mt-6 text-[15.5px] sm:text-[17px] leading-[1.65] text-muted max-w-xl">
              Analyze your resume with AI, discover weaknesses, improve your ATS score, and match your
              skills with the right opportunities.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={goAnalyze}>
                Analyze My Resume <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-muted font-semibold">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-good" /> No account required</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-good" /> PDF &amp; DOCX</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-good" /> Instant report</span>
            </div>
          </motion.div>

          {/* dashboard preview -------------------------------------- */}
          <motion.div
            id="preview"
            initial={{ opacity: 0, y: 34, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.12, ease }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[32px] bg-[var(--accent)]/[0.06] blur-2xl pointer-events-none" />
            <div className="relative card p-0 overflow-hidden shadow-[var(--shadow-lg)]">
              <div className="flex items-center gap-2 px-4 h-11 border-b border-line bg-surface-2">
                <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-good/70" />
                <span className="ml-3 text-[11.5px] font-mono font-semibold text-muted truncate">
                  app.resumeai.dev / report
                </span>
              </div>

              <div className="p-5 sm:p-6 grid sm:grid-cols-[auto_1fr] gap-6 items-center border-b border-line">
                <div className="flex flex-col items-center">
                  <div className="relative inline-flex items-center justify-center h-[132px] w-[132px]">
                    <svg width="132" height="132" className="-rotate-90 absolute inset-0">
                      <circle cx="66" cy="66" r="57" fill="none" stroke="var(--surface-3)" strokeWidth="11" />
                      <motion.circle
                        cx="66" cy="66" r="57" fill="none" stroke="var(--good)" strokeWidth="11" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 57}
                        initial={{ strokeDashoffset: 2 * Math.PI * 57 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 57 - (2 * Math.PI * 57 * 82) / 100 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                    <div className="text-center">
                      <div className="font-mono font-extrabold text-[34px] leading-none text-ink tabnum">82</div>
                      <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted mt-1">/ 100</div>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-good-soft px-2.5 py-1 text-[11px] font-bold text-good">
                    <span className="h-1.5 w-1.5 rounded-full bg-good" /> Strong Resume
                  </div>
                </div>

                <div className="space-y-3.5">
                  {[
                    { l: 'ATS Compatibility', v: 91 },
                    { l: 'Skills', v: 88 },
                    { l: 'Experience', v: 79 },
                    { l: 'Keywords', v: 78 },
                  ].map((b, i) => (
                    <div key={b.l}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="font-semibold text-ink-2">{b.l}</span>
                        <span className="font-mono font-bold text-ink tabnum">{b.v}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: b.v >= 80 ? 'var(--good)' : 'var(--accent)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${b.v}%` }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.1, ease }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-5">
                <div>
                  <Eyebrow className="mb-3">Job match</Eyebrow>
                  <div className="flex items-center gap-4">
                    <Donut value={78} size={84} stroke={9} caption="match" />
                    <div className="space-y-1.5 text-[12px]">
                      <div className="flex items-center gap-2 font-semibold text-ink"><CheckCircle2 className="h-3.5 w-3.5 text-good" /> Python · SQL · Git</div>
                      <div className="flex items-center gap-2 font-semibold text-muted"><X className="h-3.5 w-3.5 text-bad" /> React — missing</div>
                    </div>
                  </div>
                </div>
                <div>
                  <Eyebrow className="mb-3">Skills detected</Eyebrow>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'C++', 'Java', 'SQL', 'PostgreSQL', 'Git', 'React', 'Docker'].map((s, i) => (
                      <motion.span
                        key={s}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.05, duration: 0.35 }}
                        className="rounded-md border border-line bg-surface-2 px-2 py-1 text-[11px] font-bold font-mono text-ink-2"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.55, ease }}
              className="hidden sm:flex absolute -left-7 top-24 items-center gap-2.5 card px-3.5 py-2.5 shadow-[var(--shadow-md)] animate-float"
            >
              <Shield className="h-4 w-4 text-good" />
              <span className="text-[12px] font-bold text-ink">ATS parsed cleanly</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.55, ease }}
              className="hidden sm:flex absolute -right-6 bottom-16 items-center gap-2.5 card px-3.5 py-2.5 shadow-[var(--shadow-md)] animate-float"
              style={{ animationDelay: '1.4s' }}
            >
              <Lightbulb className="h-4 w-4 text-warn" />
              <span className="text-[12px] font-bold text-ink">4 rewrites ready</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------- steps */}
      <section id="how" className="border-y border-line bg-surface scroll-mt-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mb-12">
            <Eyebrow className="mb-3">Three steps</Eyebrow>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.035em] text-ink leading-[1.12]">
              Upload, analyze, improve.
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed">
              The whole loop takes about forty seconds. Everything below runs in your browser — nothing is
              uploaded anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.09, ease }}
                className="card p-6 relative"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="h-11 w-11 rounded-xl bg-accent-soft grid place-items-center">
                    <s.icon className="h-5 w-5 text-accent" strokeWidth={2} />
                  </span>
                  <span className="font-mono text-[38px] font-extrabold leading-none text-surface-3 select-none tabnum">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">{s.title}</h3>
                <p className="text-[13.5px] text-muted mt-2.5 leading-[1.65]">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ features */}
      <section id="features" className="mx-auto max-w-[1180px] px-5 sm:px-8 py-16 sm:py-24 scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <Eyebrow className="mb-3">What the report covers</Eyebrow>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.035em] text-ink leading-[1.12]">
              Nine sections. One honest verdict.
            </h2>
          </div>
          <p className="text-[13.5px] text-muted max-w-sm leading-relaxed">
            No vanity metrics. Every number traces back to something specific in your document, and every
            suggestion comes with the fix.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.07, ease }}
              className="card p-6 transition-all duration-200 hover:border-line-strong hover:shadow-[var(--shadow-md)]"
            >
              <div className="h-10 w-10 rounded-xl bg-surface-2 border border-line grid place-items-center mb-4">
                <f.icon className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
              </div>
              <h3 className="text-[15.5px] font-extrabold tracking-[-0.02em] text-ink">{f.title}</h3>
              <p className="text-[13px] text-muted mt-2 leading-[1.65]">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- demo */}
      <section id="demo" className="mx-auto max-w-[1180px] px-5 sm:px-8 pb-16 sm:pb-24 scroll-mt-20">
        <div className="card p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 grid-paper opacity-60 pointer-events-none" />
          <div className="relative grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <div>
              <Eyebrow className="mb-3">Demo mode</Eyebrow>
              <h2 className="text-[26px] sm:text-[34px] font-extrabold tracking-[-0.035em] text-ink leading-[1.14]">
                See a full report before you upload anything.
              </h2>
              <p className="text-[14.5px] text-muted mt-4 leading-[1.65] max-w-lg">
                Load a real final-year student resume — Aarav Mehta, B.Tech CSE — against a Backend Developer
                posting at Nimbus Labs. Every score, skill, project, gap and rewrite below is generated from
                that document.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={startDemo}>
                  Try Demo Resume <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
                <Button size="lg" variant="ghost" onClick={goAnalyze}>Upload my own</Button>
              </div>
              {ready && analysis && (
                <p className="mt-4 text-[12px] font-semibold text-muted">
                  A report is already loaded on this device — score {analysis.score}/100, {analysis.bandLabel}.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'Resume Score', v: `${analysis?.score ?? 82}`, s: '/100' },
                { k: 'ATS Check', v: `${analysis?.ats.score ?? 96}`, s: '%' },
                { k: 'Job Match', v: `${analysis?.jobMatch?.score ?? 78}`, s: '%' },
                { k: 'Skills Found', v: `${analysis?.skillGroups.reduce((a, g) => a + g.skills.length, 0) ?? 21}`, s: '' },
              ].map((c) => (
                <div key={c.k} className="card p-4 bg-surface-2">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">{c.k}</div>
                  <div className="mt-1.5 font-mono font-extrabold text-[26px] text-ink tabnum">
                    {c.v}<span className="text-[13px] text-muted font-bold">{c.s}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- footer */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <Logo />
          <p className="text-[12.5px] text-muted text-center sm:text-left">
            Built as an interactive prototype. Analysis runs on-device — swap in a model API without touching the UI.
          </p>
          <Link to="/app" className="text-[13px] font-bold text-accent inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
