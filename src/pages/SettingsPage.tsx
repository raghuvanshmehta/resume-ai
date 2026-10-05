import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Check, Code2, Download, Moon, Sun, Trash2 } from 'lucide-react'
import { BAND_TONE, useApp } from '../lib/store'
import { Button, Card, Eyebrow, SectionHeader } from '../components/ui'
import { TARGET_ROLES, SAMPLE_JOB_DESCRIPTION } from '../lib/data'

export default function SettingsPage() {
  const {
    theme, toggleTheme, analysis, targetRole, setTargetRole,
    jobDescription, setJobDescription, toast, library,
  } = useApp()
  const [confirm, setConfirm] = useState(false)
  const [name, setName] = useState(analysis?.candidateName ?? '')
  const [headline, setHeadline] = useState(analysis?.headline ?? '')
  const [saved, setSaved] = useState(false)

  const saveProfile = () => {
    setSaved(true)
    toast('Profile saved', 'Used in report headers and exports.')
    setTimeout(() => setSaved(false), 2000)
  }

  const clearAll = () => {
    localStorage.removeItem('resumeai:v1')
    window.location.reload()
  }

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ library, analysis }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resumeai-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('Export started', 'Your data was downloaded as JSON.')
  }

  return (
    <div className="space-y-5 max-w-[900px]">
      <SectionHeader eyebrow="Settings" title="Profile & preferences" sub="Everything here is stored locally on this device only." />

      {/* profile ---------------------------------------------------- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink mb-5">Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted mb-2">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Mehta"
                className="w-full h-11 rounded-xl border border-line bg-surface-2 px-3.5 text-[13.5px] text-ink placeholder:text-muted/70 focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </label>
            <label className="block">
              <span className="block text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted mb-2">Headline</span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Computer Science · Final Year"
                className="w-full h-11 rounded-xl border border-line bg-surface-2 px-3.5 text-[13.5px] text-ink placeholder:text-muted/70 focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={saveProfile}>
              {saved ? <Check className="h-4 w-4" /> : null} {saved ? 'Saved' : 'Save profile'}
            </Button>
            {analysis && (
              <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${BAND_TONE[analysis.band].bg} ${BAND_TONE[analysis.band].text}`}>
                Current report: {analysis.bandLabel} · {analysis.score}/100
              </span>
            )}
          </div>
        </Card>
      </motion.div>

      {/* target role ------------------------------------------------ */}
      <Card>
        <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink mb-1.5">Target role</h3>
        <p className="text-[12.5px] text-muted mb-5">
          Drives the keyword-coverage and job-match components. Change it and re-analyze to recalibrate.
        </p>
        <div className="flex flex-wrap gap-2">
          {TARGET_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setTargetRole(r); toast('Target role updated', `Scores will recalibrate to ${r}.`) }}
              className={`rounded-lg border px-3.5 h-10 text-[13px] font-bold transition-all ${
                targetRole === r ? 'border-[var(--accent)] bg-accent-soft text-accent' : 'border-line bg-surface-2 text-muted hover:text-ink hover:border-line-strong'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </Card>

      {/* appearance -------------------------------------------------- */}
      <Card>
        <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink mb-1.5">Appearance</h3>
        <p className="text-[12.5px] text-muted mb-5">Follows your choice, remembered on this device.</p>
        <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
          {([
            { k: 'light', label: 'Light', Icon: Sun },
            { k: 'dark', label: 'Dark', Icon: Moon },
          ] as const).map(({ k, label, Icon }) => (
            <button
              key={k}
              onClick={() => { if (theme !== k) toggleTheme() }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 h-9 text-[13px] font-bold transition-all ${
                theme === k ? 'bg-surface text-ink shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </Card>

      {/* default JD --------------------------------------------------- */}
      <Card>
        <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink mb-1.5">Default job description</h3>
        <p className="text-[12.5px] text-muted mb-4">Pre-filled on the upload screen and used by “Try Demo Resume”.</p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={7}
          className="w-full resize-y rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-[13px] leading-[1.7] text-ink focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
        <button onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)} className="mt-2.5 text-[12px] font-bold text-accent hover:underline">
          Restore sample posting
        </button>
      </Card>

      {/* data ---------------------------------------------------------- */}
      <Card>
        <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink mb-1.5">Your data</h3>
        <p className="text-[12.5px] text-muted mb-5">
          {library.length} analysis version{library.length === 1 ? '' : 's'} stored in this browser. Nothing has ever left the device.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button size="sm" variant="outline" onClick={exportAll}>
            <Download className="h-4 w-4" /> Export as JSON
          </Button>
          {!confirm ? (
            <Button size="sm" variant="danger" onClick={() => setConfirm(true)}>
              <Trash2 className="h-4 w-4" /> Clear all data
            </Button>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-bad/30 bg-bad-soft px-3.5">
              <AlertTriangle className="h-4 w-4 text-bad" />
              <span className="text-[12.5px] font-bold text-bad">Delete everything?</span>
              <button onClick={clearAll} className="text-[12.5px] font-extrabold text-bad underline">Yes, delete</button>
              <button onClick={() => setConfirm(false)} className="text-[12.5px] font-bold text-muted">Cancel</button>
            </div>
          )}
        </div>
      </Card>

      {/* integration ---------------------------------------------------- */}
      <Card>
        <div className="flex items-start gap-4">
          <span className="h-11 w-11 shrink-0 rounded-xl bg-accent-soft grid place-items-center">
            <Code2 className="h-5 w-5 text-accent" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">AI integration</h3>
            <p className="text-[12.5px] text-muted mt-1.5 leading-[1.7]">
              The prototype ships with a deterministic on-device engine so the whole flow is reproducible and works
              offline. To upgrade, point <code className="font-mono text-[11.5px] bg-surface-2 px-1.5 py-0.5 rounded">analyzeResume()</code> in{' '}
              <code className="font-mono text-[11.5px] bg-surface-2 px-1.5 py-0.5 rounded">src/lib/analyzer.ts</code> at a hosted
              model. The request and response shapes are already defined in{' '}
              <code className="font-mono text-[11.5px] bg-surface-2 px-1.5 py-0.5 rounded">src/lib/types.ts</code>, so no screen needs to change.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['analyzeResume(req)', '→ AnalysisResult', 'PDF/DOCX text extraction', 'Model-generated rewrites'].map((t) => (
                <span key={t} className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-bold font-mono text-muted">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <p className="text-[11.5px] text-muted pb-4">
        ResumeAI prototype · analysis engine v2.4 · all processing on-device
      </p>
    </div>
  )
}
