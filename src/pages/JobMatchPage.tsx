import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, Copy, Info, Target, X, Zap } from 'lucide-react'
import { useApp } from '../lib/store'
import { Button, Card, Eyebrow, SectionHeader } from '../components/ui'
import { Donut } from '../components/Charts'
import { SAMPLE_JOB_DESCRIPTION } from '../lib/data'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function JobMatchPage() {
  const { analysis, ready, jobDescription, setJobDescription, lastText, run, runDemo, toast } = useApp()
  const [draft, setDraft] = useState(jobDescription)
  const [busy, setBusy] = useState(false)

  if (!ready || !analysis) {
    return <div className="card p-12 text-center text-[14px] text-muted">Loading your report…</div>
  }

  const rematch = async () => {
    setBusy(true)
    setJobDescription(draft)
    if (analysis.isDemo) await runDemo()
    else await run({ fileName: analysis.fileName, text: lastText, jobDescription: draft, targetRole: analysis.targetRole })
    setBusy(false)
    toast('Job match updated', 'Scores recalculated against the new posting.')
  }

  const jm = analysis.jobMatch

  /* ------------------------------------------------ no posting yet */
  if (!jm) {
    return (
      <div className="max-w-[820px] space-y-5">
        <SectionHeader
          eyebrow="Job Match Analyzer"
          title="Add a job description"
          sub="Paste the posting you are targeting. We will diff its vocabulary against your resume and show exactly which requirements you are failing."
        />
        <Card>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            placeholder={'Backend Developer — Nimbus Labs\n\nWe are hiring…'}
            className="w-full resize-y rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-[13px] leading-[1.7] text-ink placeholder:text-muted/70 focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => setDraft(SAMPLE_JOB_DESCRIPTION)} className="text-[12px] font-bold text-accent hover:underline">
              Use a sample posting
            </button>
            <Button onClick={rematch} disabled={busy || draft.trim().length < 30}>
              {busy ? 'Analyzing…' : 'Compare now'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const tone = jm.score >= 80 ? 'var(--good)' : jm.score >= 60 ? 'var(--accent)' : 'var(--warn)'
  const severityTone = { high: 'bad', medium: 'warn', low: 'accent' } as const

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Job Match Analyzer"
        title={`${jm.jobTitle} · ${jm.company}`}
        sub="Matched against the posting you provided. Percentages are vocabulary overlap weighted by requirement priority — not a hiring prediction."
        action={
          <Button size="sm" variant="outline" onClick={() => document.getElementById('edit-jd')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            Change posting
          </Button>
        }
      />

      {/* headline ------------------------------------------------- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        <Card>
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="flex flex-col items-center">
              <Donut value={jm.score} size={196} stroke={15} caption="job match" color={tone} />
              <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold ${
                jm.score >= 80 ? 'bg-good-soft text-good' : jm.score >= 60 ? 'bg-accent-soft text-accent' : 'bg-warn-soft text-warn'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {jm.score >= 80 ? 'Strong match' : jm.score >= 60 ? 'Partial match' : 'Weak match'}
              </span>
            </div>
            <div className="min-w-0 lg:border-l border-line lg:pl-9">
              <Eyebrow className="mb-2.5">Summary</Eyebrow>
              <p className="text-[16px] sm:text-[18px] font-semibold text-ink leading-[1.55] tracking-[-0.015em]">
                {jm.summary}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { k: 'Matched', v: jm.matched.length, tone: 'text-good' },
                  { k: 'Missing', v: jm.missing.length, tone: 'text-bad' },
                  { k: 'Recommended', v: jm.recommended.length, tone: 'text-accent' },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border border-line bg-surface-2 p-4 text-center">
                    <div className={`font-mono font-extrabold text-[26px] leading-none tabnum ${s.tone}`}>{s.v}</div>
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted mt-2">{s.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* three columns -------------------------------------------- */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-8 w-8 rounded-lg bg-good-soft grid place-items-center">
              <CheckCircle2 className="h-4 w-4 text-good" strokeWidth={2.2} />
            </span>
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Matching skills</h3>
          </div>
          <div className="space-y-2">
            {jm.matched.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex items-center justify-between rounded-xl border border-good/25 bg-good-soft px-3.5 py-2.5"
              >
                <span className="text-[13px] font-bold text-ink">{s.name}</span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-good">{s.level}</span>
              </motion.div>
            ))}
            {jm.matched.length === 0 && <p className="text-[13px] text-muted">Nothing matched yet.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-8 w-8 rounded-lg bg-bad-soft grid place-items-center">
              <X className="h-4 w-4 text-bad" strokeWidth={2.6} />
            </span>
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Missing skills</h3>
          </div>
          <div className="space-y-2">
            {jm.missing.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex items-center justify-between rounded-xl border border-bad/25 bg-bad-soft px-3.5 py-2.5"
              >
                <span className="text-[13px] font-bold text-ink">{s}</span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-bad">required</span>
              </motion.div>
            ))}
            {jm.missing.length === 0 && (
              <div className="rounded-xl border border-good/25 bg-good-soft px-3.5 py-4 text-[13px] font-bold text-good text-center">
                No required skills missing
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-8 w-8 rounded-lg bg-accent-soft grid place-items-center">
              <Zap className="h-4 w-4 text-accent" strokeWidth={2.2} />
            </span>
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Recommended skills</h3>
          </div>
          <div className="space-y-2">
            {jm.recommended.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3.5 py-2.5"
              >
                <span className="text-[13px] font-bold text-ink">{s}</span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">boost</span>
              </motion.div>
            ))}
            {jm.recommended.length === 0 && <p className="text-[13px] text-muted">Nothing left to add — compete on evidence.</p>}
          </div>
          <p className="text-[11.5px] text-muted mt-4 leading-relaxed">
            A skill you can honestly evidence in a project is worth more than one you add to a list.
          </p>
        </Card>
      </div>

      {/* how to improve ------------------------------------------- */}
      <Card>
        <SectionHeader
          eyebrow="How to improve match"
          title="Closing the gap"
          sub="Three moves, ranked by how much of the shortfall each one recovers."
          action={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard?.writeText(jm.gaps.map((g) => `${g.title}\n${g.detail}`).join('\n\n')).catch(() => {})
                toast('Copied', 'Paste the improvement plan into your notes.')
              }}
            >
              <Copy className="h-4 w-4" /> Copy plan
            </Button>
          }
        />
        <div className="space-y-3">
          {jm.gaps.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07, ease }}
              className={`rounded-xl border p-5 ${
                g.severity === 'high' ? 'border-bad/25 bg-bad-soft' : g.severity === 'medium' ? 'border-warn/25 bg-warn-soft' : 'border-line bg-surface-2'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                  g.severity === 'high' ? 'bg-bad text-white' : g.severity === 'medium' ? 'bg-warn text-white' : 'bg-accent text-white'
                }`}>
                  {g.severity}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[14.5px] font-extrabold tracking-[-0.02em] text-ink">{g.title}</h4>
                  <p className="text-[13px] text-ink-2 mt-1.5 leading-[1.7]">{g.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* edit posting --------------------------------------------- */}
      <Card id="edit-jd" className="scroll-mt-24">
        <SectionHeader eyebrow="Recalibrate" title="Change the posting" sub="Swap in a different job and the match, keyword coverage and recommendations all update together." />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={9}
          className="w-full resize-y rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-[13px] leading-[1.7] text-ink focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11.5px] text-muted">{draft.length} characters</span>
          <Button onClick={rematch} disabled={busy || draft.trim().length < 30}>
            {busy ? 'Analyzing…' : 'Re-run match'} <Target className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p className="text-[12px] text-muted leading-relaxed">
          Match scores describe vocabulary overlap, not likelihood of interview. A resume at 60% with quantified impact
          consistently outperforms one at 90% with a keyword dump.
        </p>
      </div>
    </div>
  )
}
