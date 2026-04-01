import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type AdminTab = 'dashboard' | 'hero' | 'studies' | 'members' | 'portfolios' | 'transfer'

export default function AdminPage() {
  const { profile, user } = useAuth()
  const [tab, setTab] = useState<AdminTab>('dashboard')

  return (
    <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2.5rem' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <p className="section-label">Admin Panel</p>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', color: '#fff', lineHeight: 1 }}>관리자 패널</h1>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: '.3rem' }}>안녕하세요, {profile?.name}님 · {profile?.role === 'superadmin' ? '최고 관리자' : '관리자'}</p>
          </div>
          <div style={{ padding: '.5rem 1rem', background: 'rgba(123,97,255,.1)', border: '1px solid rgba(123,97,255,.2)', borderRadius: '8px', fontSize: '.75rem', color: 'rgba(123,97,255,.9)', fontFamily: "'Space Grotesk',sans-serif" }}>
            🛡 {profile?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
          {/* 사이드바 */}
          <nav style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem', height: 'fit-content' }}>
            {([
              { id: 'dashboard', label: '📊 대시보드' },
              { id: 'hero',      label: '🎬 메인 화면 설정' },
              { id: 'studies',   label: '📚 스터디 관리' },
              { id: 'members',   label: '👥 회원 관리' },
              { id: 'portfolios',label: '🎨 포트폴리오 관리' },
              { id: 'transfer',  label: '🔑 관리자 권한 양도' },
            ] as { id: AdminTab; label: string }[]).map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '.7rem 1rem', borderRadius: '8px', border: 'none',
                  background: tab === item.id ? 'rgba(0,212,255,.1)' : 'transparent',
                  color: tab === item.id ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: '.85rem',
                  cursor: 'pointer', marginBottom: '.25rem',
                  borderLeft: tab === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all .15s',
                }}
              >{item.label}</button>
            ))}
          </nav>

          {/* 메인 콘텐츠 */}
          <div>
            {tab === 'dashboard'  && <Dashboard />}
            {tab === 'hero'       && <HeroSettings />}
            {tab === 'studies'    && <StudyManager />}
            {tab === 'members'    && <MemberManager />}
            {tab === 'portfolios' && <PortfolioManager />}
            {tab === 'transfer'   && <TransferAdmin currentAdminId={user?.id ?? ''} currentAdminName={profile?.name ?? ''} />}
          </div>
        </div>
      </div>
    </main>
  )
}

// ── 대시보드 ─────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState({ members: 0, portfolios: 0, studies: 0, applicants: 0 })
  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('portfolios').select('id', { count: 'exact', head: true }),
      supabase.from('studies').select('id', { count: 'exact', head: true }),
      supabase.from('study_applicants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]).then(([m, p, s, a]) => {
      setStats({ members: m.count ?? 0, portfolios: p.count ?? 0, studies: s.count ?? 0, applicants: a.count ?? 0 })
    })
  }, [])
  const cards = [
    { label: '전체 회원', value: stats.members, icon: '👥', color: '#00D4FF' },
    { label: '포트폴리오', value: stats.portfolios, icon: '🎨', color: '#7B61FF' },
    { label: '스터디', value: stats.studies, icon: '📚', color: '#4CAF50' },
    { label: '대기 중 신청', value: stats.applicants, icon: '⏳', color: '#FF9800' },
  ]
  return (
    <div>
      <h2 style={h2Style}>개요</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 52, height: 52, background: `${c.color}15`, border: `1px solid ${c.color}30`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{c.icon}</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem', color: '#fff', lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>운영 체크리스트</h3>
        {['도메인 만료일 확인', '졸업생 계정 상태 업데이트', '종료된 스터디 처리', 'Storage 용량 확인', '관리자 권한 갱신 여부 확인'].map(item => (
          <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', cursor: 'pointer', padding: '.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '.85rem', color: 'var(--muted)' }}>
            <input type="checkbox" style={{ accentColor: 'var(--accent)', width: 'auto' }}/> {item}
          </label>
        ))}
      </div>
    </div>
  )
}

