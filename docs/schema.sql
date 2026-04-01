-- ============================================================
-- COW Project (CAGI Official Website) - Database Schema
-- Supabase PostgreSQL
-- 실행 방법: Supabase Dashboard > SQL Editor 에 붙여넣기
-- ============================================================

-- ① 사용자 프로필 테이블 (Supabase auth.users 와 연동)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 회원가입 필수 정보
  name          TEXT NOT NULL,                        -- 이름
  gender        TEXT CHECK (gender IN ('남', '여', '기타')),
  birth_date    DATE,                                 -- 생년월일
  major         TEXT NOT NULL,                        -- 전공
  grade         INTEGER CHECK (grade BETWEEN 1 AND 6), -- 학년
  student_id    TEXT UNIQUE NOT NULL,                 -- 학번
  status        TEXT DEFAULT '재학생' CHECK (status IN ('재학생', '졸업생')), -- 재학/졸업
  
  -- 권한
  role          TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'superadmin')),
  
  -- 자동 생성
  age           INTEGER GENERATED ALWAYS AS (
                  EXTRACT(YEAR FROM AGE(birth_date))::INTEGER
                ) STORED,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ② 포트폴리오 테이블
CREATE TABLE public.portfolios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT CHECK (category IN ('3D', '게임', '프로그래밍', '그래픽디자인', '영상', '기타')),
  thumbnail_url TEXT,                                 -- 대표 이미지
  media_urls    TEXT[] DEFAULT '{}',                 -- 추가 이미지/영상 배열
  tags          TEXT[] DEFAULT '{}',                 -- 태그
  tools_used    TEXT[] DEFAULT '{}',                 -- 사용 툴 (Blender, Unity 등)
  
  is_public     BOOLEAN DEFAULT TRUE,
  view_count    INTEGER DEFAULT 0,
  like_count    INTEGER DEFAULT 0,
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ③ 스터디 테이블
CREATE TABLE public.studies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID NOT NULL REFERENCES public.profiles(id),
  
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT CHECK (category IN ('Blender', 'Unity', '프로그래밍', '디자인', '기타')),
  
  max_members   INTEGER NOT NULL DEFAULT 10,          -- 최대 인원
  current_count INTEGER DEFAULT 0,                   -- 현재 신청 인원 (자동 갱신)
  
  schedule      TEXT,                                -- 일정 (예: 매주 화요일 18:00)
  location      TEXT,                                -- 장소
  duration      TEXT,                                -- 기간 (예: 8주)
  
  start_date    DATE,
  end_date      DATE,
  apply_deadline TIMESTAMPTZ,                        -- 신청 마감일
  
  status        TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'ongoing', 'ended')),
  thumbnail_url TEXT,
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ④ 스터디 신청 테이블
CREATE TABLE public.study_applicants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id      UUID NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  motivation    TEXT,                                -- 신청 동기
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  applied_at    TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(study_id, user_id)                          -- 중복 신청 방지
);

-- ⑤ 사이트 설정 테이블 (관리자 설정용)
CREATE TABLE public.site_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB,
  updated_by    UUID REFERENCES public.profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 사이트 설정 삽입
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_config', '{"type": "video", "url": "", "title": "CAGI", "subtitle": "컴퓨터그래픽 동아리", "overlay_opacity": 0.5}'),
  ('site_info', '{"founded": 1991, "university": "단국대학교", "type": "중앙동아리", "description": ""}'),
  ('announcement', '{"title": "", "content": "", "is_active": false}');

-- ⑥ 좋아요 테이블
CREATE TABLE public.portfolio_likes (
  portfolio_id  UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (portfolio_id, user_id)
);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_applicants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_likes    ENABLE ROW LEVEL SECURITY;

-- profiles 정책
CREATE POLICY "프로필 공개 조회" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "본인 프로필 수정" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "회원가입 시 프로필 생성" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- portfolios 정책
CREATE POLICY "공개 포트폴리오 조회" ON public.portfolios FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "본인 포트폴리오 생성" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 포트폴리오 수정" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인 포트폴리오 삭제" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- studies 정책
CREATE POLICY "스터디 공개 조회" ON public.studies FOR SELECT USING (true);
CREATE POLICY "관리자 스터디 생성" ON public.studies FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "관리자 스터디 수정" ON public.studies FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- study_applicants 정책
CREATE POLICY "신청자 본인 조회" ON public.study_applicants FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "로그인 사용자 신청" ON public.study_applicants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "신청 취소" ON public.study_applicants FOR DELETE USING (auth.uid() = user_id);

-- site_settings 정책
CREATE POLICY "사이트 설정 공개 조회" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "관리자 설정 수정" ON public.site_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- portfolio_likes 정책
CREATE POLICY "좋아요 공개 조회" ON public.portfolio_likes FOR SELECT USING (true);
CREATE POLICY "로그인 사용자 좋아요" ON public.portfolio_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "좋아요 취소" ON public.portfolio_likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 트리거: updated_at 자동 갱신
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON public.profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_portfolios_updated_at BEFORE UPDATE ON public.portfolios  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_studies_updated_at    BEFORE UPDATE ON public.studies     FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 트리거: 스터디 신청 시 current_count 자동 갱신
CREATE OR REPLACE FUNCTION update_study_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.studies SET current_count = current_count + 1 WHERE id = NEW.study_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.studies SET current_count = current_count - 1 WHERE id = OLD.study_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_study_count
AFTER INSERT OR DELETE ON public.study_applicants
FOR EACH ROW EXECUTE FUNCTION update_study_count();

-- 트리거: 포트폴리오 좋아요 수 자동 갱신
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.portfolios SET like_count = like_count + 1 WHERE id = NEW.portfolio_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.portfolios SET like_count = like_count - 1 WHERE id = OLD.portfolio_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_like_count
AFTER INSERT OR DELETE ON public.portfolio_likes
FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- ============================================================
-- 트리거: 회원가입 시 자동으로 profiles 레코드 생성
-- (Supabase Dashboard > Authentication > Hooks 에서도 설정 가능)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, student_id, major, gender, birth_date, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '이름없음'),
    COALESCE(NEW.raw_user_meta_data->>'student_id', '000000'),
    COALESCE(NEW.raw_user_meta_data->>'major', '미정'),
    COALESCE(NEW.raw_user_meta_data->>'gender', '기타'),
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    COALESCE(NEW.raw_user_meta_data->>'status', '재학생')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Storage 버킷 생성 (Supabase Dashboard > Storage 에서도 가능)
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('studies', 'studies', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-media', 'hero-media', true);

-- Storage 정책
CREATE POLICY "공개 이미지 조회" ON storage.objects FOR SELECT USING (bucket_id IN ('portfolios', 'avatars', 'studies', 'hero-media'));
CREATE POLICY "인증 사용자 업로드" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "본인 파일 삭제" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
