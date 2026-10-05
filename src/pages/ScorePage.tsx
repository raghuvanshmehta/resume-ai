import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileText, Layers, Sparkles, Target, Zap } from 'lucide-react'
import { BAND_TONE, useApp } from '../lib/store'
import { Button, Card, Eyebrow, ProgressBar, ScoreRing, SectionHeader, toneFor } from '../components/ui'
import { Radar, ScoreTrend } from '../components/Charts'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

const COMPONENTS: {
  key: 'ats' | 'skills' | 'experience' | 'projects' | 'keywords' | 'formatting'
  label: string
  icon: typeof Target
  weight: string
  note: string
}[] = [
  { key: 'ats', label: 'ATS Compatibility', icon: Target, weight: '18%', note: 'How cleanly an applicant tracking system reads the file.' },
  { key: 'skills', label: 'Skills', icon: Zap, weight: '20%', note: 'Breadth of detected technologies plus coverage of your target role.' },
  { key: 'experience', label: 'Experience', icon: CheckCircle2, weight: '20%', note: 'Action verbs, quantified outcomes and ownership language.' },
  { key: 'projects', label: 'Projects', icon: Layers, weight: '15%', note: 'Stack depth, metrics and scale across every project block.' },
  { key: 'keywords', label: 'Keywords', icon: Sparkles, weight: '15%', note: 'Overlap between your vocabulary and the posting.' },
  { key: 'formatting', label: 'Formatting', icon: FileText, weight: '12%', note: 'Length, contact block, bullet consistency and structure.' },
]

