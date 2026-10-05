import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  AlertTriangle, ArrowRight, Brain, CheckCircle2, Code, Database, FileText,
  FolderOpen, Gauge, Globe, Layers, LayoutDashboard, Lightbulb, ScanLine,
  Settings as SettingsIcon, Shield, Sparkles, Target, Users, Wrench,
  Circle as CircleIcon,
} from 'lucide-react'

/* ---------------------------------------------------------------- icons */

export const ICONS = {
  code: Code,
  globe: Globe,
  database: Database,
  wrench: Wrench,
  brain: Brain,
  layers: Layers,
  dashboard: LayoutDashboard,
  analyze: ScanLine,
  score: Gauge,
  match: Target,
  ideas: Lightbulb,
  library: FolderOpen,
  settings: SettingsIcon,
  ats: Shield,
  people: Users,
  doc: FileText,
  spark: Sparkles,
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const C = ICONS[name]
  return <C className={className} strokeWidth={1.9} aria-hidden />
}

/* --------------------------------------------------------------- button */

interface BtnProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
  full?: boolean
}

const VARIANTS: Record<string, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:brightness-110 shadow-[0_8px_24px_-10px_var(--accent)] disabled:opacity-50',
  secondary: 'bg-surface-2 text-ink hover:bg-surface-3 border border-line',
  outline: 'border border-line-strong text-ink hover:bg-surface-2',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-bad-soft text-bad hover:brightness-110',
}

const SIZES: Record<string, string> = {
  sm: 'h-8 px-3 text-[12.5px] rounded-lg gap-1.5',
  md: 'h-10 px-4 text-[13.5px] rounded-xl gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-xl gap-2.5',
}

export function Button({
  children, onClick, href, variant = 'primary', size = 'md',
  className = '', disabled, type = 'button', full,
}: BtnProps) {
  const cls = `inline-flex items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`
  if (href) {
    return (
      <a href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

/* ----------------------------------------------------------------- cards */

export function Card({
  children, className = '', pad = true, hover, id,
}: { children: ReactNode; className?: string; pad?: boolean; hover?: boolean; id?: string }) {
  return (
    <div id={id} className={`card ${pad ? 'p-5 sm:p-6' : ''} ${hover ? 'transition-all duration-200 hover:border-line-strong hover:shadow-[var(--shadow-md)]' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow text-muted ${className}`}>{children}</div>
}

export function SectionHeader({
  eyebrow, title, sub, action,
}: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2 className="text-[20px] sm:text-[23px] font-extrabold tracking-[-0.025em] text-ink">{title}</h2>
        {sub && <p className="text-[13.5px] text-muted mt-1.5 max-w-2xl leading-relaxed">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Badge({
  children, tone = 'neutral', className = '',
}: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'accent'; className?: string }) {
  const tones = {
    neutral: 'bg-surface-2 text-muted border-line',
    good: 'bg-good-soft text-good border-transparent',
    warn: 'bg-warn-soft text-warn border-transparent',
    bad: 'bg-bad-soft text-bad border-transparent',
    accent: 'bg-accent-soft text-accent border-transparent',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.01em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------ progress */

export function ProgressBar({
  value, tone = 'accent', height = 8, delay = 0, label,
}: { value: number; tone?: 'accent' | 'good' | 'warn' | 'bad'; height?: number; delay?: number; label?: string }) {
  const colors = {
    accent: 'var(--accent)', good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)',
  }
  return (
    <div className="w-full" aria-label={label}>
      <div className="w-full rounded-full bg-surface-3 overflow-hidden" style={{ height }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors[tone] }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, value)}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export function toneFor(value: number): 'accent' | 'good' | 'warn' | 'bad' {
  if (value >= 80) return 'good'
  if (value >= 65) return 'accent'
  if (value >= 45) return 'warn'
  return 'bad'
}

/* ------------------------------------------------------------ score ring */

export function ScoreRing({
  value, size = 220, stroke = 14, label, sub,
}: { value: number; size?: number; stroke?: number; label?: ReactNode; sub?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone = value >= 80 ? 'var(--good)' : value >= 65 ? 'var(--accent)' : value >= 45 ? 'var(--warn)' : 'var(--bad)'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * Math.max(0, Math.min(100, value))) / 100 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {label}
        {sub}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- states */

export function EmptyState({
  icon = 'spark', title, body, action,
}: { icon?: IconName; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card p-10 sm:p-14 text-center">
      <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-accent-soft flex items-center justify-center">
        <Icon name={icon} className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">{title}</h3>
      <p className="text-[13.5px] text-muted mt-2 max-w-md mx-auto leading-relaxed">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function StatusDot({ status }: { status: 'pass' | 'warn' | 'fail' }) {
  if (status === 'pass') return <CheckCircle2 className="h-[18px] w-[18px] text-good shrink-0" strokeWidth={2} />
  if (status === 'warn') return <AlertTriangle className="h-[18px] w-[18px] text-warn shrink-0" strokeWidth={2} />
  return <CircleIcon className="h-[18px] w-[18px] text-bad shrink-0" strokeWidth={2} />
}

export function ArrowLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:gap-2.5 transition-all"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  )
}

export const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}
