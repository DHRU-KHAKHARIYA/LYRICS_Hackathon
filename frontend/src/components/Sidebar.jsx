import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Mic2 } from 'lucide-react'
import EmotionArc from './EmotionArc'
import MemberStats from './MemberStats'

const LANG_COLORS = { ko: '#818cf8', en: '#34d399', mixed: '#f97316' }

export default function Sidebar({ song, memberStats, arcData }) {
  const [spinning, setSpinning] = useState(true)

  const langBreakdown = song.lyrics.reduce((acc, l) => {
    acc[l.language] = (acc[l.language] || 0) + 1
    return acc
  }, {})
  const total = song.lyrics.length

  return (
    <div className="p-6 space-y-6 select-none">

      {/* Vinyl + Song Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-center pt-2"
      >
        {/* Vinyl disc */}
        <motion.div
          className={`relative w-36 h-36 mx-auto mb-5 cursor-pointer ${spinning ? 'vinyl' : 'vinyl-paused'}`}
          onClick={() => setSpinning(s => !s)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          title={spinning ? 'Click to pause' : 'Click to spin'}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'conic-gradient(from 0deg, #1a1a2e 0%, #2d1b69 20%, #1a1a2e 40%, #12122a 60%, #1c1c30 80%, #1a1a2e 100%)',
            boxShadow: '0 0 35px rgba(124,58,237,0.35), inset 0 0 20px rgba(0,0,0,0.5)',
          }} />
          {/* Grooves */}
          {[14, 22, 30].map(inset => (
            <div key={inset} className="absolute rounded-full" style={{
              inset, border: '1px solid rgba(255,255,255,0.04)',
            }} />
          ))}
          {/* Center label */}
          <div className="absolute inset-10 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            boxShadow: '0 0 15px rgba(124,58,237,0.5)',
          }}>
            <div className="w-2 h-2 rounded-full bg-white opacity-80" />
          </div>
          {/* Shine */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)',
          }} />
        </motion.div>

        {/* Title & Artist */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="font-display text-2xl font-bold gradient-text mb-1 leading-tight"
        >
          {song.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm mb-4"
          style={{ color: '#71717a' }}
        >
          {song.artist}
        </motion.p>

        {/* Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { label: `${song.total_lines} lines`, color: '#818cf8' },
            { label: song.dominant_language.toUpperCase(), color: '#a78bfa' },
          ].map(({ label, color }, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.08 }}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <div className="section-divider" />

      {/* Language Mix */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#52525b' }}>
          <Globe size={11} /> Language Mix
        </h3>
        <div className="space-y-2">
          {Object.entries(langBreakdown).map(([lang, count], i) => {
            const pct = Math.round((count / total) * 100)
            const color = LANG_COLORS[lang] || '#6b7280'
            return (
              <div key={lang}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="uppercase" style={{ color }}>{lang}</span>
                  <span style={{ color: '#4b5563' }}>{pct}%</span>
                </div>
                <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      <div className="section-divider" />

      {/* Emotion Arc */}
      <EmotionArc data={arcData} />

      <div className="section-divider" />

      {/* Member Stats */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: '#52525b' }}>
          <Mic2 size={11} /> Member Lines
        </h3>
        <MemberStats members={memberStats} />
      </div>

    </div>
  )
}
