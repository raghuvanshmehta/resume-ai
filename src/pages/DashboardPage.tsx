import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, Sparkles, Target, TrendingUp,
} from 'lucide-react'
import { BAND_TONE, useApp } from '../lib/store'
import { Button, Card, Eyebrow, ProgressBar, ScoreRing, SectionHeader, StatusDot, toneFor } from '../components/ui'
import { ScoreTrend, Donut } from '../components/Charts'
import { TIPS } from '../lib/data'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function DashboardPage() {
  const { analysis, library, ready } = useApp()
  const nav = useNavigate()

  if (!ready || !analysis) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card h-40 bg-surface-2" />
        ))}
      </div>
    )
  }

  const tone = BAND_TONE[analysis.band]
  const prev = analysis.history[analysis.history.length - 2]?.score ?? analysis.score
  const delta = analysis.score - prev
  const topRecs = analysis.recommendations.slice(0, 3)
  const tip = TIPS[analysis.score % TIPS.length]

  return (
    <div className="space-y-6">
      {/* headline ------------------------------------------------- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        <Card className="relative overflow-hidden">
          <div className="grid lg:grid-cols-[auto_1fr_auto] gap-8 items-center">
            <div className="flex flex-col items-center">
              <ScoreRing value={analysis.score} size={168} stroke={12}
                label={<>
                  <span className="font-mono font-extrabold text-[42px] leading-none text-ink tabnum">{analysis.score}</span>
                  <span className="text-[12px] font-bold text-muted mt-1">/ 100</span>
                </>}
              />
              <span className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold ${tone.bg} ${tone.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} /> {analysis.bandLabel}
              </span>
            </div>

            <div className="min-w-0 lg:border-x border-line lg:px-8">
              <Eyebrow className="mb-2.5">Latest analysis</Eyebrow>
              <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.03em] text-ink leading-tight">
                {analysis.candidateName}
              </h2>
              <p className="text-[13px] text-muted mt-1">
                {analysis.headline} · Targeting <span className="font-bold text-ink-2">{analysis.targetRole}</span>
              </p>
              <p className="text-[13.5px] text-muted mt-4 leading-[1.65] max-w-lg">
                {analysis.improvements[0]
                  ? `Your strongest move right now: ${analysis.improvements[0].title.toLowerCase()} — worth about ${analysis.improvements[0].impact} points.`
                  : 'No blocking issues found. Focus on depth of evidence rather than adding more keywords.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button size="sm" onClick={() => nav('/app/suggestions')}>
                  <Sparkles className="h-4 w-4" /> View AI suggestions
                </Button>
                <Button size="sm" variant="outline" onClick={() => nav('/app/analyze')}>Analyze another</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 min-w-[220px]">
              {[
                { k: 'ATS Score', v: analysis.ats.score, icon: CheckCircle2, to: '/app/ats' },
                { k: 'Job Match', v: analysis.jobMatch?.score ?? null, icon: Target, to: '/app/job-match' },
              ].map((c) => (
                <button
                  key={c.k}
                  onClick={() => nav(c.to)}
                  className="text-left rounded-xl border border-line bg-surface-2 p-4 hover:border-line-strong transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">{c.k}</span>
                    <c.icon className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  {c.v === null ? (
                    <span className="text-[13px] font-bold text-muted">Not run</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="font-mono font-extrabold text-[28px] leading-none text-ink tabnum">{c.v}</span>
                      <span className="text-[11.5px] font-bold text-muted mb-0.5">%</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* metric strip --------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { k: 'Skills detected', v: analysis.skillGroups.reduce((a, g) => a + g.skills.length, 0), s: 'across ' + analysis.skillGroups.length + ' categories' },
          { k: 'Projects analyzed', v: analysis.projects.length, s: 'with rewrite suggestions' },
          { k: 'Bullets quantified', v: analysis.meta.quantified, s: `of ${analysis.meta.bullets} total` },
          { k: 'Keyword coverage', v: analysis.meta.keywordCoverage + '%', s: 'against target role' },
        ].map((m, i) => (
          <motion.div key={m.k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06, ease }}>
            <Card className="h-full">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">{m.k}</div>
              <div className="font-mono font-extrabold text-[30px] text-ink mt-2 leading-none tabnum">{m.v}</div>
              <div className="text-[11.5px] text-muted mt-1.5">{m.s}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* trend + breakdown ---------------------------------------- */}
      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-5">
        <Card>
          <SectionHeader
            eyebrow="Progress"
            title="Resume score over time"
            sub="Six versions of this document, from first draft to the current one."
            action={
              <div className="flex items-center gap-1.5 rounded-full bg-good-soft px-3 py-1.5">
                <TrendingUp className="h-4 w-4 text-good" />
                <span className="text-[12.5px] font-extrabold text-good tabnum">+{analysis.score - analysis.history[0].score} pts</span>
              </div>
            }
          />
          <ScoreTrend points={analysis.history} />
        </Card>

        <Card>
          <SectionHeader eyebrow="Breakdown" title="What is driving the score" sub="Six weighted components." />
          <div className="space-y-4">
            {(
              [
                ['ATS Compatibility', analysis.breakdown.ats],
                ['Skills', analysis.breakdown.skills],
                ['Experience', analysis.breakdown.experience],
                ['Projects', analysis.breakdown.projects],
                ['Keywords', analysis.breakdown.keywords],
                ['Formatting', analysis.breakdown.formatting],
              ] as [string, number][]
            ).map(([label, value], i) => (
              <button
                key={label}
                onClick={() => nav(label === 'Skills' ? '/app/skills' : label === 'ATS Compatibility' ? '/app/ats' : '/app/score')}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] font-bold text-ink-2 group-hover:text-accent transition-colors">{label}</span>
                  <span className="font-mono text-[12.5px] font-bold text-ink tabnum">{value}%</span>
                </div>
                <ProgressBar value={value} tone={toneFor(value)} height={7} delay={i * 0.06} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* quick cards ---------------------------------------------- */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card>
          <SectionHeader eyebrow="Job match" title={analysis.jobMatch ? analysis.jobMatch.jobTitle : 'No posting yet'}
            sub={analysis.jobMatch ? analysis.jobMatch.company : 'Paste a job description to unlock matching.'} />
          {analysis.jobMatch ? (
            <>
              <div className="flex items-center gap-5">
                <Donut value={analysis.jobMatch.score} size={104} stroke={10} caption="match"
                  color={analysis.jobMatch.score >= 75 ? 'var(--good)' : 'var(--warn)'} />
                <div className="min-w-0 space-y-2">
                  <p className="text-[12px] text-muted leading-relaxed line-clamp-4">{analysis.jobMatch.summary}</p>
                </div>
              </div>
              {analysis.jobMatch.missing.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {analysis.jobMatch.missing.map((s) => (
                    <span key={s} className="rounded-md bg-bad-soft px-2 py-1 text-[11px] font-bold font-mono text-bad">{s}</span>
                  ))}
                  <span className="rounded-md bg-surface-2 px-2 py-1 text-[11px] font-bold text-muted">missing</span>
                </div>
              )}
              <button onClick={() => nav('/app/job-match')} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:gap-2.5 transition-all">
                Open analyzer <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => nav('/app/job-match')}>Add a job description</Button>
          )}
        </Card>

        <Card>
          <SectionHeader eyebrow="AI Suggestions" title="Top 3 fixes" sub="Ranked by points recovered per unit of effort." />
          <ol className="space-y-3">
            {topRecs.map((r, i) => (
              <li key={r.id} className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-lg bg-accent-soft grid place-items-center text-[11px] font-extrabold text-accent font-mono">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink leading-snug">{r.title}</p>
                  <p className="text-[12px] text-muted mt-0.5 leading-relaxed line-clamp-2">{r.detail}</p>
                </div>
                <span className="ml-auto shrink-0 self-start rounded-md bg-good-soft px-1.5 py-0.5 text-[10.5px] font-extrabold text-good font-mono">
                  {r.impact}
                </span>
              </li>
            ))}
          </ol>
          <button onClick={() => nav('/app/suggestions')} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:gap-2.5 transition-all">
            See all {analysis.recommendations.length} suggestions <ArrowRight className="h-4 w-4" />
          </button>
        </Card>

        <Card className="flex flex-col">
          <SectionHeader eyebrow="Library" title="Recent analyses" sub={`${library.length} version${library.length === 1 ? '' : 's'} saved on this device.`} />
          <div className="space-y-2 flex-1">
            {library.slice(0, 4).map((e) => (
              <button
                key={e.id}
                onClick={() => nav('/app/resumes')}
                className="w-full flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-left hover:border-line-strong transition-all"
              >
                <span className={`h-9 w-9 shrink-0 rounded-lg grid place-items-center font-mono text-[12px] font-extrabold ${BAND_TONE[e.band].bg} ${BAND_TONE[e.band].text}`}>
                  {e.score}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-bold text-ink truncate">{e.fileName}</span>
                  <span className="block text-[11px] text-muted truncate">
                    {new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {e.targetRole}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted shrink-0" />
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-line bg-accent-soft p-4">
            <p className="text-[12px] font-bold text-accent mb-1">Did you know?</p>
            <p className="text-[12px] text-muted leading-relaxed">{tip}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
