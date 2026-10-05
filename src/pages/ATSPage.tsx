import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ChevronDown, Info, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../lib/store'
import { Button, Card, SectionHeader, StatusDot } from '../components/ui'
import { Donut } from '../components/Charts'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function ATSPage() {
  const { analysis, ready, toast } = useApp()
  const nav = useNavigate()
  const [open, setOpen] = useState<string | null>(null)

  if (!ready || !analysis) {
    return <div className="card p-12 text-center text-[14px] text-muted">Loading your report…</div>
  }

  const pass = analysis.ats.items.filter((i) => i.status === 'pass').length
  const warn = analysis.ats.items.filter((i) => i.status === 'warn').length
  const fail = analysis.ats.items.filter((i) => i.status === 'fail').length
  const verdict =
    analysis.ats.score >= 90
      ? 'This file will parse cleanly. Very little stands between you and a human reader.'
      : analysis.ats.score >= 75
        ? 'Mostly readable, with a couple of fixes worth making before you apply.'
        : 'An applicant tracking system will lose information here. Fix the failures first.'

  return (
    <div className="space-y-5 max-w-[1080px]">
      <SectionHeader
        eyebrow="ATS Checker"
        title="Will a robot be able to read this?"
        sub="Seven checks modelled on how mainstream applicant tracking systems (Workday, Greenhouse, Lever, iCIMS) parse an uploaded document."
        action={<Button size="sm" variant="outline" onClick={() => nav('/app/analyze')}>Re-upload a file</Button>}
      />

      <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-center">
        <Card className="flex flex-col items-center py-8">
          <Donut value={analysis.ats.score} size={168} stroke={13} caption="ATS score"
            color={analysis.ats.score >= 90 ? 'var(--good)' : analysis.ats.score >= 75 ? 'var(--accent)' : 'var(--warn)'} />
          <p className="mt-5 max-w-[220px] text-center text-[12.5px] text-muted leading-relaxed">{verdict}</p>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[
            { k: 'Passed', v: pass, tone: 'good' as const },
            { k: 'Warnings', v: warn, tone: 'warn' as const },
            { k: 'Failures', v: fail, tone: 'bad' as const },
          ].map((s, i) => (
            <motion.div key={s.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07, ease }}>
              <Card className="h-full text-center py-7">
                <div className={`font-mono font-extrabold text-[36px] leading-none tabnum ${
                  s.tone === 'good' ? 'text-good' : s.tone === 'warn' ? 'text-warn' : 'text-bad'
                }`}>
                  {s.v}
                </div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted mt-2.5">{s.k}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Card>
        <SectionHeader eyebrow="Checks" title="Compatibility checklist" sub="Click any row for the exact fix." />
        <div className="divide-y divide-[var(--line)] -mx-5 sm:-mx-6">
          {analysis.ats.items.map((item, i) => {
            const isOpen = open === item.id
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="w-full text-left px-5 sm:px-6 py-4 flex items-start gap-4 hover:bg-surface-2 transition-colors"
              >
                <span className="mt-0.5"><StatusDot status={item.status} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[14px] font-bold text-ink">{item.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] ${
                      item.status === 'pass' ? 'bg-good-soft text-good'
                        : item.status === 'warn' ? 'bg-warn-soft text-warn'
                          : 'bg-bad-soft text-bad'
                    }`}>
                      {item.status === 'pass' ? 'Pass' : item.status === 'warn' ? 'Warning' : 'Fail'}
                    </span>
                  </span>
                  <span className="block text-[12.5px] text-muted mt-1 leading-relaxed">{item.detail}</span>
                  {isOpen && item.fix && (
                    <span className="mt-3 flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-3.5">
                      <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-[12.5px] text-ink-2 leading-relaxed">
                        <span className="font-bold text-ink">Fix: </span>{item.fix}
                      </span>
                    </span>
                  )}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </motion.button>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-4">
          <span className="h-11 w-11 shrink-0 rounded-xl bg-warn-soft grid place-items-center">
            <ShieldAlert className="h-5 w-5 text-warn" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">What actually breaks a parse</h3>
            <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {[
                'Tables, text boxes and multi-column layouts',
                'Contact details trapped in a header or footer',
                'Icons, emoji and skill bars drawn with shapes',
                'Custom heading names the parser does not recognise',
                'Images of text, which contain no text at all',
                'Unusual fonts with ligatures that split words',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[12.5px] text-muted leading-relaxed">
                  <AlertTriangle className="h-3.5 w-3.5 text-warn shrink-0 mt-1" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => nav('/app/job-match')}>Continue to Job Match <ArrowRight className="h-4 w-4" /></Button>
        <Button variant="ghost" onClick={() => { toast('Checklist copied', 'Paste it into your editor as a pre-flight list.'); navigator.clipboard?.writeText(analysis.ats.items.map((i) => `[${i.status === 'pass' ? 'x' : ' '}] ${i.label} — ${i.fix || ''}`).join('\n')).catch(() => {}) }}>
          Copy checklist
        </Button>
      </div>
    </div>
  )
}
