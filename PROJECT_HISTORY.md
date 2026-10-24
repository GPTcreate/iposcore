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
- [x] 2026-10-25 애드센스 콘텐츠 보완 소스 구현: 가이드8편 정정, 실제 공시 사례, 비용·손실 계산기, 출처 기반 공개조건, 산식v2, 색인·광고·관리 인증 정리.
- [ ] 위 보완의 운영 배포 및 실제 AdSense 재심사 결과 확인. 기존 종목37개는 원문 검토 기록 확보 전 공개 보류.
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

### [2026-10-25] 작업자: Codex
- **문제:** 두 번째 '가치가 별로 없는 콘텐츠' 거절 요청. 공개 사이트에서 점수 산식 불일치, 허구 여론, 미확인 데이터, 보장 표현 및 계산 오류 확인.
- **변경:** 원문/확인일 필터·미확인 noindex·검증 전 수치/광고 제외, 기존8가이드 개정, 실제 공시 대조 사례1편, 비용·손실·손익분기 계산기, 출처·분석 기준과 공통 정보 탐색, www canonical·실제 lastmod. 공시 목록 기반 데이터 생성 및 허구 분석 중단. 관리 폼/API 계약과 환경 기반 인증 정리.
- **원본 보존:** 원본 체크아웃을 유지하고 별도 worktree `C:\Users\82102\Documents\Codex\2026-10-25\iposcore`, 브랜치 `fix/adsense-content-quality`에서 작업. 기존37개 데이터는 삭제/검토완료 처리하지 않음.
- **최종 검증:** Next 프로덕션 빌드와 TypeScript 통과. 콘텐츠19개/보안26개 검사 통과. `node scripts/check-content-pages.mjs`로 연결 페이지16개·미확인 noindex·공공 API·308 별칭·404·안정된 사이트맵·RSS 통과. 브라우저에서 기본 균등0/대출0, 손실 −20%/대출500만원/4일/매도비용0.2% → 약−8,772원 및 손익분기+23.95% 표시 확인. 데스크톱과 좁은 화면에서 계산 입력·본문 확인. git diff 공백 검사 통과. 관리자 단독 lint에는 기존 effect 경고/오류가 있어 전체 lint 통과로 보고하지 않음.
- **운영 상태:** 외부 배포·AdSense 재심사·실제 이메일/Telegram 발송 미실행. 운영 ADMIN_SECRET/CRON_SECRET 설정 확인 필요. 자세한 근거와 재공개 절차는 `docs/ADSENSE_CONTENT_REVIEW_2026-10-25.md`.

### [2026-10-01 09:00] 작업자: Antigravity
- **작업 내용:** Next.js allowedDevOrigins 설정 및 모바일 필터 탭 UI 개선 변경사항 커밋.
- **수정/생성 파일:** `next.config.ts`, `src/app/page.tsx`.

### [2026-10-01 09:05] 작업자: Antigravity
- **작업 내용:** AI 공용 협업 가이드라인(`AGENTS.md`) 및 프로젝트 메모리(`PROJECT_HISTORY.md`) 작성.
- **수정/생성 파일:** `AGENTS.md`, `PROJECT_HISTORY.md`.

---

## 6. 다음 작업자가 이어받을 작업 (Handoff / Next Steps)
1. `fix/adsense-content-quality` 변경과 로컬 검증 결과를 확인하고, 운영 인증 환경변수 설정 유무를 안전하게 확인한 뒤 승인된 경로로 배포. 자동 배포/재심사를 완료했다고 간주하지 말 것.
2. 기존37개 중 실제 종목별 최신 공시·주관사 조건을 대조한 레코드만 공개. 단순 URL 형식 검사나 과거 기사만으로 reviewed 처리하지 말 것.
3. 원문 기반 파서·영속 저장소를 도입하기 전에는 임의 코드/일정/가격/여론 생성과 자동 편집 덮어쓰기를 되살리지 말 것.
4. 실제 보완 사이트를 확인한 후 AdSense 재심사. 승인 보장·최소 글 수·대기 기간을 임의로 약속하지 말 것.
