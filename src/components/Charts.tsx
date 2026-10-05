import { motion } from 'framer-motion'
import { useState } from 'react'

/* --------------------------------------------------------- score trend */

export function ScoreTrend({
  points, height = 190,
}: { points: { label: string; score: number }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const w = 640
  const h = height
  const padX = 26
  const padY = 24
  const lo = Math.max(0, Math.min(...points.map((p) => p.score)) - 14)
  const hi = Math.min(100, Math.max(...points.map((p) => p.score)) + 10)
  const x = (i: number) => padX + (i * (w - padX * 2)) / Math.max(1, points.length - 1)
  const y = (v: number) => padY + (1 - (v - lo) / Math.max(1, hi - lo)) * (h - padY * 2)

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1).toFixed(1)},${h - padY} L${padX},${h - padY} Z`
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((t) => lo + t * (hi - lo))

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible" role="img" aria-label="Resume score over time">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={padX} x2={w - padX} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={padX - 6} y={y(v) + 3.5} textAnchor="end" fontSize="9.5" fill="var(--muted)" fontFamily="var(--font-mono)">
              {Math.round(v)}
            </text>
          </g>
        ))}
        <motion.path d={area} fill="url(#trendFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }} />
        <motion.path
          d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map((p, i) => (
          <g key={p.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <circle cx={x(i)} cy={y(p.score)} r="14" fill="transparent" />
            <motion.circle
              cx={x(i)} cy={y(p.score)} r={hover === i ? 6 : 4}
              fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.5"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.06 }}
              style={{ transformOrigin: `${x(i)}px ${y(p.score)}px` }}
            />
            <text x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--muted)" fontWeight="600">
              {p.label}
            </text>
            {hover === i && (
              <text x={x(i)} y={y(p.score) - 14} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text)" fontFamily="var(--font-mono)">
                {p.score}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------- category bars */

export function CategoryBars({
  data,
}: { data: { label: string; value: number; hint?: string }[] }) {
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[13px] font-bold text-ink">{d.label}</span>
            <span className="text-[12.5px] font-mono font-bold text-ink-2 tabnum">{d.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  d.value >= 80 ? 'var(--good)' : d.value >= 65 ? 'var(--accent)' : d.value >= 45 ? 'var(--warn)' : 'var(--bad)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${d.value}%` }}
              transition={{ duration: 0.95, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {d.hint && <p className="text-[11.5px] text-muted mt-1.5">{d.hint}</p>}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- donut */

export function Donut({
  value, size = 128, stroke = 12, color = 'var(--accent)', caption,
}: { value: number; size?: number; stroke?: number; color?: string; caption?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-extrabold text-ink tabnum" style={{ fontSize: size * 0.23 }}>
          {value}%
        </span>
        {caption && <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted mt-0.5">{caption}</span>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- radar */

export function Radar({
  data, size = 260,
}: { data: { label: string; value: number }[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 40
  const n = data.length
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    const rr = (v / 100) * R
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as const
  }
  const poly = data.map((d, i) => pt(i, d.value).join(',')).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon
          key={t}
          points={data.map((_, i) => pt(i, t * 100).join(',')).join(' ')}
          fill="none" stroke="var(--line)" strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const [ex, ey] = pt(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--line)" strokeWidth="1" />
      })}
      <motion.polygon
        points={poly} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round"
        initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {data.map((d, i) => {
        const [lx, ly] = pt(i, 128)
        return (
          <text key={d.label} x={lx} y={ly + 3} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--muted)">
            {d.label.slice(0, 7)}
          </text>
        )
      })}
    </svg>
  )
}
