import { IpoItem } from '@/types/ipo';

export const MOCK_IPOS: IpoItem[] = [
  {
    id: 'theborn-korea',
    name: '더본코리아',
    code: '475560',
    market: 'KOSPI',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-28',
    subscriptionEnd: '2026-10-29',
    refundDate: '2026-10-31',
    listingDate: '2026-11-06',
    priceBandMin: 23000,
    priceBandMax: 28000,
    confirmedPrice: 34000, // 상단 대폭 초과 확정
    underwriters: [
      { name: '한국투자증권', allocatedShares: 1200000, fee: 2000 },
      { name: 'NH투자증권', allocatedShares: 600000, fee: 2000 },
    ],
    institutionalCompetitionRate: 734.6,
    lockupCommitmentRate: 12.2,
    circulatingSupplyRate: 19.7,
    totalOfferingAmount: 1020,
    marketCapAtIpo: 4918,
    aiScore: 88,
    scoreGrade: 'S',
    aiSummary: {
      headline: '백종원 대표의 글로벌 외식 프랜차이즈, 공모가 상단 초과 및 전국민적 인지도',
      bulletPoints: [
        '국내 2,900여 개 가맹점 기반 탄탄한 현금흐름 및 K-푸드 해외 소스 수출 본격화',
        '상장일 유통가능물량이 19.7%로 코스피 대어급 중 매우 가벼운 수급 구조',
        '공모가 34,000원에 확정되어 밸류에이션 논란이 일부 있으나 대중적 청약 열기 압도적'
      ],
      positivePoints: [
        '상장 첫날 유통가능 주식 수가 적어 수급 안정성 매우 높음',
        '백종원 대표 개인 브랜드 파워와 넷플릭스 흑백요리사 흥행 수혜'
      ],
      riskPoints: [
        '프랜차이즈 가맹점 리스크 및 상장 후 중장기 성장 동력 지속성 검증 필요'
      ]
    },
    sentimentConsensus: {
      positiveRatio: 82,
      neutralRatio: 14,
      cautionRatio: 4
    },
    expertReviews: [
      {
        id: 'rev-born-1',
        sourceType: 'YOUTUBE',
        author: '공모주 수첩 TV',
        title: '더본코리아 수요예측 대박! 균등+비례 총력전 가이드',
        url: 'https://youtube.com',
        publishedAt: '2026-10-25',
        sentiment: 'POSITIVE',
        summary: '기관 경쟁률 734:1로 양호하며 유통물량이 20% 미만이라 상장 당일 수급 프리미엄 기대.'
      },
      {
        id: 'rev-born-2',
        sourceType: 'BLOG',
        author: '재테크의 신 네이버 블로그',
        title: '더본코리아 상장 분석: 주관사별 한도 및 청약증거금 전략',
        url: 'https://blog.naver.com',
        publishedAt: '2026-10-26',
        sentiment: 'POSITIVE',
        summary: '한투 배정물량이 NH의 2배. 비례 청약 시 한투 계좌 집중 권장.'
      }
    ]
  },
  {
    id: 'neuro-robotics',
    name: '뉴로로보틱스',
    code: '482910',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-06',
    subscriptionEnd: '2026-10-07',
    refundDate: '2026-10-09',
    listingDate: '2026-10-16',
    priceBandMin: 22000,
    priceBandMax: 26000,
    confirmedPrice: 28000,
    underwriters: [
      { name: 'KB증권', allocatedShares: 750000, fee: 1500 },
      { name: '신한투자증권', allocatedShares: 250000, fee: 2000 },
    ],
    institutionalCompetitionRate: 1245.3,
    lockupCommitmentRate: 28.4,
    circulatingSupplyRate: 19.8,
    totalOfferingAmount: 700,
    marketCapAtIpo: 3450,
    aiScore: 92,
    scoreGrade: 'S',
    aiSummary: {
      headline: '기관 수요예측 대흥행 및 공모가 상단 초과, 상장일 가벼운 유통물량',
      bulletPoints: [
        '기관 경쟁률 1,245:1 기록으로 최근 3개월 로봇 섹터 중 최고 경쟁률 달성',
        '의무보유확약 비율 28.4%로 준수하며, 상장 첫날 유통가능물량 19.8%로 매우 가벼움',
        '글로벌 대기업향 피지컬 AI 로봇 센서 독점 공급 레퍼런스 보유'
      ],
      positivePoints: [
        '공모가 밴드 상단을 초과한 28,000원에 확정되어 시장 수요 입증',
        '상장일 유통금액 약 680억원 수준으로 수급 부담이 낮음'
      ],
      riskPoints: [
        '로봇 테마주 전반의 단기 시장 변동성 주의'
      ]
    },
    sentimentConsensus: {
      positiveRatio: 85,
      neutralRatio: 12,
      cautionRatio: 3
    },
    expertReviews: [
      {
        id: 'rev-1',
        sourceType: 'YOUTUBE',
        author: '공모주 수첩 TV',
        title: '뉴로로보틱스 수요예측 결과 분석! 비례까지 가야 할까?',
        url: 'https://youtube.com',
        publishedAt: '2026-10-04',
        sentiment: 'POSITIVE',
        summary: '기관 경쟁률 1245대 1로 대박. 유통물량 20% 미만으로 시초가 100% 이상 기대.'
      }
    ]
  },
  {
    id: 'datacore-cloud',
    name: '데이터코어클라우드',
    code: '394120',
    market: 'KOSPI',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-07',
    subscriptionEnd: '2026-10-08',
    refundDate: '2026-10-12',
    listingDate: '2026-10-19',
    priceBandMin: 35000,
    priceBandMax: 42000,
    confirmedPrice: 42000,
    underwriters: [
      { name: '미래에셋증권', allocatedShares: 1200000, fee: 2000 },
      { name: '한국투자증권', allocatedShares: 800000, fee: 2000 },
      { name: '삼성증권', allocatedShares: 400000, fee: 2000 }
    ],
    institutionalCompetitionRate: 840.5,
    lockupCommitmentRate: 15.2,
    circulatingSupplyRate: 26.5,
    totalOfferingAmount: 2500,
    marketCapAtIpo: 12800,
    aiScore: 78,
    scoreGrade: 'A',
    aiSummary: {
      headline: '코스피 대어급 AI 클라우드 인프라 기업, 준수한 실적 기반 안정적 청약',
      bulletPoints: [
        '기관 경쟁률 840:1로 코스피 대형주 치고 우수한 성적표 수령',
        '공모 규모 2,500억원의 중대형 딜로 균등 배정 1~2주 안정적 기대',
        '환불일이 4일(주말 포함) 소요되어 마이너스통장 이자 비용 계산 필수'
      ],
      positivePoints: [
        '국내 금융권 및 공공기관 프라이빗 클라우드 전환 1위 수혜',
        '흑자 전환 성공 및 매년 30% 이상의 매출 성장세 유지'
      ],
      riskPoints: [
        '환불일 4일로 인한 대출 이자 기회비용 발생'
      ]
    },
    sentimentConsensus: {
      positiveRatio: 70,
      neutralRatio: 22,
      cautionRatio: 8
    },
    expertReviews: []
  },
  {
    id: 'k-bank',
    name: '케이뱅크',
    code: '279570',
    market: 'KOSPI',
    status: 'UPCOMING',
    subscriptionStart: '2026-10-21',
    subscriptionEnd: '2026-10-22',
    refundDate: '2026-10-24',
    listingDate: '2026-10-30',
    priceBandMin: 9500,
    priceBandMax: 12000,
    confirmedPrice: 11000,
    underwriters: [
      { name: 'NH투자증권', allocatedShares: 3200000, fee: 2000 },
      { name: 'KB증권', allocatedShares: 2100000, fee: 1500 },
      { name: '신한투자증권', allocatedShares: 1000000, fee: 2000 }
    ],
    institutionalCompetitionRate: 480.2,
    lockupCommitmentRate: 11.5,
    circulatingSupplyRate: 37.2,
    totalOfferingAmount: 9800,
    marketCapAtIpo: 50000,
    aiScore: 73,
    scoreGrade: 'B',
    aiSummary: {
      headline: '국내 1호 인터넷전문은행 코스피 상장 재도전, 조 단위 대형 공모',
      bulletPoints: [
        '공모 규모 약 1조원에 달하는 초대형 IPO로 풍부한 청약 배정 물량',
        '업비트 예치금 의존도 축소 및 기업 대출 성장세 가속화',
        '상장일 유통가능물량이 37.2%로 다소 무거워 상장일 시초가 변동성 대비 필요'
      ],
      positivePoints: [
        '흑자 기조 안착 및 주관사 풀청약 배정 수량 넉넉함',
        '코스피 200 조기 편입 가능성 존재'
      ],
      riskPoints: [
        '구주매출 비중 49% 및 기존 재무적 투자자(FI) 락업 해제 물량'
      ]
    },
    sentimentConsensus: {
      positiveRatio: 60,
      neutralRatio: 28,
      cautionRatio: 12
    },
    expertReviews: []
  },
  {
    id: 'clobot',
    name: '클로봇',
    code: '466100',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-16',
    subscriptionEnd: '2026-10-17',
    refundDate: '2026-10-21',
    listingDate: '2026-10-28',
    priceBandMin: 9400,
    priceBandMax: 10900,
    confirmedPrice: 13000,
    underwriters: [
      { name: '미래에셋증권', allocatedShares: 900000, fee: 2000 },
      { name: '신영증권', allocatedShares: 150000, fee: 2000 }
    ],
    institutionalCompetitionRate: 933.8,
    lockupCommitmentRate: 14.5,
    circulatingSupplyRate: 28.1,
    totalOfferingAmount: 530,
    marketCapAtIpo: 3100,
    aiScore: 83,
    scoreGrade: 'A',
    aiSummary: {
      headline: '지능형 실내 자율주행 로봇 소프트웨어 선도 기업, 공모가 상단 초과',
      bulletPoints: [
        '현대차그룹 제로원 및 보스턴다이내믹스 파트너십 구축',
        '기관 경쟁률 933:1로 공모가 13,000원에 확정',
        '로봇 플랫폼 "카멜레온" 국내 최다 이기종 로봇 관제 실적'
      ],
      positivePoints: [
        '현대차·보스턴다이내믹스 협업 모멘텀',
        '공모가 밴드 상단 초과 흥행'
      ],
      riskPoints: [
        '환불일 4일 소요로 대출 이자 발생'
      ]
    },
    sentimentConsensus: {
      positiveRatio: 76,
      neutralRatio: 18,
      cautionRatio: 6
    },
    expertReviews: []
  },
  {
    id: 'ck-solution',
    name: '씨케이솔루션',
    code: '381980',
    market: 'KOSPI',
    status: 'UPCOMING',
    subscriptionStart: '2026-11-04',
    subscriptionEnd: '2026-11-05',
    refundDate: '2026-11-07',
    priceBandMin: 15700,
    priceBandMax: 18000,
    confirmedPrice: 0,
    underwriters: [
      { name: 'NH투자증권', allocatedShares: 800000, fee: 2000 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 25.1,
    totalOfferingAmount: 560,
    marketCapAtIpo: 2200,
    aiScore: 76,
    scoreGrade: 'A',
    aiSummary: {
      headline: '2차전지 드라이룸 및 클린룸 엔지니어링 강자, 코스피 상장 준비',
      bulletPoints: [
        'LG에너지솔루션, 삼성SDI, SK온 국내 배터리 3사 모두 고객사 확보',
        '글로벌 배터리 공장 증설에 따른 드라이룸 수주 잔고 안정적 유지',
        '기관 수요예측 결과 공시 후 최종 청약 가이드 업데이트 예정'
      ],
      positivePoints: ['배터리 3사향 탄탄한 흑자 실적', '단일 주관사로 청약 집중'],
      riskPoints: ['2차전지 캐즘(일시적 수요 정체)에 따른 설비투자 이연 가능성']
    },
    sentimentConsensus: { positiveRatio: 68, neutralRatio: 25, cautionRatio: 7 },
    expertReviews: []
  },
  {
    id: 'inspien',
    name: '인스피언',
    code: '465480',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2026-09-23',
    subscriptionEnd: '2026-09-24',
    refundDate: '2026-09-26',
    listingDate: '2026-10-04',
    priceBandMin: 8000,
    priceBandMax: 10000,
    confirmedPrice: 12000,
    underwriters: [
      { name: '한국투자증권', allocatedShares: 560000, fee: 2000 }
    ],
    institutionalCompetitionRate: 1069.6,
    lockupCommitmentRate: 19.8,
    circulatingSupplyRate: 23.2,
    totalOfferingAmount: 270,
    marketCapAtIpo: 1230,
    aiScore: 91,
    scoreGrade: 'S',
    aiSummary: {
      headline: 'SAP 보안 솔루션 독점 지위 및 클라우드 EDI 고성장 수혜',
      bulletPoints: [
        '기관 경쟁률 1,069:1 기록으로 공모가 상단 20% 초과 확정',
        '상장일 시초가 +85% 상승 출발하며 성공적인 투자 수익률 달성',
        '국내 SAP ERP 보안 시장 점유율 1위 기업'
      ],
      positivePoints: ['상장 첫날 높은 시초가 수익률 달성', '클라우드 SaaS 구독형 매출 성장'],
      riskPoints: ['상장 1개월 후 벤처금융 의무보유 해제 물량 출회 대비']
    },
    sentimentConsensus: { positiveRatio: 88, neutralRatio: 9, cautionRatio: 3 },
    expertReviews: []
  },
  {
    id: 'yj-link',
    name: '와이제이링크',
    code: '206050',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2026-09-25',
    subscriptionEnd: '2026-09-26',
    refundDate: '2026-09-30',
    listingDate: '2026-10-08',
    priceBandMin: 8600,
    priceBandMax: 9800,
    confirmedPrice: 12000,
    underwriters: [
      { name: 'KB증권', allocatedShares: 890000, fee: 1500 }
    ],
    institutionalCompetitionRate: 800.5,
    lockupCommitmentRate: 12.1,
    circulatingSupplyRate: 24.5,
    totalOfferingAmount: 430,
    marketCapAtIpo: 1700,
    aiScore: 84,
    scoreGrade: 'A',
    aiSummary: {
      headline: 'SMT 스마트팩토리 공정 자동화 솔루션 기업, 테슬라/스페이스X 납품 이력',
      bulletPoints: [
        '테슬라 및 스페이스X 협력사 등록으로 시장의 뜨거운 관심 집중',
        '공모가 상단 22% 초과한 12,000원에 확정',
        '해외 매출 비중 90% 이상으로 글로벌 다변화 성공'
      ],
      positivePoints: ['글로벌 빅테크 고객사 레퍼런스', '스마트팩토리 전방 산업 수요 견조'],
      riskPoints: ['글로벌 IT 경기 둔화 시 장비 발주 축소 우려']
    },
    sentimentConsensus: { positiveRatio: 78, neutralRatio: 17, cautionRatio: 5 },
    expertReviews: []
  },
  {
    id: 'lumir',
    name: '루미르',
    code: '474170',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2026-09-26',
    subscriptionEnd: '2026-09-27',
    refundDate: '2026-10-01',
    listingDate: '2026-10-11',
    priceBandMin: 16500,
    priceBandMax: 20500,
    confirmedPrice: 12000, // 하단 미달
    underwriters: [
      { name: 'NH투자증권', allocatedShares: 600000, fee: 2000 }
    ],
    institutionalCompetitionRate: 131.5,
    lockupCommitmentRate: 2.3,
    circulatingSupplyRate: 31.8,
    totalOfferingAmount: 288,
    marketCapAtIpo: 1780,
    aiScore: 54,
    scoreGrade: 'C',
    aiSummary: {
      headline: '초고해상도 지구관측 영상 SAR 위성 기업, 공모가 하단 미달 확정',
      bulletPoints: [
        '우주항공청 개청 및 뉴스페이스 수혜주로 꼽혔으나 기관 경쟁률 131:1로 부진',
        '공모가를 12,000원으로 대폭 낮추어 가격 메리트는 확보',
        '상장일 유통물량 31.8% 및 의무확약 2.3%로 상장 당일 단기 변동성 확대'
      ],
      positivePoints: ['공모가 대폭 할인으로 밸류에이션 부담 경감'],
      riskPoints: ['기관 의무확약 2.3%로 기관 물량 상장 첫날 대량 출회 가능']
    },
    sentimentConsensus: { positiveRatio: 30, neutralRatio: 40, cautionRatio: 30 },
    expertReviews: []
  },
  {
    id: 'hem-pharma',
    name: '에이치이엠파마',
    code: '376270',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-24',
    subscriptionEnd: '2026-10-25',
    refundDate: '2026-10-29',
    listingDate: '2026-11-05',
    priceBandMin: 16400,
    priceBandMax: 19000,
    confirmedPrice: 23000,
    underwriters: [
      { name: '신한투자증권', allocatedShares: 174000, fee: 2000 }
    ],
    institutionalCompetitionRate: 1220.7,
    lockupCommitmentRate: 18.2,
    circulatingSupplyRate: 29.8,
    totalOfferingAmount: 160,
    marketCapAtIpo: 1600,
    aiScore: 89,
    scoreGrade: 'S',
    aiSummary: {
      headline: '마이크로바이옴 맞춤형 헬스케어, 암웨이 지분 투자 및 수요예측 대박',
      bulletPoints: [
        '기관 경쟁률 1,220:1로 공모가 밴드 상단 초과 23,000원 확정',
        '글로벌 기업 암웨이와의 파트너십으로 안정적 캐시카우 확보',
        '공모 규모 160억원의 소형 딜로 상장일 수급 가벼움'
      ],
      positivePoints: ['상장 첫날 유통 금액이 적어 품절주 성격 수급 기대', '암웨이향 안정적 로열티'],
      riskPoints: ['소형주 특성상 시초가 급등 후 장중 차익실현 매물 주의']
    },
    sentimentConsensus: { positiveRatio: 84, neutralRatio: 12, cautionRatio: 4 },
    expertReviews: []
  },
  {
    id: 'tomocube',
    name: '토모큐브',
    code: '475960',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-28',
    subscriptionEnd: '2026-10-29',
    refundDate: '2026-10-31',
    listingDate: '2026-11-07',
    priceBandMin: 10900,
    priceBandMax: 13400,
    confirmedPrice: 16000,
    underwriters: [
      { name: '대신증권', allocatedShares: 500000, fee: 2000 }
    ],
    institutionalCompetitionRate: 967.8,
    lockupCommitmentRate: 15.6,
    circulatingSupplyRate: 32.1,
    totalOfferingAmount: 320,
    marketCapAtIpo: 2030,
    aiScore: 85,
    scoreGrade: 'A',
    aiSummary: {
      headline: '3D 홀로토모그래피 글로벌 원천기술 보유, 하버드/MIT 납품 레퍼런스',
      bulletPoints: [
        '살아있는 세포를 염색 없이 실시간 3차원으로 관찰하는 혁신 현미경 기술',
        '기관 수요예측 967:1 기록으로 공모가 16,000원에 확정',
        '글로벌 바이오 연구기관 및 대형 제약사향 공급 본격 확대'
      ],
      positivePoints: ['독보적 원천 기술력과 글로벌 고객사', '상단 초과 확정으로 분위기 고조'],
      riskPoints: ['상장일 유통물량 32%로 중립 수준']
    },
    sentimentConsensus: { positiveRatio: 79, neutralRatio: 16, cautionRatio: 5 },
    expertReviews: []
  },
  {
    id: 'alux',
    name: '에이럭스',
    code: '475580',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-23',
    subscriptionEnd: '2026-10-24',
    refundDate: '2026-10-28',
    listingDate: '2026-11-01',
    priceBandMin: 11500,
    priceBandMax: 13500,
    confirmedPrice: 16000,
    underwriters: [
      { name: '한국투자증권', allocatedShares: 375000, fee: 2000 }
    ],
    institutionalCompetitionRate: 973.1,
    lockupCommitmentRate: 14.2,
    circulatingSupplyRate: 34.6,
    totalOfferingAmount: 240,
    marketCapAtIpo: 2100,
    aiScore: 82,
    scoreGrade: 'A',
    aiSummary: {
      headline: '드론 및 로봇 에듀테크 기반 국방/방산 드론 확장, 흑자 고성장 기업',
      bulletPoints: [
        '국내 1위 로봇/드론 교육 인프라 바탕으로 정찰 드론 방산 사업 진출',
        '수요예측 973:1 달성 및 16,000원에 공모가 확정',
        '최근 3개년 연평균 40% 이상의 가파른 매출 성장 지속'
      ],
      positivePoints: ['확실한 흑자 경영 및 드론 테마성 수급 기대'],
      riskPoints: ['상장일 유통가능물량이 34.6%로 다소 있는 편']
    },
    sentimentConsensus: { positiveRatio: 75, neutralRatio: 20, cautionRatio: 5 },
    expertReviews: []
  },
  {
    id: 'toprun-total',
    name: '탑런토탈솔루션',
    code: '336680',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-23',
    subscriptionEnd: '2026-10-24',
    refundDate: '2026-10-28',
    listingDate: '2026-11-01',
    priceBandMin: 12000,
    priceBandMax: 14000,
    confirmedPrice: 18000,
    underwriters: [
      { name: 'KB증권', allocatedShares: 625000, fee: 1500 }
    ],
    institutionalCompetitionRate: 841.4,
    lockupCommitmentRate: 17.5,
    circulatingSupplyRate: 29.8,
    totalOfferingAmount: 450,
    marketCapAtIpo: 3500,
    aiScore: 86,
    scoreGrade: 'A',
    aiSummary: {
      headline: '차량용 OLED 디스플레이 전장 부품 핵심 공급사, LG그룹 밸류체인',
      bulletPoints: [
        'LG전자, LG디스플레이 핵심 협력사로 전장 부품 수주 확대',
        '기관 경쟁률 841:1에 공모가 18,000원으로 상단 28% 초과 확정',
        '안정적인 연간 매출 5,000억원대 중견 기업의 코스닥 입성'
      ],
      positivePoints: ['탄탄한 매출 규모와 차량용 전장 고성장 수혜', '의무확약 17.5%로 양호'],
      riskPoints: ['단일 대기업 고객사향 매출 의존도']
    },
    sentimentConsensus: { positiveRatio: 81, neutralRatio: 15, cautionRatio: 4 },
    expertReviews: []
  },
  {
    id: 'bio-genetics',
    name: '바이오셀테크',
    code: '451090',
    market: 'KOSDAQ',
    status: 'UPCOMING',
    subscriptionStart: '2026-11-12',
    subscriptionEnd: '2026-11-13',
    refundDate: '2026-11-15',
    priceBandMin: 14000,
    priceBandMax: 17000,
    confirmedPrice: 0,
    underwriters: [
      { name: 'NH투자증권', allocatedShares: 500000, fee: 2000 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 34.2,
    totalOfferingAmount: 340,
    marketCapAtIpo: 1100,
    aiScore: 61,
    scoreGrade: 'B',
    aiSummary: {
      headline: '수요예측 발표 전 대기 상태, 유통물량 비중 다소 높은 편',
      bulletPoints: [
        '차세대 면역항암제 플랫폼 기술특례 상장 케이스',
        '상장일 유통가능물량 34.2%로 다소 무거운 편이라 기관 수요예측 결과 확인 필수',
        '확정 공모가 및 의무보유확약 비율 공시 후 최종 점수 재산정 예정'
      ],
      positivePoints: ['글로벌 빅파마와 라이선스아웃 계약 이력'],
      riskPoints: ['기술특례 적자 기업으로 밸류에이션 논란 가능성']
    },
    sentimentConsensus: { positiveRatio: 40, neutralRatio: 45, cautionRatio: 15 },
    expertReviews: []
  },
  {
    id: 'eco-materials',
    name: '에코머티리얼즈',
    code: '312890',
    market: 'KOSPI',
    status: 'UPCOMING',
    subscriptionStart: '2026-11-18',
    subscriptionEnd: '2026-11-19',
    refundDate: '2026-11-21',
    priceBandMin: 45000,
    priceBandMax: 55000,
    confirmedPrice: 0,
    underwriters: [
      { name: '신한투자증권', allocatedShares: 900000, fee: 2000 },
      { name: '대신증권', allocatedShares: 300000, fee: 2000 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 22.0,
    totalOfferingAmount: 1100,
    marketCapAtIpo: 5500,
    aiScore: 84,
    scoreGrade: 'A',
    aiSummary: {
      headline: '친환경 이차전지 리사이클링 대장주 기대, 기관 IR 호평',
      bulletPoints: [
        '폐배터리 리사이클링 공정 수율 국내 최고 수준 달성',
        '2차전지 반등 국면과 맞물려 섹터 관심도 상승',
        '상장일 유통물량 22%로 비교적 안정적 수급'
      ],
      positivePoints: ['국내 완성차 및 배터리 대기업 밸류체인 직납', '영업이익률 18% 고마진'],
      riskPoints: ['메탈 원자재 가격 변동에 따른 마진율 영향']
    },
    sentimentConsensus: { positiveRatio: 78, neutralRatio: 18, cautionRatio: 4 },
    expertReviews: []
  },
  {
    id: 'global-retail',
    name: '글로벌리테일홀딩스',
    code: '289300',
    market: 'KOSPI',
    status: 'WAITING_LISTING',
    subscriptionStart: '2026-09-23',
    subscriptionEnd: '2026-09-24',
    refundDate: '2026-09-26',
    listingDate: '2026-10-08',
    priceBandMin: 18000,
    priceBandMax: 22000,
    confirmedPrice: 16000,
    underwriters: [
      { name: '하나증권', allocatedShares: 600000, fee: 2000 }
    ],
    institutionalCompetitionRate: 45.2,
    lockupCommitmentRate: 1.1,
    circulatingSupplyRate: 48.5,
    totalOfferingAmount: 320,
    marketCapAtIpo: 1900,
    aiScore: 42,
    scoreGrade: 'C',
    aiSummary: {
      headline: '기관 수요예측 참패 및 공모가 하단 미달, 상장일 매도 우위 주의',
      bulletPoints: [
        '기관 경쟁률 45:1에 그치며 공모가 밴드 하단 이하인 16,000원에 확정',
        '의무보유확약 1.1%로 사실상 기관 매도 잠재물량 즉각 출회 가능',
        '상장 당일 유통물량 48.5%로 상장 첫날 공모가 하회 리스크 매우 큼'
      ],
      positivePoints: ['공모가 할인으로 밸류에이션 부담 완화'],
      riskPoints: ['구주매출 비중 50% 및 유튜버 다수 청약 패스 의견']
    },
    sentimentConsensus: { positiveRatio: 5, neutralRatio: 15, cautionRatio: 80 },
    expertReviews: []
  }
];
