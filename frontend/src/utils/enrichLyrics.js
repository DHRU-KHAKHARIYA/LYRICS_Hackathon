const SECTION_EMOTIONS = {
  'Intro':       'questioning',
  'Verse 1':     'ironic',
  'Refrain':     'hopeful',
  'Verse 2':     'confrontational',
  'Pre-Chorus':  'questioning',
  'Chorus':      'defiant',
  'Verse 3':     'rebellious',
  'Bridge':      'awakening',
  'Outro':       'hopeful',
}

const CULTURAL_NOTES = {
  '독서실': '독서실 (Dokseosil) are pay-per-hour private study rooms where Korean students study well past midnight — a symbol of Korea\'s intense academic pressure culture.',
  '공무원': 'Civil servant (공무원) has been Korea\'s #1 dream job for youth for decades, prized above all for job security — a direct product of the country\'s hyper-competitive job market.',
  '야자': '야자 (Yaja) is short for 야간자율학습 — mandatory night self-study sessions at school held until 10–11pm. Many students attend these 6 nights a week.',
  '유리멘탈': '유리멘탈 (Glass mental) is Korean slang for someone emotionally fragile — like glass that shatters under the slightest pressure.',
  '대학은': 'The Korean college entrance exam (수능 / Suneung) is so significant that on test day, flights are rerouted, businesses open late, and police escort students to testing centers.',
}

function getEmotion(section) {
  const key = Object.keys(SECTION_EMOTIONS).find(k => section?.includes(k))
  return key ? SECTION_EMOTIONS[key] : 'neutral'
}

function getCulturalNote(line) {
  const key = Object.keys(CULTURAL_NOTES).find(k => line.includes(k))
  return key ? CULTURAL_NOTES[key] : null
}

export function enrichLyrics(data) {
  return {
    ...data,
    lyrics: data.lyrics.map(item => ({
      ...item,
      emotion: getEmotion(item.section),
      cultural_note: getCulturalNote(item.line),
    })),
  }
}

export function getMemberStats(lyrics) {
  const counts = {}
  lyrics.forEach(line => {
    const match = line.section?.match(/:\s*(.+)$/)
    if (!match) return
    match[1].split(/,\s*/).forEach(m => {
      const name = m.trim()
      if (name) counts[name] = (counts[name] || 0) + 1
    })
  })
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
}

const EMOTION_SCORES = {
  apathetic: 1, ironic: 2, melancholic: 3, neutral: 4,
  questioning: 4, hopeful: 6, rebellious: 7,
  confrontational: 7, defiant: 8, awakening: 9,
}

export function getEmotionArcData(lyrics) {
  const step = Math.max(1, Math.floor(lyrics.length / 22))
  return lyrics
    .filter((_, i) => i % step === 0)
    .map((line, i) => ({
      i,
      score: EMOTION_SCORES[line.emotion] ?? 4,
      emotion: line.emotion,
      section: line.section,
    }))
}
