import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, Search, Sparkles, Loader2, X } from 'lucide-react'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function Navbar({ onSearch, onClear, loading, currentSong }) {
  const [title, setTitle]         = useState('')
  const [artist, setArtist]       = useState('')
  const [focused, setFocused]     = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSugg, setShowSugg]   = useState(false)
  const wrapperRef                = useRef(null)

  const debouncedTitle = useDebounce(title, 350)

  // Fetch suggestions from iTunes when title changes
  useEffect(() => {
    if (debouncedTitle.trim().length < 2) {
      setSuggestions([])
      return
    }
    const query = artist.trim()
      ? `${debouncedTitle} ${artist}`
      : debouncedTitle
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=6&entity=song`)
      .then(r => r.json())
      .then(data => {
        const results = (data.results || []).map(r => ({
          title: r.trackName,
          artist: r.artistName,
          art: r.artworkUrl60,
        }))
        setSuggestions(results)
        setShowSugg(true)
      })
      .catch(() => setSuggestions([]))
  }, [debouncedTitle])

  // Close suggestions on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSugg(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function selectSuggestion(s) {
    setTitle(s.title)
    setArtist(s.artist)
    setShowSugg(false)
    onSearch(s.title, s.artist)
    setTitle('')
    setArtist('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const t = title.trim()
    const a = artist.trim()
    if (t && a && !loading) {
      onSearch(t, a)
      setTitle('')
      setArtist('')
      setShowSugg(false)
    }
  }

  function clearInputs() {
    setTitle('')
    setArtist('')
    setSuggestions([])
    setShowSugg(false)
  }

  const hasInput = title.trim() || artist.trim()
  const canSubmit = title.trim() && artist.trim() && !loading

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass flex items-center justify-between px-8 py-4 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 20 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 5 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          onClick={onClear}
          title="Back to home"
        >
          <Music2 size={17} className="text-white" />
        </motion.div>
        <span className="font-display text-xl font-bold gradient-text tracking-tight">LyricFlow</span>
        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{
          background: 'rgba(124,58,237,0.12)', color: '#a78bfa',
          border: '1px solid rgba(124,58,237,0.25)',
        }}>
          <Sparkles size={9} />AI-Powered
        </span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-3">

        {/* Now playing chip */}
        <AnimatePresence>
          {currentSong && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#7c3aed' }}
              />
              <span className="text-xs font-medium max-w-48 truncate" style={{ color: '#a78bfa' }}>
                {currentSong.title} — {currentSong.artist}
              </span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClear}
                style={{ color: '#6b7280', lineHeight: 0 }}
                title="Close"
              >
                <X size={11} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search form */}
        <div ref={wrapperRef} className="relative">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <motion.div
              animate={{ borderColor: focused ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)' }}
              className="flex items-center gap-2 rounded-full px-4 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.25s ease',
              }}
            >
              <Search size={13} style={{ color: '#6b7280', flexShrink: 0 }} />
              <input
                value={title}
                onChange={e => { setTitle(e.target.value); setShowSugg(true) }}
                onFocus={() => { setFocused(true); if (suggestions.length) setShowSugg(true) }}
                onBlur={() => setFocused(false)}
                placeholder="Song title..."
                autoComplete="off"
                className="bg-transparent text-sm outline-none w-28 placeholder-gray-600"
                style={{ color: '#e8e8f0' }}
              />
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
              <input
                value={artist}
                onChange={e => setArtist(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Artist..."
                autoComplete="off"
                className="bg-transparent text-sm outline-none w-20 placeholder-gray-600"
                style={{ color: '#e8e8f0' }}
              />
              <AnimatePresence>
                {hasInput && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={clearInputs}
                    style={{ color: '#4b5563', lineHeight: 0, flexShrink: 0 }}
                    whileHover={{ color: '#9ca3af' }}
                  >
                    <X size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.04 } : {}}
              whileTap={canSubmit ? { scale: 0.96 } : {}}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                color: 'white',
                flexShrink: 0,
                opacity: canSubmit ? 1 : 0.4,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Analyzing</>
                : <><Search size={13} /> Analyze</>
              }
            </motion.button>
          </form>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSugg && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(12,12,24,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  minWidth: 320,
                }}
              >
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onMouseDown={() => selectSuggestion(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    whileHover={{ background: 'rgba(124,58,237,0.1)' }}
                  >
                    {s.art
                      ? <img src={s.art} alt="" className="w-8 h-8 rounded-lg flex-shrink-0" style={{ objectFit: 'cover' }} />
                      : <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: 'rgba(124,58,237,0.2)' }} />
                    }
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>{s.title}</p>
                      <p className="text-xs truncate" style={{ color: '#6b7280' }}>{s.artist}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white' }}>
        U
      </div>
    </motion.nav>
  )
}
