import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = ['전체', '3D', '게임', '프로그래밍', '그래픽디자인', '영상', '기타']
const COLORS = ['#FF6B35','#7B61FF','#00D4FF','#FF6B6B','#4CAF50','#FFD700','#E91E63','#FF9800']

export default function PortfolioPage() {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [category, setCategory]     = useState('전체')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetchPortfolios()
  }, [category])

  const fetchPortfolios = async () => {
    setLoading(true)
    let q = supabase.from('portfolios').select('*, profiles!user_id(name, avatar_url)').eq('is_public', true).order('created_at', { ascending: false })
    if (category !== '전체') q = q.eq('category', category)
    const { data } = await q
    setPortfolios(data ?? [])
    setLoading(false)
  }

  return (
    <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2.5rem' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <p className="section-label">Portfolio</p>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,3.5rem)', color: '#fff', lineHeight: 1 }}>작품 갤러리</h1>
            <p style={{ color: 'var(--muted)', marginTop: '.4rem', fontSize: '.9rem' }}>CAGI 멤버들의 창의적인 작품을 감상하세요</p>
          </div>
          {user && (
            <Link to="/upload" style={{ padding: '.75rem 1.5rem', background: 'var(--accent)', color: 'var(--bg)', borderRadius: '8px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '.04em' }}>
              + 작품 올리기
            </Link>
          )}
        </div>

        {/* 카테고리 필터 */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '.35rem .9rem',
              background: category === cat ? 'var(--accent)' : 'var(--surface2)',
              color: category === cat ? 'var(--bg)' : 'var(--muted)',
              border: `1px solid ${category === cat ? 'var(--accent)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '100px', fontSize: '.78rem',
              fontFamily: "'Space Grotesk',sans-serif",
              cursor: 'pointer', transition: 'all .2s',
            }}>{cat}</button>
          ))}
        </div>

        {/* 그리드 */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', animation: 'pulse 1.5s infinite' }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--surface2)' }}/>
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ height: 12, background: 'var(--surface2)', borderRadius: 4, marginBottom: 8, width: '70%' }}/>
                  <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 4, width: '40%' }}/>
                </div>
              </div>
            ))}
          </div>
        ) : portfolios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <p>아직 등록된 작품이 없습니다.</p>
            {user && <Link to="/upload" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>첫 작품을 올려보세요 →</Link>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {portfolios.map((p, i) => (
              <PortfolioCard key={p.id} p={p} color={COLORS[i % COLORS.length]}/>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function PortfolioCard({ p, color }: { p: any; color: string }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={`/portfolio/${p.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: 'var(--surface)',
          border: `1px solid ${hov ? 'rgba(0,212,255,.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
          transform: hov ? 'translateY(-4px)' : 'none',
          boxShadow: hov ? '0 20px 60px rgba(0,0,0,.4)' : 'none',
          transition: 'all .3s',
        }}
      >
        <div style={{ aspectRatio: '16/9', background: 'var(--surface2)', position: 'relative', overflow: 'hidden' }}>
          {p.thumbnail_url
            ? <img src={p.thumbnail_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : (
              <>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${color}18 0%,transparent 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', color: `${color}30` }}>
                  {p.category ?? '작품'}
                </div>
              </>
            )
          }
          {/* 호버 오버레이 */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,10,15,.9) 0%, transparent 60%)', opacity: hov ? 1 : 0, transition: 'opacity .3s', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '1rem' }}>
            <span style={{ padding: '.25rem .6rem', background: 'var(--accent)', color: 'var(--bg)', borderRadius: '4px', fontSize: '.7rem', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{p.category}</span>
          </div>
        </div>
        <div style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif" }}>by {p.profiles?.name ?? '익명'}</span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>♡ {p.like_count}</span>
          </div>
          <div style={{ fontSize: '.95rem', fontWeight: 500, color: '#fff', marginBottom: '.5rem' }}>{p.title}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
            {(p.tools_used ?? []).slice(0,3).map((t: string) => (
              <span key={t} style={{ padding: '.15rem .5rem', background: 'var(--surface2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', fontSize: '.68rem', color: 'var(--muted)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
