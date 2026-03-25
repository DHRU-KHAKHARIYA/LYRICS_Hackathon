import { motion } from 'framer-motion'

const MEMBER_COLORS = {
  'RM':        '#818cf8',
  'SUGA':      '#e2e8f0',
  'j-hope':    '#fbbf24',
  'Jin':       '#f9a8d4',
  'Jimin':     '#86efac',
  'V':         '#67e8f9',
  'Jung Kook': '#c084fc',
  'All':       '#6b7280',
}

export default function MemberStats({ members }) {
  return (
    <div className="space-y-2.5">
      {members.slice(0, 8).map(({ name, pct }, i) => {
        const color = MEMBER_COLORS[name] || '#9ca3af'
        return (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.6, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color }}>{name}</span>
              <span style={{ color: '#4b5563' }}>{pct}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.1 * i + 0.9, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}55` }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
