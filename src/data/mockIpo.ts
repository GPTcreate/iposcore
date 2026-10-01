import { IpoItem } from '@/types/ipo';

export const MOCK_IPOS: IpoItem[] = [
  // ==========================================
  // 1. 현재 청약 진행 중 (SUBSCRIPTION)
  // ==========================================
  {
    id: 'melcon',
    name: '멜콘',
    code: '377480',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-01',
    subscriptionEnd: '2026-10-02',
    refundDate: '2026-10-05',
    listingDate: '2026-10-13',
    priceBandMin: 13000,
    priceBandMax: 15000,
    confirmedPrice: 15500, // 상단 초과 확정
    underwriters: [
      { name: '신영증권', allocatedShares: 450000, fee: 2000 }
    ],
    institutionalCompetitionRate: 982.4,
    lockupCommitmentRate: 16.8,
    circulatingSupplyRate: 24.3,
    totalOfferingAmount: 280,
    marketCapAtIpo: 1520,
    aiScore: 89,
    scoreGrade: 'S',
    aiSummary: {
      headline: '반도체·디스플레이 초정밀 온도조절 칠러 강자, 공모가 상단 초과 확정',
      bulletPoints: [
        '삼성전자 및 SK하이닉스 1차 벤더향 납품 레퍼런스 보유',
        '기관 수요예측 982:1 기록으로 공모가 15,500원에 확정',
        '상장일 유통가능물량이 24.3%로 비교적 가벼운 수급 구조'
      ],
      positivePoints: [
        '반도체 HBM 고단화에 따른 초정밀 칠러 수요 급증',
        '흑자 영업이익률 15% 이상 유지 중인 실적 안정성'
      ],
      riskPoints: [
        '신영증권 단독 주관으로 비례 청약 시 경쟁률 치열 예상'
      ]
    },
    sentimentConsensus: {
      positiveRatio: 80,
      neutralRatio: 16,
      cautionRatio: 4
    },
    expertReviews: [
      {
        id: 'rev-mel-1',
        sourceType: 'YOUTUBE',
        author: '집돈버 구쯔',
        title: '멜콘 공모주 청약 1일차 & 마감 예상 | 최소 수익률은?',
        url: 'https://www.youtube.com/watch?v=PVWW3PbSY5k',
        publishedAt: '2026-10-01',
        sentiment: 'POSITIVE',
        summary: '공모가 15,500원 확정, 첫날 청약 흐름 분석 및 균등 1주 배정 확률 점검.',
      },
      {
        id: 'rev-mel-2',
        sourceType: 'YOUTUBE',
        author: '주식애소리',
        title: '[공모주] 멜콘, 삼성전자 & SK하이닉스가 택한 반도체 포토공정 환경장비',
        url: 'https://www.youtube.com/watch?v=tMurBOnBcY0',
        publishedAt: '2026-10-01',
        sentiment: 'POSITIVE',
        summary: 'ASML 국내 유일 공급사 레퍼런스, 사이즈 및 가격 메리트, 기대수익률 총정리.',
      },
      {
        id: 'rev-mel-3',
        sourceType: 'BLOG',
        author: '티엔의 수익실험실 (네이버 블로그)',
        title: '멜콘 공모주 청약분석, 기관경쟁률 1,136.84대 1과 비례청약 기회비용',
        url: 'https://blog.naver.com/kastro83/224427206492',
        publishedAt: '2026-10-01',
        sentiment: 'POSITIVE',
        summary: '반도체 초정밀 칠러 공급 레퍼런스, 기관 경쟁률 및 상장일 유통물량 정밀 분석.',
      },
    ],
  },
  {
    id: 'jincostec',
    name: '진코스텍',
    code: '252540',
    market: 'KOSDAQ',
    status: 'SUBSCRIPTION',
    subscriptionStart: '2026-10-02',
    subscriptionEnd: '2026-10-06',
    refundDate: '2026-10-08',
    listingDate: '2026-10-15',
    priceBandMin: 4800,
    priceBandMax: 5500,
    confirmedPrice: 5800,
    underwriters: [
      { name: '하나증권', allocatedShares: 520000, fee: 2000 }
    ],
    institutionalCompetitionRate: 812.1,
    lockupCommitmentRate: 11.4,
    circulatingSupplyRate: 29.5,
    totalOfferingAmount: 180,
    marketCapAtIpo: 890,
    aiScore: 76,
    scoreGrade: 'A',
    aiSummary: {
      headline: 'K-뷰티 하이드로겔 마스크팩 OEM/ODM 강자, 글로벌 수출 확대 수혜',
      bulletPoints: [
        '미국·일본 중심 K-뷰티 수출 호조로 하이드로겔 아이패치 주문량 급증',
        '기관 경쟁률 812:1로 밴드 상단 초과 5,800원 확정',
        '공모 규모 180억원의 소형주로 상장일 시초가 수급 유입 기대',
      ],
      positivePoints: [
        '소형주 품절주 효과 기대 및 가벼운 시가총액',
        '해외 인디 브랜드사향 수주 가시성 높음',
      ],
      riskPoints: [
        '중소형 화장품 OEM/ODM 업계 내 단가 경쟁 심화 가능성',
      ],
    },
    sentimentConsensus: {
      positiveRatio: 74,
      neutralRatio: 21,
      cautionRatio: 5,
    },
    expertReviews: [
      {
        id: 'rev-jin-1',
        sourceType: 'YOUTUBE',
        author: '주식애소리',
        title: '[공모주] 진코스텍, K-뷰티 코넥스 이전상장 청약 포인트 / 괴리율 점검',
        url: 'https://www.youtube.com/watch?v=L26gbE89SDM',
        publishedAt: '2026-10-01',
        sentiment: 'POSITIVE',
        summary: '코넥스 이전상장 청약 체크포인트, 기존주주 단가 및 괴리율 비교 분석.',
      },
      {
        id: 'rev-jin-2',
        sourceType: 'YOUTUBE',
        author: '집돈버 구쯔',
        title: '진코스텍 공모주 수요예측 결과, 기업 소개와 공모 조건 분석',
        url: 'https://www.youtube.com/watch?v=vMd28qWsk0U',
        publishedAt: '2026-10-01',
        sentiment: 'POSITIVE',
        summary: '공모 규모 180억원 소형주 매력, K-뷰티 하이드로겔 아이패치 수혜 점검.',
      },
      {
        id: 'rev-jin-3',
        sourceType: 'BLOG',
        author: '슈엔슈의 공모주 투자 (네이버 블로그)',
        title: '진코스텍 수요예측 결과 및 비례 청약 전략표',
        url: 'https://blog.naver.com/xuenxu/224428362525',
        publishedAt: '2026-10-01',
        sentiment: 'POSITIVE',
        summary: '하나증권 단독 주관 진코스텍 공모주 청약 가이드 및 균등/비례 기대수익 점검.',
      },
    ],
  },

  // ==========================================
  // 2. 청약 예정 (UPCOMING)
  // ==========================================
  {
    id: 'elice-group',
    name: '엘리스그룹',
    code: '459100',
    market: 'KOSDAQ',
    status: 'UPCOMING',
    subscriptionStart: '2026-10-07',
    subscriptionEnd: '2026-10-08',
    refundDate: '2026-10-12',
    listingDate: '2026-10-20',
    priceBandMin: 18000,
    priceBandMax: 22000,
    confirmedPrice: 0, // 수요예측 결과 발표 대기
    underwriters: [
      { name: '미래에셋증권', allocatedShares: 700000, fee: 2000 },
      { name: '삼성증권', allocatedShares: 300000, fee: 2000 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 26.2,
    totalOfferingAmount: 420,
    marketCapAtIpo: 2600,
    aiScore: 78,
    scoreGrade: 'A',
    aiSummary: {
      headline: 'AI 디지털 교육 플랫폼 1위 에듀테크, 공공/대기업 DX 수혜',
      bulletPoints: [
        'KAIST 출신 연구진 창업 AI 코딩 교육 및 DX 인프라 선도 기업',
        '초중고 AI 디지털 교과서 사업 및 정부 디지털 인재 양성 사업 선정',
        '수요예측 결과 공시 후 최종 확정공모가 및 점수 재산정 예정'
      ],
      positivePoints: ['AI 디지털 교과서 정책 수혜', '기업 맞춤형 AI DX 구독 매출 확대'],
      riskPoints: ['정부 교육 예산 변동성에 따른 단기 실적 영향']
    },
    sentimentConsensus: { positiveRatio: 72, neutralRatio: 22, cautionRatio: 6 },
    expertReviews: []
  },
  {
    id: 'ms-bio',
    name: '엠에스바이오',
    code: '391020',
    market: 'KOSDAQ',
    status: 'UPCOMING',
    subscriptionStart: '2026-10-12',
    subscriptionEnd: '2026-10-13',
    refundDate: '2026-10-15',
    listingDate: '2026-10-22',
    priceBandMin: 11000,
    priceBandMax: 13500,
    confirmedPrice: 0,
    underwriters: [
      { name: '한국투자증권', allocatedShares: 500000, fee: 2000 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 31.5,
    totalOfferingAmount: 250,
    marketCapAtIpo: 1400,
    aiScore: 71,
    scoreGrade: 'B',
    aiSummary: {
      headline: '차세대 약물전달체(DDS) 플랫폼 기술특례 상장 추진',
      bulletPoints: [
        '지질나노입자(LNP) 개량 기술을 활용한 항암제 전달 플랫폼 보유',
        '글로벌 제약사 라이선스아웃 타겟 파이프라인 개발 진행',
        '수요예측 기관 경쟁률 확인 필수'
      ],
      positivePoints: ['기술특례 평가 A/A 등급 통과', '단일 주관사로 청약 집중'],
      riskPoints: ['신약 개발 적자 기업으로 밸류에이션 논란 가능성']
    },
    sentimentConsensus: { positiveRatio: 58, neutralRatio: 30, cautionRatio: 12 },
    expertReviews: []
  },
  {
    id: 'dts-tech',
    name: '디티에스',
    code: '284010',
    market: 'KOSDAQ',
    status: 'UPCOMING',
    subscriptionStart: '2026-10-13',
    subscriptionEnd: '2026-10-14',
    refundDate: '2026-10-16',
    listingDate: '2026-10-23',
    priceBandMin: 8500,
    priceBandMax: 10000,
    confirmedPrice: 0,
    underwriters: [
      { name: 'KB증권', allocatedShares: 600000, fee: 1500 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 23.8,
    totalOfferingAmount: 200,
    marketCapAtIpo: 1100,
    aiScore: 76,
    scoreGrade: 'A',
    aiSummary: {
      headline: '원자력 발전 및 플랜트용 초정밀 공정 열교환기 전문 제조업체',
      bulletPoints: [
        '체코 원전 수주 및 SMR(소형모듈원자로) 테마 수혜 기대',
        '한수원 유자격 공급자 등록 및 글로벌 EPC사 납품 이력',
        '상장일 유통물량 23.8%로 비교적 안정적인 수급'
      ],
      positivePoints: ['K-원전 르네상스 수혜', '유통물량 20% 초반대로 수급 부담 적음'],
      riskPoints: ['글로벌 플랜트 발주 주기에 따른 매출 변동성']
    },
    sentimentConsensus: { positiveRatio: 70, neutralRatio: 23, cautionRatio: 7 },
    expertReviews: []
  },
  {
    id: 'ck-solution',
    name: '씨케이솔루션',
    code: '381980',
    market: 'KOSPI',
    status: 'UPCOMING',
    subscriptionStart: '2026-10-16',
    subscriptionEnd: '2026-10-17',
    refundDate: '2026-10-21',
    listingDate: '2026-10-28',
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
    aiScore: 79,
    scoreGrade: 'A',
    aiSummary: {
      headline: '2차전지 드라이룸 및 클린룸 엔지니어링 강자, 코스피 상장 준비',
      bulletPoints: [
        'LG에너지솔루션, 삼성SDI, SK온 국내 배터리 3사 모두 고객사 확보',
        '글로벌 배터리 공장 증설에 따른 드라이룸 수주 잔고 안정적 유지',
        '환불일 4일(주말 포함)으로 마통 청약 시 이자 계산 필수'
      ],
      positivePoints: ['배터리 3사향 탄탄한 흑자 실적', '단일 주관사로 청약 집중'],
      riskPoints: ['2차전지 캐즘에 따른 설비투자 이연 가능성']
    },
    sentimentConsensus: { positiveRatio: 68, neutralRatio: 25, cautionRatio: 7 },
    expertReviews: []
  },

  // ==========================================
  // 3. 상장 대기 / 일정 조정 (WAITING_LISTING)
  // ==========================================
  {
    id: 'k-bank',
    name: '케이뱅크',
    code: '279570',
    market: 'KOSPI',
    status: 'WAITING_LISTING',
    subscriptionStart: '2026-10-21',
    subscriptionEnd: '2026-10-22',
    refundDate: '2026-10-24',
    listingDate: '추후 재공시',
    priceBandMin: 9500,
    priceBandMax: 12000,
    confirmedPrice: 0,
    underwriters: [
      { name: 'NH투자증권', allocatedShares: 3200000, fee: 2000 },
      { name: 'KB증권', allocatedShares: 2100000, fee: 1500 }
    ],
    institutionalCompetitionRate: 0,
    lockupCommitmentRate: 0,
    circulatingSupplyRate: 37.2,
    totalOfferingAmount: 9800,
    marketCapAtIpo: 50000,
    aiScore: 49,
    scoreGrade: 'C',
    aiSummary: {
      headline: '국내 1호 인터넷전문은행 대어, 공모 구조 재정비 후 상장 재추진 중',
      bulletPoints: [
        '조 단위 대형 공모로 구주매출 비중(49%) 축소 및 밸류에이션 재조정 추진',
        '업비트 예치금 의존도 완화 및 기업대출 포트폴리오 다각화 성과',
        '수요예측 일정 재확정 시 공모가 밴드 및 주관사 최종 공시 예정'
      ],
      positivePoints: ['흑자 기조 안착 및 코스피 200 특례편입 잠재력'],
      riskPoints: ['구주매출 비중 및 상장일 유통물량 부담']
    },
    sentimentConsensus: { positiveRatio: 55, neutralRatio: 30, cautionRatio: 15 },
    expertReviews: []
  },

  // ==========================================
  // 4. 지난 공모주 (상장 완료: LISTED)
  // ==========================================
  {
    id: 'theborn-korea',
    name: '더본코리아',
    code: '475560',
    market: 'KOSPI',
    status: 'LISTED',
    subscriptionStart: '2024-10-28',
    subscriptionEnd: '2024-10-29',
    refundDate: '2024-10-31',
    listingDate: '2024-11-06',
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
    aiScore: 83,
    scoreGrade: 'A',
    aiSummary: {
      headline: '백종원 대표 외식 프랜차이즈, 상장 첫날 +51% 급등 마감하며 대흥행',
      bulletPoints: [
        '기관 경쟁률 734:1 기록으로 공모가 상단(28,000원)을 훌륭히 초과한 34,000원에 확정',
        '상장일 유통가능물량이 19.7%로 매우 가벼워 상장 당일 시초가 +60% 이상 상승 출발',
        '국내 2,900여 개 가맹점 기반 탄탄한 현금흐름과 K-푸드 해외 소스 수출 본격화'
      ],
      positivePoints: [
        '상장 첫날 유통가능 주식 수가 적어 수급 안정성 매우 높았음',
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
        author: '주식애소리',
        title: '[공모주] 더본코리아, 킥은 백종원 ! 생존입니까? / 청약해서 남는 게 있을 지 따져보자!',
        url: 'https://www.youtube.com/watch?v=nibo7EyXl4s',
        publishedAt: '2024-10-25',
        sentiment: 'POSITIVE',
        summary: '백종원 대표의 브랜드 파워, 프랜차이즈 해외 진출 모멘텀 및 공모주 청약 실익 분석.',
      },
      {
        id: 'rev-born-2',
        sourceType: 'BLOG',
        author: '제이현의 경제이야기 (네이버 블로그)',
        title: '더본코리아 공모주 상장 및 주가 전망 분석',
        url: 'https://blog.naver.com/cyh5584/224419806556',
        publishedAt: '2024-10-26',
        sentiment: 'POSITIVE',
        summary: '한국투자증권·NH투자증권 복수 주관 더본코리아 청약 일정 및 최종 배정 전략.',
      },
    ],
  },
  {
    id: 'clobot',
    name: '클로봇',
    code: '466100',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2024-10-16',
    subscriptionEnd: '2024-10-17',
    refundDate: '2024-10-21',
    listingDate: '2024-10-28',
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
      headline: '지능형 실내 자율주행 로봇 소프트웨어 선도 기업, 성공적 코스닥 상장',
      bulletPoints: [
        '현대차그룹 제로원 및 보스턴다이내믹스 파트너십 구축으로 시장 주목',
        '기관 경쟁률 933:1로 공모가 상단 초과 13,000원에 확정',
        '로봇 플랫폼 "카멜레온" 국내 최다 이기종 로봇 관제 실적 보유'
      ],
      positivePoints: ['현대차·보스턴다이내믹스 협업 모멘텀', '공모가 밴드 상단 초과'],
      riskPoints: ['로봇 테마 변동성에 따른 주가 등락 주의']
    },
    sentimentConsensus: { positiveRatio: 76, neutralRatio: 18, cautionRatio: 6 },
    expertReviews: []
  },
  {
    id: 'inspien',
    name: '인스피언',
    code: '465480',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2024-09-23',
    subscriptionEnd: '2024-09-24',
    refundDate: '2024-09-26',
    listingDate: '2024-10-18',
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
      headline: 'SAP ERP 보안 솔루션 독점 1위, 상장일 시초가 +85% 따블 달성',
      bulletPoints: [
        '기관 경쟁률 1,069:1 기록으로 공모가 상단 20% 초과한 12,000원 확정',
        '상장 첫날 시초가 85% 급등 출발하며 청약 참여자에게 높은 수익 안겨줌',
        '국내 SAP ERP 보안 시장 점유율 1위 독점적 지위'
      ],
      positivePoints: ['성공적인 시초가 따블 기록 달성', '클라우드 SaaS 고마진 매출 구조'],
      riskPoints: ['상장 1개월 후 벤처금융 의무보유 해제 물량 출회']
    },
    sentimentConsensus: { positiveRatio: 88, neutralRatio: 9, cautionRatio: 3 },
    expertReviews: []
  },
  {
    id: 'toprun-total',
    name: '탑런토탈솔루션',
    code: '336680',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2024-10-23',
    subscriptionEnd: '2024-10-24',
    refundDate: '2024-10-28',
    listingDate: '2024-11-01',
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
      headline: '차량용 OLED 디스플레이 전장 부품 핵심 공급사, 연 매출 5,000억 중견기업',
      bulletPoints: [
        'LG전자, LG디스플레이 핵심 협력사로 전장 부품 수주 확대',
        '기관 경쟁률 841:1에 공모가 18,000원으로 상단 28% 초과 확정',
        '안정적인 연간 매출 5,000억원대의 우량한 재무 구조'
      ],
      positivePoints: ['탄탄한 매출 규모와 차량용 전장 고성장 수혜', '의무확약 17.5%로 양호'],
      riskPoints: ['단일 대기업 고객사향 매출 의존도']
    },
    sentimentConsensus: { positiveRatio: 81, neutralRatio: 15, cautionRatio: 4 },
    expertReviews: []
  },
  {
    id: 'tomocube',
    name: '토모큐브',
    code: '475960',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2024-10-28',
    subscriptionEnd: '2024-10-29',
    refundDate: '2024-10-31',
    listingDate: '2024-11-07',
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
      positivePoints: ['독보적 원천 기술력과 글로벌 고객사', '상단 초과 확정'],
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
    status: 'LISTED',
    subscriptionStart: '2024-10-23',
    subscriptionEnd: '2024-10-24',
    refundDate: '2024-10-28',
    listingDate: '2024-11-01',
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
    id: 'hem-pharma',
    name: '에이치이엠파마',
    code: '376270',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2024-10-24',
    subscriptionEnd: '2024-10-25',
    refundDate: '2024-10-29',
    listingDate: '2024-11-05',
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
      positivePoints: ['상장 첫날 유통 금액이 적어 품절주 성격 수급', '암웨이향 안정적 로열티'],
      riskPoints: ['소형주 특성상 시초가 급등 후 장중 차익실현 매물 주의']
    },
    sentimentConsensus: { positiveRatio: 84, neutralRatio: 12, cautionRatio: 4 },
    expertReviews: []
  },
  {
    id: 'yj-link',
    name: '와이제이링크',
    code: '206050',
    market: 'KOSDAQ',
    status: 'LISTED',
    subscriptionStart: '2024-09-25',
    subscriptionEnd: '2024-09-26',
    refundDate: '2024-09-30',
    listingDate: '2024-10-18',
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
    subscriptionStart: '2024-09-26',
    subscriptionEnd: '2024-09-27',
    refundDate: '2024-10-01',
    listingDate: '2024-10-21',
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
    aiScore: 37,
    scoreGrade: 'C',
    aiSummary: {
      headline: '초고해상도 지구관측 영상 SAR 위성 기업, 공모가 하단 미달 확정',
      bulletPoints: [
        '우주항공청 개청 수혜주로 꼽혔으나 기관 경쟁률 131:1로 부진',
        '공모가를 12,000원으로 대폭 낮추어 가격 메리트는 확보',
        '상장일 유통물량 31.8% 및 의무확약 2.3%로 상장 당일 단기 변동성 확대'
      ],
      positivePoints: ['공모가 대폭 할인으로 밸류에이션 부담 경감'],
      riskPoints: ['기관 의무확약 2.3%로 기관 물량 상장 첫날 대량 출회']
    },
    sentimentConsensus: { positiveRatio: 30, neutralRatio: 40, cautionRatio: 30 },
    expertReviews: []
  },
  {
    id: 'global-retail',
    name: '글로벌리테일홀딩스',
    code: '289300',
    market: 'KOSPI',
    status: 'LISTED',
    subscriptionStart: '2024-09-23',
    subscriptionEnd: '2024-09-24',
    refundDate: '2024-09-26',
    listingDate: '2024-10-08',
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
