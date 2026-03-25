import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { Info, ChevronDown, Eye, EyeOff, Volume2, Square } from 'lucide-react'

// Maps our language codes to BCP-47 locale for SpeechSynthesis
const SPEECH_LANG = {
  ko:    'ko-KR',
  ja:    'ja-JP',
  zh:    'zh-CN',
  en:    'en-US',
  mixed: null,   // determined at runtime
}

function useSpeech() {
  const [speaking, setSpeaking] = useState(false)

  const speak = useCallback((text, lang) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = lang
    utterance.rate  = 0.85   // slightly slower for learning
    utterance.pitch = 1

    utterance.onstart = () => setSpeaking(true)
    utterance.onend   = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  return { speaking, speak, stop }
}

function SpeakButton({ line }) {
  const { speaking, speak, stop } = useSpeech()

  // Decide what text to speak and in which language
  const getLangAndText = () => {
    const lang = line.language
    if (lang === 'en')    return { text: line.line,      locale: 'en-US' }
    if (lang === 'ko')    return { text: line.line,      locale: 'ko-KR' }
    if (lang === 'ja')    return { text: line.line,      locale: 'ja-JP' }
    if (lang === 'zh')    return { text: line.line,      locale: 'zh-CN' }
    if (lang === 'mixed') {
      // For mixed lines, speak the full line guessing dominant lang from romanization
      return { text: line.line, locale: 'ko-KR' }
    }
    return null
  }

  const payload = getLangAndText()
  if (!payload) return null   // unknown lang — hide button

  function handleClick(e) {
    e.stopPropagation()
    if (speaking) { stop(); return }
    speak(payload.text, payload.locale)
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={speaking ? 'Stop' : 'Listen to pronunciation'}
      style={{
        color: speaking ? '#22d3ee' : '#6b7280',
        lineHeight: 0,
        transition: 'color 0.2s ease',
      }}
    >
      <AnimatePresence mode="wait">
        {speaking ? (
          <motion.span key="stop"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Square size={13} fill="#22d3ee" />
          </motion.span>
        ) : (
          <motion.span key="play"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Volume2 size={13} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const EMOTION_CONFIG = {
  questioning:    { color: '#f97316', bg: 'rgba(249,115,22,0.08)',   label: 'Questioning'    },
  ironic:         { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)',  label: 'Ironic'         },
  apathetic:      { color: '#64748b', bg: 'rgba(100,116,139,0.08)',  label: 'Apathetic'      },
  hopeful:        { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)',   label: 'Hopeful'        },
  confrontational:{ color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',    label: 'Confrontational'},
  defiant:        { color: '#e11d48', bg: 'rgba(225,29,72,0.08)',    label: 'Defiant'        },
  rebellious:     { color: '#a855f7', bg: 'rgba(168,85,247,0.08)',   label: 'Rebellious'     },
  awakening:      { color: '#eab308', bg: 'rgba(234,179,8,0.08)',    label: 'Awakening'      },
  neutral:        { color: '#6b7280', bg: 'rgba(107,114,128,0.08)',  label: 'Neutral'        },
}

const LANG_BADGES = {
  ko:    { label: '한국어', color: '#818cf8' },
  en:    { label: 'EN',     color: '#34d399' },
  mixed: { label: 'Mixed',  color: '#f97316' },
}

// ─── Reading Mode (default) ───────────────────────────────────────────────────
function ReadingCard({ line, index, emotion, langBadge, noteOpen, setNoteOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="relative rounded-xl p-4 group cursor-default"
      style={{
        background: 'rgba(9,9,18,0.55)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      whileHover={{
        borderColor: `${emotion.color}40`,
        boxShadow: `0 0 20px ${emotion.color}18`,
        transition: { duration: 0.25 },
      }}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 15% 50%, ${emotion.color}18, transparent 75%)`, transition: 'opacity 0.4s ease' }} />
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-0 group-hover:opacity-100"
        style={{ background: emotion.color, transition: 'opacity 0.3s ease', boxShadow: `0 0 8px ${emotion.color}` }} />

      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="text-xs px-2 py-0.5 rounded-full font-mono flex-shrink-0"
          style={{ background: `${langBadge.color}15`, color: langBadge.color, border: `1px solid ${langBadge.color}28` }}>
          {langBadge.label}
        </span>
        {line.cultural_note && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setNoteOpen(o => !o)}
            className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full flex-shrink-0"
            style={{ color: '#c084fc', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.22)' }}>
            <Info size={9} /> Cultural Note
            <motion.span animate={{ rotate: noteOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={9} />
            </motion.span>
          </motion.button>
        )}
      </div>

      <p className="text-base font-medium leading-relaxed mb-1"
        style={{ color: '#e8e8f0', fontFamily: line.language === 'ko' ? "'Noto Sans KR', sans-serif" : 'inherit' }}>
        {line.line}
      </p>
      {line.romanized && (
        <p className="text-xs italic mb-1.5" style={{ color: '#52525b' }}>{line.romanized}</p>
      )}
      {line.is_translated && line.language !== 'en' && (
        <p className="text-sm" style={{ color: '#71717a' }}>{line.translation}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ boxShadow: [`0 0 3px ${emotion.color}`, `0 0 8px ${emotion.color}`, `0 0 3px ${emotion.color}`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full" style={{ background: emotion.color }} />
          <span className="text-xs capitalize" style={{ color: emotion.color }}>{emotion.label}</span>
        </div>
        {line.confidence < 0.5 && <span className="text-xs" style={{ color: '#374151' }}>low confidence</span>}
      </div>

      <AnimatePresence>
        {noteOpen && line.cultural_note && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="overflow-hidden">
            <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed"
              style={{ color: '#c4b5fd', background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <span className="font-semibold block mb-1" style={{ color: '#a78bfa' }}>📍 Cultural Context</span>
              {line.cultural_note}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Practice Mode ────────────────────────────────────────────────────────────
function PracticeCard({ line, index, emotion, langBadge, noteOpen, setNoteOpen }) {
  const [showTranslation, setShowTranslation] = useState(false)

  // English-only lines have no romanization — show original as primary
  const primary    = line.romanized || line.line
  const hasRoman   = !!line.romanized

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="relative rounded-2xl px-6 py-5 group cursor-default"
      style={{
        background: 'rgba(9,9,20,0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${emotion.color}20`,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      whileHover={{
        borderColor: `${emotion.color}55`,
        boxShadow: `0 0 30px ${emotion.color}14`,
        transition: { duration: 0.25 },
      }}
    >
      {/* Subtle left glow bar */}
      <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, transparent, ${emotion.color}60, transparent)` }} />

      {/* Top row: original pill + cultural note */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Language badge */}
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: `${langBadge.color}12`, color: `${langBadge.color}99`, border: `1px solid ${langBadge.color}20` }}>
            {langBadge.label}
          </span>
          {/* Original text (secondary) */}
          {hasRoman && (
            <span className="text-xs" style={{ color: '#3a3a52', fontFamily: "'Noto Sans KR', sans-serif" }}>
              {line.line}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Speak button */}
          <SpeakButton line={line} />
          {/* Toggle translation */}
          {line.is_translated && line.language !== 'en' && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowTranslation(s => !s)}
              style={{ color: showTranslation ? '#6b7280' : '#2d2d40', lineHeight: 0 }}
              title={showTranslation ? 'Hide meaning' : 'Show meaning'}>
              {showTranslation ? <Eye size={13} /> : <EyeOff size={13} />}
            </motion.button>
          )}
          {/* Cultural note */}
          {line.cultural_note && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setNoteOpen(o => !o)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)' }}>
              <Info size={9} />
              <motion.span animate={{ rotate: noteOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={9} />
              </motion.span>
            </motion.button>
          )}
        </div>
      </div>

      {/* PRIMARY: Romanized (or original if English) */}
      <p className="leading-relaxed font-medium mb-2"
        style={{
          color: '#f0f0ff',
          fontSize: '1.25rem',
          letterSpacing: '0.02em',
          wordSpacing: '0.1em',
          fontFamily: 'Inter, sans-serif',
        }}>
        {primary}
      </p>

      {/* Translation — hidden by default, reveal with eye icon */}
      <AnimatePresence>
        {showTranslation && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs mb-2 overflow-hidden"
            style={{ color: '#4b4b6b' }}
          >
            {line.translation}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Emotion */}
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1 h-1 rounded-full" style={{ background: emotion.color }} />
        <span className="text-xs capitalize" style={{ color: `${emotion.color}80` }}>{emotion.label}</span>
      </div>

      {/* Cultural note panel */}
      <AnimatePresence>
        {noteOpen && line.cultural_note && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="overflow-hidden">
            <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed"
              style={{ color: '#c4b5fd', background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <span className="font-semibold block mb-1" style={{ color: '#a78bfa' }}>📍 Cultural Context</span>
              {line.cultural_note}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────
export default function LyricCard({ line, index, practiceMode }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const emotion   = EMOTION_CONFIG[line.emotion] ?? EMOTION_CONFIG.neutral
  const langBadge = LANG_BADGES[line.language]   ?? { label: line.language, color: '#6b7280' }
  const shared    = { line, index, emotion, langBadge, noteOpen, setNoteOpen }

  return practiceMode
    ? <PracticeCard {...shared} />
    : <ReadingCard  {...shared} />
}
