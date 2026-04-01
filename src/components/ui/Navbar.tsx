import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../auth/AuthModal'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login'|'signup'>('login')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const openLogin  = () => { setAuthTab('login');  setAuthOpen(true) }
  const openSignup = () => { setAuthTab('signup'); setAuthOpen(true) }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { label: '동아리 소개', href: '/#about' },
    { label: '포트폴리오', href: '/portfolio' },
    { label: '스터디', href: '/studies' },
  ]

  return (
    <>
      {isAdmin && (
        <div style={{
          background: 'rgba(123,97,255,0.1)',
          borderBottom: '1px solid rgba(123,97,255,0.2)',
          padding: '0.4rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
          fontSize: '0.75rem', color: 'rgba(123,97,255,0.9)',
          fontFamily: "'Space Grotesk', sans-serif",
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001,
        }}>
          <span style={{ width:6, height:6, background:'rgba(123,97,255,0.9)', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
          관리자 모드 · <Link to="/admin" style={{ color:'rgba(123,97,255,0.9)', fontWeight:600 }}>관리자 패널 열기 →</Link>
        </div>
      )}

      <nav style={{
        position: 'fixed',
        top: isAdmin ? '32px' : 0,
        left: 0, right: 0,
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2.5rem',
        background: scrolled ? 'rgba(8,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <Link to="/" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.8rem', letterSpacing: '0.15em',
          color: '#fff', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <span style={{ width:8, height:8, background:'var(--accent)', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }}/>
          CAGI
        </Link>

        {/* 데스크탑 링크 */}
        <ul style={{ display:'flex', gap:'2rem', listStyle:'none', margin:0 }} className="hide-mobile">
          {navLinks.map(l => (
            <li key={l.href}>
              <Link to={l.href} style={{
                color: location.pathname === l.href ? 'var(--accent)' : 'var(--muted)',
                textDecoration: 'none',
                fontSize: '0.85rem', letterSpacing: '0.05em',
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'color 0.2s',
              }}>{l.label}</Link>
            </li>
          ))}
        </ul>

        {/* 오른쪽 버튼 영역 */}
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          {user ? (
            <>
              <Link to="/upload" style={btnStyle('ghost')}>작품 올리기</Link>
              <Link to="/profile" style={{ ...btnStyle('ghost'), display:'flex', alignItems:'center', gap:'0.4rem' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width:22, height:22, borderRadius:'50%', objectFit:'cover' }}/>
                  : <span style={{ width:22, height:22, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'var(--bg)', fontWeight:700 }}>{profile?.name?.[0] ?? 'U'}</span>
                }
                {profile?.name ?? '프로필'}
              </Link>
              <button onClick={handleLogout} style={btnStyle('ghost')}>로그아웃</button>
            </>
          ) : (
            <>
              <button onClick={openLogin}  style={btnStyle('ghost')}>로그인</button>
              <button onClick={openSignup} style={btnStyle('filled')}>회원가입</button>
            </>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
      />

      <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </>
  )
}

function btnStyle(type: 'ghost' | 'filled') {
  const base: React.CSSProperties = {
    padding: '0.45rem 1.1rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.04em',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  }
  if (type === 'ghost') return { ...base, background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'var(--text)' }
  return { ...base, background:'var(--accent)', border:'1px solid var(--accent)', color:'var(--bg)', fontWeight:600 }
}
