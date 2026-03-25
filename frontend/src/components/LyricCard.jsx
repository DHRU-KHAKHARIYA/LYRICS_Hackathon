import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { Info, ChevronDown, Eye, EyeOff, Volume2, Square, Mic, MicOff, RotateCcw } from 'lucide-react'

const LOCALE_MAP = {
  ko: 'ko-KR', ja: 'ja-JP', zh: 'zh-CN', en: 'en-US', mixed: 'ko-KR',
}

// ─── Similarity ───────────────────────────────────────────────────────────────
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9가-힣ぁ-んァ-ン\u4e00-\u9fff]/g, '')
}

function similarity(a, b) {
  const s1 = normalize(a)
  const s2 = normalize(b)
  if (!s1 || !s2) return 0
  // Build LCS length matrix
  const dp = Array.from({ length: s1.length + 1 }, () => new Array(s2.length + 1).fill(0))
  for (let i = 1; i <= s1.length; i++)
    for (let j = 1; j <= s2.length; j++)
      dp[i][j] = s1[i - 1] === s2[j - 1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1])
  return dp[s1.length][s2.length] / Math.max(s1.length, s2.length)
}

// ─── TTS hook ─────────────────────────────────────────────────────────────────
function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const speak = useCallback((text, lang) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang; u.rate = 0.85
    u.onstart = () => setSpeaking(true)
    u.onend   = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [])
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false) }, [])
  return { speaking, speak, stop }
}

// ─── Pronunciation practice buttons ──────────────────────────────────────────
function PronunciationButtons({ line, onResult }) {
  const locale  = LOCALE_MAP[line.language]
  const { speaking, speak, stop } = useSpeech()
  const [phase, setPhase]   = useState('idle')   // idle | listening | done
  const [score, setScore]   = useState(null)

  if (!locale) return null

  function handleSpeak(e) {
    e.stopPropagation()
    if (speaking) { stop(); return }
    speak(line.line, locale)
  }

  function handleMic(e) {
    e.stopPropagation()
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported. Use Chrome or Edge.'); return }

    stop()   // stop TTS if playing
    const rec = new SR()
    rec.lang        = locale
    rec.interimResults = false
    rec.maxAlternatives = 1

    setPhase('listening')

    rec.onresult = (event) => {
      const heard = event.results[0][0].transcript
      const expected = line.line
      const sc = similarity(heard, expected)
      setScore(sc)
      setPhase('done')
      onResult(sc)
    }
    rec.onerror = () => setPhase('idle')
    rec.onend   = () => { if (phase === 'listening') setPhase('idle') }
    rec.start()
  }

  function handleReset(e) {
    e.stopPropagation()
    setPhase('idle')
    setScore(null)
    onResult(null)
  }

  return (
    <div className="flex items-center gap-2">
      {/* TTS button */}
      <motion.button onClick={handleSpeak} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        title={speaking ? 'Stop' : 'Listen'}
        style={{ color: speaking ? '#22d3ee' : '#6b7280', lineHeight: 0 }}>
        <AnimatePresence mode="wait">
          {speaking
            ? <motion.span key="sq" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Square size={13} fill="#22d3ee" /></motion.span>
            : <motion.span key="v2" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Volume2 size={13} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Mic button */}
      {phase === 'idle' && (
        <motion.button onClick={handleMic} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          title="Repeat this line" style={{ color: '#6b7280', lineHeight: 0 }}>
          <Mic size={13} />
        </motion.button>
      )}
      {phase === 'listening' && (
        <motion.div animate={{ scale: [1, 1.2, 1], color: ['#ef4444', '#f97316', '#ef4444'] }}
          transition={{ duration: 0.8, repeat: Infinity }} style={{ lineHeight: 0, color: '#ef4444' }}>
          <MicOff size={13} />
        </motion.div>
      )}

      {/* Score + reset */}
      {phase === 'done' && score !== null && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5">
          <span className="text-xs font-semibold"
            style={{ color: score >= 0.6 ? '#22c55e' : '#ef4444' }}>
            {Math.round(score * 100)}%
          </span>
          <motion.button onClick={handleReset} whileHover={{ scale: 1.1 }}
            style={{ color: '#4b5563', lineHeight: 0 }} title="Try again">
            <RotateCcw size={11} />
          </motion.button>
        </motion.div>
      )}
    </div>
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
        <p className="text-xs italic mb-1.5" style={{ color: '#8888aa' }}>{line.romanized}</p>
      )}
      {line.is_translated && line.language !== 'en' && (
        <p className="text-sm" style={{ color: '#9ca3af' }}>{line.translation}</p>
      )}

      {line.confidence < 0.5 && (
        <div className="mt-3">
          <span className="text-xs" style={{ color: '#374151' }}>low confidence</span>
        </div>
      )}

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
  const [result, setResult] = useState(null)   // null | 0-1 score

  const primary  = line.romanized || line.line
  const hasRoman = !!line.romanized

  const borderColor = result === null
    ? `${emotion.color}20`
    : result >= 0.6 ? '#22c55e60' : '#ef444460'
  const glowColor = result === null
    ? `${emotion.color}14`
    : result >= 0.6 ? '#22c55e20' : '#ef444420'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      animate={{
        borderColor,
        boxShadow: result !== null ? `0 0 25px ${glowColor}` : `0 0 0px transparent`,
      }}
      className="relative rounded-2xl px-6 py-5 group cursor-default"
      style={{
        background: 'rgba(9,9,20,0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Result banner */}
      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background: result >= 0.6 ? '#22c55e' : '#ef4444' }}
          />
        )}
      </AnimatePresence>

      {/* Left glow bar */}
      <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, transparent, ${result !== null ? (result >= 0.6 ? '#22c55e' : '#ef4444') : emotion.color}60, transparent)` }} />

      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: `${langBadge.color}12`, color: `${langBadge.color}99`, border: `1px solid ${langBadge.color}20` }}>
            {langBadge.label}
          </span>
          {hasRoman && (
            <span className="text-xs" style={{ color: '#6b7280', fontFamily: "'Noto Sans KR', sans-serif" }}>
              {line.line}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* TTS + Mic */}
          <PronunciationButtons line={line} onResult={setResult} />
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
          fontSize: '1.35rem',
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
            style={{ color: '#9ca3af' }}
          >
            {line.translation}
          </motion.p>
        )}
      </AnimatePresence>


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
