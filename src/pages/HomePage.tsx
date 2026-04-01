import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heroConfig, setHeroConfig] = useState<any>(null)
  const [studies, setStudies]       = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<any[]>([])

  // 사이트 설정 불러오기
  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      const cfg = data?.find((d: any) => d.key === 'hero_config')
      if (cfg) setHeroConfig(cfg.value)
    })
    supabase.from('studies').select('*').eq('status','open').limit(4).order('created_at',{ascending:false}).then(({ data }) => { if (data) setStudies(data) })
    supabase.from('portfolios').select('*, profiles(name, avatar_url)').eq('is_public',true).limit(6).order('created_at',{ascending:false}).then(({ data }) => { if (data) setPortfolios(data) })
  }, [])

  // 파티클 애니메이션
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let particles: any[] = []

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
        r: Math.random()*1.4+.3,
        op: Math.random()*.5+.1,
        color: Math.random()>.7 ? '#00D4FF' : Math.random()>.5 ? '#7B61FF' : '#fff',
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x<0||p.x>canvas.width||p.y<0||p.y>canvas.height) {
          p.x = Math.random()*canvas.width; p.y = Math.random()*canvas.height
        }
        ctx.globalAlpha = p.op
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill()
      })
      // 연결선
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.sqrt(dx*dx+dy*dy)
          if (d < 100) {
            ctx.globalAlpha = (1-d/100)*.07
            ctx.strokeStyle = '#00D4FF'
            ctx.lineWidth = .5
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  // 숫자 카운트업
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-count]')
    els.forEach(el => {
      const target = parseInt(el.dataset.count ?? '0')
      let cur = 0
      const step = () => {
        cur += target / 90
        el.textContent = Math.min(Math.floor(cur), target) + (target >= 100 ? '+' : '')
        if (cur < target) requestAnimationFrame(step)
        else el.textContent = target + (target >= 100 ? '+' : '')
      }
      const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) { step(); obs.disconnect() } }, { threshold: .5 })
      obs.observe(el)
    })
  }, [])

  return (
    <main>
      {/* ── HERO ──────────────────────────────── */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {/* 배경 */}
        <div style={{
          position:'absolute', inset:0,
          background: heroConfig?.type === 'video' && heroConfig.url
            ? undefined
            : 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(123,97,255,0.08) 0%, transparent 60%), #080A0F',
        }}>
          {/* 그리드 패턴 */}
          <div style={{
            position:'absolute', inset:0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}/>
          {/* 관리자 설정 영상 */}
          {heroConfig?.type === 'video' && heroConfig.url && (
            <video autoPlay muted loop playsInline style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 1 - (heroConfig.overlay_opacity ?? .5) }}>
              <source src={heroConfig.url}/>
            </video>
          )}
          <div style={{ position:'absolute', inset:0, background:`rgba(8,10,15,${heroConfig?.overlay_opacity ?? .5})` }}/>
        </div>

        {/* 파티클 캔버스 */}
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}/>

        {/* 콘텐츠 */}
        <div style={{ position:'relative', zIndex:10, textAlign:'center', padding:'2rem' }}>
          <div className="animate-fadeInUp" style={{
            display:'inline-flex', alignItems:'center', gap:'.5rem',
            padding:'.35rem 1rem',
            background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)',
            borderRadius:'100px', fontSize:'.75rem', color:'var(--accent)',
            fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'.12em', textTransform:'uppercase',
            marginBottom:'1.5rem',
          }}>
            <span style={{ width:20, height:1, background:'var(--accent)', display:'inline-block' }}/>
            Since 1991 · 단국대학교 중앙동아리
            <span style={{ width:20, height:1, background:'var(--accent)', display:'inline-block' }}/>
          </div>

          <h1 className="animate-fadeInUp delay-100" style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:'clamp(5rem,16vw,12rem)',
            lineHeight:.9, letterSpacing:'.05em', color:'#fff',
          }}>
            C<span style={{ color:'var(--accent)' }}>A</span>GI
          </h1>

          <p className="animate-fadeInUp delay-200" style={{
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize:'clamp(.9rem,2vw,1.1rem)',
            color:'var(--muted)', letterSpacing:'.3em', textTransform:'uppercase',
            margin:'1rem 0 2rem',
          }}>
            Computer Art &amp; Graphic Institute
          </p>

          <p className="animate-fadeInUp delay-300" style={{ fontSize:'1rem', color:'rgba(232,234,240,.6)', maxWidth:'420px', margin:'0 auto 2.5rem', lineHeight:1.9 }}>
            단국대학교 유일무이 컴퓨터그래픽 동아리.<br/>
            Blender, Unity, 프로그래밍으로 창의성을 현실로.
          </p>

          <div className="animate-fadeInUp delay-400" style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/portfolio" style={primaryBtn}>포트폴리오 보기</Link>
            <Link to="/studies"   style={ghostBtn}>스터디 신청하기</Link>
          </div>
        </div>

        {/* 통계 */}
        <div className="animate-fadeInUp delay-500" style={{
          position:'absolute', bottom:'3rem', left:'50%', transform:'translateX(-50%)',
          display:'flex', gap:'3rem',
        }}>
          {[['33','Years'],['500','Alumni'],['120','Projects']].map(([n, l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <span data-count={n} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.2rem', color:'#fff', letterSpacing:'.05em', display:'block' }}>0</span>
              <span style={{ fontSize:'.72rem', color:'var(--muted)', letterSpacing:'.12em', textTransform:'uppercase', fontFamily:"'Space Grotesk',sans-serif" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* 스크롤 힌트 */}
        <div style={{ position:'absolute', bottom:'1.2rem', left:'50%', display:'flex', flexDirection:'column', alignItems:'center', gap:'.3rem', color:'var(--muted)', fontSize:'.7rem', fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'.15em', animation:'bounce 2s infinite' }}>
          SCROLL ↓
        </div>
      </section>

      <div className="gradient-line"/>

      {/* ── ABOUT ─────────────────────────────── */}
      <section id="about" style={{ maxWidth:'1200px', margin:'0 auto', padding:'6rem 2.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
          {/* 왼쪽 이미지 플레이스홀더 */}
          <div style={{ position:'relative', aspectRatio:'4/3', background:'var(--surface)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'6rem', color:'rgba(0,212,255,.08)', letterSpacing:'.1em' }}>CAGI</div>
            <div style={{ position:'absolute', bottom:'1.5rem', left:'1.5rem', background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.18)', borderRadius:'8px', padding:'.75rem 1rem' }}>
              <div style={{ fontSize:'.65rem', color:'var(--accent)', letterSpacing:'.15em', textTransform:'uppercase' }}>Founded · 1991</div>
              <div style={{ fontSize:'.9rem', color:'#fff', fontWeight:600 }}>단국대학교 중앙동아리</div>
            </div>
          </div>
          {/* 오른쪽 텍스트 */}
          <div>
            <p className="section-label">About CAGI</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.5rem,5vw,3.8rem)', lineHeight:1, color:'#fff', marginBottom:'.5rem' }}>창의성의<br/>무한한 가능성</h2>
            <p style={{ color:'var(--muted)', lineHeight:1.9, margin:'1rem 0 1.5rem' }}>
              1991년에 창설되어 30년 넘게 이어져 온 단국대학교 유일무이의 컴퓨터그래픽 동아리입니다.
              Blender 3D, Unity 게임 엔진, 프로그래밍 등 다양한 분야의 스터디를 통해 서로의 성장을 이끌어가고 있습니다.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
              {['Blender 3D','Unity','프로그래밍','게임 개발','모션 그래픽','디지털 아트','VR/AR','쉐이더'].map(t => (
                <span key={t} style={{ padding:'.3rem .8rem', background: t.length < 6 ? 'rgba(0,212,255,.08)' : 'var(--surface2)', border:`1px solid ${t.length < 6 ? 'rgba(0,212,255,.25)' : 'rgba(255,255,255,.07)'}`, borderRadius:'100px', fontSize:'.78rem', color: t.length < 6 ? 'var(--accent)' : 'var(--muted)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-line"/>

      {/* ── PORTFOLIO PREVIEW ─────────────────── */}
      <section id="portfolio" style={{ maxWidth:'1200px', margin:'0 auto', padding:'6rem 2.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'2.5rem' }}>
          <div>
            <p className="section-label">Portfolio</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.5rem,5vw,3.8rem)', lineHeight:1, color:'#fff' }}>작품 갤러리</h2>
            <p style={{ color:'var(--muted)', fontSize:'.95rem', marginTop:'.4rem' }}>CAGI 멤버들이 만들어낸 창의적인 작품들</p>
          </div>
          <Link to="/portfolio" style={ghostBtn}>전체 보기 →</Link>
        </div>

        {portfolios.length === 0
          ? <PortfolioPlaceholders />
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.5rem' }}>
              {portfolios.map(p => <PortfolioCard key={p.id} p={p}/>)}
            </div>
          )
        }
      </section>

      <div className="gradient-line"/>

      {/* ── STUDIES ───────────────────────────── */}
      <section id="studies" style={{ maxWidth:'1200px', margin:'0 auto', padding:'6rem 2.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'2.5rem' }}>
          <div>
            <p className="section-label">Studies</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.5rem,5vw,3.8rem)', lineHeight:1, color:'#fff' }}>스터디 모집</h2>
            <p style={{ color:'var(--muted)', fontSize:'.95rem', marginTop:'.4rem' }}>현재 모집 중인 스터디에 참여해보세요</p>
          </div>
          <Link to="/studies" style={ghostBtn}>전체 보기 →</Link>
        </div>

        {studies.length === 0
          ? <StudyPlaceholders />
          : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {studies.map(s => <StudyRow key={s.id} s={s}/>)}
            </div>
          )
        }
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer style={{ background:'var(--surface)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'3rem 2.5rem', textAlign:'center' }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', letterSpacing:'.15em', color:'#fff', marginBottom:'.5rem' }}>CAGI</div>
        <div style={{ fontSize:'.8rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'.08em' }}>Computer Art &amp; Graphic Institute · 단국대학교</div>
        <div style={{ display:'flex', gap:'2rem', justifyContent:'center', margin:'1.5rem 0', flexWrap:'wrap' }}>
          {['소개','포트폴리오','스터디','개인정보처리방침'].map(l => (
            <a key={l} href="#" style={{ color:'var(--muted)', fontSize:'.8rem', textDecoration:'none', fontFamily:"'Space Grotesk',sans-serif" }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:'.72rem', color:'rgba(107,114,128,.5)', fontFamily:"'Space Grotesk',sans-serif" }}>© 2024 CAGI. All rights reserved. Est. 1991.</div>
      </footer>
    </main>
  )
}

// ── 서브 컴포넌트 ────────────────────────────

const COLORS = ['#FF6B35','#7B61FF','#00D4FF','#FF6B6B','#4CAF50','#FFD700']

function PortfolioCard({ p }: { p: any }) {
  const color = COLORS[Math.floor(Math.random()*COLORS.length)]
  return (
    <Link to={`/portfolio/${p.id}`} style={{ textDecoration:'none' }}>
      <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', transition:'all .3s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(0,212,255,.3)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)' }}
      >
        <div style={{ aspectRatio:'16/9', background:'var(--surface2)', position:'relative', overflow:'hidden' }}>
          {p.thumbnail_url
            ? <img src={p.thumbnail_url} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'3rem', color:`${color}20`, background:`linear-gradient(135deg,${color}18 0%,transparent 60%)` }}>{p.category ?? '3D'}</div>
          }
        </div>
        <div style={{ padding:'1.2rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.4rem' }}>
            <span style={{ fontSize:'.72rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif" }}>by {p.profiles?.name ?? '익명'}</span>
            <span style={{ fontSize:'.72rem', color:'var(--muted)' }}>♡ {p.like_count}</span>
          </div>
          <div style={{ fontSize:'.95rem', fontWeight:500, color:'#fff', marginBottom:'.4rem' }}>{p.title}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem' }}>
            {(p.tools_used ?? []).slice(0,3).map((t: string) => (
              <span key={t} style={{ padding:'.15rem .5rem', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'4px', fontSize:'.68rem', color:'var(--muted)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

function StudyRow({ s }: { s: any }) {
  const icons: Record<string, string> = { Blender:'🧊', Unity:'🎮', 프로그래밍:'💻', 디자인:'🎨', 기타:'✨' }
  const closed = s.current_count >= s.max_members
  return (
    <Link to={`/studies`} style={{ textDecoration:'none' }}>
      <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.8rem 2rem', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'1.5rem', alignItems:'center', transition:'all .2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(0,212,255,.2)'; (e.currentTarget as HTMLElement).style.transform='translateX(4px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform='' }}
      >
        <div style={{ width:52, height:52, background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>{icons[s.category] ?? '📚'}</div>
        <div>
          <div style={{ fontSize:'1rem', fontWeight:500, color:'#fff', marginBottom:'.2rem' }}>{s.title}</div>
          <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>{s.schedule} · {s.location}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.4rem' }}>
          <span style={{ padding:'.2rem .7rem', borderRadius:'100px', fontSize:'.7rem', fontFamily:"'Space Grotesk',sans-serif", fontWeight:500, background: closed ? 'rgba(255,107,107,.1)' : 'rgba(0,212,255,.1)', color: closed ? 'var(--accent3)' : 'var(--accent)', border: `1px solid ${closed ? 'rgba(255,107,107,.2)' : 'rgba(0,212,255,.2)'}` }}>
            {closed ? '마감' : '모집중'}
          </span>
          <span style={{ fontSize:'.78rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif" }}>{s.current_count}/{s.max_members}명</span>
        </div>
      </div>
    </Link>
  )
}

// 데이터 없을 때 플레이스홀더
function PortfolioPlaceholders() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.5rem' }}>
      {COLORS.map((c, i) => (
        <div key={i} style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ aspectRatio:'16/9', background:`linear-gradient(135deg,${c}12 0%, transparent 60%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'3rem', color:`${c}30` }}>CAGI</div>
          <div style={{ padding:'1.2rem' }}>
            <div style={{ fontSize:'.95rem', fontWeight:500, color:'rgba(255,255,255,0.5)', marginBottom:'.4rem' }}>작품 {i+1}</div>
            <div style={{ fontSize:'.78rem', color:'var(--muted)' }}>회원 포트폴리오가 여기에 표시됩니다</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StudyPlaceholders() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {['Blender 기초 스터디','Unity 게임 개발','웹 프론트엔드 스터디'].map((title, i) => (
        <div key={i} style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.8rem 2rem', display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <div style={{ width:52, height:52, background:'var(--surface2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', opacity:.5 }}>📚</div>
          <div>
            <div style={{ fontSize:'1rem', color:'rgba(255,255,255,0.5)', marginBottom:'.2rem' }}>{title}</div>
            <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>스터디 정보가 곧 업데이트됩니다</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const primaryBtn: React.CSSProperties = { padding:'.85rem 2rem', background:'var(--accent)', color:'var(--bg)', border:'none', borderRadius:'8px', fontFamily:"'Space Grotesk',sans-serif", fontSize:'.9rem', fontWeight:600, cursor:'pointer', letterSpacing:'.05em', textDecoration:'none', display:'inline-block', transition:'all .2s' }
const ghostBtn:   React.CSSProperties = { padding:'.85rem 2rem', background:'transparent', color:'var(--text)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', fontFamily:"'Space Grotesk',sans-serif", fontSize:'.9rem', cursor:'pointer', letterSpacing:'.05em', textDecoration:'none', display:'inline-block', transition:'all .2s' }
