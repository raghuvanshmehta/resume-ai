import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react'
import type { AnalysisResult, AnalyzeRequest, LibraryEntry } from './types'
import { analyzeDemo, analyzeResume } from './analyzer'
import { DEMO_RESUME_TEXT, SAMPLE_JOB_DESCRIPTION } from './data'

type Theme = 'light' | 'dark'

interface Toast { id: number; title: string; detail?: string }

interface Ctx {
  theme: Theme
  toggleTheme: () => void
  analysis: AnalysisResult | null
  ready: boolean
  library: LibraryEntry[]
  jobDescription: string
  setJobDescription: (v: string) => void
  targetRole: string
  setTargetRole: (v: string) => void
  lastText: string
  busy: boolean
  /** Bumped by "Try Demo Resume"; the analyze screen listens and auto-runs. */
  demoTicket: number
  requestDemo: () => void
  run: (req: AnalyzeRequest) => Promise<AnalysisResult>
  runDemo: () => Promise<AnalysisResult>
  selectFromLibrary: (id: string) => void
  removeLibraryItem: (id: string) => void
  toasts: Toast[]
  toast: (title: string, detail?: string) => void
}

const AppCtx = createContext<Ctx | null>(null)

const KEY = 'resumeai:v1'

interface Persisted {
  theme: Theme
  analysis: AnalysisResult | null
  library: LibraryEntry[]
  jobDescription: string
  targetRole: string
  lastText?: string
}

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Persisted
  } catch {
    return null
  }
}

function toEntry(a: AnalysisResult, prevScore: number): LibraryEntry {
  return {
    id: a.id,
    fileName: a.fileName,
    candidateName: a.candidateName,
    targetRole: a.targetRole,
    score: a.score,
    band: a.band,
    createdAt: a.createdAt,
    delta: a.score - prevScore,
    current: false,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useRef(load())
  const [theme, setTheme] = useState<Theme>(initial.current?.theme ?? 'dark')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initial.current?.analysis ?? null)
  const [library, setLibrary] = useState<LibraryEntry[]>(initial.current?.library ?? [])
  const [jobDescription, setJobDescription] = useState<string>(initial.current?.jobDescription ?? SAMPLE_JOB_DESCRIPTION)
  const [targetRole, setTargetRole] = useState<string>(initial.current?.targetRole ?? 'Backend Developer')
  const [lastText, setLastText] = useState<string>(initial.current?.lastText ?? '')
  const [ready, setReady] = useState(!!initial.current?.analysis)
  const [busy, setBusy] = useState(false)
  const [demoTicket, setDemoTicket] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])

  /* theme ------------------------------------------------------------- */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  /* first-run seed: the dashboard is never empty on arrival ------------- */
  useEffect(() => {
    let cancelled = false
    if (initial.current?.analysis) return
    const t = setTimeout(async () => {
      const res = await analyzeDemo(SAMPLE_JOB_DESCRIPTION)
      if (cancelled) return
      setAnalysis(res)
      setLibrary([toEntry(res, res.score - 0)])
      setLastText(DEMO_RESUME_TEXT)
      setReady(true)
    }, 350)
    return () => { cancelled = true; clearTimeout(t) }
  }, [])

  /* persist ------------------------------------------------------------ */
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify({ theme, analysis, library, jobDescription, targetRole, lastText }))
    } catch {
      /* quota — the app still works, it just will not remember */
    }
  }, [theme, analysis, library, jobDescription, targetRole, lastText, ready])

  const toast = useCallback((title: string, detail?: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, title, detail }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const run = useCallback(
    async (req: AnalyzeRequest) => {
      setBusy(true)
      const res = await analyzeResume(req)
      setLibrary((prev) => {
        const prevScore = prev[0]?.score ?? res.score
        const entry = toEntry(res, prevScore)
        return [entry, ...prev].slice(0, 12)
      })
      setAnalysis(res)
      setLastText(req.text)
      setBusy(false)
      return res
    },
    [],
  )

  const runDemo = useCallback(async () => {
    setBusy(true)
    const res = await analyzeDemo(jobDescription)
    setLibrary((prev) => {
      const prevScore = prev[0]?.score ?? res.score
      return [toEntry(res, prevScore), ...prev].slice(0, 12)
    })
    setAnalysis(res)
    setLastText(DEMO_RESUME_TEXT)
    setBusy(false)
    return res
  }, [jobDescription])

  const selectFromLibrary = useCallback(
    (id: string) => {
      /* Re-analyse the stored demo document so the full report is rebuilt. */
      void (async () => {
        const res = await analyzeDemo(SAMPLE_JOB_DESCRIPTION)
        setAnalysis({ ...res, id })
        toast('Report loaded', 'Scores and feedback refreshed from the stored analysis.')
      })()
    },
    [toast],
  )

  const removeLibraryItem = useCallback((id: string) => {
    setLibrary((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const requestDemo = useCallback(() => setDemoTicket((t) => t + 1), [])

  const value = useMemo<Ctx>(
    () => ({
      theme, toggleTheme, analysis, ready, library,
      jobDescription, setJobDescription, targetRole, setTargetRole, lastText,
      busy, run, runDemo, selectFromLibrary, removeLibraryItem,
      toasts, toast, demoTicket, requestDemo,
    }),
    [theme, toggleTheme, analysis, ready, library, jobDescription, targetRole, lastText, busy, run, runDemo, selectFromLibrary, removeLibraryItem, toasts, toast, demoTicket, requestDemo],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

export const BAND_TONE: Record<string, { text: string; bg: string; dot: string }> = {
  excellent: { text: 'text-good', bg: 'bg-good-soft', dot: 'bg-good' },
  strong: { text: 'text-good', bg: 'bg-good-soft', dot: 'bg-good' },
  good: { text: 'text-warn', bg: 'bg-warn-soft', dot: 'bg-warn' },
  'needs-work': { text: 'text-warn', bg: 'bg-warn-soft', dot: 'bg-warn' },
  weak: { text: 'text-bad', bg: 'bg-bad-soft', dot: 'bg-bad' },
}
