import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const ICONS: Record<string, string> = { Blender:'🧊', Unity:'🎮', 프로그래밍:'💻', 디자인:'🎨', 기타:'✨' }

export default function StudiesPage() {
  const { user } = useAuth()
  const [studies, setStudies]       = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<any>(null)
  const [motivation, setMotivation] = useState('')
  const [applying, setApplying]     = useState(false)
  const [myApplied, setMyApplied]   = useState<string[]>([])

  useEffect(() => {
    supabase.from('studies').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setStudies(data ?? [])
      setLoading(false)
    })
    if (user) {
      supabase.from('study_applicants').select('study_id').eq('user_id', user.id).then(({ data }) => {
        setMyApplied((data ?? []).map((d: any) => d.study_id))
      })
    }
  }, [user])

  const handleApply = async () => {
    if (!user) { toast.error('로그인이 필요합니다'); return }
    if (!selected) return
    if (selected.current_count >= selected.max_members) { toast.error('모집이 마감된 스터디입니다'); return }
    setApplying(true)
    const { error } = await supabase.from('study_applicants').insert({
      study_id: selected.id, user_id: user.id, motivation,
    })
    setApplying(false)
    if (error) {
      if (error.code === '23505') toast.error('이미 신청한 스터디입니다')
      else toast.error('신청 중 오류가 발생했습니다')
      return
    }
    toast.success('스터디 신청이 완료되었습니다!')
    setMyApplied(prev => [...prev, selected.id])
    setSelected(null); setMotivation('')
    // 카운트 갱신
    setStudies(prev => prev.map(s => s.id === selected.id ? { ...s, current_count: s.current_count + 1 } : s))
  }

  return (
    <>
      <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2.5rem' }}>
          <p className="section-label">Studies</p>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,3.5rem)', color: '#fff', lineHeight: 1, marginBottom: '.5rem' }}>스터디 모집</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.95rem', marginBottom: '2.5rem' }}>현재 모집 중인 스터디에 신청해보세요. 신청자 명단은 관리자만 확인할 수 있습니다.</p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 100, background: 'var(--surface)', borderRadius: 12, animation: 'pulse 1.5s infinite' }}/>)}
            </div>
          ) : studies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <p>현재 모집 중인 스터디가 없습니다.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {studies.map(s => {
                const closed   = s.current_count >= s.max_members || s.status !== 'open'
                const applied  = myApplied.includes(s.id)
                const pct      = Math.round((s.current_count / s.max_members) * 100)

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelected(s)}
                    style={{
                      background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px', padding: '1.8rem 2rem', cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(0,212,255,.2)'; (e.currentTarget as HTMLElement).style.transform='translateX(4px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform='' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, background: 'var(--surface2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{ICONS[s.category] ?? '📚'}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.2rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 500, color: '#fff' }}>{s.title}</span>
                          {applied && <span style={{ padding: '.1rem .5rem', background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', borderRadius: '100px', fontSize: '.65rem', color: 'var(--accent)', fontFamily: "'Space Grotesk',sans-serif" }}>신청완료</span>}
                        </div>
                        <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.6rem' }}>{s.schedule} · {s.location} · {s.duration}</div>
                        {/* 진행바 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                          <div style={{ flex: 1, height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: closed ? 'var(--accent3)' : 'var(--accent)', borderRadius: 2, transition: 'width .5s' }}/>
                          </div>
                          <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif", whiteSpace: 'nowrap' }}>{s.current_count}/{s.max_members}명</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.4rem' }}>
                        <span style={{ padding: '.2rem .7rem', borderRadius: '100px', fontSize: '.7rem', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, background: closed ? 'rgba(255,107,107,.1)' : 'rgba(0,212,255,.1)', color: closed ? 'var(--accent3)' : 'var(--accent)', border: `1px solid ${closed ? 'rgba(255,107,107,.2)' : 'rgba(0,212,255,.2)'}` }}>
                          {s.status === 'ended' ? '종료' : s.status === 'ongoing' ? '진행중' : closed ? '마감' : '모집중'}
                        </span>
                        {s.apply_deadline && <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif" }}>마감: {new Date(s.apply_deadline).toLocaleDateString('ko-KR')}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* 스터디 상세 / 신청 모달 */}
      {selected && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}
          style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', animation:'fadeIn .2s ease' }}
        >
          <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', width:'100%', maxWidth:'520px', maxHeight:'90vh', overflowY:'auto', animation:'fadeInUp .25s ease' }}>
            {/* 헤더 */}
            <div style={{ padding:'2rem', background:'var(--surface2)', borderBottom:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px 16px 0 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:'.7rem', color:'var(--accent)', letterSpacing:'.15em', textTransform:'uppercase', fontFamily:"'Space Grotesk',sans-serif", marginBottom:'.4rem' }}>{selected.category}</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', color:'#fff', letterSpacing:'.05em' }}>{selected.title}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'1.3rem', cursor:'pointer' }}>✕</button>
              </div>
            </div>
            <div style={{ padding:'2rem' }}>
              {/* 설명 */}
              {selected.description && <p style={{ color:'var(--muted)', fontSize:'.88rem', lineHeight:1.8, marginBottom:'1.5rem' }}>{selected.description}</p>}

              {/* 상세 정보 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.8rem', marginBottom:'1.5rem' }}>
                {[['일정', selected.schedule], ['장소', selected.location], ['기간', selected.duration], ['신청 마감', selected.apply_deadline ? new Date(selected.apply_deadline).toLocaleDateString('ko-KR') : '-']].map(([l,v]) => (
                  <div key={l} style={{ background:'var(--surface2)', borderRadius:'8px', padding:'.75rem 1rem' }}>
                    <div style={{ fontSize:'.68rem', color:'var(--muted)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'.2rem' }}>{l}</div>
                    <div style={{ fontSize:'.9rem', color:'#fff' }}>{v ?? '-'}</div>
                  </div>
                ))}
              </div>

              {/* 모집 현황 */}
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.4rem' }}>
                  <span style={{ fontSize:'.78rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif" }}>모집 현황</span>
                  <span style={{ fontSize:'.78rem', color:'var(--accent)', fontFamily:"'Space Grotesk',sans-serif" }}>{selected.current_count}/{selected.max_members}명</span>
                </div>
                <div style={{ width:'100%', height:4, background:'var(--surface2)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${Math.round(selected.current_count/selected.max_members*100)}%`, height:'100%', background:'var(--accent)', borderRadius:2, transition:'width .5s' }}/>
                </div>
              </div>

              {/* 신청 동기 */}
              {selected.status === 'open' && selected.current_count < selected.max_members && !myApplied.includes(selected.id) && (
                <>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', fontSize:'.73rem', color:'var(--muted)', marginBottom:'.35rem', letterSpacing:'.06em', fontFamily:"'Space Grotesk',sans-serif" }}>신청 동기 (선택)</label>
                    <textarea value={motivation} onChange={e => setMotivation(e.target.value)} placeholder="스터디에 참여하고 싶은 이유를 간단히 적어주세요." style={{ width:'100%', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'.7rem .9rem', color:'var(--text)', fontSize:'.85rem', fontFamily:"'Noto Sans KR',sans-serif", resize:'vertical', minHeight:'80px', outline:'none' }}/>
                  </div>
                  <button onClick={handleApply} disabled={applying} style={{ width:'100%', padding:'.9rem', background: applying ? 'rgba(0,212,255,.5)' : 'var(--accent)', color:'var(--bg)', border:'none', borderRadius:'8px', fontFamily:"'Space Grotesk',sans-serif", fontSize:'.9rem', fontWeight:600, cursor: applying ? 'not-allowed' : 'pointer', letterSpacing:'.05em' }}>
                    {applying ? '신청 중...' : '스터디 신청하기'}
                  </button>
                </>
              )}

              {myApplied.includes(selected.id) && (
                <div style={{ padding:'1rem', background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.2)', borderRadius:'8px', textAlign:'center', color:'var(--accent)', fontSize:'.9rem' }}>
                  ✓ 신청이 완료되었습니다. 관리자 검토 후 연락드립니다.
                </div>
              )}

              {(selected.current_count >= selected.max_members || selected.status !== 'open') && !myApplied.includes(selected.id) && (
                <div style={{ padding:'1rem', background:'rgba(255,107,107,.08)', border:'1px solid rgba(255,107,107,.2)', borderRadius:'8px', textAlign:'center', color:'var(--accent3)', fontSize:'.9rem' }}>
                  모집이 마감되었습니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
