import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

export const ANALYSIS_STEPS = [
  'Reading resume',
  'Extracting skills',
  'Analyzing experience',
  'Checking ATS compatibility',
  'Identifying keywords',
  'Comparing job requirements',
  'Generating recommendations',
]

const DETAIL = [
  'Parsing document structure and section order',
  'Matching 40 known technologies and their aliases',
  'Grading bullets for verbs, metrics and ownership',
  'Running 7 compatibility checks used by real screeners',
  'Building a vocabulary index for your target role',
  'Diffing your skills against the posting requirements',
  'Drafting rewrites with before / after versions',
]

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function AnalyzingOverlay({
  fileName, targetRole, jobAttached, onDone,
}: { fileName: string; targetRole: string; jobAttached: boolean; onDone: () => void }) {
  const [active, setActive] = useState(0)
  const [pct, setPct] = useState(4)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const timers: number[] = []
    ANALYSIS_STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setActive(i + 1), 520 * (i + 1)))
    })
    timers.push(window.setTimeout(() => doneRef.current(), 520 * ANALYSIS_STEPS.length + 520))
    const iv = window.setInterval(() => {
      setPct((p) => (p >= 100 ? 100 : p + Math.max(1, Math.round((100 - p) / 11))))
    }, 90)
    timers.push(window.setTimeout(() => setPct(100), 520 * ANALYSIS_STEPS.length + 300))
    return () => {
      timers.forEach(clearTimeout)
      window.clearInterval(iv)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[90] bg-bg/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="min-h-full flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[980px] grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center">
          {/* scanning document ------------------------------------- */}
          <div className="hidden lg:block">
            <div className="relative mx-auto w-[300px]">
              <div className="absolute -inset-8 rounded-[40px] bg-[var(--accent)]/[0.07] blur-3xl" />
              <motion.div
                initial={{ opacity: 0, y: 24, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ duration: 0.7, ease }}
                className="relative card p-6 overflow-hidden shadow-[var(--shadow-lg)]"
              >
                <div className="space-y-2.5">
                  <div className="h-3 w-2/5 rounded bg-[var(--accent)]/40" />
                  <div className="h-2 w-3/5 rounded bg-surface-3" />
                  <div className="h-2 w-1/2 rounded bg-surface-3" />
                  <div className="pt-3 space-y-1.5">
                    {[92, 78, 86, 64, 90, 72, 83, 58].map((w, i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 rounded bg-surface-3"
                        style={{ width: `${w}%` }}
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
                      />
                    ))}
                  </div>
                  <div className="pt-4 space-y-1.5">
                    {[70, 88, 62].map((w, i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 rounded bg-surface-3"
                        style={{ width: `${w}%` }}
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 + i * 0.12 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
                  <div className="animate-scan h-16 w-full bg-gradient-to-b from-transparent via-[var(--accent)]/18 to-transparent border-b-2 border-[var(--accent)]" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -right-14 -bottom-6 card px-4 py-3 shadow-[var(--shadow-md)] animate-float"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">File</div>
                <div className="text-[12px] font-mono font-bold text-ink mt-0.5 max-w-[170px] truncate">{fileName}</div>
              </motion.div>
            </div>
          </div>

          {/* steps ------------------------------------------------- */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="eyebrow text-accent">AI analysis in progress</span>
            </div>

            <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-[-0.035em] text-ink leading-[1.14]">
              Analyzing your resume
            </h2>
            <p className="text-[13.5px] text-muted mt-2.5 leading-relaxed">
              Target role <span className="font-bold text-ink-2">{targetRole}</span>
              {jobAttached ? ' · job description attached' : ' · no job description attached'}
            </p>

            <div className="mt-7 card p-1.5">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 shrink-0 grid place-items-center">
                    <svg width="40" height="40" className="-rotate-90 absolute inset-0">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-3)" strokeWidth="3.5" />
                      <circle
                        cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 - (2 * Math.PI * 16 * pct) / 100}
                        style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                      />
                    </svg>
                    <span className="font-mono text-[10px] font-extrabold text-ink tabnum">{pct}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-ink truncate">
                      {active >= ANALYSIS_STEPS.length ? 'Finalizing report' : ANALYSIS_STEPS[Math.min(active, ANALYSIS_STEPS.length - 1)]}
                    </p>
                    <p className="text-[11.5px] text-muted truncate">
                      {active >= ANALYSIS_STEPS.length ? 'Assembling scores, gaps and rewrites' : DETAIL[Math.min(active, DETAIL.length - 1)]}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[12px] font-bold text-muted tabnum shrink-0 pl-3">
                  {Math.min(active, ANALYSIS_STEPS.length)}/{ANALYSIS_STEPS.length}
                </span>
              </div>

              <div className="border-t border-line divide-y divide-[var(--line)]">
                {ANALYSIS_STEPS.map((s, i) => {
                  const done = active > i
                  const running = active === i
                  return (
                    <div key={s} className="flex items-center gap-3 px-4 h-11">
                      <AnimatePresence mode="wait">
                        {done ? (
                          <motion.span
                            key="done" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.28, ease }}
                          >
                            <CheckCircle2 className="h-[17px] w-[17px] text-good" strokeWidth={2.2} />
                          </motion.span>
                        ) : running ? (
                          <motion.span
                            key="run" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="relative flex h-[17px] w-[17px] items-center justify-center"
                          >
                            <span className="absolute inline-flex h-[17px] w-[17px] rounded-full border-2 border-accent/40 animate-pulse-ring" />
                            <span className="relative h-[17px] w-[17px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
                          </motion.span>
                        ) : (
                          <motion.span key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Circle className="h-[17px] w-[17px] text-line-strong" strokeWidth={2} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span className={`text-[13.5px] transition-colors ${
                        done ? 'text-ink font-semibold' : running ? 'text-accent font-bold' : 'text-muted'
                      }`}>
                        {s}
                      </span>
                      {done && <span className="ml-auto text-[10.5px] font-bold uppercase tracking-[0.08em] text-good">Done</span>}
                      {running && <span className="ml-auto text-[10.5px] font-bold uppercase tracking-[0.08em] text-accent animate-caret">Working</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
