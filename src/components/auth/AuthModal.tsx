import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

// ── 유효성 검사 스키마 ────────────────────────
const loginSchema = z.object({
  email:    z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '6자 이상 입력해주세요'),
})

const signupSchema = z.object({
  name:       z.string().min(2, '이름을 2자 이상 입력해주세요'),
  student_id: z.string().min(8, '학번을 정확히 입력해주세요'),
  major:      z.string().min(2, '전공을 입력해주세요'),
  grade:      z.number({ invalid_type_error: '학년을 선택해주세요' }).min(1).max(6),
  gender:     z.enum(['남','여','기타'], { required_error: '성별을 선택해주세요' }),
  birth_date: z.string().min(1, '생년월일을 입력해주세요'),
  status:     z.enum(['재학생','졸업생']),
  email:      z.string().email('올바른 이메일 형식이 아닙니다'),
  password:   z.string().min(8, '8자 이상 입력해주세요'),
  agree:      z.literal(true, { errorMap: () => ({ message: '이용약관에 동의해주세요' }) }),
})

type LoginData   = z.infer<typeof loginSchema>
type SignupData  = z.infer<typeof signupSchema>

interface Props {
  isOpen: boolean
  defaultTab: 'login' | 'signup'
  onClose: () => void
}

export default function AuthModal({ isOpen, defaultTab, onClose }: Props) {
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  // ── 로그인 폼 ────
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })

  const onLogin = async (data: LoginData) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    setLoading(false)
    if (error) { toast.error('이메일 또는 비밀번호가 올바르지 않습니다'); return }
    toast.success('로그인되었습니다!')
    onClose()
  }

  // ── 회원가입 폼 ────
  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { status: '재학생', gender: '남' },
  })

  const onSignup = async (data: SignupData) => {
    setLoading(true)
    const { error } = await signUp({
      email:      data.email,
      password:   data.password,
      name:       data.name,
      gender:     data.gender,
      birth_date: data.birth_date,
      major:      data.major,
      grade:      data.grade,
      student_id: data.student_id,
      status:     data.status,
    })
    setLoading(false)
    if (error) { toast.error(error.message ?? '회원가입 중 오류가 발생했습니다'); return }
    toast.success('가입 완료! 이메일을 확인해주세요.')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:'fixed', inset:0, zIndex:2000,
        background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1.5rem', animation:'fadeIn 0.2s ease',
      }}
    >
      <div style={{
        background:'var(--surface)',
        border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:'16px',
        width:'100%', maxWidth:'440px',
        maxHeight:'90vh', overflowY:'auto',
        animation:'fadeInUp 0.25s ease',
      }}>
        {/* 헤더 */}
        <div style={{ padding:'1.8rem 2rem 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', color:'#fff', letterSpacing:'0.05em' }}>
              {tab === 'login' ? '로그인' : '회원가입'}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--muted)', fontFamily:"'Space Grotesk',sans-serif" }}>CAGI Member Portal</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'1.3rem', cursor:'pointer', padding:'0.2rem' }}>✕</button>
        </div>

        <div style={{ padding:'1.5rem 2rem 2rem' }}>
          {/* 탭 */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', marginBottom:'1.5rem' }}>
            {(['login','signup'] as const).map((t, i) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background:'none', border:'none', padding:'0.5rem 0 0.75rem',
                color: tab === t ? 'var(--accent)' : 'var(--muted)',
                fontFamily:"'Space Grotesk',sans-serif", fontSize:'0.88rem', cursor:'pointer',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom:'-1px', marginRight:'1.5rem', transition:'all 0.2s',
              }}>
                {i === 0 ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {/* ── 로그인 폼 ── */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <Field label="이메일" error={loginForm.formState.errors.email?.message}>
                <input className="input-base" type="email" placeholder="example@dankook.ac.kr" {...loginForm.register('email')}/>
              </Field>
              <Field label="비밀번호" error={loginForm.formState.errors.password?.message}>
                <input className="input-base" type="password" placeholder="••••••••" {...loginForm.register('password')}/>
              </Field>
              <SubmitBtn loading={loading}>로그인</SubmitBtn>
            </form>
          )}

          {/* ── 회원가입 폼 ── */}
          {tab === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(onSignup)}>
              <Field label="이름" error={signupForm.formState.errors.name?.message}>
                <input className="input-base" type="text" placeholder="홍길동" {...signupForm.register('name')}/>
              </Field>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' }}>
                <Field label="학번" error={signupForm.formState.errors.student_id?.message}>
                  <input className="input-base" type="text" placeholder="32200000" {...signupForm.register('student_id')}/>
                </Field>
                <Field label="학년" error={signupForm.formState.errors.grade?.message}>
                  <select className="input-base" {...signupForm.register('grade', { valueAsNumber: true })}>
                    <option value="">선택</option>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}학년</option>)}
                  </select>
                </Field>
              </div>

              <Field label="전공" error={signupForm.formState.errors.major?.message}>
                <input className="input-base" type="text" placeholder="컴퓨터공학과" {...signupForm.register('major')}/>
              </Field>

              <Field label="생년월일" error={signupForm.formState.errors.birth_date?.message}>
                <input className="input-base" type="date" {...signupForm.register('birth_date')}/>
              </Field>

              <Field label="성별" error={signupForm.formState.errors.gender?.message}>
                <div style={{ display:'flex', gap:'0.6rem' }}>
                  {(['남','여','기타'] as const).map(g => (
                    <label key={g} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', cursor:'pointer', padding:'0.55rem', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'6px', fontSize:'0.85rem', color:'var(--text)', transition:'all 0.15s' }}>
                      <input type="radio" value={g} {...signupForm.register('gender')} style={{ display:'none' }}/>
                      {g}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="재학 상태" error={signupForm.formState.errors.status?.message}>
                <div style={{ display:'flex', gap:'0.6rem' }}>
                  {(['재학생','졸업생'] as const).map(s => (
                    <label key={s} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:'0.55rem', background:'var(--surface2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'6px', fontSize:'0.85rem', color:'var(--text)', transition:'all 0.15s' }}>
                      <input type="radio" value={s} {...signupForm.register('status')} style={{ display:'none' }}/>
                      {s}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="이메일" error={signupForm.formState.errors.email?.message}>
                <input className="input-base" type="email" placeholder="example@dankook.ac.kr" {...signupForm.register('email')}/>
              </Field>

              <Field label="비밀번호" error={signupForm.formState.errors.password?.message}>
                <input className="input-base" type="password" placeholder="8자 이상" {...signupForm.register('password')}/>
              </Field>

              <label style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', cursor:'pointer', fontSize:'0.78rem', color:'var(--muted)', marginTop:'0.5rem' }}>
                <input type="checkbox" {...signupForm.register('agree')} style={{ marginTop:'2px', accentColor:'var(--accent)', width:'auto' }}/>
                <span>
                  <a href="/terms" target="_blank" style={{ color:'var(--accent)' }}>이용약관</a> 및{' '}
                  <a href="/privacy" target="_blank" style={{ color:'var(--accent)' }}>개인정보처리방침</a>에 동의합니다
                </span>
              </label>
              {signupForm.formState.errors.agree && (
                <p style={{ color:'var(--accent3)', fontSize:'0.72rem', marginTop:'0.3rem' }}>{signupForm.formState.errors.agree.message}</p>
              )}

              <SubmitBtn loading={loading} style={{ marginTop:'1rem' }}>가입하기</SubmitBtn>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 서브 컴포넌트 ────────────────────────────
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: error ? '0.6rem' : '1rem' }}>
      <label style={{ display:'block', fontSize:'0.73rem', color:'var(--muted)', marginBottom:'0.35rem', letterSpacing:'0.06em', fontFamily:"'Space Grotesk',sans-serif" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color:'var(--accent3)', fontSize:'0.72rem', marginTop:'0.25rem' }}>{error}</p>}
    </div>
  )
}

function SubmitBtn({ children, loading, style: extraStyle }: { children: React.ReactNode; loading: boolean; style?: React.CSSProperties }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width:'100%', padding:'0.9rem',
        background: loading ? 'rgba(0,212,255,0.5)' : 'var(--accent)',
        color:'var(--bg)', border:'none', borderRadius:'8px',
        fontFamily:"'Space Grotesk',sans-serif", fontSize:'0.9rem', fontWeight:600,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition:'all 0.2s', letterSpacing:'0.05em',
        ...extraStyle,
      }}
    >
      {loading ? '처리 중...' : children}
    </button>
  )
}
