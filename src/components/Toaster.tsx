import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { useApp } from '../lib/store'

export default function Toaster() {
  const { toasts } = useApp()
  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2.5rem))] pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto card p-4 flex items-start gap-3 shadow-[var(--shadow-lg)]"
          >
            <CheckCircle2 className="h-[18px] w-[18px] text-good shrink-0 mt-0.5" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-ink">{t.title}</p>
              {t.detail && <p className="text-[12px] text-muted mt-0.5 leading-relaxed">{t.detail}</p>}
            </div>
            <X className="h-4 w-4 text-muted" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
