# IPOScore — 공모주 공시 해설과 배정·비용 계산

> 2026-10-25 후속 변경: 점수와 여론을 핵심 기능으로 유지하며 실제 RSS 원문 수집·저장·상세 하단 표시를 연결했습니다. 공시 검토 전에도 수집된 원문은 독립 공개합니다. 기존 종목37개 금융 수치는 원문 확인 전이며, 수집한 글이 금융 검토를 대신하지 않습니다. 현재 공개 조건은 [콘텐츠 보완 기록](docs/ADSENSE_CONTENT_REVIEW_2026-10-25.md), 실행·운영 검증은 [수집 기능 검증 기록](docs/REVIEW_PIPELINE_VERIFICATION_2026-10-25.md)을 참고하세요.

공시를 읽는 방법과 균등·비례 배정, 증거금·대출이자·손익을 직접 비교하는 도구를 제공합니다. 운영 URL은 https://www.iposcore.kr 입니다.

---

## 🌟 주요 핵심 기능

1. **AI 종합 매력도 스코어링 (IPO Score)**
   - **공개 산식 v3**: 기관 경쟁률 최대40 + 확약 최대25 + 유통비율 최대20 + 실제 분류 표본 내 참여 비율×15점. 의견 표본이 없으면 공시85점을100점으로 환산하며 산출 기준을 배지에 표시합니다.
   - 원문·확인일·필수 지표가 없으면 점수는 보류합니다. 리뷰 원문·의견 표본은 금융 검토와 독립 표시합니다. 누락값 평균 보정, 공모가 상단 초과 가점은 사용하지 않습니다.
   - S/A/B/C는 비교 구간이며 수익 예측이나 청약 추천이 아닙니다. 구간표는 `/methodology`에 공개합니다.

2. **AI 3줄 핵심 요약 & 호재 vs 리스크 체크**
   - 원문 확인을 대체하지 않습니다. 자동 생성 자료는 검토 완료로 승격하지 않으며, 검색 링크로 전문가의 의견을 만들어내지 않습니다.
   - 실제 RSS·본문에서 해당 종목이 언급된 짧은 근거와 원문 링크를 제공합니다. 명시 입장이 없으면 미분류로 남기며 무표본 비율은 `null`입니다. 유료 LLM 호출은 없습니다.

3. **인터랙티브 비례 청약 계산기**
   - 비례 경쟁률·증거금률·균등 주수·대출 원금·사용 일수·매도 비용을 직접 입력합니다. 기관 경쟁률로 비례 경쟁률을 추정하지 않습니다.
   - 손실 시나리오, 배정 가정, 손익분기를 비교하며 실제 배정을 보장하지 않습니다.

4. **구글 애드센스 최적화 슬롯 컴포넌트 (`GoogleAdSlot`)**
   - 소유권 확인 메타 태그와 ads.txt를 유지합니다. 검증 대기/관리 페이지에는 광고 로더를 넣지 않습니다.
   - 광고는 `NEXT_PUBLIC_ADSENSE_ADS_ENABLED=true`와 실제 슬롯 ID가 있어야 활성화됩니다. 기본 광고 자리 표시와 가짜 슬롯은 제거했습니다.

5. **메일링(뉴스레터) 구독 시스템**
   - 매주 월요일 오전 8시 주간 공모주 캘린더 브리핑 발송.
   - 확인된 청약 자료가 없으면 주간 발송을 보류합니다. 실제 발송을 검증 목적으로 실행하지 않습니다.

---

## 🛠️ 기술 스택

- **프론트엔드/풀스택**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS
- **아이콘**: Lucide React
- **블로그 수집 파이프라인**: TypeScript, fast-xml-parser, Cheerio, GitHub Actions → JSON 스냅샷 → Vercel Git 배포. 기존 Python/Gemini 코드는 보관용이며 웹 수집과 연결되지 않습니다.
- **이메일**: HTML 뉴스레터 템플릿 (Resend / Stibee 연동 가능)

