import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Download, Eye, FileText, Plus, Sparkles, Trash2, TrendingUp,
} from 'lucide-react'
import { BAND_TONE, useApp } from '../lib/store'
import { Button, Card, Eyebrow, SectionHeader } from '../components/ui'

export default function ResumesPage() {
  const { library, analysis, selectFromLibrary, removeLibraryItem, requestDemo, toast } = useApp()
  const nav = useNavigate()

  const best = library.length ? Math.max(...library.map((e) => e.score)) : 0
  const avg = library.length ? Math.round(library.reduce((a, e) => a + e.score, 0) / library.length) : 0
  const gain = library.length > 1 ? library[library.length - 1].score - library[0].score : 0

  const open = (id: string) => {
    selectFromLibrary(id)
    nav('/app/score')
  }

  const demo = async () => {
    requestDemo()
    nav('/app/analyze')
  }

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ library, analysis }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resumeai-export.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('Export started', 'resumeai-download.json contains every saved analysis.')
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Library"
        title="My Resumes"
        sub="Every analysis stored on this device. Re-open any version to see its full report."
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportAll} disabled={library.length === 0}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={() => nav('/app/analyze')}>
              <Plus className="h-4 w-4" /> New analysis
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { k: 'Versions', v: library.length, s: 'saved analyses' },
          { k: 'Best score', v: best, s: 'highest achieved' },
          { k: 'Average', v: avg, s: 'across all versions' },
          { k: 'Total gain', v: `${gain > 0 ? '+' : ''}${gain}`, s: 'first to latest' },
        ].map((s, i) => (
          <motion.div key={s.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
            <Card className="h-full">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">{s.k}</div>
              <div className={`font-mono font-extrabold text-[28px] mt-2 leading-none tabnum ${s.k === 'Total gain' && gain > 0 ? 'text-good' : 'text-ink'}`}>
                {s.v}
              </div>
              <div className="text-[11.5px] text-muted mt-1.5">{s.s}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {library.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-8 w-8 text-muted mx-auto mb-4" />
          <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">No analyses yet</h3>
          <p className="text-[13.5px] text-muted mt-2 max-w-md mx-auto leading-relaxed">
            Upload your resume, or load the sample document to see a complete report in about ten seconds.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => nav('/app/analyze')}>Analyze my resume</Button>
            <Button variant="outline" onClick={demo}>
              <Sparkles className="h-4 w-4" /> Try Demo Resume
            </Button>
          </div>
        </Card>
      ) : (
        <Card pad={false}>
          <div className="hidden md:grid grid-cols-[2.2fr_1fr_1fr_0.8fr_0.9fr_auto] gap-4 px-6 py-3.5 border-b border-line">
            {['File', 'Candidate', 'Target role', 'Score', 'Trend', ''].map((h) => (
              <div key={h} className="eyebrow text-muted">{h}</div>
            ))}
          </div>
          <div className="divide-y divide-[var(--line)]">
            {library.map((e, i) => {
              const tone = BAND_TONE[e.band]
              const isCurrent = analysis?.id === e.id
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className={`grid md:grid-cols-[2.2fr_1fr_1fr_0.8fr_0.9fr_auto] gap-3 md:gap-4 items-center px-5 sm:px-6 py-4 hover:bg-surface-2 transition-colors ${isCurrent ? 'bg-accent-soft' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 shrink-0 rounded-xl bg-surface-2 border border-line grid place-items-center">
                      <FileText className="h-4 w-4 text-muted" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-ink truncate">{e.fileName}</span>
                      <span className="block text-[11.5px] text-muted">
                        {new Date(e.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        {isCurrent && <span className="text-accent font-bold"> · current</span>}
                        {e.delta !== 0 && i > 0 && <span className={e.delta > 0 ? 'text-good font-bold' : 'text-bad font-bold'}> · {e.delta > 0 ? '+' : ''}{e.delta} vs previous</span>}
                      </span>
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-ink-2 truncate">{e.candidateName}</div>
                  <div className="text-[12.5px] text-muted truncate">{e.targetRole}</div>
                  <div className="flex items-center gap-2">
                    <span className={`h-8 min-w-9 px-1.5 rounded-lg grid place-items-center font-mono text-[13px] font-extrabold ${tone.bg} ${tone.text}`}>
                      {e.score}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {e.delta === 0 ? (
                      <span className="text-[12px] text-muted font-semibold">baseline</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${e.delta > 0 ? 'text-good' : 'text-bad'}`}>
                        <TrendingUp className={`h-3.5 w-3.5 ${e.delta < 0 ? 'rotate-180' : ''}`} />
                        {e.delta > 0 ? '+' : ''}{e.delta}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Button size="sm" variant="outline" onClick={() => open(e.id)}>
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <button
                      onClick={() => { removeLibraryItem(e.id); toast('Version removed', 'The analysis was deleted from this device.') }}
                      className="h-8 w-8 grid place-items-center rounded-lg text-muted hover:text-bad hover:bg-bad-soft transition-colors"
                      aria-label="Delete version"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <Eyebrow className="mb-2">Next step</Eyebrow>
          <p className="text-[14px] font-bold text-ink">Targeting a different role?</p>
          <p className="text-[12.5px] text-muted mt-1">Change the target role and every score recalibrates to that vocabulary.</p>
        </div>
        <div className="flex gap-2.5">
          <Button size="sm" variant="outline" onClick={demo}>
            <Sparkles className="h-4 w-4" /> Reload demo
          </Button>
          <Button size="sm" onClick={() => nav('/app/analyze')}>
            New analysis <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
