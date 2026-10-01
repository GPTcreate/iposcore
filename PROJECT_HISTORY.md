# ipo-insights - Project History & Memory

> 이 파일은 AI 에이전트(Antigravity, GPT, Codex 등)와 개발자 간의 상태 동기화를 위한 공용 메모리입니다.
> 작업을 시작할 때 반드시 먼저 읽고, 작업을 마칠 때 반드시 업데이트해야 합니다.

## 1. 프로젝트 개요 & 기술 스택
- **목적:** 국내 공모주(IPO) 청약 일정, 공모가, 주관사, 청약 경쟁률 및 상장일 실시간 일정 모니터링 반응형 웹 대시보드
- **주요 스택:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React
- **실행 방법:**
  - 개발 서버 실행: `npm run dev` (접속: `http://localhost:3000`)
  - 빌드: `npm run build`

## 2. 현재 상태 & 마일스톤
- [x] Next.js 16 + Tailwind CSS v4 기반 공모주 일정 대시보드 UI 구축
- [x] 상태별 탭 필터링 (전체, 청약 진행 중, 청약 예정, 상장 대기, 지난 공모주)
- [x] 모바일 터치 최적화 가로 스크롤 및 탭 디자인 개편
- [x] Tailscale VPN 접속 허용을 위한 `next.config.ts` allowedDevOrigins 설정
- [ ] DART 공시 API 또는 크롤러를 통한 실시간 IPO 데이터 자동 수신 연동
- [ ] 청약 마감일 D-Day 푸시/카카오톡 알림 기능

## 3. 핵심 아키텍처 및 결정 사항 (Key Decisions)
- **모바일 우선(Mobile-First):** 스마트폰에서도 한눈에 공모주 일정을 확인할 수 있도록 반응형 카드 뷰 및 가로 스크롤 탭 인터페이스 적용.
- **Next.js App Router:** `src/app/page.tsx` 중심의 컴포넌트 구조.

## 4. 주의사항 및 제약 (Gotchas & Constraints)
- Tailwind CSS v4를 사용하므로 이전 버전의 `tailwind.config.js` 대신 `@import "tailwindcss";` 방식 적용.
- 외부 기기(스마트폰 Tailscale)에서 로컬 개발서버 접근 시 `allowedDevOrigins` 설정 준수.

---

## 5. 작업 이력 (Change Log)

### [2026-10-01 09:00] 작업자: Antigravity
- **작업 내용:** Next.js allowedDevOrigins 설정 및 모바일 필터 탭 UI 개선 변경사항 커밋.
- **수정/생성 파일:** `next.config.ts`, `src/app/page.tsx`.

### [2026-10-01 09:05] 작업자: Antigravity
- **작업 내용:** AI 공용 협업 가이드라인(`AGENTS.md`) 및 프로젝트 메모리(`PROJECT_HISTORY.md`) 작성.
- **수정/생성 파일:** `AGENTS.md`, `PROJECT_HISTORY.md`.

---

## 6. 다음 작업자가 이어받을 작업 (Handoff / Next Steps)
1. DART 전자공시 오픈 API 키 연동 또는 실시간 크롤링 API 연동.
2. 개별 종목 클릭 시 공모 분석 상세 모달 팝업 추가.
