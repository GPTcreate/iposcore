# IPOScore 콘텐츠 보완 기록 — 2026-10-25

## 상태

- 대상: https://www.iposcore.kr / GitHub `GPTcreate/iposcore`
- 독립 Git worktree와 `fix/adsense-content-quality` 브랜치에서 수정. 원본 데이터·운영 체크아웃 보존.
- 소스 구현과 로컬 검증 대상이며, 운영 배포 및 AdSense 재심사는 아직 실행하지 않음.
- Google 내부 거절 판단을 확정한 진단은 아님. 공개 페이지에서 실제로 확인한 품질 문제를 개선함.

## 확인한 문제와 조치

| 관찰한 문제 | 조치 |
| --- | --- |
| 홈·소개·실제 코드의 점수 가중치가 다르고 5개년 백테스트 근거 없음 | 공개 산식 v2 하나로 통일. 임의 점수·여론 가점·백테스트 주장 제거 |
| 수요예측 미확인 종목에도 70~80점대와 전문가 75/20/5 비율 표시 | 원문과 검토일 없는 자료·점수 보류. 수집하지 않은 리뷰/여론 생성 중단 |
| 공시 목록만으로 코드·일정·가격·주관사를 만들어내는 코드 | 공시 후보 조회만 허용. 수동 등록도 확인값 필수, 검토 대기 저장 |
| 원금·배정·수익 보장, 매도 시간대의 출처 없는 통계 | 기존 8개 가이드 URL을 유지해 공식 자료와 계산 예시 중심으로 재작성 |
| 계산기가 기관 경쟁률을 2배로 바꾸고 균등 1주 자동 합산, 손실 입력 불가 | 비례 경쟁률 직접 입력, 균등 기본0, 증거금률/실제 대출/매도비용/손실/손익분기 제공 |
| 종목별 반복 칼럼·불확실한 데이터를 검색/RSS에 노출 | 검토된 자료만 공개 API·목록·RSS·사이트맵 포함. 미확인 상세는 수치/광고 없는 noindex 안내 |
| sitemap lastmod와 Article 수정일이 매 요청 시각 | 가이드 실제 수정일과 원문 확인일 사용. 수정일을 모르는 정적 페이지에는 lastmod 생략 |
| non-www canonical과 www 운영 리디렉트 불일치 | 공개 페이지·robots·사이트맵·RSS 기준 URL을 www로 통일 |
| 가짜 광고 슬롯과 빈 광고 공간 | 기본 광고 OFF. 소유권 메타·ads.txt 보존, 실제 슬롯과 활성화 옵션 요구 |

## 실제 공시 대조에서 확인한 오류

아이엠1호스팩의 기존 자료는 유통가능 비율4.58%, 상장 예정11/06, 기관경쟁률0이었다. 아래 원문 대조 결과 유통가능95.42%, 증권사 공고상 상장 예정11/04, 기관경쟁률1,266.52:1이었다. 4.58%는 공모 전 주주의 보호예수 비중이었다. 일반 증거금률도 100%라서 일률50% 계산은 부정확했다.

