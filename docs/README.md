# COW Project 개발 문서
## CAGI Official Website — 개발 가이드 & 운영 매뉴얼

> 이 문서는 개발자부터 코딩을 모르는 관리자까지 모두가 읽을 수 있도록 작성되었습니다.
> 최소 5~10년 운영 가능하도록 각 단계를 상세히 기록합니다.

---

## 📋 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [로컬 개발 환경 세팅](#3-로컬-개발-환경-세팅)
4. [Supabase 세팅 (백엔드/DB)](#4-supabase-세팅)
5. [Vercel 배포](#5-vercel-배포)
6. [도메인 구매 및 연결](#6-도메인-구매-및-연결)
7. [관리자 권한 양도 방법](#7-관리자-권한-양도)
8. [관리자 기능 사용법](#8-관리자-기능-사용법)
9. [공동 개발 환경 (GitHub)](#9-공동-개발-환경)
10. [유지보수 가이드](#10-유지보수-가이드)
11. [자주 묻는 질문 (FAQ)](#11-faq)

---

## 1. 프로젝트 개요

**프로젝트명:** COW (CAGI Official Website)  
**목적:** 단국대학교 컴퓨터그래픽 동아리 CAGI의 공식 웹사이트  
**창설:** 1991년  
**분류:** 단국대학교 중앙동아리

### 주요 기능
| 기능 | 설명 |
|------|------|
| 로그인/회원가입 | 이메일 기반 인증, 학생 정보 등록 |
| 포트폴리오 갤러리 | 회원 작품 전시 및 공유 |
| 스터디 관리 | 스터디 생성/신청/관리 |
| 관리자 패널 | 사이트 설정, 권한 관리 |
| 모션 그래픽 히어로 | 관리자가 설정 가능한 메인 화면 |

---

## 2. 기술 스택

| 역할 | 기술 | 이유 |
|------|------|------|
| **프론트엔드** | React + Vite + TypeScript | 빠른 개발, 강력한 생태계 |
| **백엔드/DB** | Supabase | 코딩 없이 대시보드로 관리 가능, 무료 플랜 충분 |
| **스타일링** | Tailwind CSS | 빠른 UI 개발 |
| **배포** | Vercel | GitHub 연동 자동 배포, 무료 플랜 |
| **도메인** | Namecheap / 가비아 | 연간 구매 |
| **버전관리** | GitHub | 팀 협업, 코드 히스토리 |

### 비용 예상
| 항목 | 비용 |
|------|------|
| Supabase | 무료 (월 500MB DB, 1GB Storage) |
| Vercel | 무료 (개인/팀 프로젝트) |
| 도메인 (.com) | 연간 약 15,000원 |
| **합계** | **연간 약 15,000원** |

---

## 3. 로컬 개발 환경 세팅

### 사전 요구사항
- Node.js 18+ 설치: https://nodejs.org
- Git 설치: https://git-scm.com
- VS Code 설치 (권장): https://code.visualstudio.com

### 시작하기

```bash
# 1. 저장소 클론
git clone https://github.com/[your-org]/cow-project.git
cd cow-project

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 정보 입력 (아래 참고)

# 4. 개발 서버 실행
npm run dev
# 브라우저에서 http://localhost:5173 접속
```

### .env.local 설정
```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

---

## 4. Supabase 세팅

### 4-1. 프로젝트 생성
1. https://supabase.com 접속 → 회원가입
2. "New Project" 클릭
3. 프로젝트 이름: `cagi-cow`, 비밀번호 설정, 리전: `Northeast Asia (Seoul)` 선택
4. 프로젝트 생성 완료까지 약 2분 대기

### 4-2. 데이터베이스 스키마 적용
1. Supabase Dashboard → SQL Editor
2. `docs/schema.sql` 파일 내용 전체 복사
3. SQL Editor에 붙여넣기 → Run 클릭
4. 오류 없이 완료되면 성공

### 4-3. API 키 확인
1. Dashboard → Settings → API
2. `Project URL` 복사 → `.env.local`의 `VITE_SUPABASE_URL`에 붙여넣기
3. `anon public` 키 복사 → `.env.local`의 `VITE_SUPABASE_ANON_KEY`에 붙여넣기

### 4-4. Storage 버킷 확인
SQL 실행 후 Dashboard → Storage에서 다음 버킷들이 생성되었는지 확인:
- `portfolios` (포트폴리오 이미지)
- `avatars` (프로필 사진)
- `studies` (스터디 썸네일)
- `hero-media` (메인 화면 영상/이미지)

---

## 5. Vercel 배포

### 5-1. GitHub에 코드 올리기
```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 5-2. Vercel 연동
1. https://vercel.com 접속 → GitHub으로 로그인
2. "New Project" → GitHub 저장소 선택
3. Framework: Vite 자동 감지됨
4. Environment Variables 추가:
   - `VITE_SUPABASE_URL` = Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase Anon Key
5. "Deploy" 클릭

### 5-3. 자동 배포
이후 `git push`할 때마다 자동으로 Vercel에 배포됩니다.

---

## 6. 도메인 구매 및 연결

### 추천 도메인
- `cagi.kr` 또는 `cagi-dku.com` 또는 `cagi-dankook.com`

### 구매 방법 (가비아 기준)
1. https://www.gabia.com 접속
2. 원하는 도메인 검색 → 구매 (연간 갱신)
3. 결제 완료 후 DNS 관리 화면으로 이동

### Vercel에 도메인 연결
1. Vercel Dashboard → 프로젝트 → Settings → Domains
2. 구매한 도메인 입력 → Add
3. Vercel이 안내하는 DNS 레코드를 가비아 DNS 설정에 추가:
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
4. 약 24~48시간 내에 도메인 연결 완료

---

## 7. 관리자 권한 양도

### ⚠️ 매우 중요 — 매년 새 관리자에게 전달할 사항

### 방법 1: Supabase Dashboard에서 직접 수정 (권장)
1. https://supabase.com → 프로젝트 Dashboard
2. Table Editor → `profiles` 테이블
3. 새 관리자의 이름/학번으로 행 찾기
4. `role` 컬럼을 `admin`으로 변경
5. 기존 관리자의 `role`을 `member`로 변경

### 방법 2: SQL로 수정
```sql
-- 새 관리자 설정 (학번으로 검색)
UPDATE profiles SET role = 'admin' WHERE student_id = '32200000';

-- 기존 관리자 권한 해제
UPDATE profiles SET role = 'member' WHERE student_id = '31900000';
```

### Supabase 계정 인수인계
- Supabase 이메일 계정 정보를 안전하게 전달
- 또는 새 관리자를 Supabase 팀 멤버로 초대
- Vercel 계정도 동일하게 인수인계 필요

### GitHub 저장소 권한
- GitHub 저장소 → Settings → Collaborators
- 새 관리자의 GitHub 계정을 Admin으로 추가

---

## 8. 관리자 기능 사용법

### 8-1. 메인 화면 (히어로) 영상 변경
**코딩 없이 가능!**
1. 웹사이트 로그인 (관리자 계정)
2. 관리자 패널 → 사이트 설정 → 히어로 설정
3. "영상 업로드" 또는 YouTube URL 입력
4. 저장 → 즉시 반영

### 8-2. 스터디 생성
1. 관리자 패널 → 스터디 관리 → 새 스터디
2. 제목, 설명, 일정, 장소, 최대 인원 입력
3. 게시하면 일반 회원에게 표시됨

### 8-3. 스터디 신청자 확인
1. 관리자 패널 → 스터디 관리 → 해당 스터디 클릭
2. 신청자 목록 확인 (일반 회원에게는 보이지 않음)
3. 승인/거절 처리 가능

### 8-4. 회원 관리
1. 관리자 패널 → 회원 목록
2. 재학생/졸업생 필터링
3. 특정 회원 포트폴리오 숨김/표시 처리

---

## 9. 공동 개발 환경

### GitHub 협업 규칙

#### 브랜치 전략
```
main          ← 실제 서비스 (Vercel 자동 배포)
develop       ← 개발 통합 브랜치
feature/xxx   ← 기능 개발 브랜치
fix/xxx       ← 버그 수정 브랜치
```

#### 작업 흐름
```bash
# 새 기능 개발 시
git checkout develop
git pull origin develop
git checkout -b feature/portfolio-gallery

# 작업 완료 후
git add .
git commit -m "feat: 포트폴리오 갤러리 필터 기능 추가"
git push origin feature/portfolio-gallery
# → GitHub에서 Pull Request 생성 → 코드 리뷰 → develop에 병합
```

#### 커밋 메시지 규칙
- `feat:` 새 기능
- `fix:` 버그 수정
- `style:` UI 변경
- `docs:` 문서 수정
- `refactor:` 코드 리팩토링

### VS Code 추천 확장
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

---

## 10. 유지보수 가이드

### 정기 점검 (월 1회)
- [ ] Supabase Storage 용량 확인 (무료: 1GB)
- [ ] 졸업생 계정 status 업데이트
- [ ] 스터디 종료된 것들 status → 'ended' 처리
- [ ] 오래된 포트폴리오 정리 (작성자 동의 필요)

### 연간 갱신
- [ ] 도메인 갱신 (가비아 자동갱신 설정 권장)
- [ ] 관리자 계정 교체 (7번 참고)
- [ ] 의존성 업데이트: `npm update`

### 패키지 업데이트
```bash
# 패키지 업데이트 (개발 환경에서만!)
npm update

# 빌드 테스트
npm run build

# 문제 없으면 배포
git add . && git commit -m "chore: 패키지 업데이트" && git push
```

### 백업
- Supabase는 자동으로 일일 백업을 제공합니다 (Pro 플랜)
- 무료 플랜의 경우 주기적으로 수동 백업 권장:
  1. Supabase Dashboard → Settings → Database
  2. "Generate a backup" 클릭

---

## 11. FAQ

**Q: 비밀번호를 잊어버렸어요**  
A: 로그인 화면 → "비밀번호 재설정" → 이메일로 링크 전송

**Q: 회원이 탈퇴를 원해요**  
A: Supabase → Authentication → Users → 해당 유저 삭제 (연쇄 삭제로 프로필, 포트폴리오도 자동 삭제)

**Q: 사이트가 느려요**  
A: Supabase 무료 플랜은 7일 미사용 시 슬립 모드 진입. 월 사용량을 확인하고 필요 시 Pro 업그레이드 검토.

**Q: 이미지 업로드가 안 돼요**  
A: Storage 용량(1GB) 초과 여부 확인. 오래된 파일 정리 또는 Pro 업그레이드.

**Q: 도메인이 만료됐어요**  
A: 가비아 로그인 → 도메인 갱신. 만료 전 이메일 알림 설정 권장.

**Q: 새로운 기능을 추가하고 싶어요**  
A: 개발자에게 GitHub Issue로 요청하거나, `docs/` 폴더의 개발 문서를 참고해 직접 개발.

---

## 📞 문의 및 기여

- **GitHub Issues:** 버그 리포트 및 기능 요청
- **GitHub Discussions:** 일반 질문
- **이메일:** cagi@dankook.ac.kr (예시)

---

*이 문서는 COW Project 팀이 관리합니다. 마지막 업데이트: 2024년*
