import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  ArrowRight, Check, CheckCircle2, ChevronRight, Copy, Lightbulb,
  Sparkles, Target, TrendingUp, Wand2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { Button, Card, Eyebrow, SectionHeader } from '../components/ui'
import { buildRewrites } from '../lib/analyzer'
import type { RewriteArea } from '../lib/types'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

const AREA_ICON: Record<RewriteArea, typeof Target> = {
  summary: Sparkles,
  skills: TrendingUp,
  projects: Wand2,
  experience: Target,
  achievements: CheckCircle2,
}

export default function SuggestionsPage() {
  const { analysis, ready, toast } = useApp()
  const [area, setArea] = useState<RewriteArea>('projects')
  const [copied, setCopied] = useState<string | null>(null)

  if (!ready || !analysis) {
    return <div className="card p-12 text-center text-[14px] text-muted">Loading your report…</div>
  }

  const rewrites = buildRewrites(analysis)
  const current = rewrites.find((r) => r.area === area) || rewrites[0]
  const totalImpact = analysis.improvements.reduce((a, i) => a + i.impact, 0)

  const copy = (id: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(id)
    toast('Copied to clipboard', 'Paste it straight into your resume document.')
    setTimeout(() => setCopied(null), 1800)
  }

  const improve = (target: RewriteArea) => {
    setArea(target)
    document.getElementById('improve')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-5">
      {/* header ---------------------------------------------------- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        <Card className="relative overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <Eyebrow className="mb-2.5">AI Feedback</Eyebrow>
              <h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.03em] text-ink leading-tight">
                {analysis.strengths.length} strengths, {analysis.improvements.length} gaps,
                {' '}{analysis.recommendations.length} rewrites.
              </h2>
              <p className="text-[13.5px] text-muted mt-2.5 max-w-xl leading-relaxed">
                Applying every suggestion below would move your score from{' '}
                <span className="font-mono font-bold text-ink">{analysis.score}</span> to roughly{' '}
                <span className="font-mono font-bold text-good">{analysis.potential}</span>
                {' '}— about <span className="font-bold text-good">+{totalImpact} points</span> of recoverable value.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="font-mono font-extrabold text-[40px] leading-none text-ink tabnum">{analysis.score}</div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted mt-1.5">now</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted" />
              <div className="text-center">
                <div className="font-mono font-extrabold text-[40px] leading-none text-good tabnum">{analysis.potential}</div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted mt-1.5">potential</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* three feedback columns ------------------------------------ */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* strengths */}
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-9 w-9 rounded-xl bg-good-soft grid place-items-center">
              <CheckCircle2 className="h-[18px] w-[18px] text-good" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Strengths</h3>
              <p className="text-[11.5px] text-muted">Keep these exactly as they are</p>
            </div>
          </div>
          <div className="space-y-3.5">
            {analysis.strengths.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4, ease }}
                className="rounded-xl border border-line bg-surface-2 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[13.5px] font-bold text-ink leading-snug">{s.title}</h4>
                  <span className="shrink-0 rounded-md bg-good-soft px-1.5 py-0.5 text-[10px] font-bold text-good font-mono">
                    {s.evidence}
                  </span>
                </div>
                <p className="text-[12.5px] text-muted mt-2 leading-[1.65]">{s.detail}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* improvements */}
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-9 w-9 rounded-xl bg-warn-soft grid place-items-center">
              <Lightbulb className="h-[18px] w-[18px] text-warn" strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">Improvements Needed</h3>
              <p className="text-[11.5px] text-muted">Ordered by points recovered</p>
            </div>
          </div>
          <div className="space-y-3.5">
            {analysis.improvements.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4, ease }}
                className="rounded-xl border border-line bg-surface-2 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[13.5px] font-bold text-ink leading-snug">{s.title}</h4>
                  <span className="shrink-0 rounded-md bg-warn-soft px-1.5 py-0.5 text-[10px] font-extrabold text-warn font-mono">
                    +{s.impact}
                  </span>
                </div>
                <p className="text-[12.5px] text-muted mt-2 leading-[1.65]">{s.detail}</p>
                <button
                  onClick={() => improve(s.area)}
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-accent hover:gap-2 transition-all"
                >
                  Fix this <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* recommendations */}
        <Card>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-9 w-9 rounded-xl bg-accent-soft grid place-items-center">
              <Sparkles className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">AI Recommendations</h3>
              <p className="text-[11.5px] text-muted">Rewrites, ready to paste</p>
            </div>
          </div>
          <div className="space-y-3.5">
            {analysis.recommendations.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4, ease }}
                className="rounded-xl border border-line bg-surface-2 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[13.5px] font-bold text-ink leading-snug">{r.title}</h4>
                  <span className="shrink-0 rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-extrabold text-accent font-mono">
                    {r.impact}
                  </span>
                </div>
                <p className="text-[12.5px] text-muted mt-2 leading-[1.65]">{r.detail}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => improve(r.area)}>Improve</Button>
                  <Button size="sm" variant="outline" onClick={() => copy(r.id, r.after)}>
                    {copied === r.id ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
                    {copied === r.id ? 'Copied' : 'Copy rewrite'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* improve my resume ----------------------------------------- */}
      <Card id="improve" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Improve My Resume"
          title="Pick a section. See the before and after."
          sub="Select the part of your resume you want to work on. Each rewrite is generated from what is actually in your document."
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {rewrites.map((r) => {
            const Icon = AREA_ICON[r.area]
            const active = area === r.area
            return (
              <button
                key={r.area}
                onClick={() => setArea(r.area)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 h-10 text-[13px] font-bold transition-all ${
                  active ? 'border-[var(--accent)] bg-accent-soft text-accent' : 'border-line bg-surface-2 text-muted hover:text-ink hover:border-line-strong'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} /> {r.label}
              </button>
            )
          })}
        </div>

        <motion.div key={area} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line bg-surface-2 p-5">
              <div className="flex items-center justify-between mb-3.5">
                <Eyebrow className="text-bad">Before</Eyebrow>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">current version</span>
              </div>
              <p className="text-[13px] text-ink-2 leading-[1.85] whitespace-pre-wrap">{current.before}</p>
            </div>
            <div className="rounded-2xl border border-good/30 bg-good-soft p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3.5">
                <Eyebrow className="text-good">After</Eyebrow>
                <button
                  onClick={() => copy('improve-' + current.area, current.after)}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-good"
                >
                  {copied === 'improve-' + current.area ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === 'improve-' + current.area ? 'Copied' : 'Copy rewrite'}
                </button>
              </div>
              <p className="text-[13px] text-ink-2 leading-[1.85] whitespace-pre-wrap">{current.after}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line p-4">
            <div className="flex items-start gap-3">
              <Wand2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-muted leading-relaxed max-w-2xl">
                <span className="font-bold text-ink">Why this works: </span>{current.note}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-good-soft px-2.5 py-1 text-[11.5px] font-extrabold text-good font-mono">
              {current.impact}
            </span>
          </div>
        </motion.div>
      </Card>
    </div>
  )
}