- [DART 10/22 발행조건확정 신고서](https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373)
- [DART 10/08 정정 신고서](https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261008000225)
- [iM증권 10/23 개별 공모 공지](https://ww2.imfnsec.com/research/bussiness_indust/re020301.jsp?bid=C_A001&aid=4922)

확인한 수치와 계산 과정은 `/research/iam-spac1-float`에 별도 해설로 제공한다. 기존 코드469272, KIND 상장 확정 및 후속 공시 전체목록 확인은 미완료이므로 해당 종목 전체를 검토 완료로 승격하지 않았다.

## 기존 종목 37개와 재공개 절차

데이터를 삭제하지 않았다. 개별 원문·확인 기록이 없는 기존 종목37개 모두 검증 대기다. 홈의 공시 목록은 검토된 자료만 포함하며, 가이드·계산기·확인 범위를 밝힌 실제 공시 사례를 주요 콘텐츠로 제공한다. 이 상태를 '시장에 청약 없음'으로 표현하지 않는다.

재공개는 현재 저장소 검토·배포 방식으로 진행한다.

1. 최신 개별 공시와 증권사 공고를 직접 읽고 코드·일정·모집 조건·수치·기준(신청/배정 등)을 대조한다.
2. 사실과 근거를 먼저 정정한다. 미확인을 임의 값으로 채우지 않는다.
3. 완전한 대조를 마친 자료에만 `dataQuality.status='reviewed'`, 실제 `reviewedAt`, `sources:[{title,url}]`를 기록한다. DART rcpNo/KIND acptno가 있는 개별 공시가 필요하다.
4. diff·공개 화면·수치·현재성 검토 후 테스트와 빌드를 실행하고 커밋·배포한다.

`isReviewedIpo`의 URL/날짜 형식 검사는 원문 내용 검증을 대체하지 않는다. reviewed는 편집 확인의 명시값이다. `hasVerifiedForecast`는 필수 지표까지 확인돼야 true다. 수치가 수정되면 기존 검토 상태를 무효화한다. 서버리스 파일/메모리 저장은 인스턴스 간 영속 DB가 아니므로 관리자 입력만으로 영구 공개를 기대하지 않는다.

## 회귀 방지와 운영 설정

- `npm run test:content`: 출처·확인일·미확인 점수·0확약·가점·여론 중단 및 비용/손실/손익분기/입력 오류 회귀 검사.
- `npm run test:security`: 환경 기반 관리자 인증, 위조 크론 헤더 차단, 레이트 리미터 검사. 테스트값은 임시 환경에서만 사용한다.
- `npm run build`: 데이터 형식 검사 → Next 빌드 → TypeScript 검사. 데이터 형식 통과는 원문 진위 검증이 아니다.
- 최종 결과: 콘텐츠19개, 인증26개 통과. 프로덕션 빌드·TypeScript 통과. 로컬 서버에서 `node scripts/check-content-pages.mjs`로16개 연결 페이지와 API/메타/리디렉트/404/사이트맵/RSS 확인. 브라우저 손실 시나리오와 좁은 화면 입력 확인. 전체 lint 통과를 주장하지 않음(관리자의 기존 effect lint 오류 미수정).
- 공공 `/api/ipo`는 검토 자료만 반환. 관리자 예외의 기본 비밀번호·위조 가능한 헤더단독 인증을 제거했다.
- 운영 `ADMIN_SECRET`와 `CRON_SECRET`가 없으면 관리자/크론 인증은 거절된다. 배포 전 설정 유무를 확인해야 한다. 비밀값을 로그/저장소에 기록하지 않는다.
- [Vercel 공식 Cron 인증 계약](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs): CRON_SECRET를 Authorization Bearer로 전달.
- 파이프라인은 파생 계산을 반환하며 편집 완료 내용을 자동 덮어쓰거나 Telegram을 발송하지 않는다. 수동 발송은 별도 기존 관리 경로이며 검토 전 종목 발송은 거절한다.
- `NEXT_PUBLIC_ADSENSE_ADS_ENABLED` 기본false. 승인 후 실제 광고 게재 설정은 별도 작업이다.
- GA4/GSC/Naver 소유권, Google Sheets 구독자 저장, 동의/해지, Android, Vercel cron 경로 보존. 실제 이메일·Telegram 발송/AdSense 재심사/외부 SNS 게시는 테스트하지 않았다.

## 정책 근거

- [AdSense 미승인 해결](https://support.google.com/adsense/answer/81904?hl=ko): 모든 페이지가 검토될 수 있으며 독창적이고 풍부한 사용자 가치가 필요하다.
- [유용하고 신뢰할 수 있는 콘텐츠](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=ko): 자체 분석·명확한 출처·작성 배경·검증 가능한 정확성.
- [사이트맵 작성 지침](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko): lastmod는 실제 의미 있는 변경 시각.

특정 글 수·글자 수·대기 기간으로 승인을 보장하지 않는다. 이 보완은 품질과 검증 구조의 개선이며 승인 자체는 실제 재심사 결과로 확인해야 한다.
