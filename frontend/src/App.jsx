import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { enrichLyrics, getMemberStats, getEmotionArcData } from './utils/enrichLyrics'
import BackgroundOrbs from './components/BackgroundOrbs'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LyricsPanel from './components/LyricsPanel'

function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 h-full">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl"
      >
        🎵
      </motion.div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            className="w-1 h-6 rounded-full"
            style={{ background: 'linear-gradient(to top, #7c3aed, #ec4899)', transformOrigin: 'bottom' }}
          />
        ))}
      </div>
      <p className="text-sm" style={{ color: '#52525b' }}>Fetching & processing lyrics...</p>
    </div>
  )
}

function EmptyState({ onSearch }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full gap-6 px-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-6xl"
      >
        🎧
      </motion.div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold gradient-text mb-2">Search any song</h2>
        <p className="text-sm" style={{ color: '#52525b' }}>Enter a title and artist to analyze lyrics</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { title: 'Dynamite', artist: 'BTS' },
          { title: 'STAY', artist: 'The Kid LAROI' },
          { title: 'Butter', artist: 'BTS' },
        ].map(s => (
          <motion.button
            key={s.title}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSearch(s.title, s.artist)}
            className="text-xs px-4 py-2 rounded-full"
            style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.22)' }}
          >
            {s.title} — {s.artist}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [song, setSong]               = useState(null)
  const [memberStats, setMemberStats] = useState([])
  const [arcData, setArcData]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [lastQuery, setLastQuery]     = useState(null)
  const [practiceMode, setPracticeMode] = useState(false)

  function clearSong() {
    setSong(null)
    setError(null)
    setLastQuery(null)
  }

  async function fetchSong(title, artist) {
    setLoading(true)
    setError(null)
    setSong(null)
    setLastQuery({ title, artist })
    try {
      const res = await fetch('/api/v1/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist }),
      })
      if (!res.ok) {
        let detail = `Server error (${res.status})`
        try {
          const err = await res.json()
          detail = err.detail || detail
        } catch {}
        throw new Error(detail)
      }
      const data = await res.json()
      const enriched = enrichLyrics(data)
      setSong(enriched)
      setMemberStats(getMemberStats(enriched.lyrics))
      setArcData(getEmotionArcData(enriched.lyrics))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#030309' }}>
      <BackgroundOrbs />

      <div className="relative z-10 flex flex-col h-screen">
        <Navbar onSearch={fetchSong} onClear={clearSong} loading={loading} currentSong={song} />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence>
            {song && (
              <motion.aside
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-72 flex-shrink-0 overflow-y-auto"
                style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}
              >
                <Sidebar song={song} memberStats={memberStats} arcData={arcData} />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            {loading ? (
              <LoadingScreen />
            ) : error ? (
              <div className="flex-1 flex items-center justify-center h-full flex-col gap-4">
                <p className="text-4xl">😕</p>
                <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
                <p className="text-xs" style={{ color: '#52525b' }}>
                  Make sure the backend is running: <code className="px-1 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>python main.py serve</code>
                </p>
                <div className="flex gap-3 mt-1">
                  {lastQuery && (
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => fetchSong(lastQuery.title, lastQuery.artist)}
                      className="text-sm px-4 py-2 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
                    >
                      Try again
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={clearSong}
                    className="text-sm px-4 py-2 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Go back
                  </motion.button>
                </div>
              </div>
            ) : song ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <LyricsPanel lyrics={song.lyrics} practiceMode={practiceMode} setPracticeMode={setPracticeMode} />
              </motion.div>
            ) : (
              <EmptyState onSearch={fetchSong} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
