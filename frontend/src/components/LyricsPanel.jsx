import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Mic2 } from 'lucide-react'
import LyricCard from './LyricCard'

function ModeToggle({ practiceMode, setPracticeMode }) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center p-1 rounded-full"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { label: 'Reading',  icon: BookOpen, value: false },
          { label: 'Practice', icon: Mic2,     value: true  },
        ].map(({ label, icon: Icon, value }) => (
          <motion.button
            key={label}
            onClick={() => setPracticeMode(value)}
            className="relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium"
            style={{ color: practiceMode === value ? 'white' : '#52525b' }}
            whileHover={{ color: practiceMode === value ? 'white' : '#9ca3af' }}
            whileTap={{ scale: 0.97 }}
          >
            {practiceMode === value && (
              <motion.div
                layoutId="modeIndicator"
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon size={13} />
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function LyricsPanel({ lyrics, practiceMode, setPracticeMode }) {
  const sections = useMemo(() => {
    const result = []
    let curSection = null
    let curLines   = []
    lyrics.forEach(line => {
      if (line.section !== curSection) {
        if (curSection !== null) result.push({ section: curSection, lines: curLines })
        curSection = line.section
        curLines   = [line]
      } else {
        curLines.push(line)
      }
    })
    if (curSection !== null) result.push({ section: curSection, lines: curLines })
    return result
  }, [lyrics])

  return (
    <div className="max-w-2xl mx-auto px-8 py-6 pb-20">
      <ModeToggle practiceMode={practiceMode} setPracticeMode={setPracticeMode} />

      <AnimatePresence mode="wait">
        <motion.div
          key={practiceMode ? 'practice' : 'reading'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {sections.map((s, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-10"
            >
              {s.section && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="section-divider" />
                  <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.09)', border: '1px solid rgba(124,58,237,0.18)' }}>
                    {s.section}
                  </span>
                  <div className="section-divider" />
                </div>
              )}

              <div className={practiceMode ? 'space-y-3' : 'space-y-2'}>
                {s.lines.map((line, li) => (
                  <LyricCard key={li} line={line} index={li} practiceMode={practiceMode} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
