import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const EMOTION_COLORS = {
  questioning: '#f97316', ironic: '#94a3b8', apathetic: '#64748b',
  hopeful: '#22d3ee', confrontational: '#f43f5e', defiant: '#e11d48',
  rebellious: '#a855f7', awakening: '#eab308', neutral: '#6b7280',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="capitalize font-semibold" style={{ color: EMOTION_COLORS[d.emotion] || '#6b7280' }}>{d.emotion}</p>
      {d.section && (
        <p className="mt-0.5 max-w-xs truncate" style={{ color: '#6b7280' }}>{d.section}</p>
      )}
    </div>
  )
}

export default function EmotionArc({ data }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#6b7280' }}>
        <TrendingUp size={12} /> Emotional Arc
      </h3>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.9 }}
      >
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#7c3aed" />
                <stop offset="50%"  stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="url(#strokeGrad)"
              strokeWidth={2}
              fill="url(#fillGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#374151' }}>
          <span>Intro</span><span>Bridge</span><span>Outro</span>
        </div>
      </motion.div>
    </div>
  )
}
