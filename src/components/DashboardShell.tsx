import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight, ChevronRight, Menu, Moon, Plus, ScanLine, Sun, X,
} from 'lucide-react'
import { BAND_TONE, useApp } from '../lib/store'
import { Button, Icon, type IconName } from './ui'
import { Link } from 'react-router-dom'

interface Item { to: string; label: string; icon: IconName }

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Workspace',
    items: [
      { to: '/app', label: 'Dashboard', icon: 'dashboard' },
      { to: '/app/analyze', label: 'Analyze Resume', icon: 'analyze' },
    ],
  },
  {
    title: 'Report',
    items: [
      { to: '/app/score', label: 'Resume Score', icon: 'score' },
      { to: '/app/skills', label: 'Skills & Projects', icon: 'code' },
      { to: '/app/ats', label: 'ATS Checker', icon: 'ats' },
      { to: '/app/job-match', label: 'Job Match', icon: 'match' },
      { to: '/app/suggestions', label: 'AI Suggestions', icon: 'ideas' },
    ],
  },
  {
    title: 'Library',
    items: [{ to: '/app/resumes', label: 'My Resumes', icon: 'library' }],
  },
]

const TITLES: Record<string, { t: string; s: string }> = {
  '/app': { t: 'Dashboard', s: 'Everything from your latest analysis in one place.' },
  '/app/analyze': { t: 'Analyze Resume', s: 'Upload a PDF or DOCX, or paste the text directly.' },
  '/app/score': { t: 'Resume Score', s: 'Your overall score and the six components behind it.' },
  '/app/skills': { t: 'Skills & Projects', s: 'What we detected, how strong it is, and how to phrase it.' },
  '/app/ats': { t: 'ATS Checker', s: 'Seven checks an applicant tracking system runs on your file.' },
  '/app/job-match': { t: 'Job Match', s: 'How well this resume lines up against a specific posting.' },
  '/app/suggestions': { t: 'AI Suggestions', s: 'Strengths, gaps, and rewrites you can copy straight in.' },
  '/app/resumes': { t: 'My Resumes', s: 'Every analysis you have run, with score movement.' },
  '/app/settings': { t: 'Settings', s: 'Profile, target role, appearance and data.' },
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { analysis } = useApp()
  const tone = analysis ? BAND_TONE[analysis.band] : null
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-line shrink-0">
        <Link to="/" className="inline-flex items-center gap-2.5" onClick={onNavigate}>
          <span className="h-8 w-8 rounded-[10px] bg-[var(--accent)] text-white grid place-items-center shadow-[0_6px_18px_-8px_var(--accent)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h9a5 5 0 0 1 0 10h-4l6 6h-4l-6-6V8h9" />
            </svg>
          </span>
          <span className="text-[16px] font-extrabold tracking-[-0.035em] text-ink">
            Resume<span className="text-accent">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="eyebrow text-muted px-3 mb-2">{g.title}</div>
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/app'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 h-10 text-[13.5px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'text-muted hover:text-ink hover:bg-surface-2'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[var(--accent)]"
                        />
                      )}
                      <Icon name={it.icon} className="h-[17px] w-[17px] shrink-0" />
                      <span className="truncate">{it.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-line shrink-0 space-y-3">
        {analysis && (
          <div className="rounded-xl border border-line bg-surface-2 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">Latest score</span>
              {tone && <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />}
            </div>
            <div className="flex items-end gap-1.5">
              <span className="font-mono font-extrabold text-[26px] leading-none text-ink tabnum">{analysis.score}</span>
              <span className="text-[11.5px] font-bold text-muted mb-0.5">/100</span>
            </div>
            <p className={`text-[11.5px] font-bold mt-1 ${tone?.text}`}>{analysis.bandLabel}</p>
          </div>
        )}
        <NavLink
          to="/app/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 h-10 text-[13.5px] font-semibold transition-colors ${
              isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink hover:bg-surface-2'
            }`
          }
        >
          <Icon name="settings" className="h-[17px] w-[17px]" />
          Settings
        </NavLink>
      </div>
    </div>
  )
}

export default function DashboardShell() {
  const { theme, toggleTheme, analysis } = useApp()
  const { pathname } = useLocation()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const meta = TITLES[pathname] || TITLES['/app']

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[264px] border-r border-line bg-surface z-40">
        <SidebarBody />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 w-[276px] bg-surface z-50 border-r border-line"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 h-8 w-8 grid place-items-center rounded-lg text-muted hover:bg-surface-2"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
          <div className="px-4 sm:px-7 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
                className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-line text-muted shrink-0"
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
              <div className="min-w-0">
                <h1 className="text-[15.5px] font-extrabold tracking-[-0.025em] text-ink truncate">{meta.t}</h1>
                <p className="text-[12px] text-muted truncate hidden sm:block">{meta.s}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-9 w-9 grid place-items-center rounded-lg border border-line text-muted hover:text-ink hover:bg-surface-2 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
              </button>
              <Button size="sm" onClick={() => nav('/app/analyze')} className="hidden sm:inline-flex">
                <Plus className="h-4 w-4" /> New analysis
              </Button>
              <div className="h-9 w-9 rounded-full bg-accent-soft border border-accent-border grid place-items-center text-[12px] font-extrabold text-accent select-none">
                {(analysis?.candidateName || 'R').slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-7 py-6 sm:py-8 max-w-[1220px]">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export function ReportCta() {
  const nav = useNavigate()
  return (
    <button
      onClick={() => nav('/app/score')}
      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:gap-2.5 transition-all"
    >
      View full report <ArrowUpRight className="h-4 w-4" />
    </button>
  )
}

export { SidebarBody, TITLES, ChevronRight, ScanLine }
