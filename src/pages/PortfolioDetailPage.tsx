import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [loading, setLoading]    = useState(true)
  const [liked, setLiked]        = useState(false)
  const [imgIdx, setImgIdx]      = useState(0)

  useEffect(() => {
    if (!id) return
    supabase.from('portfolios').select('*, profiles!user_id(name, avatar_url, major, grade)').eq('id', id).single().then(({ data }) => {
      setPortfolio(data)
      setLoading(false)
      // 조회수 증가
      supabase.from('portfolios').update({ view_count: (data?.view_count ?? 0) + 1 }).eq('id', id)
    })
    if (user) {
      supabase.from('portfolio_likes').select('portfolio_id').eq('portfolio_id', id).eq('user_id', user.id).single().then(({ data }) => {
        if (data) setLiked(true)
      })
    }
  }, [id, user])

  const toggleLike = async () => {
    if (!user) { toast.error('로그인이 필요합니다'); return }
    if (liked) {
      await supabase.from('portfolio_likes').delete().eq('portfolio_id', id!).eq('user_id', user.id)
      setPortfolio((p: any) => ({ ...p, like_count: p.like_count - 1 }))
      setLiked(false)
    } else {
      await supabase.from('portfolio_likes').insert({ portfolio_id: id!, user_id: user.id })
      setPortfolio((p: any) => ({ ...p, like_count: p.like_count + 1 }))
      setLiked(true)
    }
  }

  if (loading) return <main style={{ paddingTop:'6rem', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>로딩중...</main>
  if (!portfolio) return <main style={{ paddingTop:'6rem', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', color:'var(--muted)' }}><div style={{ fontSize:'3rem' }}>🔍</div><p>포트폴리오를 찾을 수 없습니다</p><Link to="/portfolio" style={{ color:'var(--accent)', textDecoration:'none' }}>← 갤러리로 돌아가기</Link></main>

  const allMedia = [portfolio.thumbnail_url, ...(portfolio.media_urls ?? [])].filter(Boolean)

  return (
    <main style={{ paddingTop:'6rem', minHeight:'100vh' }}>
      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'3rem 2.5rem' }}>
        {/* 뒤로가기 */}
        <Link to="/portfolio" style={{ display:'inline-flex', alignItems:'center', gap:'.4rem', color:'var(--muted)', textDecoration:'none', fontSize:'.85rem', fontFamily:"'Space Grotesk',sans-serif", marginBottom:'2rem' }}>
          ← 갤러리로 돌아가기
        </Link>

        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:'2.5rem', alignItems:'start' }}>
          {/* 왼쪽: 이미지 */}
          <div>
            <div style={{ aspectRatio:'16/9', background:'var(--surface2)', borderRadius:'12px', overflow:'hidden', marginBottom:'.8rem', position:'relative' }}>
              {allMedia.length > 0
                ? <img src={allMedia[imgIdx]} alt={portfolio.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'4rem', color:'rgba(0,212,255,.1)' }}>{portfolio.category}</div>
              }
              {allMedia.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => Math.max(0, i-1))} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,.6)', border:'none', color:'#fff', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
                  <button onClick={() => setImgIdx(i => Math.min(allMedia.length-1, i+1))} style={{ position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,.6)', border:'none', color:'#fff', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
                </>
              )}
            </div>
            {/* 썸네일 목록 */}
            {allMedia.length > 1 && (
              <div style={{ display:'flex', gap:'.5rem', overflowX:'auto' }}>
                {allMedia.map((url: string, i: number) => (
                  <div key={i} onClick={() => setImgIdx(i)} style={{ width:60, height:45, borderRadius:'6px', overflow:'hidden', cursor:'pointer', border:`2px solid ${i === imgIdx ? 'var(--accent)' : 'transparent'}`, flexShrink:0 }}>
                    <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 정보 */}
          <div>
            <div style={{ fontSize:'.7rem', color:'var(--accent)', letterSpacing:'.15em', textTransform:'uppercase', fontFamily:"'Space Grotesk',sans-serif", marginBottom:'.4rem' }}>{portfolio.category}</div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.2rem', color:'#fff', lineHeight:1, marginBottom:'1rem' }}>{portfolio.title}</h1>

            {/* 작가 정보 */}
            <div style={{ display:'flex', alignItems:'center', gap:'.8rem', padding:'1rem', background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', marginBottom:'1.2rem' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', color:'var(--bg)', fontWeight:700, overflow:'hidden', flexShrink:0 }}>
                {portfolio.profiles?.avatar_url
                  ? <img src={portfolio.profiles.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : portfolio.profiles?.name?.[0] ?? 'U'
                }
              </div>
              <div>
                <div style={{ fontSize:'.9rem', color:'#fff', fontWeight:500 }}>{portfolio.profiles?.name ?? '익명'}</div>
                <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>{portfolio.profiles?.major} {portfolio.profiles?.grade}학년</div>
              </div>
            </div>

            {portfolio.description && <p style={{ color:'rgba(232,234,240,.7)', fontSize:'.88rem', lineHeight:1.8, marginBottom:'1.2rem' }}>{portfolio.description}</p>}

            {/* 태그 */}
            {portfolio.tags?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem', marginBottom:'1.2rem' }}>
                {portfolio.tags.map((t: string) => (
                  <span key={t} style={{ padding:'.2rem .7rem', background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.15)', borderRadius:'100px', fontSize:'.72rem', color:'var(--accent)' }}>#{t}</span>
                ))}
              </div>
            )}

            {/* 사용 툴 */}
            {portfolio.tools_used?.length > 0 && (
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'.72rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'.5rem' }}>사용 툴</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                  {portfolio.tools_used.map((t: string) => (
                    <span key={t} style={{ padding:'.3rem .7rem', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'6px', fontSize:'.78rem', color:'var(--text)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 통계 & 좋아요 */}
            <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
              <button onClick={toggleLike} style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.55rem 1.1rem', background: liked ? 'rgba(255,107,107,.15)' : 'var(--surface)', border:`1px solid ${liked ? 'rgba(255,107,107,.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius:'8px', color: liked ? '#ff6b6b' : 'var(--muted)', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:'.85rem', transition:'all .2s' }}>
                {liked ? '♥' : '♡'} {portfolio.like_count}
              </button>
              <span style={{ fontSize:'.78rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif" }}>조회 {portfolio.view_count}</span>
              <span style={{ fontSize:'.78rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif" }}>{new Date(portfolio.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
