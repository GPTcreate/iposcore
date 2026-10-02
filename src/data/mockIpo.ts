import { IpoItem } from '@/types/ipo';

export const MOCK_IPOS: IpoItem[] = [
  {
    "id": "melcon",
    "name": "멜콘",
    "code": "377480",
    "market": "KOSDAQ",
    "status": "SUBSCRIPTION",
    "subscriptionStart": "2026-10-01",
    "subscriptionEnd": "2026-10-02",
    "refundDate": "2026-10-05",
    "listingDate": "2026-10-13",
    "priceBandMin": 13000,
    "priceBandMax": 15000,
    "confirmedPrice": 15500,
    "underwriters": [
      {
        "name": "신영증권",
        "allocatedShares": 450000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 982.4,
    "lockupCommitmentRate": 16.8,
    "circulatingSupplyRate": 24.3,
    "totalOfferingAmount": 280,
    "marketCapAtIpo": 1520,
    "aiSummary": {
      "headline": "반도체·디스플레이 초정밀 온도조절 칠러 강자, 공모가 상단 초과 확정",
      "bulletPoints": [
        "삼성전자 및 SK하이닉스 1차 벤더향 납품 레퍼런스 보유",
        "기관 수요예측 982:1 기록으로 공모가 15,500원에 확정",
        "상장일 유통가능물량이 24.3%로 비교적 가벼운 수급 구조"
      ],
      "positivePoints": [
        "반도체 HBM 고단화에 따른 초정밀 칠러 수요 급증",
        "흑자 영업이익률 15% 이상 유지 중인 실적 안정성"
      ],
      "riskPoints": [
        "신영증권 단독 주관으로 비례 청약 시 경쟁률 치열 예상"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 80,
      "neutralRatio": 16,
      "cautionRatio": 4
    },
    "expertReviews": [
      {
        "id": "rev-mel-1",
        "sourceType": "YOUTUBE",
        "author": "집돈버 구쯔",
        "title": "멜콘 공모주 청약 1일차 & 마감 예상 | 최소 수익률은?",
        "url": "https://www.youtube.com/watch?v=PVWW3PbSY5k",
        "publishedAt": "2026-10-01",
        "sentiment": "POSITIVE",
        "summary": "공모가 15,500원 확정, 첫날 청약 흐름 분석 및 균등 1주 배정 확률 점검."
      },
      {
        "id": "rev-mel-2",
        "sourceType": "YOUTUBE",
        "author": "주식애소리",
        "title": "[공모주] 멜콘, 삼성전자 & SK하이닉스가 택한 반도체 포토공정 환경장비",
        "url": "https://www.youtube.com/watch?v=tMurBOnBcY0",
        "publishedAt": "2026-10-01",
        "sentiment": "POSITIVE",
        "summary": "ASML 국내 유일 공급사 레퍼런스, 사이즈 및 가격 메리트, 기대수익률 총정리."
      },
      {
        "id": "rev-mel-3",
        "sourceType": "BLOG",
        "author": "티엔의 수익실험실 (네이버 블로그)",
        "title": "멜콘 공모주 청약분석, 기관경쟁률 1,136.84대 1과 비례청약 기회비용",
        "url": "https://blog.naver.com/kastro83/224427206492",
        "publishedAt": "2026-10-01",
        "sentiment": "POSITIVE",
        "summary": "반도체 초정밀 칠러 공급 레퍼런스, 기관 경쟁률 및 상장일 유통물량 정밀 분석."
      }
    ],
    "aiScore": 89,
    "scoreGrade": "S"
  },
  {
    "id": "jincostec",
    "name": "진코스텍",
    "code": "252540",
    "market": "KOSDAQ",
    "status": "SUBSCRIPTION",
    "subscriptionStart": "2026-10-02",
    "subscriptionEnd": "2026-10-06",
    "refundDate": "2026-10-08",
    "listingDate": "2026-10-15",
    "priceBandMin": 4800,
    "priceBandMax": 5500,
    "confirmedPrice": 5800,
    "underwriters": [
      {
        "name": "하나증권",
        "allocatedShares": 520000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 812.1,
    "lockupCommitmentRate": 11.4,
    "circulatingSupplyRate": 29.5,
    "totalOfferingAmount": 180,
    "marketCapAtIpo": 890,
    "aiSummary": {
      "headline": "K-뷰티 하이드로겔 마스크팩 OEM/ODM 강자, 글로벌 수출 확대 수혜",
      "bulletPoints": [
        "미국·일본 중심 K-뷰티 수출 호조로 하이드로겔 아이패치 주문량 급증",
        "기관 경쟁률 812:1로 밴드 상단 초과 5,800원 확정",
        "공모 규모 180억원의 소형주로 상장일 시초가 수급 유입 기대"
      ],
      "positivePoints": [
        "소형주 품절주 효과 기대 및 가벼운 시가총액",
        "해외 인디 브랜드사향 수주 가시성 높음"
      ],
      "riskPoints": [
        "상장일 유통물량 29.5%로 보통 수준, 단기 차익 실현 매물 주의"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 74,
      "neutralRatio": 21,
      "cautionRatio": 5
    },
    "expertReviews": [
      {
        "id": "rev-jin-1",
        "sourceType": "YOUTUBE",
        "author": "주식애소리",
        "title": "[공모주] 진코스텍 청약 전 총정리: 가벼운 공모 규모와 기대 수익률",
        "url": "https://www.youtube.com/results?search_query=%EC%A7%84%EC%BD%94%EC%8A%A4%ED%85%8D+%EA%B3%B5%EB%AA%A8%EC%A3%BC",
        "publishedAt": "2026-10-01",
        "sentiment": "POSITIVE",
        "summary": "5,800원 확정, 소형주 수급 탄력 점검 및 균등 비례 배정 예상주수 분석."
      },
      {
        "id": "rev-jin-2",
        "sourceType": "BLOG",
        "author": "아이언의 공모주 이야기",
        "title": "진코스텍 공모주 청약 정보 및 수요예측 결과 요약",
        "url": "https://blog.naver.com/msql",
        "publishedAt": "2026-10-01",
        "sentiment": "POSITIVE",
        "summary": "하나증권 단독 주관, 1인당 배정 수량 시뮬레이션 및 상장일 대응 전략."
      }
    ],
    "aiScore": 76,
    "scoreGrade": "A"
  },
  {
    "id": "elice-group",
    "name": "엘리스그룹",
    "code": "459100",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-07",
    "subscriptionEnd": "2026-10-08",
    "refundDate": "2026-10-12",
    "listingDate": "2026-10-20",
    "priceBandMin": 18000,
    "priceBandMax": 21000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 700000,
        "fee": 2000
      },
      {
        "name": "삼성증권",
        "allocatedShares": 300000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 26.5,
    "totalOfferingAmount": 420,
    "marketCapAtIpo": 2850,
    "aiSummary": {
      "headline": "국내 1위 실습 중심 AI 교육·클라우드 인프라 플랫폼, 고성장 테크주",
      "bulletPoints": [
        "자체 AI 실습 플랫폼 엘리스LXP 및 초거대 AI 데이터센터 인프라 구축",
        "대기업·공공기관 1,800개사 고객사 확보로 B2B 반복 매출 구조",
        "AI 국가 전략 과제 선정 및 동남아 싱가포르 등 글로벌 진출 본격화"
      ],
      "positivePoints": [
        "소프트웨어 교육 시장 독점적 1위 및 고마진 SaaS 비즈니스",
        "빅테크 파트너십 확대로 안정적 수주 파이프라인"
      ],
      "riskPoints": [
        "수요예측 결과 발표 전으로 기관 경쟁률 모니터링 필수"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 72,
      "neutralRatio": 22,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 57,
    "scoreGrade": "C"
  },
  {
    "id": "ms-bio",
    "name": "엠에스바이오",
    "code": "391020",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-12",
    "subscriptionEnd": "2026-10-13",
    "refundDate": "2026-10-15",
    "listingDate": "2026-10-23",
    "priceBandMin": 8000,
    "priceBandMax": 9500,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 31.8,
    "totalOfferingAmount": 190,
    "marketCapAtIpo": 1100,
    "aiSummary": {
      "headline": "천연물 추출 기반 관절염·간기능 개선 기능성 원료 전문 바이오텍",
      "bulletPoints": [
        "개별인정형 건강기능식품 원료 식약처 승인 다수 보유",
        "주요 대형 제약사향 독점 원료 공급으로 안정적 현금흐름 창출",
        "중국·동남아 글로벌 기능성 식품 시장 수출 가시화"
      ],
      "positivePoints": [
        "연구개발 바이오텍과 달리 지속적인 영업이익 흑자 달성 중",
        "공모 규모 190억원대로 상대적으로 가벼운 몸집"
      ],
      "riskPoints": [
        "상장일 유통물량 31.8%로 구주매출 비율 점검 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 64,
      "neutralRatio": 26,
      "cautionRatio": 10
    },
    "expertReviews": [],
    "aiScore": 52,
    "scoreGrade": "C"
  },
  {
    "id": "dts-tech",
    "name": "디티에스",
    "code": "284010",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-13",
    "subscriptionEnd": "2026-10-14",
    "refundDate": "2026-10-16",
    "listingDate": "2026-10-26",
    "priceBandMin": 12000,
    "priceBandMax": 14000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 600000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 28.2,
    "totalOfferingAmount": 252,
    "marketCapAtIpo": 1680,
    "aiSummary": {
      "headline": "LNG 추진선 및 발전 플랜트용 공랭식 열교환기 글로벌 탑티어",
      "bulletPoints": [
        "조선·해양 친환경 고부가가치 선박 수주 호황의 직접 수혜",
        "글로벌 에너지 메이저사 벤더 등록 완료로 해외 수주 잔고 급증",
        "공랭식 열교환기 독자 특허 설계로 에너지 효율 극대화"
      ],
      "positivePoints": [
        "조선 슈퍼사이클 진입에 따른 탄탄한 3년치 일감 확보",
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
    "aiScore": 57,
    "scoreGrade": "C"
  },
  {
    "id": "ck-solution",
    "name": "씨케이솔루션",
    "code": "381980",
    "market": "KOSPI",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-16",
    "subscriptionEnd": "2026-10-17",
    "refundDate": "2026-10-21",
    "listingDate": "2026-10-29",
    "priceBandMin": 15700,
    "priceBandMax": 18000,
    "confirmedPrice": 0,
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
      "headline": "2차전지 배터리 드라이룸 & 클린룸 공조 시스템 유가증권 상장 도전",
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
    "aiScore": 59,
    "scoreGrade": "C"
  },
  {
    "id": "barofarm",
    "name": "바로팜",
    "code": "488210",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-20",
    "subscriptionEnd": "2026-10-21",
    "refundDate": "2026-10-23",
    "listingDate": "2026-10-30",
    "priceBandMin": 14000,
    "priceBandMax": 16500,
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
      "headline": "전국 약국 80%가 사용하는 의약품 주문 통합 B2B 플랫폼 1위",
      "bulletPoints": [
        "약국 전용 원스톱 주문·품절 입고 알림 SaaS 솔루션 시장 장악",
        "제약사 다이렉트 마케팅 및 결제 금융 서비스로 비즈니스 모델 확장",
        "월간 활성 거래액(GMV) 매 분기 두 자릿수 성장률 달성"
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
    "aiScore": 57,
    "scoreGrade": "C"
  },
  {
    "id": "dongwon-parts",
    "name": "동원파츠",
    "code": "342930",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-22",
    "subscriptionEnd": "2026-10-23",
    "refundDate": "2026-10-27",
    "listingDate": "2026-11-04",
    "priceBandMin": 22000,
    "priceBandMax": 26000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "한국투자증권",
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
      "headline": "반도체 식각·증착 장비용 초정밀 세라믹 & 메탈 가공 핵심 부품사",
      "bulletPoints": [
        "글로벌 톱 반도체 장비사(어플라이드 머티어리얼즈 등) 직납 레퍼런스",
        "초미세 선단 공정 전환에 따른 정밀 챔버 및 샤워헤드 교체 수요 급증",
        "5축 초정밀 가공 스마트 팩토리 완전 자동화 라인 가동"
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
    "aiScore": 61,
    "scoreGrade": "B"
  },
  {
    "id": "creates",
    "name": "크리에이츠",
    "code": "462900",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-26",
    "subscriptionEnd": "2026-10-27",
    "refundDate": "2026-10-29",
    "listingDate": "2026-11-06",
    "priceBandMin": 10500,
    "priceBandMax": 12500,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "NH투자증권",
        "allocatedShares": 720000,
        "fee": 2000
      },
      {
        "name": "신한투자증권",
        "allocatedShares": 240000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 30.5,
    "totalOfferingAmount": 360,
    "marketCapAtIpo": 2150,
    "aiSummary": {
      "headline": "초고속 카메라 센서 기반 글로벌 골프 론치모니터(QED/UNEEKOR) 선도기업",
      "bulletPoints": [
        "미국 개인용 골프 시뮬레이터 및 아웃도어 론치모니터 시장 점유율 상위권",
        "자체 비전 AI 알고리즘으로 볼 스핀 및 클럽 궤적 초정밀 실시간 계측",
        "해외 매출 비중 70% 이상으로 글로벌 엔터테인먼트 시장 공략"
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
    "aiScore": 53,
    "scoreGrade": "C"
  },
  {
    "id": "tne-korea",
    "name": "티앤이코리아",
    "code": "382010",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-10-28",
    "subscriptionEnd": "2026-10-29",
    "refundDate": "2026-10-31",
    "listingDate": "2026-11-10",
    "priceBandMin": 13000,
    "priceBandMax": 15000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 550000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 26.1,
    "totalOfferingAmount": 238,
    "marketCapAtIpo": 1550,
    "aiSummary": {
      "headline": "수소연료전지 및 반도체 공정용 초고속 공기베어링 터보블로워 국산화 선도",
      "bulletPoints": [
        "오일리스(Oil-less) 공기포일베어링 원천기술로 친환경 고효율 송풍기 상용화",
        "현대차 수소 상용차 및 건물용 연료전지 공기공급기 공급사 선정",
        "산업용 터보압축기 교체 수요 증가로 연평균 30% 매출 성장"
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
    "aiScore": 57,
    "scoreGrade": "C"
  },
  {
    "id": "lablup",
    "name": "래블업",
    "code": "481020",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-03",
    "subscriptionEnd": "2026-11-04",
    "refundDate": "2026-11-06",
    "listingDate": "2026-11-13",
    "priceBandMin": 24000,
    "priceBandMax": 29000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "삼성증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 25.8,
    "totalOfferingAmount": 480,
    "marketCapAtIpo": 3200,
    "aiSummary": {
      "headline": "엔비디아 파트너사, 생성형 AI GPU 클러스터 가상화 플랫폼 Backend.AI",
      "bulletPoints": [
        "고가 GPU 자원을 조각내어 공유·배분하는 AI 분산 인프라 플랫폼 기술",
        "국내 주요 통신사, 클라우드 CSP사 및 대기업 연구소 필수 도입",
        "소버린 AI 인프라 확산에 따른 글로벌 라이선스 수출 성장"
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
    "aiScore": 58,
    "scoreGrade": "C"
  },
  {
    "id": "intellivix",
    "name": "인텔리빅스",
    "code": "372100",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-09",
    "subscriptionEnd": "2026-11-10",
    "refundDate": "2026-11-12",
    "listingDate": "2026-11-19",
    "priceBandMin": 11000,
    "priceBandMax": 13500,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "하나증권",
        "allocatedShares": 600000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 28.9,
    "totalOfferingAmount": 295,
    "marketCapAtIpo": 1850,
    "aiSummary": {
      "headline": "국내 1호 지능형 CCTV 공공인증 AI 비전 영상분석 솔루션 강자",
      "bulletPoints": [
        "화재, 침입, 쓰러짐 등 복합 이상행동을 실시간 감지하는 비전 AI 알고리즘",
        "전국 지자체 통합관제센터 및 스마트시티, 국방 안보 프로젝트 수주 점유율 1위",
        "엣지 AI 박스 하드웨어 일체형 솔루션으로 B2B 산업안전 분야 확장"
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
    "aiScore": 57,
    "scoreGrade": "C"
  },
  {
    "id": "brills",
    "name": "브릴스",
    "code": "471900",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-09-22",
    "subscriptionEnd": "2026-09-23",
    "refundDate": "2026-09-25",
    "listingDate": "2026-10-10",
    "priceBandMin": 8500,
    "priceBandMax": 10000,
    "confirmedPrice": 11000,
    "underwriters": [
      {
        "name": "신한투자증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1052.4,
    "lockupCommitmentRate": 18.2,
    "circulatingSupplyRate": 23.5,
    "totalOfferingAmount": 220,
    "marketCapAtIpo": 1450,
    "aiSummary": {
      "headline": "협동로봇 기반 맞춤형 표준 로봇 자동화 솔루션, 밴드 상단 초과 흥행",
      "bulletPoints": [
        "제조·물류 현장 투입용 모듈형 협동로봇 솔루션 플랫폼 소프트웨어 공급",
        "수요예측 경쟁률 1,052:1 기록, 공모가 상단 10% 초과 확정",
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
    "code": "461230",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-09-23",
    "subscriptionEnd": "2026-09-24",
    "refundDate": "2026-09-26",
    "listingDate": "2026-10-14",
    "priceBandMin": 15000,
    "priceBandMax": 17500,
    "confirmedPrice": 18500,
    "underwriters": [
      {
        "name": "미래에셋증권",
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
        "수요예측 914:1 기록, 확정공모가 18,500원 상단 돌파"
      ],
      "positivePoints": [
        "방산/우주항공 확실한 실적 기반과 국가 안보 필수 국산화 부품",
        "해외 수주 물량 확대에 따른 레버리지 효과"
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
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-09-24",
    "subscriptionEnd": "2026-09-25",
    "refundDate": "2026-09-29",
    "listingDate": "2026-10-16",
    "priceBandMin": 12000,
    "priceBandMax": 13500,
    "confirmedPrice": 14000,
    "underwriters": [
      {
        "name": "KB증권",
        "allocatedShares": 450000,
        "fee": 1500
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
    "code": "389200",
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
  }
];