// ── 히어로 설정 ───────────────────────────────
function HeroSettings() {
  const { user } = useAuth()
  const [config, setConfig] = useState({ type: 'gradient', url: '', title: 'CAGI', subtitle: '컴퓨터그래픽 동아리', overlay_opacity: 0.5 })
  const [saving, setSaving] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key','hero_config').single().then(({ data }) => {
      if (data?.value) setConfig(data.value as any)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    let finalConfig = { ...config }

    if (mediaFile) {
      const ext  = mediaFile.name.split('.').pop()
      const path = `hero-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('hero-media').upload(path, mediaFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('hero-media').getPublicUrl(path)
        finalConfig.url  = data.publicUrl
        finalConfig.type = mediaFile.type.startsWith('video') ? 'video' : 'image'
      }
    }

    await supabase.from('site_settings').update({ value: finalConfig, updated_by: user?.id }).eq('key','hero_config')
    setSaving(false)
    toast.success('메인 화면 설정이 저장되었습니다!')
  }

  return (
    <div>
      <h2 style={h2Style}>메인 화면 설정</h2>
      <div style={cardStyle}>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
          방문자가 처음 보는 히어로 화면을 설정합니다. 이미지 또는 영상을 업로드하거나, 그라디언트 배경을 사용할 수 있습니다.
        </p>

        {/* 타입 선택 */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>배경 타입</label>
          <div style={{ display: 'flex', gap: '.6rem' }}>
            {(['gradient','image','video'] as const).map(t => (
              <button key={t} onClick={() => setConfig(c => ({...c, type: t}))} style={{ flex: 1, padding: '.6rem', background: config.type === t ? 'rgba(0,212,255,.1)' : 'var(--surface2)', border: `1px solid ${config.type === t ? 'rgba(0,212,255,.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', color: config.type === t ? 'var(--accent)' : 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif", fontSize: '.82rem', cursor: 'pointer' }}>
                {t === 'gradient' ? '🌈 그라디언트' : t === 'image' ? '🖼 이미지' : '🎬 영상'}
              </button>
            ))}
          </div>
        </div>

        {/* 파일 업로드 */}
        {(config.type === 'image' || config.type === 'video') && (
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>{config.type === 'image' ? '이미지' : '영상'} 파일</label>
            <div onClick={() => document.getElementById('heroMedia')?.click()} style={{ padding: '2rem', background: 'var(--surface2)', border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
              {mediaFile ? `선택됨: ${mediaFile.name}` : '클릭하여 파일 선택'}
              {config.url && !mediaFile && <div style={{ marginTop: '.5rem', fontSize: '.75rem', color: 'var(--accent)' }}>현재 파일 있음 (교체하려면 새 파일 선택)</div>}
            </div>
            <input id="heroMedia" type="file" accept={config.type === 'image' ? 'image/*' : 'video/*'} style={{ display: 'none' }} onChange={e => setMediaFile(e.target.files?.[0] ?? null)}/>
          </div>
        )}

        {/* 오버레이 투명도 */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>어두운 오버레이 ({Math.round(config.overlay_opacity * 100)}%)</label>
          <input type="range" min="0" max="1" step="0.05" value={config.overlay_opacity} onChange={e => setConfig(c => ({...c, overlay_opacity: parseFloat(e.target.value)}))} style={{ width: '100%', accentColor: 'var(--accent)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif", marginTop: '.25rem' }}>
            <span>밝음</span><span>어두움</span>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={primaryBtnStyle(saving)}>
          {saving ? '저장 중...' : '설정 저장하기'}
        </button>
      </div>
    </div>
  )
}

// ── 스터디 관리 ───────────────────────────────
function StudyManager() {
  const { user } = useAuth()
  const [studies, setStudies] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [applicants, setApplicants] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', category:'Blender', schedule:'', location:'', duration:'', max_members:10, apply_deadline:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchStudies() }, [])

  const fetchStudies = async () => {
    const { data } = await supabase.from('studies').select('*').order('created_at', { ascending: false })
    setStudies(data ?? [])
  }

  const fetchApplicants = async (studyId: string) => {
    const { data } = await supabase.from('study_applicants').select('*, profiles(name, student_id, major, grade)').eq('study_id', studyId).order('applied_at')
    setApplicants(data ?? [])
  }

  const selectStudy = (s: any) => { setSelected(s); fetchApplicants(s.id); setCreating(false) }

  const updateApplicant = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('study_applicants').update({ status }).eq('id', id)
    setApplicants(prev => prev.map(a => a.id === id ? {...a, status} : a))
    toast.success(status === 'approved' ? '승인되었습니다' : '거절되었습니다')
  }

  const createStudy = async () => {
    setSaving(true)
    const { error } = await supabase.from('studies').insert({ ...form, created_by: user?.id, status: 'open' })
    setSaving(false)
    if (error) { toast.error('생성 중 오류가 발생했습니다'); return }
    toast.success('스터디가 생성되었습니다!')
    setCreating(false)
    fetchStudies()
  }

  const closeStudy = async (id: string) => {
    await supabase.from('studies').update({ status: 'ended' }).eq('id', id)
    toast.success('스터디가 종료되었습니다')
    fetchStudies()
    setSelected(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={h2Style}>스터디 관리</h2>
        <button onClick={() => { setCreating(true); setSelected(null) }} style={primaryBtnStyle(false)}>+ 새 스터디</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* 스터디 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {studies.map(s => (
            <div key={s.id} onClick={() => selectStudy(s)} style={{ padding: '1rem', background: selected?.id === s.id ? 'rgba(0,212,255,.08)' : 'var(--surface)', border: `1px solid ${selected?.id === s.id ? 'rgba(0,212,255,.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '.9rem', fontWeight: 500, color: '#fff', marginBottom: '.2rem' }}>{s.title}</div>
                <span style={{ padding: '.15rem .5rem', background: s.status === 'open' ? 'rgba(0,212,255,.1)' : 'rgba(107,114,128,.1)', borderRadius: '100px', fontSize: '.65rem', color: s.status === 'open' ? 'var(--accent)' : 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)', fontFamily: "'Space Grotesk',sans-serif", whiteSpace: 'nowrap' }}>
                  {s.status === 'open' ? '모집중' : s.status === 'ongoing' ? '진행중' : '종료'}
                </span>
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{s.category} · {s.current_count}/{s.max_members}명</div>
            </div>
          ))}
        </div>

        {/* 상세 / 신청자 / 생성 폼 */}
        <div>
          {creating && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.2rem' }}>새 스터디 생성</h3>
              {[['title','제목'],['schedule','일정'],['location','장소'],['duration','기간']].map(([k,l]) => (
                <div key={k} style={{ marginBottom: '.8rem' }}>
                  <label style={labelStyle}>{l}</label>
                  <input className="input-base" value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} placeholder={l}/>
                </div>
              ))}
              <div style={{ marginBottom: '.8rem' }}>
                <label style={labelStyle}>카테고리</label>
                <select className="input-base" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                  {['Blender','Unity','프로그래밍','디자인','기타'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '.8rem' }}>
                <label style={labelStyle}>최대 인원</label>
                <input className="input-base" type="number" value={form.max_members} onChange={e => setForm(f => ({...f, max_members: parseInt(e.target.value)}))}/>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>신청 마감일</label>
                <input className="input-base" type="datetime-local" value={form.apply_deadline} onChange={e => setForm(f => ({...f, apply_deadline: e.target.value}))}/>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>설명</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{ width:'100%', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'.7rem .9rem', color:'var(--text)', fontSize:'.85rem', fontFamily:"'Noto Sans KR',sans-serif", resize:'vertical', minHeight:'70px', outline:'none' }}/>
              </div>
              <button onClick={createStudy} disabled={saving} style={primaryBtnStyle(saving)}>{saving ? '저장 중...' : '스터디 생성'}</button>
            </div>
          )}

          {selected && !creating && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#fff' }}>{selected.title}</h3>
                {selected.status === 'open' && (
                  <button onClick={() => closeStudy(selected.id)} style={{ padding: '.3rem .7rem', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', borderRadius: '6px', color: 'var(--accent3)', fontSize: '.75rem', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}>스터디 종료</button>
                )}
              </div>
              <h4 style={{ fontSize: '.82rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: '1rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>신청자 목록 ({applicants.length}명)</h4>
              {applicants.length === 0
                ? <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>신청자가 없습니다</p>
                : applicants.map(a => (
                  <div key={a.id} style={{ padding: '.8rem', background: 'var(--surface2)', borderRadius: '8px', marginBottom: '.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '.88rem', color: '#fff', fontWeight: 500 }}>{a.profiles?.name} <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif" }}>({a.profiles?.student_id})</span></div>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{a.profiles?.major} {a.profiles?.grade}학년</div>
                        {a.motivation && <div style={{ fontSize: '.78rem', color: 'rgba(232,234,240,.6)', marginTop: '.3rem', lineHeight: 1.5 }}>"{a.motivation}"</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        {a.status === 'pending' && <>
                          <button onClick={() => updateApplicant(a.id, 'approved')} style={{ padding: '.25rem .6rem', background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', borderRadius: '6px', color: 'var(--accent)', fontSize: '.72rem', cursor: 'pointer' }}>승인</button>
                          <button onClick={() => updateApplicant(a.id, 'rejected')} style={{ padding: '.25rem .6rem', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', borderRadius: '6px', color: 'var(--accent3)', fontSize: '.72rem', cursor: 'pointer' }}>거절</button>
                        </>}
                        {a.status !== 'pending' && <span style={{ fontSize: '.72rem', color: a.status === 'approved' ? 'var(--accent)' : 'var(--accent3)', fontFamily: "'Space Grotesk',sans-serif" }}>{a.status === 'approved' ? '✓ 승인' : '✕ 거절'}</span>}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 회원 관리 ─────────────────────────────────
function MemberManager() {
  const [members, setMembers] = useState<any[]>([])
  const [filter, setFilter]   = useState<string>('all')

  useEffect(() => {
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => setMembers(data ?? []))
  }, [filter])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={h2Style}>회원 관리</h2>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          {['all','재학생','졸업생'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '.35rem .8rem', background: filter === f ? 'var(--accent)' : 'var(--surface2)', color: filter === f ? 'var(--bg)' : 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '100px', fontSize: '.75rem', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}>
              {f === 'all' ? '전체' : f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['이름','학번','전공','학년','상태','권한'].map(h => (
                <th key={h} style={{ padding: '.8rem 1rem', textAlign: 'left', fontSize: '.72rem', color: 'var(--muted)', fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: i < members.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <td style={{ padding: '.85rem 1rem', color: '#fff', fontSize: '.88rem', fontWeight: 500 }}>{m.name}</td>
                <td style={{ padding: '.85rem 1rem', color: 'var(--muted)', fontSize: '.82rem', fontFamily: "'Space Grotesk',sans-serif" }}>{m.student_id}</td>
                <td style={{ padding: '.85rem 1rem', color: 'var(--muted)', fontSize: '.82rem' }}>{m.major}</td>
                <td style={{ padding: '.85rem 1rem', color: 'var(--muted)', fontSize: '.82rem' }}>{m.grade}학년</td>
                <td style={{ padding: '.85rem 1rem' }}>
                  <span style={{ padding: '.15rem .5rem', background: m.status === '재학생' ? 'rgba(0,212,255,.1)' : 'rgba(107,114,128,.1)', borderRadius: '100px', fontSize: '.68rem', color: m.status === '재학생' ? 'var(--accent)' : 'var(--muted)', border: `1px solid ${m.status === '재학생' ? 'rgba(0,212,255,.2)' : 'rgba(255,255,255,0.07)'}` }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ padding: '.85rem 1rem' }}>
                  <span style={{ padding: '.15rem .5rem', background: m.role !== 'member' ? 'rgba(123,97,255,.1)' : 'transparent', borderRadius: '100px', fontSize: '.68rem', color: m.role !== 'member' ? 'rgba(123,97,255,.9)' : 'var(--muted)', border: m.role !== 'member' ? '1px solid rgba(123,97,255,.2)' : '1px solid transparent' }}>
                    {m.role === 'superadmin' ? '최고관리자' : m.role === 'admin' ? '관리자' : '일반'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>회원이 없습니다</div>}
      </div>
    </div>
  )
}

// ── 포트폴리오 관리 ───────────────────────────
function PortfolioManager() {
  const [portfolios, setPortfolios] = useState<any[]>([])
  useEffect(() => {
    supabase.from('portfolios').select('*, profiles(name)').order('created_at', { ascending: false }).then(({ data }) => setPortfolios(data ?? []))
  }, [])

  const togglePublic = async (id: string, current: boolean) => {
    await supabase.from('portfolios').update({ is_public: !current }).eq('id', id)
    setPortfolios(prev => prev.map(p => p.id === id ? {...p, is_public: !current} : p))
    toast.success(!current ? '공개로 변경되었습니다' : '비공개로 변경되었습니다')
  }

  const deletePortfolio = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('portfolios').delete().eq('id', id)
    setPortfolios(prev => prev.filter(p => p.id !== id))
    toast.success('삭제되었습니다')
  }

  return (
    <div>
      <h2 style={h2Style}>포트폴리오 관리</h2>
      <div style={cardStyle}>
        {portfolios.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.8rem 0', borderBottom: i < portfolios.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.9rem', color: '#fff', fontWeight: 500 }}>{p.title}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>by {p.profiles?.name} · {p.category} · 조회 {p.view_count}</div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
              <button onClick={() => togglePublic(p.id, p.is_public)} style={{ padding: '.3rem .7rem', background: p.is_public ? 'rgba(0,212,255,.1)' : 'rgba(107,114,128,.1)', border: `1px solid ${p.is_public ? 'rgba(0,212,255,.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '6px', color: p.is_public ? 'var(--accent)' : 'var(--muted)', fontSize: '.72rem', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}>
                {p.is_public ? '공개' : '비공개'}
              </button>
              <button onClick={() => deletePortfolio(p.id)} style={{ padding: '.3rem .7rem', background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.2)', borderRadius: '6px', color: 'var(--accent3)', fontSize: '.72rem', cursor: 'pointer' }}>삭제</button>
            </div>
          </div>
        ))}
        {portfolios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>포트폴리오가 없습니다</p>}
      </div>
    </div>
  )
}

// ── 관리자 권한 양도 ──────────────────────────
function TransferAdmin({ currentAdminId, currentAdminName }: { currentAdminId: string; currentAdminName: string }) {
  const [members, setMembers]     = useState<any[]>([])
  const [selected, setSelected]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('id, name, student_id, major').neq('id', currentAdminId).eq('role', 'member').then(({ data }) => setMembers(data ?? []))
  }, [currentAdminId])

  const doTransfer = async () => {
    if (confirm !== '관리자권한양도') { toast.error('"관리자권한양도" 를 정확히 입력해주세요'); return }
    if (!selected) { toast.error('새 관리자를 선택해주세요'); return }
    setLoading(true)
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', selected)
    await supabase.from('profiles').update({ role: 'member' }).eq('id', currentAdminId)
    toast.success('관리자 권한이 양도되었습니다. 다시 로그인해주세요.')
    setLoading(false)
  }

  return (
    <div>
      <h2 style={h2Style}>관리자 권한 양도</h2>
      <div style={cardStyle}>
        <div style={{ padding: '1rem', background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '.85rem', color: 'var(--accent3)', fontWeight: 500, marginBottom: '.3rem' }}>⚠️ 중요 안내</div>
          <p style={{ fontSize: '.82rem', color: 'rgba(232,234,240,.7)', lineHeight: 1.7 }}>
            권한을 양도하면 현재 계정({currentAdminName})은 일반 회원으로 변경됩니다.
            매년 새 임원에게 권한을 이전하세요.
          </p>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>새 관리자 선택</label>
          <select className="input-base" value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">회원을 선택해주세요</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.student_id}) - {m.major}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>확인 문구 입력: <span style={{ color: 'var(--accent3)' }}>관리자권한양도</span></label>
          <input className="input-base" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="관리자권한양도"/>
        </div>

        <button onClick={doTransfer} disabled={loading || !selected || confirm !== '관리자권한양도'} style={{ ...primaryBtnStyle(loading), background: confirm === '관리자권한양도' && selected ? 'var(--accent3)' : 'rgba(255,107,107,.3)', cursor: loading || !selected || confirm !== '관리자권한양도' ? 'not-allowed' : 'pointer' }}>
          {loading ? '처리 중...' : '관리자 권한 양도'}
        </button>
      </div>
    </div>
  )
}

// ── 스타일 헬퍼 ──────────────────────────────
const h2Style: React.CSSProperties = { fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.8rem', color: '#fff', letterSpacing: '.03em', marginBottom: '1.5rem' }
const cardStyle: React.CSSProperties = { background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.73rem', color: 'var(--muted)', marginBottom: '.35rem', letterSpacing: '.06em', fontFamily: "'Space Grotesk',sans-serif" }
const primaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '.85rem', background: disabled ? 'rgba(0,212,255,.5)' : 'var(--accent)',
  color: 'var(--bg)', border: 'none', borderRadius: '8px',
  fontFamily: "'Space Grotesk',sans-serif", fontSize: '.9rem', fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: '.05em',
})
