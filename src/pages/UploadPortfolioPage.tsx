import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const schema = z.object({
  title:       z.string().min(2, '제목을 입력해주세요'),
  description: z.string().optional(),
  category:    z.string().min(1, '카테고리를 선택해주세요'),
  tools_used:  z.string().optional(),
  tags:        z.string().optional(),
  is_public:   z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

export default function UploadPortfolioPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string>('')
  const [mediaFiles, setMediaFiles]     = useState<File[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_public: true },
  })

  const handleThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbFile(file)
    setThumbPreview(URL.createObjectURL(file))
  }

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setMediaFiles(prev => [...prev, ...files].slice(0, 10))
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setLoading(true)

    try {
      let thumbnail_url = ''
      let media_urls: string[] = []

      // 썸네일 업로드
      if (thumbFile) {
        const ext  = thumbFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('portfolios').upload(path, thumbFile)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('portfolios').getPublicUrl(path)
        thumbnail_url = urlData.publicUrl
      }

      // 추가 미디어 업로드
      for (const f of mediaFiles) {
        const ext  = f.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('portfolios').upload(path, f)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('portfolios').getPublicUrl(path)
        media_urls.push(urlData.publicUrl)
      }

      // DB 저장
      const { error: dbErr } = await supabase.from('portfolios').insert({
        user_id:       user.id,
        title:         data.title,
        description:   data.description,
        category:      data.category,
        tools_used:    data.tools_used?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
        tags:          data.tags?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
        is_public:     data.is_public,
        thumbnail_url,
        media_urls,
      })
      if (dbErr) throw dbErr

      toast.success('포트폴리오가 등록되었습니다!')
      navigate('/portfolio')
    } catch (e: any) {
      toast.error(e.message ?? '업로드 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ paddingTop: '6rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 2.5rem' }}>
        <p className="section-label">Upload</p>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', color: '#fff', lineHeight: 1, marginBottom: '2rem' }}>작품 올리기</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 썸네일 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>대표 이미지</label>
            <div
              onClick={() => document.getElementById('thumbInput')?.click()}
              style={{
                width: '100%', aspectRatio: '16/9',
                background: thumbPreview ? 'transparent' : 'var(--surface2)',
                border: '2px dashed rgba(255,255,255,0.15)',
                borderRadius: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', transition: 'border-color .2s', position: 'relative',
              }}
            >
              {thumbPreview
                ? <img src={thumbPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📷</div>
                    <div style={{ fontSize: '.85rem' }}>클릭하여 이미지 업로드</div>
                    <div style={{ fontSize: '.75rem', marginTop: '.25rem', color: 'rgba(107,114,128,.6)' }}>PNG, JPG, WebP (최대 10MB)</div>
                  </div>
              }
            </div>
            <input id="thumbInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumb}/>
          </div>

          <Field label="제목 *" error={errors.title?.message}>
            <input className="input-base" type="text" placeholder="작품 제목을 입력해주세요" {...register('title')}/>
          </Field>

          <Field label="설명" error={errors.description?.message}>
            <textarea {...register('description')} placeholder="작품에 대한 설명을 적어주세요" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '.7rem .9rem', color: 'var(--text)', fontSize: '.88rem', fontFamily: "'Noto Sans KR',sans-serif", resize: 'vertical', minHeight: '100px', outline: 'none' }}/>
          </Field>

          <Field label="카테고리 *" error={errors.category?.message}>
            <select className="input-base" {...register('category')}>
              <option value="">선택해주세요</option>
              {['3D','게임','프로그래밍','그래픽디자인','영상','기타'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="사용 툴 (쉼표로 구분)" error={errors.tools_used?.message}>
            <input className="input-base" type="text" placeholder="Blender, Unity, Photoshop" {...register('tools_used')}/>
          </Field>

          <Field label="태그 (쉼표로 구분)" error={errors.tags?.message}>
            <input className="input-base" type="text" placeholder="3D아트, 게임그래픽, 모델링" {...register('tags')}/>
          </Field>

          {/* 추가 미디어 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>추가 이미지 / 영상 (최대 10개)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.6rem', marginTop: '.4rem' }}>
              {mediaFiles.map((f, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'var(--surface2)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  <button type="button" onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '.3rem', right: '.3rem', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {mediaFiles.length < 10 && (
                <div onClick={() => document.getElementById('mediaInput')?.click()} style={{ aspectRatio: '1', background: 'var(--surface2)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--muted)' }}>+</div>
              )}
            </div>
            <input id="mediaInput" type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleMedia}/>
          </div>

          {/* 공개 설정 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '.7rem', cursor: 'pointer', marginBottom: '2rem' }}>
            <input type="checkbox" {...register('is_public')} defaultChecked style={{ accentColor: 'var(--accent)', width: 'auto', transform: 'scale(1.2)' }}/>
            <div>
              <div style={{ fontSize: '.9rem', color: '#fff' }}>공개 포트폴리오</div>
              <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>비공개 시 본인만 볼 수 있습니다</div>
            </div>
          </label>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? 'rgba(0,212,255,.5)' : 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '8px', fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '.05em' }}>
            {loading ? '업로드 중...' : '포트폴리오 등록하기'}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ color: 'var(--accent3)', fontSize: '.72rem', marginTop: '.25rem' }}>{error}</p>}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.73rem', color: 'var(--muted)', marginBottom: '.35rem', letterSpacing: '.06em', fontFamily: "'Space Grotesk',sans-serif" }
