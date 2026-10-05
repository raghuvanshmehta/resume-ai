import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, ChevronDown, FileText, Sparkles, Trash2, UploadCloud,
} from 'lucide-react'
import { SAMPLE_JOB_DESCRIPTION, TARGET_ROLES, DEMO_RESUME_TEXT } from '../lib/data'
import { useApp } from '../lib/store'
import { Button, Card, Eyebrow, SectionHeader } from '../components/ui'
import AnalyzingOverlay from '../components/AnalyzingOverlay'

const ACCEPTED = ['pdf', 'docx', 'doc', 'txt']
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function AnalyzePage() {
  const { jobDescription, setJobDescription, targetRole, setTargetRole, run, runDemo, toast, demoTicket } = useApp()
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [current, setCurrent] = useState('')
  const [jdOpen, setJdOpen] = useState(true)

  const accept = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported file type ".${ext}". Upload a PDF, DOCX or TXT.`)
      return
    }
    if (f.size > 12 * 1024 * 1024) {
      setError('File is larger than 12 MB. Please export a smaller document.')
      return
    }
    setError(null)
    setFile({ name: f.name, size: f.size })
    setCurrent(f.name)
    if (ext === 'txt') {
      const reader = new FileReader()
      reader.onload = () => setText(String(reader.result || ''))
      reader.readAsText(f)
    } else {
      setText('')
    }
  }

  const start = async () => {
    if (!file && text.trim().length < 40) {
      setError('Drop a file, or paste at least a few lines of resume text.')
      return
    }
    setError(null)
    setAnalyzing(true)
    setCurrent(file?.name || 'pasted-resume.txt')
    await run({ fileName: file?.name || 'pasted-resume.txt', text, jobDescription, targetRole })
  }

  const startDemo = async () => {
    setAnalyzing(true)
    setCurrent('aarav-mehta-resume.pdf')
    setText(DEMO_RESUME_TEXT)
    await runDemo()
  }

  /* "Try Demo Resume" from the landing page lands here and runs itself. */
  const handledTicket = useRef(0)
  useEffect(() => {
    if (demoTicket > handledTicket.current) {
      handledTicket.current = demoTicket
      void startDemo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoTicket])

  const done = () => {
    setAnalyzing(false)
    toast('Analysis complete', 'Your score, feedback and job match are ready.')
    nav('/app/score')
  }

  return (
    <div className="space-y-5 max-w-[980px]">
      <SectionHeader
        eyebrow="Step 1 of 3"
        title="Upload your resume"
        sub="Drop a PDF or DOCX below, or paste the text directly — pasted text is analyzed word for word, which produces the most accurate report."
        action={
          <Button variant="outline" size="sm" onClick={startDemo}>
            <Sparkles className="h-4 w-4" /> Try Demo Resume
          </Button>
        }
      />

      {/* dropzone ------------------------------------------------- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault(); setDrag(false)
            const f = e.dataTransfer.files?.[0]
            if (f) accept(f)
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
          className={`relative card p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
            drag ? 'border-[var(--accent)] bg-accent-soft scale-[1.005]' : 'hover:border-line-strong'
          }`}
        >
          <input
            ref={inputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) accept(f) }}
          />
          {drag && <div className="absolute inset-0 grid-paper pointer-events-none" />}

          <div className="relative">
            <motion.div
              animate={drag ? { y: -6, scale: 1.06 } : { y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-accent-soft grid place-items-center"
            >
              <UploadCloud className="h-7 w-7 text-accent" strokeWidth={1.8} />
            </motion.div>
            <h3 className="text-[20px] sm:text-[23px] font-extrabold tracking-[-0.03em] text-ink">
              Drop your resume here
            </h3>
            <p className="text-[13.5px] text-muted mt-2">
              or <span className="font-bold text-accent">Browse Files</span> — up to 12 MB
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {['PDF', 'DOCX', 'TXT'].map((f) => (
                <span key={f} className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-bold font-mono text-muted">
                  {f}
                </span>
              ))}
              <span className="text-[11.5px] text-muted ml-1">Supported formats</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* selected file -------------------------------------------- */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="flex items-center gap-4">
              <span className="h-11 w-11 shrink-0 rounded-xl bg-accent-soft grid place-items-center">
                <FileText className="h-5 w-5 text-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-ink truncate">{file.name}</p>
                <p className="text-[12px] text-muted">
                  {(file.size / 1024).toFixed(0)} KB · ready to analyze
                  {text.length > 40 && ` · ${text.trim().split(/\s+/).length} words extracted`}
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setText(''); setCurrent('') }}
                className="h-9 w-9 grid place-items-center rounded-lg text-muted hover:text-bad hover:bg-bad-soft transition-colors"
                aria-label="Remove file"
              >
                <Trash2 className="h-[17px] w-[17px]" />
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-bad/30 bg-bad-soft p-4">
          <AlertTriangle className="h-[18px] w-[18px] text-bad shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-bad">{error}</p>
        </div>
      )}

      {/* paste text ------------------------------------------------ */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Or paste your resume text</h3>
            <p className="text-[12.5px] text-muted mt-1">Optional — but it makes the analysis dramatically more accurate.</p>
          </div>
          {text && (
            <Button size="sm" variant="ghost" onClick={() => setText('')}>Clear</Button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={'SUMMARY\nFinal-year CS student with experience in Python and React…\n\nSKILLS\nPython, SQL, Git…'}
          className="w-full resize-y rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-[13px] leading-[1.7] text-ink placeholder:text-muted/70 focus:border-[var(--accent)] focus:outline-none transition-colors font-mono"
        />
        <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-muted">
          <span>{text.trim() ? `${text.trim().split(/\s+/).length} words` : 'Nothing pasted yet'}</span>
          <button onClick={() => setText(DEMO_RESUME_TEXT)} className="font-bold text-accent hover:underline">
            Load sample resume text
          </button>
        </div>
      </Card>

      {/* job description ------------------------------------------- */}
      <Card>
        <button onClick={() => setJdOpen((v) => !v)} className="w-full flex items-start justify-between gap-4 text-left">
          <div>
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Paste Job Description</h3>
            <p className="text-[12.5px] text-muted mt-1">
              Optional — compare your resume against a specific job to unlock the Job Match analyzer.
            </p>
          </div>
          <ChevronDown className={`h-[18px] w-[18px] text-muted shrink-0 mt-1 transition-transform ${jdOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {jdOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }} className="overflow-hidden"
            >
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                placeholder="Backend Developer — Nimbus Labs\n\nWe are hiring…"
                className="mt-4 w-full resize-y rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-[13px] leading-[1.7] text-ink placeholder:text-muted/70 focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-muted">
                <span>{jobDescription.trim().length} characters</span>
                <div className="flex gap-3">
                  <button onClick={() => setJobDescription('')} className="font-bold text-muted hover:text-ink">Clear</button>
                  <button onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)} className="font-bold text-accent hover:underline">
                    Use sample posting
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* role + submit --------------------------------------------- */}
      <Card>
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-end">
          <div>
            <Eyebrow className="mb-2.5">Target role</Eyebrow>
            <div className="flex flex-wrap gap-2">
              {TARGET_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`rounded-lg border px-3 h-9 text-[12.5px] font-bold transition-all ${
                    targetRole === r
                      ? 'border-[var(--accent)] bg-accent-soft text-accent'
                      : 'border-line bg-surface-2 text-muted hover:text-ink hover:border-line-strong'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Button size="lg" onClick={start} className="w-full sm:w-auto">
            Analyze Resume <span aria-hidden>→</span>
          </Button>
        </div>
      </Card>

      <p className="text-[11.5px] text-muted leading-relaxed max-w-2xl">
        <span className="font-bold text-ink-2">Prototype note: </span>
        analysis runs entirely in your browser through a deterministic engine, so the report is reproducible.
        Binary PDF/DOCX extraction and model-generated rewrites are the two seams to replace when you wire in a
        real API — every screen already consumes the same <code className="font-mono text-[11px]">AnalysisResult</code> shape.
      </p>

      <AnimatePresence>
        {analyzing && (
          <AnalyzingOverlay
            fileName={current}
            targetRole={targetRole}
            jobAttached={jobDescription.trim().length > 30}
            onDone={done}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