export default function ScorePage() {
  const { analysis, ready } = useApp()
  const nav = useNavigate()

  if (!ready || !analysis) {
    return (
      <div className="card p-12 text-center">
        <p className="text-[14px] text-muted">Loading your report…</p>
      </div>
    )
  }

  const tone = BAND_TONE[analysis.band]
  const sorted = [...COMPONENTS].sort((a, b) => analysis.breakdown[b.key] - analysis.breakdown[a.key])

  return (
    <div className="space-y-5">
      {/* hero score ------------------------------------------------ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        <Card className="relative overflow-hidden">
          <div className="grid lg:grid-cols-[auto_1fr] gap-9 items-center">
            <div className="flex flex-col items-center">
              <ScoreRing value={analysis.score} size={236} stroke={16}
                label={<>
                  <span className="eyebrow text-muted mb-1.5">Resume Score</span>
                  <span className="flex items-baseline gap-1">
                    <span className="font-mono font-extrabold text-[58px] leading-none text-ink tabnum">{analysis.score}</span>
                    <span className="text-[17px] font-bold text-muted">/ 100</span>
                  </span>
                </>}
                sub={<span className={`mt-2.5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold ${tone.bg} ${tone.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /> {analysis.bandLabel}
                </span>}
              />
            </div>

            <div className="min-w-0 lg:border-l border-line lg:pl-9">
              <Eyebrow className="mb-2.5">Report</Eyebrow>
              <h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.03em] text-ink leading-tight">
                {analysis.candidateName}
              </h2>
              <p className="text-[13px] text-muted mt-1.5">
                {analysis.fileName} · {analysis.meta.words} words · {analysis.meta.pages} page{analysis.meta.pages > 1 ? 's' : ''}
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { k: 'Potential', v: analysis.potential, s: 'if every fix is applied' },
                  { k: 'ATS', v: analysis.ats.score, s: 'of 7 checks passed' },
                  { k: 'Job Match', v: analysis.jobMatch?.score ?? null, s: analysis.jobMatch ? analysis.jobMatch.jobTitle : 'no posting' },
                  { k: 'Coverage', v: analysis.meta.keywordCoverage, s: 'keyword coverage' },
                ].map((c) => (
                  <div key={c.k} className="rounded-xl border border-line bg-surface-2 p-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{c.k}</div>
                    <div className="mt-1.5 flex items-baseline gap-0.5">
                      {c.v === null ? (
                        <span className="text-[15px] font-bold text-muted">—</span>
                      ) : (
                        <span className="font-mono font-extrabold text-[24px] leading-none text-ink tabnum">{c.v}</span>
                      )}
                    </div>
                    <div className="text-[10.5px] text-muted mt-1 leading-tight truncate">{c.s}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button size="sm" onClick={() => nav('/app/suggestions')}><Sparkles className="h-4 w-4" /> Fix the top issues</Button>
                <Button size="sm" variant="outline" onClick={() => nav('/app/ats')}>Run ATS check</Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* component cards ------------------------------------------- */}
      <div>
        <SectionHeader
          eyebrow="Score breakdown"
          title="The six components behind your score"
          sub="Each component is weighted differently. Percentages are absolute, not relative to other users."
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((c, i) => {
            const value = analysis.breakdown[c.key]
            const t = toneFor(value)
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.06, ease }}
              >
                <Card className="h-full hover:border-line-strong transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-xl bg-surface-2 border border-line grid place-items-center">
                        <c.icon className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
                      </span>
                      <div>
                        <div className="text-[14px] font-extrabold tracking-[-0.02em] text-ink">{c.label}</div>
                        <div className="text-[10.5px] font-bold text-muted uppercase tracking-[0.08em]">Weight {c.weight}</div>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-[26px] leading-none text-ink tabnum">{value}</span>
                  </div>
                  <ProgressBar value={value} tone={t} delay={0.15 + i * 0.06} />
                  <p className="text-[12px] text-muted mt-3 leading-relaxed">{c.note}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* radar + trend --------------------------------------------- */}
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <Card>
          <SectionHeader eyebrow="Shape" title="Score profile" sub="A balanced resume has a round outline, not a spike." />
          <div className="flex justify-center py-2">
            <Radar
              data={[
                { label: 'ATS', value: analysis.breakdown.ats },
                { label: 'Skills', value: analysis.breakdown.skills },
                { label: 'Exp.', value: analysis.breakdown.experience },
                { label: 'Projects', value: analysis.breakdown.projects },
                { label: 'Keywords', value: analysis.breakdown.keywords },
                { label: 'Format', value: analysis.breakdown.formatting },
              ]}
              size={280}
            />
          </div>
          <div className="mt-4 rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[12.5px] text-muted leading-relaxed">
              Your weakest axis is <span className="font-bold text-ink">{sorted[sorted.length - 1].label.toLowerCase()}</span> at{' '}
              <span className="font-mono font-bold text-ink">{analysis.breakdown[sorted[sorted.length - 1].key]}%</span>.
              Recovering that gap is worth roughly{' '}
              <span className="font-bold text-good">
                +{Math.round((85 - analysis.breakdown[sorted[sorted.length - 1].key]) * 0.15)} points
              </span>{' '}
              on the overall score.
            </p>
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="History"
            title="Score movement"
            sub="Every analysis is saved so you can see whether an edit actually moved the number."
          />
          <ScoreTrend points={analysis.history} height={210} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { k: 'First draft', v: analysis.history[0].score },
              { k: 'Current', v: analysis.score },
              { k: 'Change', v: `+${analysis.score - analysis.history[0].score}` },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-line bg-surface-2 p-3.5 text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{s.k}</div>
                <div className="font-mono font-extrabold text-[22px] text-ink mt-1.5 tabnum">{s.v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* document stats -------------------------------------------- */}
      <Card>
        <SectionHeader eyebrow="Document" title="What we counted" sub="Raw measurements taken from your file — no estimates." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { k: 'Words', v: analysis.meta.words },
            { k: 'Bullets', v: analysis.meta.bullets },
            { k: 'Quantified', v: analysis.meta.quantified },
            { k: 'Action verbs', v: analysis.meta.actionVerbs },
            { k: 'Sections', v: analysis.meta.sections.length },
            { k: 'Pages', v: analysis.meta.pages },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-line bg-surface-2 p-4">
              <div className="font-mono font-extrabold text-[24px] text-ink leading-none tabnum">{s.v}</div>
              <div className="text-[11px] font-bold text-muted mt-2 uppercase tracking-[0.08em]">{s.k}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {['summary', 'experience', 'projects', 'skills', 'education', 'achievements'].map((s) => {
            const found = analysis.meta.sections.includes(s)
            return (
              <span key={s} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold capitalize ${
                found ? 'border-good/30 bg-good-soft text-good' : 'border-line bg-surface-2 text-muted'
              }`}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {s}
              </span>
            )
          })}
        </div>
        <button onClick={() => nav('/app/skills')} className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:gap-2.5 transition-all">
          Continue to skills &amp; projects <ArrowRight className="h-4 w-4" />
        </button>
      </Card>
    </div>
  )
}