---

## 📂 프로젝트 구조

```text
ipo-insights/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # 메인 일정 & 캘린더 대시보드
│   │   ├── layout.tsx                   # 공통 레이아웃 & 구글 애드센스 로더
│   │   ├── ipo/[id]/page.tsx            # 공모주별 AI 상세 리포트 & 계산기
│   │   ├── calculator/page.tsx          # 독립 비례 청약 계산기 페이지
│   │   └── api/newsletter/subscribe/    # 뉴스레터 이메일 구독 API
│   ├── components/
│   │   ├── Header.tsx                   # 반응형 상단 네비게이션
│   │   ├── IpoCard.tsx                  # 공모주 목록 카드 컴포넌트
│   │   ├── ScoreBadge.tsx               # AI 스코어 게이지 배지
│   │   ├── IpoCalculator.tsx            # 실전 청약 계산기 위젯
│   │   ├── GoogleAdSlot.tsx             # 구글 애드센스 광고 슬롯
│   │   └── NewsletterBanner.tsx         # 이메일 뉴스레터 신청 폼
│   ├── data/
│   │   ├── mockIpo.ts                   # 기존 종목 후보 (공시 검토 전)
│   │   ├── reviewChannels.json          # 실제 수집 블로그 설정
│   │   └── reviewSnapshots.json         # 종목+청약일별 실제 수집 근거
│   └── types/
│       └── ipo.ts                       # 공모주 스키마 인터페이스
│
├── python_pipeline/                     # AI 데이터 수집 & 요약 엔진
│   ├── analyzer.py                      # DART + 유튜브 감성분석 & 100점 점수화
│   ├── weekly_newsletter_sample.html    # 매주 월요일 발송용 HTML 이메일
│   └── requirements.txt
│
└── .env.example                         # 환경변수 예시
```

---

## 🚀 빠른 시작 가이드

### 1. 개발 서버 실행 (웹페이지)
```bash
# 종속성 설치 (이미 완료됨)
npm install

# 로컬 개발 서버 실행
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

### 2. 프로덕션 빌드 검증
```bash
npm run build
```

### 3. 실제 블로그 수집 점검
```bash
npm run collect:reviews -- --dry-run
npm run collect:reviews -- --stock iam-spac1 --write
```
기본 대상은 KST 청약 전날입니다. `--stock`은 정확한 종목 ID를 지정합니다. `--date YYYY-MM-DD`는 대상 선정일만 바꾸며 실제 수집 시각을 바꾸지 않습니다. `--write`는 로컬 JSON 저장이며 운영 배포를 뜻하지 않습니다. 기본 브랜치의 GitHub 작업은 D-1 12:17/18:17 KST에 실행되며 지연될 수 있습니다. Vercel 관리 화면의 수집은 미리보기로 응답하고 영속 저장 성공으로 처리하지 않습니다.

기존 `python_pipeline`은 웹 미연결 보관 코드입니다. 실제 블로그 수집과 운영 스냅샷 갱신에는 위 명령을 사용합니다.

---

## 💰 구글 애드센스 승인 체크리스트

1. 콘텐츠 수, 글자 수, 자체 점수나 면책 문구가 AdSense 승인을 보장하지 않습니다. 실제 승인 여부는 Google 심사 결과로만 확인합니다.
2. 원문·검토일·독자가 따라 계산할 수 있는 사례를 갖추고, 검증하지 못한 사실은 공개하지 않습니다.
3. 기본 관리자 비밀번호는 없습니다. 운영 환경의 ADMIN_SECRET와 CRON_SECRET 설정이 필요합니다. Cron은 Bearer 인증을 사용합니다.
4. `npm run test:content`, `npm run test:security`, `npm run build`로 검증합니다. 기존 금융 데이터 형식 검사는 원문 진위 검증을 뜻하지 않습니다.
