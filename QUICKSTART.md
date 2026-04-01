# 🚀 COW Project 빠른 시작 가이드
## 처음 세팅하는 개발자를 위한 단계별 안내

---

## ① Supabase 세팅 (약 10분)

1. https://supabase.com → 회원가입 → New Project
   - 이름: `cagi-cow`
   - 비밀번호: 안전한 비밀번호 설정 (메모 필수!)
   - Region: **Northeast Asia (Seoul)**

2. Dashboard → SQL Editor → 아래 파일 내용 붙여넣기 → Run
   ```
   docs/schema.sql
   ```

3. Dashboard → Settings → API
   - **Project URL** 복사
   - **anon public** 키 복사

---

## ② 로컬 개발 환경 (약 5분)

```bash
# 1. 저장소 클론 (GitHub에 올린 후)
git clone https://github.com/YOUR_ORG/cow-project.git
cd cow-project

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 열어서 Supabase URL & Key 입력

# 3. 설치 & 실행
npm install
npm run dev
# → http://localhost:5173 접속
```

---

## ③ GitHub 저장소 세팅

```bash
# 처음 한 번만
git init
git add .
git commit -m "feat: 초기 프로젝트 세팅"
git remote add origin https://github.com/YOUR_ORG/cow-project.git
git push -u origin main
```

GitHub Secrets 추가 (Settings → Secrets and variables → Actions):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## ④ Vercel 배포 (약 5분)

1. https://vercel.com → GitHub으로 로그인
2. New Project → GitHub 저장소 선택
3. Environment Variables 입력:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

이후 `git push`만 하면 자동 배포 ✓

---

## ⑤ 도메인 연결

1. 가비아(www.gabia.com) 또는 Namecheap에서 도메인 구매
   - 추천: `cagi.kr`, `cagi-dku.com`
2. Vercel → Project → Settings → Domains → 도메인 입력
3. 가비아 DNS 설정에 Vercel 안내 레코드 추가
4. 24~48시간 후 연결 완료

---

## ⑥ 첫 관리자 계정 만들기

1. 웹사이트에서 일반 회원가입
2. Supabase Dashboard → Table Editor → profiles 테이블
3. 가입한 계정 찾기 → role 컬럼 → `admin`으로 변경
4. 사이트 새로고침 → 관리자 패널 이용 가능!

---

## 📁 프로젝트 구조

```
cow-project/
├── src/
│   ├── components/
│   │   ├── auth/     AuthModal.tsx         로그인/회원가입 모달
│   │   └── ui/       Navbar.tsx            네비게이션
│   ├── pages/
│   │   ├── HomePage.tsx                    메인 랜딩 페이지
│   │   ├── PortfolioPage.tsx               포트폴리오 갤러리
│   │   ├── PortfolioDetailPage.tsx         포트폴리오 상세
│   │   ├── StudiesPage.tsx                 스터디 목록/신청
│   │   ├── UploadPortfolioPage.tsx         작품 업로드
│   │   ├── ProfilePage.tsx                 내 프로필
│   │   └── AdminPage.tsx                   관리자 패널
│   ├── hooks/
│   │   └── useAuth.tsx                     인증 컨텍스트
│   ├── lib/
│   │   └── supabase.ts                     Supabase 클라이언트
│   └── styles/
│       └── globals.css                     전역 스타일
├── docs/
│   ├── schema.sql                          DB 스키마
│   └── README.md                           상세 운영 가이드
├── .env.example                            환경변수 템플릿
├── vercel.json                             배포 설정
└── package.json
```

---

## ❓ 문제 해결

| 증상 | 해결 |
|------|------|
| `npm run dev` 에러 | `npm install` 후 재시도 |
| 로그인 후 프로필 없음 | Supabase SQL 재실행 (트리거 확인) |
| 이미지 업로드 실패 | Supabase Storage 버킷 public 설정 확인 |
| 배포 후 404 | vercel.json 의 rewrites 설정 확인 |

---

*문제가 있으면 GitHub Issues에 등록해주세요!*
