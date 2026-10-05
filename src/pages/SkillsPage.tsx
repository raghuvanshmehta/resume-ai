import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle2, Code, Copy, Layers, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../lib/store'
import { Button, Card, Eyebrow, ProgressBar, SectionHeader, toneFor } from '../components/ui'
import { CategoryBars } from '../components/Charts'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function SkillsPage() {
  const { analysis, ready, toast } = useApp()
  const nav = useNavigate()
  const [open, setOpen] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  if (!ready || !analysis) {
    return <div className="card p-12 text-center text-[14px] text-muted">Loading your report…</div>
  }

  const copy = (id: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(id)
    toast('Copied to clipboard', 'Paste it straight into your resume.')
    setTimeout(() => setCopied(null), 1800)
  }

  const totalSkills = analysis.skillGroups.reduce((a, g) => a + g.skills.length, 0)

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Skill analysis"
        title={`${totalSkills} skills detected`}
        sub="Grouped by category. Strength is inferred from how often a skill appears, whether it is core to your target role, and whether it is backed by evidence elsewhere in the document."
        action={<Button size="sm" variant="outline" onClick={() => nav('/app/suggestions')}>Get rewrite suggestions</Button>}
      />

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        {/* skill groups ------------------------------------------- */}
        <div className="space-y-4">
          {analysis.skillGroups.map((g, gi) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: gi * 0.06, ease }}>
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-accent-soft grid place-items-center">
                      <Code className="h-[17px] w-[17px] text-accent" strokeWidth={2} />
                    </span>
                    <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">{g.category}</h3>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-muted tabnum">{g.skills.length} detected</span>
                </div>
                <div className="space-y-3.5">
                  {g.skills.map((s, i) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-ink-2">{s.name}</span>
                        <span className="flex items-center gap-2.5">
                          <span className="text-[11px] text-muted font-semibold">{s.mentions}× mention{s.mentions > 1 ? 's' : ''}</span>
                          <span className="font-mono text-[12px] font-bold text-ink tabnum w-8 text-right">{s.level}%</span>
                        </span>
                      </div>
                      <ProgressBar value={s.level} tone={toneFor(s.level)} height={6} delay={0.1 + i * 0.04} />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* strength chart ----------------------------------------- */}
        <div className="space-y-5">
          <Card>
            <SectionHeader eyebrow="Skill strength" title="Strength by category" sub="Average confidence across the skills detected in each group." />
            <CategoryBars
              data={analysis.skillGroups.map((g) => ({
                label: g.category,
                value: Math.round(g.skills.reduce((a, s) => a + s.level, 0) / g.skills.length),
                hint: `${g.skills.length} skills · top: ${g.skills[0]?.name}`,
              }))}
            />
          </Card>

          <Card>
            <SectionHeader eyebrow="Target role" title={`Fit for ${analysis.targetRole}`} sub="Coverage of the vocabulary a screen for this role filters on." />
            <ProgressBar value={analysis.breakdown.skills} tone={toneFor(analysis.breakdown.skills)} height={10} />
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[12.5px] text-muted">Role vocabulary coverage</span>
              <span className="font-mono font-extrabold text-[18px] text-ink tabnum">{analysis.breakdown.skills}%</span>
            </div>
            <button onClick={() => nav('/app/job-match')} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:gap-2.5 transition-all">
              Compare against a real posting <ArrowRight className="h-4 w-4" />
            </button>
          </Card>
        </div>
      </div>

      {/* projects -------------------------------------------------- */}
      <div>
        <SectionHeader
          eyebrow="Project analyzer"
          title={`${analysis.projects.length} projects analyzed`}
          sub="Each project is graded on stack, action verbs, measurable results and scale — then rewritten with a headline number."
        />

        {analysis.projects.length === 0 ? (
          <Card className="p-10 text-center">
            <Layers className="h-7 w-7 text-muted mx-auto mb-3" />
            <p className="text-[14px] font-bold text-ink">No project section found</p>
            <p className="text-[13px] text-muted mt-1.5 max-w-md mx-auto">
              Add a "Projects" heading with two or three bullets each. For students, this is the highest-signal block on the page.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {analysis.projects.map((p, i) => {
              const isOpen = open === p.id
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05, ease }}>
                  <Card>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">{p.name}</h4>
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold font-mono ${
                            p.score >= 80 ? 'bg-good-soft text-good' : p.score >= 60 ? 'bg-warn-soft text-warn' : 'bg-bad-soft text-bad'
                          }`}>
                            {p.score}/100
                          </span>
                        </div>
                        {p.tagline && <p className="text-[12.5px] text-muted mt-1">{p.tagline}</p>}
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {p.tech.map((t) => (
                            <span key={t} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-bold font-mono text-ink-2">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => setOpen(isOpen ? null : p.id)}>
                          {isOpen ? 'Hide rewrite' : 'Improve Description'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copy(p.id, p.improvedDescription)}>
                          {copied === p.id ? <Check className="h-4 w-4 text-good" /> : <Copy className="h-4 w-4" />}
                          {copied === p.id ? 'Copied' : 'Copy Suggestion'}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 grid md:grid-cols-[1.4fr_1fr] gap-5">
                      <div className="rounded-xl border border-line bg-surface-2 p-4">
                        <Eyebrow className="mb-2.5">Current description</Eyebrow>
                        <p className="text-[13px] text-ink-2 leading-[1.7]">{p.description || 'No description text found for this project.'}</p>
                      </div>
                      <div>
                        <Eyebrow className="mb-2.5">AI checks</Eyebrow>
                        <ul className="space-y-2">
                          {p.checks.map((c) => (
                            <li key={c.label} className="flex items-start gap-2.5">
                              {c.ok ? (
                                <CheckCircle2 className="h-[15px] w-[15px] text-good shrink-0 mt-0.5" strokeWidth={2.2} />
                              ) : (
                                <X className="h-[15px] w-[15px] text-bad shrink-0 mt-0.5" strokeWidth={2.6} />
                              )}
                              <span className={`text-[12.5px] leading-snug ${c.ok ? 'text-muted' : 'text-ink font-semibold'}`}>{c.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-warn/30 bg-warn-soft p-4">
                      <Eyebrow className="mb-2 text-warn">AI suggestion</Eyebrow>
                      <p className="text-[13px] text-ink-2 leading-[1.7]">{p.suggestion}</p>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.32, ease }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 rounded-xl border border-good/30 bg-good-soft p-4">
                        <div className="flex items-center justify-between mb-2.5">
                          <Eyebrow className="text-good">Rewritten version</Eyebrow>
                          <button onClick={() => copy(p.id + '-r', p.improvedDescription)} className="text-[11.5px] font-bold text-good inline-flex items-center gap-1.5">
                            {copied === p.id + '-r' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied === p.id + '-r' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-[13px] text-ink-2 leading-[1.7]">{p.improvedDescription}</p>
                      </div>
                    </motion.div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
