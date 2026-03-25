export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="orb-1 absolute rounded-full" style={{
        width: 700, height: 700,
        top: '-250px', left: '-150px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
      <div className="orb-2 absolute rounded-full" style={{
        width: 550, height: 550,
        top: '25%', right: '-180px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.11) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
      <div className="orb-3 absolute rounded-full" style={{
        width: 450, height: 450,
        bottom: '-120px', left: '38%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
    </div>
  )
}
