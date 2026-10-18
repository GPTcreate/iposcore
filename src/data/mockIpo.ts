import { IpoItem } from '@/types/ipo';

export const MOCK_IPOS: IpoItem[] = [
  {
    "id": "melcon",
    "name": "멜콘",
    "code": "179880",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-10-01",
    "subscriptionEnd": "2026-10-02",
    "refundDate": "2026-10-07",
    "listingDate": "2026-10-15",
    "priceBandMin": 10700,
    "priceBandMax": 12300,
    "confirmedPrice": 12300,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 625000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1136.8,
    "generalCompetitionRate": 1741.48,
    "lockupCommitmentRate": 33.1,
    "circulatingSupplyRate": 34.6,
    "totalOfferingAmount": 308,
    "marketCapAtIpo": 1550,
    "subscriptionResults": {
      "proportionalCompetitionRate": 3481.33,
      "totalAccounts": 254009,
      "totalDepositAmount": 6.7,
      "equalAllocationShares": 1.23
    },
    "aiSummary": {
      "headline": "10월 15일 코스닥 신규 상장 완료! 일반 경쟁률 1,741:1(비례 3,481:1) 증거금 6.7조원 기록",
      "bulletPoints": [
        "2026년 10월 15일(목) 코스닥 시장 신규 상장 완료 (공식 종목코드: 179880)",
        "일반 청약 최종 경쟁률 1,741.48:1(비례 3,481.33:1) 기록, 청약 증거금 약 6조 7,000억원 유입",
        "균등 배정 1인당 약 1.23주(추첨 2주 확률), 비례 배정 1주당 증거금 약 2,140만원 소요",
        "ASML 및 도쿄일렉트론(TEL) 노광장비 필수 초정밀 온·습도 제어시스템 독점력 확보"
      ],
      "positivePoints": [
        "일반 청약 1,741:1(비례 3,481:1) 초흥행으로 상장일 시초가 수급 유입 기록",
        "ASML 및 도쿄일렉트론(TEL) 노광장비 필수 초정밀 온·습도 제어시스템 독점력"
      ],
      "riskPoints": [
        "상장 직후 유통가능물량 34.6% 출회 가능성 및 시장 수급 변동성 주의"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 90,
      "neutralRatio": 8,
      "cautionRatio": 2
    },
    "expertReviews": [
      {
        "id": "rev-mel-1",
        "sourceType": "YOUTUBE",
        "author": "집돈버 구쯔",
        "title": "멜콘 공모주 청약 최종 경쟁률 3,483:1 마감! 비례 1주 금액 및 상장일 목표가",
        "url": "https://www.youtube.com/watch?v=PVWW3PbSY5k",
        "publishedAt": "2026-10-02",
        "sentiment": "POSITIVE",
        "summary": "일반 경쟁률 3,482.95대 1 기록, 증거금 6.7조원 몰려 균등 1.23주 및 상장일 대응 전략."
      },
      {
        "id": "rev-mel-2",
        "sourceType": "YOUTUBE",
        "author": "주식애소리",
        "title": "[공모주] 멜콘 최종 결과 & 배정 결과 총정리: 10월 15일 상장일 매도 전략",
        "url": "https://www.youtube.com/watch?v=tMurBOnBcY0",
        "publishedAt": "2026-10-02",
        "sentiment": "POSITIVE",
        "summary": "대신증권 25.4만건 청약, 기관 확약 33.1% 감안한 상장일 유통물량 및 기대수익률 분석."
      },
      {
        "id": "rev-mel-3",
        "sourceType": "BLOG",
        "author": "티엔의 수익실험실 (네이버 블로그)",
        "title": "멜콘 공모주 청약 최종 결과, 경쟁률 3,482.95대 1과 비례 1주 가성비 분석",
        "url": "https://blog.naver.com/kastro83/224427206492",
        "publishedAt": "2026-10-02",
        "sentiment": "POSITIVE",
        "summary": "공모가 12,300원, 증거금 6.7조원 돌파, 10월 7일 환불일 체크 및 상장일 시초가 전망."
      }
    ],
    "aiScore": 94,
    "scoreGrade": "S"
  },
  {
    "id": "jincostec",
    "name": "진코스텍",
    "code": "250030",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-10-02",
    "subscriptionEnd": "2026-10-06",
    "refundDate": "2026-10-08",
    "listingDate": "2026-10-15",
    "priceBandMin": 19500,
    "priceBandMax": 23500,
    "confirmedPrice": 23500,
    "underwriters": [
      {
        "name": "하나증권",
        "allocatedShares": 213000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1097.6,
    "generalCompetitionRate": 685.83,
    "lockupCommitmentRate": 5.3,
    "circulatingSupplyRate": 58.4,
    "totalOfferingAmount": 200,
    "marketCapAtIpo": 890,
    "subscriptionResults": {
      "proportionalCompetitionRate": 1371.66,
      "totalAccounts": 147227,
      "totalDepositAmount": 1.72,
      "equalAllocationShares": 0.72
    },
    "aiSummary": {
      "headline": "10월 15일 코스닥 상장 완료! 일반 경쟁률 686:1(비례 1,372:1) 증거금 1.72조원 마감",
      "bulletPoints": [
        "2026년 10월 15일(목) 코스닥 시장 신규 상장 완료 (공식 종목코드: 250030)",
        "일반 청약 최종 경쟁률 685.83:1(비례 1,371.66:1) 기록, 청약 증거금 약 1조 7,200억원 유입",
        "청약 건수 14.7만건, 균등배정 0.72주(추첨 확률 72%), 확정 공모가 23,500원(상단)",
        "글로벌 인디 화장품 브랜드향 하이드로겔 패치 수출 고성장세 지속"
      ],
      "positivePoints": [
        "소형주 수급 메리트 및 청약 계좌 14.7만 건 이상 참여로 뜨거운 시장 관심",
        "글로벌 인디 화장품 브랜드향 하이드로겔 패치 수출 고성장세 지속"
      ],
      "riskPoints": [
        "상장 직후 유통가능물량 58.4% 출회 가능성 및 기존 주주 차익 매물 소화 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 78,
      "neutralRatio": 18,
      "cautionRatio": 4
    },
    "expertReviews": [
      {
        "id": "rev-jin-1",
        "sourceType": "YOUTUBE",
        "author": "주식애소리",
        "title": "[공모주] 진코스텍 청약 최종 결과 & 비례 1주 배정 금액 총정리",
        "url": "https://www.youtube.com/results?search_query=%EC%A7%84%EC%BD%94%EC%8A%A4%ED%85%8D+%EA%B3%B5%EB%AA%A8%EC%A3%BC",
        "publishedAt": "2026-10-06",
        "sentiment": "POSITIVE",
        "summary": "17,220:1 마감, 균등 배정 0.72주 및 10월 15일 멜콘과 동시 상장일 대응 전략."
      },
      {
        "id": "rev-jin-2",
        "sourceType": "BLOG",
        "author": "아이언의 공모주 이야기",
        "title": "진코스텍 공모주 청약 최종 마감 결과 및 배정 수량 분석",
        "url": "https://blog.naver.com/msql",
        "publishedAt": "2026-10-06",
        "sentiment": "POSITIVE",
        "summary": "하나증권 청약 건수 14.7만건, 비례 배정 계산 및 10월 8일 환불일 체크."
      }
    ],
    "aiScore": 82,
    "scoreGrade": "A"
  },
  {
    "id": "elice-group",
    "name": "엘리스그룹",
    "code": "459100",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-07",
    "subscriptionEnd": "2026-10-08",
    "refundDate": "2026-10-12",
    "listingDate": "2026-10-20",
    "priceBandMin": 70400,
    "priceBandMax": 90500,
    "confirmedPrice": 90500,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 1555400,
        "fee": 2000
      },
      {
        "name": "삼성증권",
        "allocatedShares": 666600,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 388.8,
    "generalCompetitionRate": 408.17,
    "lockupCommitmentRate": 15.2,
    "circulatingSupplyRate": 20.8,
    "totalOfferingAmount": 2011,
    "marketCapAtIpo": 10054,
    "subscriptionResults": {
      "totalAccounts": 289054,
      "totalDepositAmount": 10.26,
      "equalAllocationShares": 0.96,
      "proportionalCompetitionRate": 816.34
    },
    "aiSummary": {
      "headline": "일반 청약 경쟁률 408:1 (비례 816:1) 흥행! 증거금 10.26조원 돌파, 10월 20일 코스닥 상장",
      "bulletPoints": [
        "일반 청약 최종 경쟁률 408.17:1 (비례배정 경쟁률 816.34:1) 기록, 청약 증거금 10조 2,598억원 운집",
        "확정 공모가 90,500원 (상단 확정), 상장 후 시총 1조 54억원으로 하반기 코스닥 최대어 등극",
        "균등 배정 1인당 약 0.96주 (추첨 1주 또는 0주), 10월 12일 환불 완료 후 10월 20일(화) 코스닥 신규 상장 대기",
        "상장 직후 유통가능물량 20.81%로 대형 테크주 중 매우 타이트한 품절주 수급 구조"
      ],
      "positivePoints": [
        "자체 AI 실습 플랫폼 LXP 및 초거대 AI 데이터센터(PMDC) 독보적 경쟁력",
        "상장일 유통물량 20.8%로 오버행 부담 극히 낮음",
        "B2B/B2G 1,800개사 고객사 기반의 탄탄한 SaaS 연간반복매출(ARR)"
      ],
      "riskPoints": [
        "1주당 공모가 90,500원으로 최소 청약 단위(20주 기준) 증거금 부담 확인 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 86,
      "neutralRatio": 11,
      "cautionRatio": 3
    },
    "expertReviews": [
      {
        "id": "rev-elice-1",
        "sourceType": "YOUTUBE",
        "author": "주식애소리",
        "title": "[공모주] 엘리스그룹 수요예측 결과 분석: 90,500원 확정, 청약해야 할까?",
        "url": "https://www.youtube.com/results?search_query=%EC%97%98%EB%A6%AC%EC%8A%A4%EA%B7%B8%EB%A3%B9+%EA%B3%B5%EB%AA%A8%EC%A3%BC",
        "publishedAt": "2026-10-06",
        "sentiment": "POSITIVE",
        "summary": "확정공모가 90,500원, 시총 1조원 유니콘의 유통물량 20.8% 메리트 및 미래에셋·삼성 배정 전략."
      },
      {
        "id": "rev-elice-2",
        "sourceType": "BLOG",
        "author": "아이언의 공모주 이야기",
        "title": "엘리스그룹 공모주 수요예측 결과 및 비례배정 청약 한도 분석",
        "url": "https://blog.naver.com/msql",
        "publishedAt": "2026-10-06",
        "sentiment": "POSITIVE",
        "summary": "기관 경쟁률 388.8:1, 10월 7일~8일 청약 일정 및 증거금별 비례 배정 예상 주수."
      }
    ],
    "aiScore": 88,
    "scoreGrade": "S"
  },
  {
    "id": "ms-bio",
    "name": "엠에스바이오",
    "code": "391020",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-12",
    "subscriptionEnd": "2026-10-13",
    "refundDate": "2026-10-15",
    "listingDate": "2026-10-22",
    "priceBandMin": 6800,
    "priceBandMax": 7800,
    "confirmedPrice": 7800,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 1002500,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 1096.56,
    "generalCompetitionRate": 1538.51,
    "lockupCommitmentRate": 82.52,
    "circulatingSupplyRate": 31.8,
    "totalOfferingAmount": 312,
    "marketCapAtIpo": 2122,
    "subscriptionResults": {
      "totalAccounts": 286498,
      "totalDepositAmount": 6.01,
      "equalAllocationShares": 1.75,
      "proportionalCompetitionRate": 3076.02
    },
    "aiSummary": {
      "headline": "일반 경쟁률 1,539:1 (비례 3,076:1) 대흥행 마감! 확정공모가 7,800원, 10월 22일 코스닥 상장",
      "bulletPoints": [
        "일반 청약 최종 경쟁률 1,538.51:1 (비례배정 경쟁률 3,076.02:1) 기록, 청약 증거금 약 6조 151억원 유입",
        "확정 공모가 7,800원 (희망밴드 6,800~7,800원 상단 확정), 총 공모금액 312억원",
        "기관 수요예측 경쟁률 1,096.56:1 및 최종 의무보유확약 비율 82.52% 배정으로 기관 신뢰도 입증",
        "균등배정 1인당 약 1.75주 (1주 기본 + 75% 추첨 2주 배정), 10월 15일 환불 완료 후 10월 22일(목) 코스닥 신규 상장 대기"
      ],
      "positivePoints": [
        "연구개발 바이오텍과 달리 지속적인 영업이익 흑자 달성 및 천연물 건강기능식품 고성장 지속",
        "최종 의무보유확약 82.52% 배정으로 상장일 기관 유통 출회 가능 물량 대폭 축소",
        "공모가 7,800원 상단 확정 및 증거금 6조원 돌파로 상장 첫날 수급 모멘텀 우수"
      ],
      "riskPoints": [
        "상장 당일 유통가능물량 31.8%에 대한 단기 차익 실현 매물 출회 가능성 모니터링 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 78,
      "neutralRatio": 16,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 94,
    "scoreGrade": "S"
  },
  {
    "id": "dts-tech",
    "name": "디티에스",
    "code": "284010",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-13",
    "subscriptionEnd": "2026-10-14",
    "refundDate": "2026-10-16",
    "listingDate": "2026-10-23",
    "priceBandMin": 12000,
    "priceBandMax": 14000,
    "confirmedPrice": 18500,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 501507,
        "fee": 2000
      },
      {
        "name": "유진투자증권",
        "allocatedShares": 55723,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1042.0,
    "generalCompetitionRate": 986.89,
    "lockupCommitmentRate": 61.0,
    "circulatingSupplyRate": 28.2,
    "totalOfferingAmount": 412,
    "marketCapAtIpo": 2338,
    "subscriptionResults": {
      "totalAccounts": 240920,
      "totalDepositAmount": 5.09,
      "equalAllocationShares": 1.16,
      "proportionalCompetitionRate": 1973.78
    },
    "aiSummary": {
      "headline": "공모가 18,500원 확정 & 일반 경쟁률 987:1 (비례 1,974:1) 흥행 마감! 10월 23일 코스닥 상장",
      "bulletPoints": [
        "통합 일반 청약 최종 경쟁률 986.89:1 (비례배정 경쟁률 1,973.78:1) 기록, 청약 증거금 약 5조 868억원 유입",
        "확정 공모가 18,500원 (희망밴드 12,000~14,000원 대폭 초과), 최종 의무보유확약 비율 61.0% 고배정",
        "균등 배정 1인당 약 1.16주 (기본 1주 + 16% 추첨 2주), 10월 16일 환불 완료 후 10월 23일(금) 코스닥 신규 상장 대기",
        "주관사별 경쟁률: 대신증권 일반 998.39:1 (비례 1,996.77:1), 유진투자증권 일반 883.39:1 (비례 1,766.81:1)"
      ],
      "positivePoints": [
        "조선 슈퍼사이클 진입에 따른 탄탄한 3년치 일감 확보",
        "최종 의무보유확약 비율 61.0% 배정으로 상장일 기관 유통 출회 물량 방어",
        "수익성 높은 특수선용 열교환기 믹스 개선"
      ],
      "riskPoints": [
        "글로벌 원자재(구리, 스테인리스) 가격 변동에 따른 마진 민감도"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 70,
      "neutralRatio": 23,
      "cautionRatio": 7
    },
    "expertReviews": [],
    "aiScore": 89,
    "scoreGrade": "S"
  },
  {
    "id": "ck-solution",
    "name": "씨케이솔루션",
    "code": "480370",
    "market": "KOSPI",
    "status": "LISTED",
    "subscriptionStart": "2025-03-04",
    "subscriptionEnd": "2025-03-05",
    "refundDate": "2025-03-07",
    "listingDate": "2025-03-17",
    "priceBandMin": 13500,
    "priceBandMax": 15000,
    "confirmedPrice": 15000,
    "underwriters": [
      {
        "name": "NH투자증권",
        "allocatedShares": 800000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 25,
    "totalOfferingAmount": 567,
    "marketCapAtIpo": 3420,
    "aiSummary": {
      "headline": "2차전지 배터리 드라이룸 클린룸 공조 시스템 유가증권 상장 완료",
      "bulletPoints": [
        "LG에너지솔루션, 삼성SDI, SK온 국내 배터리 3사 드라이룸 메인 시공사",
        "북미·유럽 현지 공장 동반 진출로 해외 법인 매출 급성장",
        "코스피 상장으로 대형 기관 및 패시브 펀드 자금 유입 기대"
      ],
      "positivePoints": [
        "유통가능물량 25.0%로 코스피 대형주 대비 매우 양호한 수급",
        "드라이룸 제습기 핵심 국산화 기술로 독점적 경쟁 우위"
      ],
      "riskPoints": [
        "전기차 캐즘(일시적 둔화) 장기화 시 배터리사 증설 속도 조절 우려"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 68,
      "neutralRatio": 25,
      "cautionRatio": 7
    },
    "expertReviews": [],
    "aiScore": 84,
    "scoreGrade": "A"
  },
  {
    "id": "barofarm",
    "name": "바로팜",
    "code": "488210",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-02",
    "subscriptionEnd": "2026-11-03",
    "refundDate": "2026-11-05",
    "listingDate": "2026-11-12",
    "priceBandMin": 16400,
    "priceBandMax": 20200,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 650000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 27.4,
    "totalOfferingAmount": 330,
    "marketCapAtIpo": 2200,
    "aiSummary": {
      "headline": "전국 약국 80% 점유 의약품 B2B 플랫폼 바로팜, 11월 2일~3일 청약 연기 확정",
      "bulletPoints": [
        "정정 공시 반영: 청약 일정이 11월 2일(월) ~ 11월 3일(화)로 최종 확정",
        "희망 공모가 16,400 ~ 20,200원, 환불일: 11월 5일(목), 주관사: 미래에셋증권",
        "약국 원스톱 주문 SaaS 락인 효과와 제약 광고·커머스 고성장세"
      ],
      "positivePoints": [
        "강력한 약국 네트워크 락인(Lock-in) 효과와 압도적 시장 점유율",
        "플랫폼 기반 광고 및 데이터 사업 등 신규 고마진 수익원 가시화"
      ],
      "riskPoints": [
        "온라인 플랫폼 규제 및 기존 도매상과의 이해관계 조율 이슈"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 19,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 80,
    "scoreGrade": "A"
  },
  {
    "id": "dongwon-parts",
    "name": "동원파츠",
    "code": "342930",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-02",
    "subscriptionEnd": "2026-11-03",
    "refundDate": "2026-11-05",
    "listingDate": "2026-11-13",
    "priceBandMin": 23000,
    "priceBandMax": 26500,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "삼성증권",
        "allocatedShares": 480000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 23.8,
    "totalOfferingAmount": 390,
    "marketCapAtIpo": 2600,
    "aiSummary": {
      "headline": "반도체 식각·증착 부품 선도 동원파츠, 11월 2일~3일 일반 청약",
      "bulletPoints": [
        "램리서치·세메스 등 글로벌 톱 반도체 장비사향 초정밀 챔버 부품 직납",
        "희망 공모가 23,000 ~ 26,500원, 청약일: 11월 2일(월) ~ 11월 3일(화)",
        "환불일: 11월 5일(목), 주관사: 삼성증권"
      ],
      "positivePoints": [
        "상장일 유통물량 23.8%로 매우 가벼운 수급 모멘텀",
        "영업이익률 20%를 상회하는 압도적인 제조 원가 경쟁력"
      ],
      "riskPoints": [
        "전방 반도체 설비투자(CAPEX) 집행 시기에 따른 실적 변동성"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 78,
      "neutralRatio": 17,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 82,
    "scoreGrade": "A"
  },
  {
    "id": "creates",
    "name": "크리에이츠",
    "code": "462900",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-20",
    "subscriptionEnd": "2026-10-21",
    "refundDate": "2026-10-23",
    "listingDate": "2026-10-30",
    "priceBandMin": 15000,
    "priceBandMax": 18000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "삼성증권",
        "allocatedShares": 700000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 29.8,
    "totalOfferingAmount": 360,
    "marketCapAtIpo": 2150,
    "aiSummary": {
      "headline": "글로벌 골프 론치모니터(UNEEKOR) 10월 20일~21일 일반 청약 개시",
      "bulletPoints": [
        "초고속 비전 센서 기반 미국 골프 시뮬레이터 시장 점유율 최상위권",
        "희망 공모가 15,000 ~ 18,000원, 청약 기간: 10월 20일(화) ~ 10월 21일(수)",
        "환불일: 10월 23일(금), 대표 주관사: 삼성증권",
        "구독형 골프 시뮬레이션 SaaS 매출 확대로 북미 시장 고성장 지속"
      ],
      "positivePoints": [
        "미국 시장 내 프리미엄 브랜드 인지도 확립 및 높은 재구매율",
        "구독형 소프트웨어(SaaS) 시뮬레이션 서비스 도입으로 반복 수익 창출"
      ],
      "riskPoints": [
        "미국 등 주요 수출국의 경기 둔화 시 레저용품 소비 위축 가능성"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 71,
      "neutralRatio": 22,
      "cautionRatio": 7
    },
    "expertReviews": [],
    "aiScore": 79,
    "scoreGrade": "A"
  },
  {
    "id": "tne-korea",
    "name": "티앤이코리아",
    "code": "382010",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-20",
    "subscriptionEnd": "2026-10-21",
    "refundDate": "2026-10-23",
    "listingDate": "2026-10-29",
    "priceBandMin": 12600,
    "priceBandMax": 15300,
    "confirmedPrice": 15300,
    "underwriters": [
      {
        "name": "신한투자증권",
        "allocatedShares": 600000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1041.02,
    "lockupCommitmentRate": 29.52,
    "circulatingSupplyRate": 31.29,
    "totalOfferingAmount": 367.2,
    "marketCapAtIpo": 1737,
    "aiSummary": {
      "headline": "확정 공모가 15,300원(상단) 확정! 기관 경쟁률 1,041:1 & 의무확약 29.5% 흥행",
      "bulletPoints": [
        "수요예측 결과 공모 희망밴드(12,600~15,300원) 최상단인 15,300원으로 최종 확정 (공모규모 367.2억원)",
        "기관 수요예측 경쟁률 1,041.02:1 기록 및 의무보유확약 비율 29.52%(신청수량 기준) 달성",
        "상장 직후 유통가능물량 31.29%(3,551,856주), 상장 시가총액 약 1,737억원",
        "청약 일정: 2026년 10월 20일(화) ~ 10월 21일(수), 주관사: 신한투자증권 (환불일: 10월 23일, 상장예정일: 10월 29일)"
      ],
      "positivePoints": [
        "초고속 회전체 원천기술 보유로 높은 기술적 진입장벽",
        "에너지 절감 탄소중립 트렌드에 부합하는 산업용 블로워 수요 급증"
      ],
      "riskPoints": [
        "수소 산업 생태계 개화 속도에 따른 중장기 수혜 편차"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 73,
      "neutralRatio": 21,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 81,
    "scoreGrade": "A"
  },
  {
    "id": "lablup",
    "name": "래블업",
    "code": "481020",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-22",
    "subscriptionEnd": "2026-10-23",
    "refundDate": "2026-10-27",
    "listingDate": "2026-11-04",
    "priceBandMin": 19000,
    "priceBandMax": 22000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "NH투자증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 24.8,
    "totalOfferingAmount": 480,
    "marketCapAtIpo": 3200,
    "aiSummary": {
      "headline": "엔비디아 파트너사 AI GPU 가상화 솔루션 래블업, 10월 22일~23일 청약",
      "bulletPoints": [
        "정정 공시 완료: 청약 일정이 10월 22일(목) ~ 10월 23일(금)로 확정",
        "희망 공모가 19,000 ~ 22,000원, 환불일: 10월 27일(화), 주관사: NH투자증권",
        "고가 GPU 인프라 분산 효율화 Backend.AI 플랫폼 글로벌 도입 가속"
      ],
      "positivePoints": [
        "AI 인프라 효율화 소프트웨어 분야 독보적인 기술력과 레퍼런스",
        "구독형 엔터프라이즈 라이선스로 매년 누적되는 ARR(연간반복매출)"
      ],
      "riskPoints": [
        "글로벌 빅테크 오픈소스 기술 등장에 따른 기술 경쟁 지속"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 82,
      "neutralRatio": 14,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 83,
    "scoreGrade": "A"
  },
  {
    "id": "intellivix",
    "name": "인텔리빅스",
    "code": "372100",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-21",
    "subscriptionEnd": "2026-10-22",
    "refundDate": "2026-10-26",
    "listingDate": "2026-10-31",
    "priceBandMin": 7600,
    "priceBandMax": 9000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 625000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 25.5,
    "totalOfferingAmount": 295,
    "marketCapAtIpo": 1850,
    "aiSummary": {
      "headline": "13년 연속 흑자 안전 AI 딥테크 인텔리빅스, 10월 21일~22일 일반 청약",
      "bulletPoints": [
        "지능형 영상관제(Vizion AI) 및 생성형 AI 플랫폼 보유한 알짜 흑자 테크기업",
        "희망 공모가 7,600 ~ 9,000원, 청약 기간: 10월 21일(수) ~ 10월 22일(목)",
        "환불일: 10월 26일(월), 대표 주관사: 미래에셋증권",
        "스마트시티·산재예방 관제 시장 개화로 공공 및 대기업 수주 확대"
      ],
      "positivePoints": [
        "공공 안전 및 중대재해처벌법 강화에 따른 B2B 영상관제 수요 폭증",
        "10년 이상 축적된 압도적인 영상 데이터베이스와 높은 감지 정확도"
      ],
      "riskPoints": [
        "공공 프로젝트 발주 시기에 따른 계절적 분기 매출 편차"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 74,
      "neutralRatio": 20,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 81,
    "scoreGrade": "A"
  },
  {
    "id": "brills",
    "name": "브릴스",
    "code": "468670",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-22",
    "subscriptionEnd": "2026-09-23",
    "refundDate": "2026-09-25",
    "listingDate": "2026-10-10",
    "priceBandMin": 16000,
    "priceBandMax": 19500,
    "confirmedPrice": 19500,
    "underwriters": [
      {
        "name": "IBK투자증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1676.3,
    "lockupCommitmentRate": 18.2,
    "circulatingSupplyRate": 23.5,
    "totalOfferingAmount": 290,
    "marketCapAtIpo": 1450,
    "aiSummary": {
      "headline": "협동로봇 기반 맞춤형 표준 로봇 자동화 솔루션, 밴드 상단 초과 흥행",
      "bulletPoints": [
        "제조·물류 현장 투입용 모듈형 협동로봇 솔루션 플랫폼 소프트웨어 공급",
        "수요예측 경쟁률 1,676:1 기록, 공모가 상단 19,500원 확정",
        "상장일 유통물량 23.5%로 매우 가벼운 수급으로 시초가 상승 기대"
      ],
      "positivePoints": [
        "로봇 섹터 수급 호조와 가벼운 공모 규모",
        "의무보유확약 18.2%로 기관 보호예수 물량 풍부"
      ],
      "riskPoints": [
        "소형 로봇 테마주 특성상 상장 초기 높은 일중 변동성"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 83,
      "neutralRatio": 14,
      "cautionRatio": 3
    },
    "expertReviews": [],
    "aiScore": 89,
    "scoreGrade": "S"
  },
  {
    "id": "duksan-nepcores",
    "name": "덕산넵코어스",
    "code": "266690",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-23",
    "subscriptionEnd": "2026-09-24",
    "refundDate": "2026-09-26",
    "listingDate": "2026-10-14",
    "priceBandMin": 12500,
    "priceBandMax": 14600,
    "confirmedPrice": 14600,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 650000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 914.8,
    "lockupCommitmentRate": 15.3,
    "circulatingSupplyRate": 27.8,
    "totalOfferingAmount": 370,
    "marketCapAtIpo": 2400,
    "aiSummary": {
      "headline": "K-방산 유도무기 및 우주항공 정밀 PNT 항법 솔루션 독점적 지위",
      "bulletPoints": [
        "항재밍(Anti-Jamming) 및 위성항법 복합 항법장치 국산화 완료",
        "K-방산 수출 호조로 한화에어로, LIG넥스원향 장기 수주 잔고 급증",
        "수요예측 흥행으로 확정공모가 14,600원 밴드 상단 확정"
      ],
      "positivePoints": [
        "방산/우주항공 확실한 실적 기반과 국가 안보 필수 국산화 부품",
        "대신증권 단독 주관으로 깔끔한 배정 구조"
      ],
      "riskPoints": [
        "방산 프로젝트 계약 일정에 따른 매출 인식 시점 지연 가능성"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 80,
      "neutralRatio": 16,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 86,
    "scoreGrade": "S"
  },
  {
    "id": "bigwave-robotics",
    "name": "빅웨이브로보틱스",
    "code": "468300",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-24",
    "subscriptionEnd": "2026-09-25",
    "refundDate": "2026-09-29",
    "listingDate": "2026-10-16",
    "priceBandMin": 15000,
    "priceBandMax": 18000,
    "confirmedPrice": 18000,
    "underwriters": [
      {
        "name": "유진투자증권",
        "allocatedShares": 300000,
        "fee": 2000
      },
      {
        "name": "미래에셋증권",
        "allocatedShares": 150000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 885.2,
    "lockupCommitmentRate": 13.9,
    "circulatingSupplyRate": 29.1,
    "totalOfferingAmount": 210,
    "marketCapAtIpo": 1380,
    "aiSummary": {
      "headline": "로봇 자동화 매칭 플랫폼 마로솔(마이로봇솔루션) 운영사",
      "bulletPoints": [
        "기업 고객의 제조 공정에 최적화된 로봇 솔루션 추천 및 사후관리 RaaS 제공",
        "물류센터 AGV/AMR 이송로봇 통합 관제 소프트웨어 솔루션 개발",
        "기관 경쟁률 885:1, 공모가 상단 초과 14,000원에 확정"
      ],
      "positivePoints": [
        "공모 규모 210억원대 소형주 메리트와 로봇 테마 수급 호재",
        "단순 로봇 제조사가 아닌 소프트웨어 플랫폼형 비즈니스 모델"
      ],
      "riskPoints": [
        "중소기업 스마트공장 정부 보조금 예산 변동에 따른 민감도"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 77,
      "neutralRatio": 18,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 77,
    "scoreGrade": "A"
  },
  {
    "id": "kbank",
    "name": "케이뱅크",
    "code": "279570",
    "market": "KOSPI",
    "status": "LISTED",
    "isCancelled": true,
    "cancelReason": "기관 수요예측 결과 부진 및 상장일 오버행(구주매출 50%) 우려로 공모 철회신고서 제출",
    "subscriptionStart": "2026-09-20",
    "subscriptionEnd": "2026-09-21",
    "refundDate": "2026-09-23",
    "priceBandMin": 9500,
    "priceBandMax": 12000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "NH투자증권",
        "allocatedShares": 3200000,
        "fee": 2000
      },
      {
        "name": "KB증권",
        "allocatedShares": 2100000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 48.5,
    "lockupCommitmentRate": 2.1,
    "circulatingSupplyRate": 37.8,
    "totalOfferingAmount": 9800,
    "marketCapAtIpo": 50000,
    "aiSummary": {
      "headline": "[공모 취소/철회] 수요예측 부진 및 과도한 구주매출 우려로 철회 결정",
      "bulletPoints": [
        "기관 수요예측 경쟁률 48.5:1로 저조하여 공모 철회신고서 정식 공시",
        "총 공모 물량 중 구주매출 비중 50%로 상장 직후 오버행 리스크 지적",
        "업비트 예치금 의존도 및 플랫폼 밸류에이션 고평가 논란 확산"
      ],
      "positivePoints": [
        "케이뱅크 흑자 전환 실적",
        "아파트 담보대출 성장세"
      ],
      "riskPoints": [
        "공모 철회로 이번 청약 일정 전면 취소"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 15,
      "neutralRatio": 25,
      "cautionRatio": 60
    },
    "expertReviews": [],
    "aiScore": 31,
    "scoreGrade": "C"
  },
  {
    "id": "hanul-semi",
    "name": "한울반도체",
    "code": "320000",
    "market": "KOSDAQ",
    "status": "LISTED",
    "isCancelled": true,
    "cancelReason": "국내외 반도체 소부장 투자심리 위축에 따른 시장 친화적 기업가치 재평가를 위해 자진 철회",
    "subscriptionStart": "2026-09-30",
    "subscriptionEnd": "2026-10-01",
    "refundDate": "2026-10-05",
    "priceBandMin": 14000,
    "priceBandMax": 17000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "신한투자증권",
        "allocatedShares": 400000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 85.3,
    "lockupCommitmentRate": 3.5,
    "circulatingSupplyRate": 35.2,
    "totalOfferingAmount": 220,
    "marketCapAtIpo": 1350,
    "aiSummary": {
      "headline": "[공모 취소/철회] 반도체 시장 변동성 확대로 인한 발행 철회 결정",
      "bulletPoints": [
        "기관 투자자 수요예측 미달로 증권신고서 철회서 공식 접수",
        "공모가 밴드 하단 이하 주문 집중으로 무리한 상장 대신 시점 순연 선택",
        "선단 공정용 번인 소켓 및 테스트 인터페이스 기술 재정비 후 재추진 계획"
      ],
      "positivePoints": [
        "HBM 테스트 소켓 기술력 보유"
      ],
      "riskPoints": [
        "공모 취소로 이번 청약 미진행"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 20,
      "neutralRatio": 25,
      "cautionRatio": 55
    },
    "expertReviews": [],
    "aiScore": 32,
    "scoreGrade": "C"
  },
  {
    "id": "theborn-korea",
    "name": "더본코리아",
    "code": "475560",
    "market": "KOSPI",
    "status": "LISTED",
    "subscriptionStart": "2026-09-15",
    "subscriptionEnd": "2026-09-16",
    "refundDate": "2026-09-18",
    "listingDate": "2026-09-25",
    "priceBandMin": 23000,
    "priceBandMax": 28000,
    "confirmedPrice": 34000,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 1200000,
        "fee": 2000
      },
      {
        "name": "NH투자증권",
        "allocatedShares": 600000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 734.7,
    "lockupCommitmentRate": 12.3,
    "circulatingSupplyRate": 19.7,
    "totalOfferingAmount": 1020,
    "marketCapAtIpo": 4900,
    "openingPrice": 46350,
    "openingReturnRate": 36.3,
    "closingPrice": 51400,
    "closingReturnRate": 51.2,
    "aiSummary": {
      "headline": "백종원 대표의 글로벌 종합 외식 프랜차이즈, 코스피 상장일 51% 급등 성공",
      "bulletPoints": [
        "공모가 34,000원 확정(상단 초과) 후 상장 첫날 종가 51,400원 마감",
        "상장일 유통물량이 19.7%로 대형 공모주 중 매우 타이트한 품절주 효과",
        "빽다방, 홍콩반점 등 다각화된 25개 브랜드 포트폴리오와 HMR 유통"
      ],
      "positivePoints": [
        "상장일 유통물량 20% 미만으로 오버행 리스크 최소화",
        "압도적인 브랜드 대중 인지도와 탄탄한 현금성 자산"
      ],
      "riskPoints": [
        "가맹점주 상생 이슈 및 핵심 인물(백종원) 의존도 리스크"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 82,
      "neutralRatio": 14,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 83,
    "scoreGrade": "A"
  },
  {
    "id": "clobot",
    "name": "클로봇",
    "code": "466100",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-08",
    "subscriptionEnd": "2026-09-09",
    "refundDate": "2026-09-11",
    "listingDate": "2026-09-19",
    "priceBandMin": 9400,
    "priceBandMax": 10900,
    "confirmedPrice": 13000,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 900000,
        "fee": 2000
      },
      {
        "name": "신영증권",
        "allocatedShares": 150000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 933.6,
    "lockupCommitmentRate": 11.2,
    "circulatingSupplyRate": 28.5,
    "totalOfferingAmount": 411,
    "marketCapAtIpo": 3100,
    "openingPrice": 14500,
    "openingReturnRate": 11.5,
    "closingPrice": 11800,
    "closingReturnRate": -9.2,
    "aiSummary": {
      "headline": "지능형 실내 자율주행 로봇 서비스(크롬/카멜레온) 플랫폼 강자",
      "bulletPoints": [
        "현대차그룹 제로원, 보스턴다이내믹스 파트너십 구축",
        "기관 경쟁률 933:1로 공모가 13,000원에 상단 초과 확정",
        "상장 첫날 시초가 +11.5% 형성 후 장 후반 차익 실현 매물 출회"
      ],
      "positivePoints": [
        "국내 최다 130개 이상 이기종 로봇 관제 실적 보유",
        "현대차 전략적 투자자(SI) 지분 보유"
      ],
      "riskPoints": [
        "단기 차익 실현 매물에 따른 상장 초기 주가 변동성"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 76,
      "neutralRatio": 18,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 81,
    "scoreGrade": "A"
  },
  {
    "id": "inspien",
    "name": "인스피언",
    "code": "465480",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-01",
    "subscriptionEnd": "2026-09-02",
    "refundDate": "2026-09-04",
    "listingDate": "2026-09-12",
    "priceBandMin": 8000,
    "priceBandMax": 10000,
    "confirmedPrice": 12000,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 560000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1069.6,
    "lockupCommitmentRate": 18.9,
    "circulatingSupplyRate": 23.2,
    "totalOfferingAmount": 270,
    "marketCapAtIpo": 1230,
    "openingPrice": 24000,
    "openingReturnRate": 100,
    "closingPrice": 21300,
    "closingReturnRate": 77.5,
    "aiSummary": {
      "headline": "SAP 보안 솔루션 독점적 1위, 상장일 시초가 더블(+100%) 대박 기록",
      "bulletPoints": [
        "기관 경쟁률 1,069:1 기록, 공모가 상단 20% 초과 확정",
        "상장일 시초가 24,000원(+100%) 형성, 종가 21,300원으로 흥행",
        "국내 SAP ERP 보안 시장 점유율 1위 독점적 지위"
      ],
      "positivePoints": [
        "성공적인 시초가 따블 기록 달성",
        "클라우드 SaaS 고마진 매출 구조"
      ],
      "riskPoints": [
        "상장 1개월 후 벤처금융 의무보유 해제 물량 출회"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 88,
      "neutralRatio": 9,
      "cautionRatio": 3
    },
    "expertReviews": [],
    "aiScore": 90,
    "scoreGrade": "S"
  },
  {
    "id": "toprun-total",
    "name": "탑런토탈솔루션",
    "code": "336680",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-08-20",
    "subscriptionEnd": "2026-08-21",
    "refundDate": "2026-08-25",
    "listingDate": "2026-09-01",
    "priceBandMin": 12000,
    "priceBandMax": 14000,
    "confirmedPrice": 18000,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 625000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 841.4,
    "lockupCommitmentRate": 17.5,
    "circulatingSupplyRate": 29.8,
    "totalOfferingAmount": 450,
    "marketCapAtIpo": 3500,
    "openingPrice": 16500,
    "openingReturnRate": -8.3,
    "closingPrice": 13750,
    "closingReturnRate": -23.6,
    "aiSummary": {
      "headline": "차량용 OLED 디스플레이 전장 부품 핵심 공급사, 연 매출 5,000억 중견기업",
      "bulletPoints": [
        "LG전자, LG디스플레이 핵심 협력사로 전장 부품 수주 확대",
        "기관 경쟁률 841:1에 공모가 18,000원으로 상단 28% 초과 확정",
        "안정적인 연간 매출 5,000억원대의 우량한 재무 구조"
      ],
      "positivePoints": [
        "탄탄한 매출 규모와 차량용 전장 고성장 수혜",
        "의무확약 17.5%로 양호"
      ],
      "riskPoints": [
        "단일 대기업 고객사향 매출 의존도"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 81,
      "neutralRatio": 15,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 81,
    "scoreGrade": "A"
  },
  {
    "id": "tomocube",
    "name": "토모큐브",
    "code": "475960",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-08-12",
    "subscriptionEnd": "2026-08-13",
    "refundDate": "2026-08-17",
    "listingDate": "2026-08-26",
    "priceBandMin": 10900,
    "priceBandMax": 13400,
    "confirmedPrice": 16000,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 967.8,
    "lockupCommitmentRate": 15.6,
    "circulatingSupplyRate": 32.1,
    "totalOfferingAmount": 320,
    "marketCapAtIpo": 2030,
    "openingPrice": 15100,
    "openingReturnRate": -5.6,
    "closingPrice": 11800,
    "closingReturnRate": -26.3,
    "aiSummary": {
      "headline": "3D 홀로토모그래피 글로벌 원천기술 보유, 하버드/MIT 납품 레퍼런스",
      "bulletPoints": [
        "살아있는 세포를 염색 없이 실시간 3차원으로 관찰하는 혁신 현미경 기술",
        "기관 수요예측 967:1 기록으로 공모가 16,000원에 확정",
        "글로벌 바이오 연구기관 및 대형 제약사향 공급 본격 확대"
      ],
      "positivePoints": [
        "독보적 원천 기술력과 글로벌 고객사",
        "상단 초과 확정"
      ],
      "riskPoints": [
        "상장일 유통물량 32%로 중립 수준"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 79,
      "neutralRatio": 16,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 82,
    "scoreGrade": "A"
  },
  {
    "id": "alux",
    "name": "에이럭스",
    "code": "475580",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-08-04",
    "subscriptionEnd": "2026-08-05",
    "refundDate": "2026-08-07",
    "listingDate": "2026-08-18",
    "priceBandMin": 11500,
    "priceBandMax": 13500,
    "confirmedPrice": 16000,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 375000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 973.1,
    "lockupCommitmentRate": 14.8,
    "circulatingSupplyRate": 34.6,
    "totalOfferingAmount": 240,
    "marketCapAtIpo": 2110,
    "openingPrice": 19000,
    "openingReturnRate": 18.8,
    "closingPrice": 14500,
    "closingReturnRate": -9.4,
    "aiSummary": {
      "headline": "경량 드론 및 교육용 AI 로봇 플랫폼 제조사, 북미 수출 가시화",
      "bulletPoints": [
        "자체 조립형 코딩 로봇 및 비행 제어 드론 기술력 확보",
        "기관 경쟁률 973:1로 공모가 16,000원 상단 초과 확정",
        "전국 2,500개 초·중등 교육기관에 로봇 교구 독점 공급망 확보"
      ],
      "positivePoints": [
        "북미 드론 시장 수출 본격화",
        "견조한 흑자 기조 유지"
      ],
      "riskPoints": [
        "상장일 유통물량 34.6%로 다소 높은 부담"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 77,
    "scoreGrade": "A"
  },
  {
    "id": "한화플러스제6호기업인수목적",
    "name": "한화플러스제6호기업인수목적",
    "code": "450043",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-20",
    "subscriptionEnd": "2026-10-21",
    "refundDate": "2026-10-23",
    "listingDate": "2026-10-30",
    "priceBandMin": 2000,
    "priceBandMax": 2000,
    "confirmedPrice": 2000,
    "underwriters": [
      {
        "name": "한화투자증권",
        "allocatedShares": 3500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 85.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 72,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "공모가 2,000원 신규 스팩! 한화플러스제6호스팩 10월 20일~21일 청약",
      "bulletPoints": [
        "공모가 2,000원 고정, 청약 기간: 2026년 10월 20일(화) ~ 10월 21일(수)",
        "환불일: 10월 23일(금), 대표 주관사: 한화투자증권 (일반 청약한도 15만주)",
        "합병 실패 시에도 원금과 3년치 은행 이자 보장되는 안정적 하방 구조"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "이에스티",
    "name": "이에스티",
    "code": "412170",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-22",
    "subscriptionEnd": "2026-10-23",
    "refundDate": "2026-10-27",
    "listingDate": "2026-11-05",
    "priceBandMin": 10600,
    "priceBandMax": 12400,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 450000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 26.2,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 77,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "반도체 정전척(ESC) 국산화 선도기업 이에스티, 10월 22일~23일 일반 청약",
      "bulletPoints": [
        "웨이퍼 초정밀 고정 핵심 정전척 원천기술 보유 소부장 특례상장",
        "희망 공모가: 10,600 ~ 12,400원, 청약일: 10월 22일(목) ~ 10월 23일(금)",
        "환불일: 10월 27일(화), 대표 주관사: 대신증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "아이엠기업인수목적1호",
    "name": "아이엠기업인수목적1호",
    "code": "469272",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-26",
    "subscriptionEnd": "2026-10-27",
    "refundDate": "2026-10-29",
    "listingDate": "2026-11-06",
    "priceBandMin": 2000,
    "priceBandMax": 2000,
    "confirmedPrice": 2000,
    "underwriters": [
      {
        "name": "iM증권",
        "allocatedShares": 3000000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 85.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 71,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "공모가 2,000원! iM증권 신규 스팩 아이엠1호스팩 10월 26일~27일 청약",
      "bulletPoints": [
        "확정 공모가 2,000원, 청약 일정: 10월 26일(월) ~ 10월 27일(화)",
        "환불일: 10월 29일(목), 주관사: iM증권",
        "원금 및 연복리 반환예치 이자가 보장되는 저위험 스팩 공모주"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "에이엘로봇",
    "name": "에이엘로봇",
    "code": "417970",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-26",
    "subscriptionEnd": "2026-10-27",
    "refundDate": "2026-10-29",
    "listingDate": "2026-11-06",
    "priceBandMin": 15700,
    "priceBandMax": 17600,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 24.5,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 78,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "로봇 힘·토크 센서 및 제어 솔루션 에이엘로봇, 10월 26일~27일 청약",
      "bulletPoints": [
        "협동로봇 및 스마트 팩토리 필수 초정밀 센서 융합 시스템 국산화",
        "희망 공모가 15,700 ~ 17,600원, 청약일: 10월 26일(월) ~ 10월 27일(화)",
        "환불일: 10월 29일(목), 대표 주관사: 대신증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "엠비디",
    "name": "엠비디",
    "code": "417050",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-28",
    "subscriptionEnd": "2026-10-29",
    "refundDate": "2026-11-02",
    "listingDate": "2026-11-10",
    "priceBandMin": 9600,
    "priceBandMax": 11700,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "하나증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 28.5,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 75,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "3D 세포배양 맞춤형 약물 반응 예측 플랫폼 엠비디, 10월 28일~29일 청약",
      "bulletPoints": [
        "정정 공시 완료: 10월 28일(수) ~ 10월 29일(목) 청약 진행",
        "희망 공모가 9,600 ~ 11,700원, 환불일: 11월 2일(월), 주관사: 하나증권",
        "공모주식 전량 신주 발행으로 연구개발 및 글로벌 임상 확장 자금 유입"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "넥스아이",
    "name": "넥스아이",
    "code": "447253",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-03",
    "subscriptionEnd": "2026-11-04",
    "refundDate": "2026-11-06",
    "listingDate": "2026-11-13",
    "priceBandMin": 10500,
    "priceBandMax": 12500,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 500000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 25.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 75,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "머신비전 3D 검사 솔루션 넥스아이, 11월 3일~4일 일반 청약 개시",
      "bulletPoints": [
        "희망 공모가 10,500 ~ 12,500원, 청약일: 11월 3일(화) ~ 11월 4일(수)",
        "환불일: 11월 6일(금), 대표 주관사: KB증권",
        "반도체 및 2차전지 불량 자동 검출 비전 AI 장비 수요 확대"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "영광와이케이엠씨",
    "name": "영광와이케이엠씨",
    "code": "409600",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-04",
    "subscriptionEnd": "2026-11-05",
    "refundDate": "2026-11-09",
    "listingDate": "2026-11-17",
    "priceBandMin": 9400,
    "priceBandMax": 11000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 28.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 73,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "정밀 금속 가공 및 알루미늄 아노다이징 영광와이케이엠씨, 11월 4일~5일 청약",
      "bulletPoints": [
        "희망 공모가: 9,400 ~ 11,000원, 청약 기간: 11월 4일(수) ~ 11월 5일(목)",
        "환불일: 11월 9일(월), 주관사: 미래에셋증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "옵토닉스",
    "name": "옵토닉스",
    "code": "485424",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-05",
    "subscriptionEnd": "2026-11-06",
    "refundDate": "2026-11-10",
    "listingDate": "2026-11-18",
    "priceBandMin": 10000,
    "priceBandMax": 12000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "신한투자증권",
        "allocatedShares": 450000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 27.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 74,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "초정밀 광학 렌즈 및 레이저 모듈 전문 옵토닉스, 11월 5일~6일 청약",
      "bulletPoints": [
        "희망 공모가: 10,000 ~ 12,000원, 청약 기간: 11월 5일(목) ~ 11월 6일(금)",
        "환불일: 11월 10일(화), 주관사: 신한투자증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "하나에어로다이내믹스",
    "name": "하나에어로다이내믹스",
    "code": "410250",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-10",
    "subscriptionEnd": "2026-11-11",
    "refundDate": "2026-11-13",
    "listingDate": "2026-11-20",
    "priceBandMin": 4700,
    "priceBandMax": 5700,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "하나증권",
        "allocatedShares": 700000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 24.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 76,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "항공우주 복합재 및 가스터빈 부품사 하나에어로다이내믹스, 11월 10일~11일 청약",
      "bulletPoints": [
        "희망 공모가: 4,700 ~ 5,700원, 청약일: 11월 10일(화) ~ 11월 11일(수)",
        "환불일: 11월 13일(금), 주관사: 하나증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "엔키화이트햇",
    "name": "엔키화이트햇",
    "code": "417950",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-12",
    "subscriptionEnd": "2026-11-13",
    "refundDate": "2026-11-17",
    "listingDate": "2026-11-23",
    "priceBandMin": 13000,
    "priceBandMax": 15000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "NH투자증권",
        "allocatedShares": 400000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 23.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 76,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "사이버 보안 및 침해사고 방어 전문 엔키화이트햇, 11월 12일~13일 청약",
      "bulletPoints": [
        "희망 공모가: 13,000 ~ 15,000원, 청약일: 11월 12일(목) ~ 11월 13일(금)",
        "환불일: 11월 17일(화), 주관사: NH투자증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "제이앤티지",
    "name": "제이앤티지",
    "code": "414030",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-12",
    "subscriptionEnd": "2026-11-13",
    "refundDate": "2026-11-17",
    "listingDate": "2026-11-24",
    "priceBandMin": 26400,
    "priceBandMax": 30000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 22.5,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 79,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "수소연료전지 기체확산층(GDL) 국산화 제이앤티지, 11월 12일~13일 일반 청약",
      "bulletPoints": [
        "희망 공모가: 26,400 ~ 30,000원, 청약일: 11월 12일(목) ~ 11월 13일(금)",
        "환불일: 11월 17일(화), 주관사: 대신증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "씨앤엠",
    "name": "씨앤엠",
    "code": "406180",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-12",
    "subscriptionEnd": "2026-11-13",
    "refundDate": "2026-11-17",
    "listingDate": "2026-11-25",
    "priceBandMin": 10000,
    "priceBandMax": 10000,
    "confirmedPrice": 10000,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 600000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 28.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 75,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "반도체 패키징 검사 장비 전문 씨앤엠, 11월 12일~13일 공모 청약 개시",
      "bulletPoints": [
        "공모가 10,000원, 청약 기간: 11월 12일(목) ~ 11월 13일(금)",
        "환불일: 11월 17일(화), 대표 주관사: KB증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "아델",
    "name": "아델",
    "code": "463510",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-23",
    "subscriptionEnd": "2026-11-24",
    "refundDate": "2026-11-26",
    "listingDate": "2026-12-03",
    "priceBandMin": 18000,
    "priceBandMax": 21000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 400000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 25.0,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 78,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "알츠하이머 타우 단백질 표적 항체 치료제 바이오텍 아델, 11월 23일~24일 청약",
      "bulletPoints": [
        "희망 공모가: 18,000 ~ 21,000원, 청약일: 11월 23일(월) ~ 11월 24일(화)",
        "환불일: 11월 26일(목), 주관사: 한국투자증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  },
  {
    "id": "케이엠에프",
    "name": "케이엠에프",
    "code": "454392",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-24",
    "subscriptionEnd": "2026-11-25",
    "refundDate": "2026-11-27",
    "listingDate": "2026-12-04",
    "priceBandMin": 15000,
    "priceBandMax": 17800,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 24.5,
    "totalOfferingAmount": 250,
    "marketCapAtIpo": 1800,
    "aiScore": 76,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "원자력 및 수소 플랜트 고압 배관 피팅 케이엠에프, 11월 24일~25일 청약",
      "bulletPoints": [
        "희망 공모가: 15,000 ~ 17,800원, 청약 기간: 11월 24일(화) ~ 11월 25일(수)",
        "환불일: 11월 27일(금), 주관사: 미래에셋증권"
      ],
      "positivePoints": [
        "DART 증권신고서 정식 공시 및 효력 발생 완료",
        "우수한 펀더멘털과 안정적인 공모 구조"
      ],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": []
  }
];
