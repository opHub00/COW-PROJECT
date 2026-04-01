import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', major:'', grade:1, bio:'', status:'재학생' as '재학생'|'졸업생' })
  const [myPortfolios, setMyPortfolios] = useState<any[]>([])
  const [myStudies, setMyStudies]       = useState<any[]>([])
  const [avatarFile, setAvatarFile]     = useState<File|null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    if (!profile) return
    setForm({ name: profile.name, major: profile.major, grade: profile.grade ?? 1, bio: profile.bio ?? '', status: profile.status })
    if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
    supabase.from('portfolios').select('*').eq('user_id', user?.id ?? '').order('created_at', { ascending: false }).then(({ data }) => setMyPortfolios(data ?? []))
    supabase.from('study_applicants').select('*, studies(title, category, status)').eq('user_id', user?.id ?? '').order('applied_at', { ascending: false }).then(({ data }) => setMyStudies(data ?? []))
  }, [profile, user])

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const save = async () => {
    if (!user) return
    setSaving(true)
    let avatar_url = profile?.avatar_url ?? ''
    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `${user.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      avatar_url = data.publicUrl
    }
    const { error } = await supabase.from('profiles').update({ ...form, avatar_url }).eq('id', user.id)
    setSaving(false)
    if (error) { toast.error('저장 중 오류가 발생했습니다'); return }
    await refreshProfile()
    toast.success('프로필이 저장되었습니다!')
  }

  const deletePortfolio = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('portfolios').delete().eq('id', id)
    setMyPortfolios(prev => prev.filter(p => p.id !== id))
    toast.success('삭제되었습니다')
  }

  return (
    <main style={{ paddingTop:'6rem', minHeight:'100vh' }}>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'3rem 2.5rem' }}>
        <p className="section-label">My Page</p>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'3rem', color:'#fff', lineHeight:1, marginBottom:'2rem' }}>프로필</h1>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.8fr', gap:'2rem', alignItems:'start' }}>
          {/* 왼쪽: 프로필 카드 */}
          <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'2rem', textAlign:'center' }}>
            <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
              <div onClick={() => document.getElementById('avatarInput')?.click()} style={{ width:80, height:80, borderRadius:'50%', overflow:'hidden', cursor:'pointer', border:'2px solid rgba(0,212,255,.3)', margin:'0 auto' }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ width:'100%', height:'100%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', color:'var(--bg)' }}>{profile?.name?.[0] ?? 'U'}</div>
                }
              </div>
              <div style={{ position:'absolute', bottom:0, right:0, width:24, height:24, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', cursor:'pointer' }} onClick={() => document.getElementById('avatarInput')?.click()}>✏️</div>
            </div>
            <input id="avatarInput" type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatar}/>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.1rem', fontWeight:600, color:'#fff', marginBottom:'.2rem' }}>{profile?.name}</div>
            <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'1rem' }}>{profile?.major} {profile?.grade}학년 · {profile?.student_id}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'.4rem', fontSize:'.78rem', color:'var(--muted)' }}>
              <div>🎂 {profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('ko-KR') : '-'}</div>
              <div>📊 {profile?.status} · {profile?.age}세</div>
              <div>🛡 {profile?.role === 'admin' ? '관리자' : profile?.role === 'superadmin' ? '최고관리자' : '일반 회원'}</div>
            </div>
            <div style={{ marginTop:'1.5rem', padding:'.8rem', background:'rgba(0,212,255,.05)', borderRadius:'8px', border:'1px solid rgba(0,212,255,.1)' }}>
              <div style={{ fontSize:'.72rem', color:'var(--accent)', letterSpacing:'.1em', fontFamily:"'Space Grotesk',sans-serif", marginBottom:'.3rem' }}>ACTIVITY</div>
              <div style={{ display:'flex', justifyContent:'space-around' }}>
                <div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:'#fff' }}>{myPortfolios.length}</div><div style={{ fontSize:'.65rem', color:'var(--muted)' }}>작품</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:'#fff' }}>{myStudies.length}</div><div style={{ fontSize:'.65rem', color:'var(--muted)' }}>스터디</div></div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 편집 */}
          <div>
            <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' }}>
              <h3 style={{ fontSize:'1rem', color:'#fff', marginBottom:'1.2rem' }}>기본 정보 수정</h3>
              {[['이름','name','text','홍길동'],['전공','major','text','컴퓨터공학과'],['자기소개','bio','text','']].map(([l,k,t,ph]) => (
                <div key={k} style={{ marginBottom:'.9rem' }}>
                  <label style={lblStyle}>{l}</label>
                  {k === 'bio'
                    ? <textarea value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} placeholder="간단한 자기소개" style={{ width:'100%', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'.65rem .9rem', color:'var(--text)', fontSize:'.85rem', fontFamily:"'Noto Sans KR',sans-serif", resize:'vertical', minHeight:'70px', outline:'none' }}/>
                    : <input className="input-base" type={t} value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} placeholder={ph}/>
                  }
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.8rem', marginBottom:'.9rem' }}>
                <div>
                  <label style={lblStyle}>학년</label>
                  <select className="input-base" value={form.grade} onChange={e => setForm(f => ({...f, grade: parseInt(e.target.value)}))}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}학년</option>)}
                  </select>
                </div>
                <div>
                  <label style={lblStyle}>상태</label>
                  <select className="input-base" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as any}))}>
                    <option value="재학생">재학생</option>
                    <option value="졸업생">졸업생</option>
                  </select>
                </div>
              </div>
              <button onClick={save} disabled={saving} style={saveBtnStyle}>{saving ? '저장 중...' : '변경사항 저장'}</button>
            </div>

            {/* 내 포트폴리오 */}
            <div style={{ background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h3 style={{ fontSize:'1rem', color:'#fff' }}>내 작품</h3>
                <button onClick={() => navigate('/upload')} style={{ padding:'.3rem .7rem', background:'rgba(0,212,255,.1)', border:'1px solid rgba(0,212,255,.2)', borderRadius:'6px', color:'var(--accent)', fontSize:'.75rem', cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}>+ 추가</button>
              </div>
              {myPortfolios.length === 0
                ? <p style={{ color:'var(--muted)', fontSize:'.85rem' }}>아직 올린 작품이 없습니다.</p>
                : myPortfolios.map(p => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.65rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize:'.88rem', color:'#fff', fontWeight:500 }}>{p.title}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)' }}>{p.category} · ♡{p.like_count} · 조회 {p.view_count}</div>
                    </div>
                    <button onClick={() => deletePortfolio(p.id)} style={{ padding:'.25rem .6rem', background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:'6px', color:'var(--accent3)', fontSize:'.7rem', cursor:'pointer' }}>삭제</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const lblStyle: React.CSSProperties = { display:'block', fontSize:'.73rem', color:'var(--muted)', marginBottom:'.35rem', letterSpacing:'.06em', fontFamily:"'Space Grotesk',sans-serif" }
const saveBtnStyle: React.CSSProperties = { width:'100%', padding:'.85rem', background:'var(--accent)', color:'var(--bg)', border:'none', borderRadius:'8px', fontFamily:"'Space Grotesk',sans-serif", fontSize:'.9rem', fontWeight:600, cursor:'pointer', letterSpacing:'.05em' }
