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
    "institutionalCompetitionRate": 1136.84,
    "generalCompetitionRate": 1741.48,
    "lockupCommitmentRate": 36.07,
    "circulatingSupplyRate": 34.5,
    "totalOfferingAmount": 307.5,
    "marketCapAtIpo": 1549.8,
    "subscriptionResults": {
      "proportionalCompetitionRate": 3481.33,
      "totalAccounts": 254009,
      "totalDepositAmount": 6.7,
      "equalAllocationShares": 1.23
    },
    "aiSummary": {
      "headline": "2026-10-15 상장 · 시초가 27,400원(+122.8%) · 종가 17,120원(+39.2%)",
      "bulletPoints": [
        "2026-10-01~2026-10-02 일반청약, 환불 2026-10-07.",
        "확정 공모가 12,300원, 총 공모금액 307.5억원.",
        "기관 수요예측 1,136.84:1, 신청수량 기준 의무보유확약 36.07%.",
        "특수 목적용 기계 제조업. 주요 제품·서비스: THC, XPS."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 34.5%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
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
    "scoreGrade": "S",
    "openingPrice": 27400,
    "openingReturnRate": 122.8,
    "closingPrice": 17120,
    "closingReturnRate": 39.2,
    "offeringShareCount": 2500000,
    "listedShareCount": 12600000,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 12300,
        "publishedAt": "2026-09-29",
        "excerpt": "confirmedPrice: 12300; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1136.84,
        "publishedAt": "2026-09-29",
        "excerpt": "institutionalCompetitionRate: 1136.84; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 36.07,
        "publishedAt": "2026-09-29",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 36.07% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 34.5,
        "publishedAt": "2026-09-29",
        "excerpt": "circulatingSupplyRate: 34.5; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2500000,
        "publishedAt": "2026-09-29",
        "excerpt": "offeringShareCount: 2500000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 12600000,
        "publishedAt": "2026-09-29",
        "excerpt": "listedShareCount: 12600000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 307.5,
        "publishedAt": "2026-09-29",
        "excerpt": "공모 2,500,000주 × 확정공모가 12,300원 = 307.5억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1549.8,
        "publishedAt": "2026-09-29",
        "excerpt": "공모 후 주식수 12,600,000주 × 확정공모가 12,300원 ÷ 1억원 = 1549.8억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "179880",
        "excerpt": "멜콘 | 코스닥 | 179880 | 상장일 2026-10-15",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-10-15",
        "excerpt": "멜콘 | 코스닥 | 179880 | 상장일 2026-10-15",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260929000191"
        }
      ]
    },
    "listingPriceEvidence": {
      "code": "179880",
      "tradeDate": "2026-10-15",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=179880&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T11:52:46.704Z"
    }
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
    "institutionalCompetitionRate": 1097.62,
    "generalCompetitionRate": 685.83,
    "lockupCommitmentRate": 5.29,
    "circulatingSupplyRate": 58.44,
    "totalOfferingAmount": 200.22,
    "marketCapAtIpo": 889.835255,
    "subscriptionResults": {
      "proportionalCompetitionRate": 1371.66,
      "totalAccounts": 147227,
      "totalDepositAmount": 1.72,
      "equalAllocationShares": 0.72
    },
    "aiSummary": {
      "headline": "2026-10-15 상장 · 시초가 24,000원(+2.1%) · 종가 14,350원(-38.9%)",
      "bulletPoints": [
        "2026-10-02~2026-10-06 일반청약, 환불 2026-10-08.",
        "확정 공모가 23,500원, 총 공모금액 200.22억원.",
        "기관 수요예측 1,097.62:1, 신청수량 기준 의무보유확약 5.29%.",
        "기타 화학제품 제조업. 주요 제품·서비스: 하이드로겔 패치 및 마스크팩 ODM/OEM."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 58.44%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
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
    "scoreGrade": "A",
    "openingPrice": 24000,
    "openingReturnRate": 2.1,
    "closingPrice": 14350,
    "closingReturnRate": -38.9,
    "offeringShareCount": 852000,
    "listedShareCount": 3786533,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 진코스텍 정정 투자설명서 공모조건·수요예측 원문",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 23500,
        "publishedAt": "2026-10-01",
        "excerpt": "confirmedPrice: 23500; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 진코스텍 정정 투자설명서 공모조건·수요예측 원문",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1097.62,
        "publishedAt": "2026-10-01",
        "excerpt": "institutionalCompetitionRate: 1097.62; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 진코스텍 정정 투자설명서 공모조건·수요예측 원문",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 5.29,
        "publishedAt": "2026-10-01",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 5.29% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 58.44,
        "publishedAt": "2026-10-01",
        "excerpt": "circulatingSupplyRate: 58.44; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 진코스텍 정정 투자설명서 공모조건·수요예측 원문",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 852000,
        "publishedAt": "2026-10-01",
        "excerpt": "offeringShareCount: 852000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 3786533,
        "publishedAt": "2026-10-01",
        "excerpt": "listedShareCount: 3786533; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 진코스텍 정정 투자설명서 공모조건·수요예측 원문",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 200.22,
        "publishedAt": "2026-10-01",
        "excerpt": "공모 852,000주 × 확정공모가 23,500원 = 200.22억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 889.835255,
        "publishedAt": "2026-10-01",
        "excerpt": "공모 후 주식수 3,786,533주 × 확정공모가 23,500원 ÷ 1억원 = 889.835255억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "250030",
        "excerpt": "진코스텍 | 코스닥 | 250030 | 상장일 2026-10-15",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-10-15",
        "excerpt": "진코스텍 | 코스닥 | 250030 | 상장일 2026-10-15",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000586"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261001000594"
        }
      ]
    },
    "listingPriceEvidence": {
      "code": "250030",
      "tradeDate": "2026-10-15",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=250030&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T11:52:46.714Z"
    }
  },
  {
    "id": "elice-group",
    "name": "엘리스",
    "code": "0158S0",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-10-07",
    "subscriptionEnd": "2026-10-08",
    "refundDate": "2026-10-13",
    "listingDate": "2026-10-20",
    "priceBandMin": 70400,
    "priceBandMax": 90500,
    "confirmedPrice": 90500,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 444400,
        "fee": 2000
      },
      {
        "name": "삼성증권",
        "allocatedShares": 111100,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 388.84,
    "generalCompetitionRate": 408.17,
    "lockupCommitmentRate": 13.7,
    "circulatingSupplyRate": 20.77,
    "totalOfferingAmount": 2010.91,
    "marketCapAtIpo": 10071.62192,
    "subscriptionResults": {
      "totalAccounts": 289054,
      "totalDepositAmount": 10.26,
      "equalAllocationShares": 0.96,
      "proportionalCompetitionRate": 816.34
    },
    "aiSummary": {
      "headline": "2026-10-20 상장 · 시초가 75,700원(-16.4%) · 종가 61,600원(-31.9%)",
      "bulletPoints": [
        "2026-10-07~2026-10-08 일반청약, 환불 2026-10-13.",
        "확정 공모가 90,500원, 총 공모금액 2,010.91억원.",
        "기관 수요예측 388.84:1, 신청수량 기준 의무보유확약 13.7%.",
        "주식회사 엘리스그룹(상장명 엘리스). 소프트웨어 개발 및 공급업. 주요 제품·서비스: AX, AI클라우드."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 20.77%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
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
    "scoreGrade": "S",
    "openingPrice": 75700,
    "openingReturnRate": -16.4,
    "closingPrice": 61600,
    "closingReturnRate": -31.9,
    "offeringShareCount": 2222000,
    "listedShareCount": 11128864,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 90500,
        "publishedAt": "2026-10-06",
        "excerpt": "confirmedPrice: 90500; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 388.84,
        "publishedAt": "2026-10-06",
        "excerpt": "institutionalCompetitionRate: 388.84; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 13.7,
        "publishedAt": "2026-10-06",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 13.7% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 20.77,
        "publishedAt": "2026-10-06",
        "excerpt": "circulatingSupplyRate: 20.77; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2222000,
        "publishedAt": "2026-10-06",
        "excerpt": "offeringShareCount: 2222000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 11128864,
        "publishedAt": "2026-10-06",
        "excerpt": "listedShareCount: 11128864; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2010.91,
        "publishedAt": "2026-10-06",
        "excerpt": "공모 2,222,000주 × 확정공모가 90,500원 = 2010.91억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 10071.62192,
        "publishedAt": "2026-10-06",
        "excerpt": "공모 후 주식수 11,128,864주 × 확정공모가 90,500원 ÷ 1억원 = 10071.62192억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-10-07",
        "publishedAt": "2026-10-06",
        "excerpt": "subscriptionStart: 2026-10-07; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-10-08",
        "publishedAt": "2026-10-06",
        "excerpt": "subscriptionEnd: 2026-10-08; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-10-13",
        "publishedAt": "2026-10-06",
        "excerpt": "refundDate: 2026-10-13; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "0158S0",
        "excerpt": "엘리스 | 코스닥 | 0158S0 | 상장일 2026-10-20",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-10-20",
        "excerpt": "엘리스 | 코스닥 | 0158S0 | 상장일 2026-10-20",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01754737",
      "receiptNo": "20261006000447",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447",
      "receivedAt": "2026-10-06",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261006000447"
        }
      ]
    },
    "businessDescription": "주식회사 엘리스그룹(상장명 엘리스). 소프트웨어 개발 및 공급업. 주요 제품·서비스: AX, AI클라우드.",
    "listingPriceEvidence": {
      "code": "0158S0",
      "tradeDate": "2026-10-20",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=0158S0&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "ms-bio",
    "name": "엠에스바이오",
    "code": "0013Y0",
    "market": "KOSDAQ",
    "status": "LISTED",
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
        "allocatedShares": 1000000,
        "fee": 1500
      }
    ],
    "institutionalCompetitionRate": 1096.56,
    "generalCompetitionRate": 1538.51,
    "lockupCommitmentRate": 30.62,
    "circulatingSupplyRate": 23.33,
    "totalOfferingAmount": 312,
    "marketCapAtIpo": 2121.8067,
    "subscriptionResults": {
      "totalAccounts": 286498,
      "totalDepositAmount": 6.01,
      "equalAllocationShares": 1.75,
      "proportionalCompetitionRate": 3076.02
    },
    "aiSummary": {
      "headline": "2026-10-22 상장 · 시초가 16,000원(+105.1%) · 종가 13,620원(+74.6%)",
      "bulletPoints": [
        "2026-10-12~2026-10-13 일반청약, 환불 2026-10-15.",
        "확정 공모가 7,800원, 총 공모금액 312억원.",
        "기관 수요예측 1,096.56:1, 신청수량 기준 의무보유확약 30.62%.",
        "의료용 기기 제조업. 주요 제품·서비스: 의료용 인체조직 이식재 및 생체재료 기반 의료기기."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 23.33%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 78,
      "neutralRatio": 16,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 94,
    "scoreGrade": "S",
    "openingPrice": 16000,
    "openingReturnRate": 105.1,
    "closingPrice": 13620,
    "closingReturnRate": 74.6,
    "offeringShareCount": 4000000,
    "listedShareCount": 27202650,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 7800,
        "publishedAt": "2026-10-07",
        "excerpt": "confirmedPrice: 7800; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1096.56,
        "publishedAt": "2026-10-07",
        "excerpt": "institutionalCompetitionRate: 1096.56; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 30.62,
        "publishedAt": "2026-10-07",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 30.62% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 23.33,
        "publishedAt": "2026-10-07",
        "excerpt": "circulatingSupplyRate: 23.33; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 4000000,
        "publishedAt": "2026-10-07",
        "excerpt": "offeringShareCount: 4000000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 27202650,
        "publishedAt": "2026-10-07",
        "excerpt": "listedShareCount: 27202650; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 312,
        "publishedAt": "2026-10-07",
        "excerpt": "공모 4,000,000주 × 확정공모가 7,800원 = 312억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2121.8067,
        "publishedAt": "2026-10-07",
        "excerpt": "공모 후 주식수 27,202,650주 × 확정공모가 7,800원 ÷ 1억원 = 2121.8067억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-10-12",
        "publishedAt": "2026-10-07",
        "excerpt": "subscriptionStart: 2026-10-12; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-10-13",
        "publishedAt": "2026-10-07",
        "excerpt": "subscriptionEnd: 2026-10-13; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-10-15",
        "publishedAt": "2026-10-07",
        "excerpt": "refundDate: 2026-10-15; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "0013Y0",
        "excerpt": "엠에스바이오 | 코스닥 | 0013Y0 | 상장일 2026-10-22",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-10-22",
        "excerpt": "엠에스바이오 | 코스닥 | 0013Y0 | 상장일 2026-10-22",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01749559",
      "receiptNo": "20261007000327",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327",
      "receivedAt": "2026-10-07",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000327"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261007000328"
        }
      ]
    },
    "businessDescription": "의료용 기기 제조업. 주요 제품·서비스: 의료용 인체조직 이식재 및 생체재료 기반 의료기기.",
    "listingPriceEvidence": {
      "code": "0013Y0",
      "tradeDate": "2026-10-22",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=0013Y0&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "dts-tech",
    "name": "디티에스",
    "code": "0015M0",
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
    "institutionalCompetitionRate": 983.98,
    "generalCompetitionRate": 986.89,
    "lockupCommitmentRate": 13.31,
    "circulatingSupplyRate": 15.12,
    "totalOfferingAmount": 412.349645,
    "marketCapAtIpo": 2753.120975,
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
    "scoreGrade": "S",
    "offeringShareCount": 2228917,
    "listedShareCount": 14881735,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 18500,
        "publishedAt": "2026-10-12",
        "excerpt": "confirmedPrice: 18500; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 983.98,
        "publishedAt": "2026-10-12",
        "excerpt": "institutionalCompetitionRate: 983.98; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 13.31,
        "publishedAt": "2026-10-12",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 13.31% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 15.12,
        "publishedAt": "2026-10-12",
        "excerpt": "circulatingSupplyRate: 15.12; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2228917,
        "publishedAt": "2026-10-12",
        "excerpt": "offeringShareCount: 2228917; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 14881735,
        "publishedAt": "2026-10-12",
        "excerpt": "listedShareCount: 14881735; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 412.349645,
        "publishedAt": "2026-10-12",
        "excerpt": "공모 2,228,917주 × 확정공모가 18,500원 = 412.349645억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2753.120975,
        "publishedAt": "2026-10-12",
        "excerpt": "공모 후 주식수 14,881,735주 × 확정공모가 18,500원 ÷ 1억원 = 2753.120975억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261012000308"
        }
      ]
    }
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
    "institutionalCompetitionRate": 1020.35,
    "lockupCommitmentRate": 5.46,
    "circulatingSupplyRate": 25,
    "totalOfferingAmount": 472,
    "marketCapAtIpo": 3420,
    "aiSummary": {
      "headline": "3월 17일 코스피 신규 상장! 시초가 27,650원(+84.3%), 첫날 종가 18,760원(+25.1%) 기록",
      "bulletPoints": [
        "공모가 15,000원(희망밴드 상단) 확정 및 기관 경쟁률 1,020.35:1",
        "일반 청약 증거금 3.71조원 몰리며 경쟁률 1,320.68:1(비례 2,641:1) 기록",
        "LG에너지솔루션·삼성SDI향 글로벌 드라이룸 수주 기반 탄탄한 실적"
      ],
      "positivePoints": [
        "글로벌 2차전지 배터리 드라이룸 시장 독보적 점유율",
        "안정적인 흑자 기조 및 해외 공장 동반 진출"
      ],
      "riskPoints": [
        "2차전지 전방 산업 캐펙스(CAPEX) 투자 속도 조절 리스크",
        "의무보유확약 비율(5.5%)이 비교적 낮은 점"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 68,
      "neutralRatio": 25,
      "cautionRatio": 7
    },
    "expertReviews": [],
    "aiScore": 84,
    "scoreGrade": "A",
    "generalCompetitionRate": 1320.68,
    "subscriptionResults": {
      "totalAccounts": 153400,
      "totalDepositAmount": 3.71,
      "proportionalCompetitionRate": 2641.36
    },
    "openingPrice": 27650,
    "openingReturnRate": 84.3,
    "closingPrice": 18760,
    "closingReturnRate": 25.1,
    "fieldEvidence": {
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "480370",
        "excerpt": "씨케이솔루션 | 유가 | 480370 | 상장일 2025-03-17",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2025-03-17",
        "excerpt": "씨케이솔루션 | 유가 | 480370 | 상장일 2025-03-17",
        "parserVersion": "krx-company-list-v1"
      }
    }
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
        "allocatedShares": 445000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 27.4,
    "totalOfferingAmount": 360,
    "marketCapAtIpo": 2413,
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
        "allocatedShares": 507500,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 23.8,
    "totalOfferingAmount": 538,
    "marketCapAtIpo": 2458,
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
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-20",
    "subscriptionEnd": "2026-10-21",
    "refundDate": "2026-10-23",
    "listingDate": "2026-10-30",
    "priceBandMin": 15000,
    "priceBandMax": 18000,
    "confirmedPrice": 15000,
    "underwriters": [
      {
        "name": "삼성증권",
        "allocatedShares": 350000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 240.46,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 39.43,
    "totalOfferingAmount": 210,
    "marketCapAtIpo": 1969.557,
    "aiSummary": {
      "headline": "글로벌 골프 론치모니터(UNEEKOR) 공모가 15,000원 확정, 10월 20일~21일 일반 청약 진행",
      "bulletPoints": [
        "기관 수요예측 경쟁률 240.46:1 기록, 공모가 희망 밴드 하단인 15,000원 확정",
        "상장일 유통가능물량 39.43%(5,176,832주), 의무보유확약 0.0%로 수급 부담 주의",
        "초고속 비전 센서 기반 미국 골프 시뮬레이터 시장 점유율 최상위권 강소기업",
        "환불일: 10월 23일(금), 상장예정일: 10월 30일(금), 대표 주관사: 삼성증권"
      ],
      "positivePoints": [
        "희망 공모가 밴드 하단(15,000원) 확정으로 가격 밸류에이션 매력 확보",
        "미국 골프 시장 내 UNEEKOR 론치모니터 및 구독형 시뮬레이션 SaaS 인지도 보유"
      ],
      "riskPoints": [
        "상장 직후 유통가능물량 비율 39.43% 및 기관 의무보유확약 사실상 0%로 상장일 매도 압력 주의"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 55,
      "neutralRatio": 30,
      "cautionRatio": 15
    },
    "expertReviews": [],
    "aiScore": 68,
    "scoreGrade": "B",
    "offeringShareCount": 1400000,
    "listedShareCount": 13130380,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 15000,
        "publishedAt": "2026-10-19",
        "excerpt": "confirmedPrice: 15000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 240.46,
        "publishedAt": "2026-10-19",
        "excerpt": "institutionalCompetitionRate: 240.46; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 0,
        "publishedAt": "2026-10-19",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 0% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 39.43,
        "publishedAt": "2026-10-19",
        "excerpt": "circulatingSupplyRate: 39.43; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1400000,
        "publishedAt": "2026-10-19",
        "excerpt": "offeringShareCount: 1400000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 13130380,
        "publishedAt": "2026-10-19",
        "excerpt": "listedShareCount: 13130380; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 210,
        "publishedAt": "2026-10-19",
        "excerpt": "공모 1,400,000주 × 확정공모가 15,000원 = 210억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1969.557,
        "publishedAt": "2026-10-19",
        "excerpt": "공모 후 주식수 13,130,380주 × 확정공모가 15,000원 ÷ 1억원 = 1969.557억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000286"
        }
      ]
    }
  },
  {
    "id": "tne-korea",
    "name": "티앤이코리아",
    "code": "0053F0",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
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
    "marketCapAtIpo": 1736.717688,
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
    "scoreGrade": "A",
    "listedShareCount": 11351096,
    "offeringShareCount": 2400000,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 15300,
        "publishedAt": "2026-10-16",
        "excerpt": "confirmedPrice: 15300; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1041.02,
        "publishedAt": "2026-10-16",
        "excerpt": "institutionalCompetitionRate: 1041.02; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 29.52,
        "publishedAt": "2026-10-16",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 29.52% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 31.29,
        "publishedAt": "2026-10-16",
        "excerpt": "circulatingSupplyRate: 31.29; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2400000,
        "publishedAt": "2026-10-16",
        "excerpt": "offeringShareCount: 2400000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 11351096,
        "publishedAt": "2026-10-16",
        "excerpt": "listedShareCount: 11351096; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 367.2,
        "publishedAt": "2026-10-16",
        "excerpt": "공모 2,400,000주 × 확정공모가 15,300원 = 367.2억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1736.717688,
        "publishedAt": "2026-10-16",
        "excerpt": "공모 후 주식수 11,351,096주 × 확정공모가 15,300원 ÷ 1억원 = 1736.717688억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000158"
        }
      ]
    }
  },
  {
    "id": "lablup",
    "name": "래블업",
    "code": "481020",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-22",
    "subscriptionEnd": "2026-10-23",
    "refundDate": "2026-10-27",
    "listingDate": "2026-11-03",
    "priceBandMin": 19000,
    "priceBandMax": 22000,
    "confirmedPrice": 19000,
    "underwriters": [
      {
        "name": "NH투자증권",
        "allocatedShares": 545000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 284.53,
    "lockupCommitmentRate": 2.09,
    "circulatingSupplyRate": 35.51,
    "totalOfferingAmount": 414,
    "marketCapAtIpo": 2768,
    "aiSummary": {
      "headline": "엔비디아 파트너사 AI GPU 솔루션 래블업, 공모가 19,000원 확정 및 일반 청약",
      "bulletPoints": [
        "공모가 19,000원(희망 밴드 하단) 확정, 기관 수요예측 경쟁률 284.53:1 기록",
        "상장 직후 유통가능물량 35.51% (10월 21일 DART 정정 증권신고서 최종 확정)",
        "청약 일정: 10월 22일(목) ~ 10월 23일(금), 환불일: 10월 27일(화), 대표 주관사: NH투자증권",
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
    "code": "420610",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-21",
    "subscriptionEnd": "2026-10-22",
    "refundDate": "2026-10-26",
    "listingDate": "2026-10-30",
    "priceBandMin": 7600,
    "priceBandMax": 9000,
    "confirmedPrice": 9000,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 625000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1234.3,
    "generalCompetitionRate": 1410.9,
    "lockupCommitmentRate": 6.14,
    "circulatingSupplyRate": 23.95,
    "totalOfferingAmount": 225,
    "marketCapAtIpo": 1020.18672,
    "subscriptionResults": {
      "totalAccounts": 237353,
      "totalDepositAmount": 3.97,
      "equalAllocationShares": 1.32,
      "proportionalCompetitionRate": 2821.75
    },
    "aiSummary": {
      "headline": "13년 연속 흑자 AI 비전 테크 인텔리빅스, 공모가 9,000원 상단 확정 및 청약 흥행 마감",
      "bulletPoints": [
        "일반 청약 최종 경쟁률 1,410.9:1, 증거금 약 3.97조 원 몰리며 흥행 성료",
        "기관 수요예측 1,234.3:1 대흥행 기록, 희망 밴드 최상단인 9,000원에 최종 확정",
        "상장일 유통가능물량 23.95%로 오버행 리스크 매우 낮음 (최대주주 지분 60% 3년 락업)",
        "환불일: 10월 26일(월), 상장예정일: 10월 30일(금), 대표 주관사: 미래에셋증권"
      ],
      "positivePoints": [
        "공모가 희망 밴드 상단(9,000원) 초과 수요 집중 및 일반 청약 증거금 약 4조 원 달성",
        "상장 직후 유통가능비율 23.95%로 매우 안정적인 수급 구조 보유",
        "공공 및 스마트시티 안전 관제 시장 점유율 1위와 검증된 13년 연속 흑자 경영 실적"
      ],
      "riskPoints": [
        "공공 안전 프로젝트 발주 시기에 따른 계절적 분기 매출 편차"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 86,
      "neutralRatio": 11,
      "cautionRatio": 3
    },
    "expertReviews": [],
    "aiScore": 88,
    "scoreGrade": "S",
    "offeringShareCount": 2500000,
    "listedShareCount": 11335408,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 9000,
        "publishedAt": "2026-10-20",
        "excerpt": "confirmedPrice: 9000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1234.3,
        "publishedAt": "2026-10-20",
        "excerpt": "institutionalCompetitionRate: 1234.3; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 6.14,
        "publishedAt": "2026-10-20",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 6.14% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 23.95,
        "publishedAt": "2026-10-20",
        "excerpt": "circulatingSupplyRate: 23.95; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2500000,
        "publishedAt": "2026-10-20",
        "excerpt": "offeringShareCount: 2500000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 11335408,
        "publishedAt": "2026-10-20",
        "excerpt": "listedShareCount: 11335408; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 225,
        "publishedAt": "2026-10-20",
        "excerpt": "공모 2,500,000주 × 확정공모가 9,000원 = 225억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1020.18672,
        "publishedAt": "2026-10-20",
        "excerpt": "공모 후 주식수 11,335,408주 × 확정공모가 9,000원 ÷ 1억원 = 1020.18672억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261020000365"
        }
      ]
    }
  },
  {
    "id": "brills",
    "name": "브릴스",
    "code": "468670",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-17",
    "subscriptionEnd": "2026-09-18",
    "refundDate": "2026-09-22",
    "listingDate": "2026-10-01",
    "priceBandMin": 16000,
    "priceBandMax": 19500,
    "confirmedPrice": 19500,
    "underwriters": [
      {
        "name": "IBK투자증권",
        "allocatedShares": 300000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1187.74,
    "lockupCommitmentRate": 21.75,
    "circulatingSupplyRate": 26.42,
    "totalOfferingAmount": 234,
    "marketCapAtIpo": 2215.911555,
    "aiSummary": {
      "headline": "2026-10-01 상장 · 시초가 61,800원(+216.9%) · 종가 31,100원(+59.5%)",
      "bulletPoints": [
        "2026-09-17~2026-09-18 일반청약, 환불 2026-09-22.",
        "확정 공모가 19,500원, 총 공모금액 234억원.",
        "기관 수요예측 1,187.74:1, 신청수량 기준 의무보유확약 21.75%.",
        "특수 목적용 기계 제조업. 주요 제품·서비스: 로봇 모듈화 플랫폼 솔루션."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 26.42%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 83,
      "neutralRatio": 14,
      "cautionRatio": 3
    },
    "expertReviews": [],
    "aiScore": 89,
    "scoreGrade": "S",
    "generalCompetitionRate": 1676.26,
    "subscriptionResults": {
      "totalAccounts": 113800,
      "totalDepositAmount": 4.9,
      "proportionalCompetitionRate": 3352.52
    },
    "openingPrice": 61800,
    "openingReturnRate": 216.9,
    "closingPrice": 31100,
    "closingReturnRate": 59.5,
    "offeringShareCount": 1200000,
    "listedShareCount": 11363649,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 19500,
        "publishedAt": "2026-09-16",
        "excerpt": "confirmedPrice: 19500; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1187.74,
        "publishedAt": "2026-09-16",
        "excerpt": "institutionalCompetitionRate: 1187.74; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 21.75,
        "publishedAt": "2026-09-16",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 21.75% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 26.42,
        "publishedAt": "2026-09-16",
        "excerpt": "circulatingSupplyRate: 26.42; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1200000,
        "publishedAt": "2026-09-16",
        "excerpt": "offeringShareCount: 1200000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 11363649,
        "publishedAt": "2026-09-16",
        "excerpt": "listedShareCount: 11363649; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 234,
        "publishedAt": "2026-09-16",
        "excerpt": "공모 1,200,000주 × 확정공모가 19,500원 = 234억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2215.911555,
        "publishedAt": "2026-09-16",
        "excerpt": "공모 후 주식수 11,363,649주 × 확정공모가 19,500원 ÷ 1억원 = 2215.911555억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-17",
        "publishedAt": "2026-09-16",
        "excerpt": "subscriptionStart: 2026-09-17; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-18",
        "publishedAt": "2026-09-16",
        "excerpt": "subscriptionEnd: 2026-09-18; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-22",
        "publishedAt": "2026-09-16",
        "excerpt": "refundDate: 2026-09-22; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "468670",
        "excerpt": "브릴스 | 코스닥 | 468670 | 상장일 2026-10-01",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-10-01",
        "excerpt": "브릴스 | 코스닥 | 468670 | 상장일 2026-10-01",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01801026",
      "receiptNo": "20260916000234",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234",
      "receivedAt": "2026-09-16",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000234"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260916000240"
        }
      ]
    },
    "businessDescription": "특수 목적용 기계 제조업. 주요 제품·서비스: 로봇 모듈화 플랫폼 솔루션.",
    "listingPriceEvidence": {
      "code": "468670",
      "tradeDate": "2026-10-01",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=468670&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "duksan-nepcores",
    "name": "덕산넵코어스",
    "code": "266690",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-16",
    "subscriptionEnd": "2026-09-17",
    "refundDate": "2026-09-21",
    "listingDate": "2026-09-30",
    "priceBandMin": 12500,
    "priceBandMax": 14600,
    "confirmedPrice": 14600,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 750000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 868.64,
    "lockupCommitmentRate": 4.05,
    "circulatingSupplyRate": 40.11,
    "totalOfferingAmount": 438,
    "marketCapAtIpo": 2758.507794,
    "aiSummary": {
      "headline": "2026-09-30 상장 · 시초가 27,100원(+85.6%) · 종가 16,830원(+15.3%)",
      "bulletPoints": [
        "2026-09-16~2026-09-17 일반청약, 환불 2026-09-21.",
        "확정 공모가 14,600원, 총 공모금액 438억원.",
        "기관 수요예측 868.64:1, 신청수량 기준 의무보유확약 4.05%.",
        "항공기,우주선 및 부품 제조업. 주요 제품·서비스: 위성항법장치, 항재밍장치, 통합항법장치, 데이터링크 등."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 40.11%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 80,
      "neutralRatio": 16,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 86,
    "scoreGrade": "S",
    "generalCompetitionRate": 332.82,
    "subscriptionResults": {
      "totalAccounts": 132911,
      "totalDepositAmount": 3.64,
      "proportionalCompetitionRate": 665.64
    },
    "openingPrice": 27100,
    "openingReturnRate": 85.6,
    "closingPrice": 16830,
    "closingReturnRate": 15.3,
    "offeringShareCount": 3000000,
    "listedShareCount": 18893889,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 14600,
        "publishedAt": "2026-09-15",
        "excerpt": "confirmedPrice: 14600; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 868.64,
        "publishedAt": "2026-09-15",
        "excerpt": "institutionalCompetitionRate: 868.64; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 4.05,
        "publishedAt": "2026-09-15",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 4.05% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 40.11,
        "publishedAt": "2026-09-15",
        "excerpt": "circulatingSupplyRate: 40.11; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 3000000,
        "publishedAt": "2026-09-15",
        "excerpt": "offeringShareCount: 3000000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 18893889,
        "publishedAt": "2026-09-15",
        "excerpt": "listedShareCount: 18893889; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 438,
        "publishedAt": "2026-09-15",
        "excerpt": "공모 3,000,000주 × 확정공모가 14,600원 = 438억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2758.507794,
        "publishedAt": "2026-09-15",
        "excerpt": "공모 후 주식수 18,893,889주 × 확정공모가 14,600원 ÷ 1억원 = 2758.507794억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-16",
        "publishedAt": "2026-09-15",
        "excerpt": "subscriptionStart: 2026-09-16; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-17",
        "publishedAt": "2026-09-15",
        "excerpt": "subscriptionEnd: 2026-09-17; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-21",
        "publishedAt": "2026-09-15",
        "excerpt": "refundDate: 2026-09-21; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "266690",
        "excerpt": "덕산넵코어스 | 코스닥 | 266690 | 상장일 2026-09-30",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-09-30",
        "excerpt": "덕산넵코어스 | 코스닥 | 266690 | 상장일 2026-09-30",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "00960623",
      "receiptNo": "20260915000085",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085",
      "receivedAt": "2026-09-15",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260915000085"
        }
      ]
    },
    "businessDescription": "항공기,우주선 및 부품 제조업. 주요 제품·서비스: 위성항법장치, 항재밍장치, 통합항법장치, 데이터링크 등.",
    "listingPriceEvidence": {
      "code": "266690",
      "tradeDate": "2026-09-30",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=266690&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "bigwave-robotics",
    "name": "빅웨이브로보틱스",
    "code": "0035S0",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2026-09-15",
    "subscriptionEnd": "2026-09-16",
    "refundDate": "2026-09-18",
    "listingDate": "2026-09-29",
    "priceBandMin": 15000,
    "priceBandMax": 18000,
    "confirmedPrice": 18000,
    "underwriters": [
      {
        "name": "유진투자증권",
        "allocatedShares": 204000,
        "fee": 2000
      },
      {
        "name": "미래에셋증권",
        "allocatedShares": 196000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1109.37,
    "lockupCommitmentRate": 18.14,
    "circulatingSupplyRate": 26.76,
    "totalOfferingAmount": 288,
    "marketCapAtIpo": 1848.67398,
    "aiSummary": {
      "headline": "2026-09-29 상장 · 시초가 56,000원(+211.1%) · 종가 27,050원(+50.3%)",
      "bulletPoints": [
        "2026-09-15~2026-09-16 일반청약, 환불 2026-09-18.",
        "확정 공모가 18,000원, 총 공모금액 288억원.",
        "기관 수요예측 1,109.37:1, 신청수량 기준 의무보유확약 18.14%.",
        "소프트웨어 개발 및 공급업. 주요 제품·서비스: 로봇 플랫폼 (마로솔, 솔링크)."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 26.76%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 77,
      "neutralRatio": 18,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 77,
    "scoreGrade": "A",
    "generalCompetitionRate": 1307.78,
    "subscriptionResults": {
      "totalAccounts": 248338,
      "totalDepositAmount": 9.42,
      "proportionalCompetitionRate": 2615.56
    },
    "openingPrice": 56000,
    "openingReturnRate": 211.1,
    "closingPrice": 27050,
    "closingReturnRate": 50.3,
    "offeringShareCount": 1600000,
    "listedShareCount": 10270411,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 18000,
        "publishedAt": "2026-09-14",
        "excerpt": "confirmedPrice: 18000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1109.37,
        "publishedAt": "2026-09-14",
        "excerpt": "institutionalCompetitionRate: 1109.37; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 18.14,
        "publishedAt": "2026-09-14",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 18.14% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 26.76,
        "publishedAt": "2026-09-14",
        "excerpt": "circulatingSupplyRate: 26.76; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1600000,
        "publishedAt": "2026-09-14",
        "excerpt": "offeringShareCount: 1600000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 10270411,
        "publishedAt": "2026-09-14",
        "excerpt": "listedShareCount: 10270411; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 288,
        "publishedAt": "2026-09-14",
        "excerpt": "공모 1,600,000주 × 확정공모가 18,000원 = 288억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1848.67398,
        "publishedAt": "2026-09-14",
        "excerpt": "공모 후 주식수 10,270,411주 × 확정공모가 18,000원 ÷ 1억원 = 1848.67398억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-15",
        "publishedAt": "2026-09-14",
        "excerpt": "subscriptionStart: 2026-09-15; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-16",
        "publishedAt": "2026-09-14",
        "excerpt": "subscriptionEnd: 2026-09-16; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2026-09-18",
        "publishedAt": "2026-09-14",
        "excerpt": "refundDate: 2026-09-18; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "0035S0",
        "excerpt": "빅웨이브로보틱스 | 코스닥 | 0035S0 | 상장일 2026-09-29",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2026-09-29",
        "excerpt": "빅웨이브로보틱스 | 코스닥 | 0035S0 | 상장일 2026-09-29",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01722066",
      "receiptNo": "20260914000379",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379",
      "receivedAt": "2026-09-14",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000379"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260914000385"
        }
      ]
    },
    "businessDescription": "소프트웨어 개발 및 공급업. 주요 제품·서비스: 로봇 플랫폼 (마로솔, 솔링크).",
    "listingPriceEvidence": {
      "code": "0035S0",
      "tradeDate": "2026-09-29",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=0035S0&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
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
    "subscriptionStart": "2024-10-28",
    "subscriptionEnd": "2024-10-29",
    "refundDate": "2024-10-31",
    "listingDate": "2024-11-06",
    "priceBandMin": 23000,
    "priceBandMax": 28000,
    "confirmedPrice": 34000,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 450000,
        "fee": 2000
      },
      {
        "name": "NH투자증권",
        "allocatedShares": 300000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 734.67,
    "lockupCommitmentRate": 12.23,
    "circulatingSupplyRate": 19.67,
    "totalOfferingAmount": 1020,
    "marketCapAtIpo": 4918.4502,
    "openingPrice": 46350,
    "openingReturnRate": 36.3,
    "closingPrice": 51400,
    "closingReturnRate": 51.2,
    "aiSummary": {
      "headline": "2024-11-06 상장 · 시초가 46,350원(+36.3%) · 종가 51,400원(+51.2%)",
      "bulletPoints": [
        "2024-10-28~2024-10-29 일반청약, 환불 2024-10-31.",
        "확정 공모가 34,000원, 총 공모금액 1,020억원.",
        "기관 수요예측 734.67:1, 신청수량 기준 의무보유확약 12.23%.",
        "상품 종합 도매업. 주요 제품·서비스: 프랜차이즈."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 19.67%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 82,
      "neutralRatio": 14,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 83,
    "scoreGrade": "A",
    "generalCompetitionRate": 772.8,
    "subscriptionResults": {
      "totalDepositAmount": 11.82,
      "proportionalCompetitionRate": 1545.6
    },
    "offeringShareCount": 3000000,
    "listedShareCount": 14466030,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 34000,
        "publishedAt": "2024-10-25",
        "excerpt": "confirmedPrice: 34000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 734.67,
        "publishedAt": "2024-10-25",
        "excerpt": "institutionalCompetitionRate: 734.67; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 12.23,
        "publishedAt": "2024-10-25",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 12.23% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 19.67,
        "publishedAt": "2024-10-25",
        "excerpt": "circulatingSupplyRate: 19.67; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 3000000,
        "publishedAt": "2024-10-25",
        "excerpt": "offeringShareCount: 3000000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 14466030,
        "publishedAt": "2024-10-25",
        "excerpt": "listedShareCount: 14466030; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1020,
        "publishedAt": "2024-10-25",
        "excerpt": "공모 3,000,000주 × 확정공모가 34,000원 = 1020억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 4918.4502,
        "publishedAt": "2024-10-25",
        "excerpt": "공모 후 주식수 14,466,030주 × 확정공모가 34,000원 ÷ 1억원 = 4918.4502억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-28",
        "publishedAt": "2024-10-25",
        "excerpt": "subscriptionStart: 2024-10-28; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-29",
        "publishedAt": "2024-10-25",
        "excerpt": "subscriptionEnd: 2024-10-29; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-31",
        "publishedAt": "2024-10-25",
        "excerpt": "refundDate: 2024-10-31; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "475560",
        "excerpt": "더본코리아 | 유가 | 475560 | 상장일 2024-11-06",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2024-11-06",
        "excerpt": "더본코리아 | 유가 | 475560 | 상장일 2024-11-06",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "00968607",
      "receiptNo": "20241025000264",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264",
      "receivedAt": "2024-10-25",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000264"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000269"
        }
      ]
    },
    "businessDescription": "상품 종합 도매업. 주요 제품·서비스: 프랜차이즈.",
    "listingPriceEvidence": {
      "code": "475560",
      "tradeDate": "2024-11-06",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=475560&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "clobot",
    "name": "클로봇",
    "code": "466100",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2024-10-16",
    "subscriptionEnd": "2024-10-17",
    "refundDate": "2024-10-21",
    "listingDate": "2024-10-28",
    "priceBandMin": 9400,
    "priceBandMax": 10900,
    "confirmedPrice": 13000,
    "underwriters": [
      {
        "name": "미래에셋증권",
        "allocatedShares": 675000,
        "fee": 2000
      },
      {
        "name": "신영증권",
        "allocatedShares": 75000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 933.9,
    "lockupCommitmentRate": 1.44,
    "circulatingSupplyRate": 28.06,
    "totalOfferingAmount": 390,
    "marketCapAtIpo": 3112.57778,
    "openingPrice": 12500,
    "openingReturnRate": -3.8,
    "closingPrice": 10070,
    "closingReturnRate": -22.5,
    "aiSummary": {
      "headline": "2024-10-28 상장 · 시초가 12,500원(-3.8%) · 종가 10,070원(-22.5%)",
      "bulletPoints": [
        "2024-10-16~2024-10-17 일반청약, 환불 2024-10-21.",
        "확정 공모가 13,000원, 총 공모금액 390억원.",
        "기관 수요예측 933.9:1, 신청수량 기준 의무보유확약 1.44%.",
        "소프트웨어 개발 및 공급업. 주요 제품·서비스: 로봇 소프트웨어(카멜레온, 크롬스)."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 28.06%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 76,
      "neutralRatio": 18,
      "cautionRatio": 6
    },
    "expertReviews": [],
    "aiScore": 81,
    "scoreGrade": "A",
    "generalCompetitionRate": 1037,
    "subscriptionResults": {
      "totalDepositAmount": 5.06,
      "proportionalCompetitionRate": 2074
    },
    "offeringShareCount": 3000000,
    "listedShareCount": 23942906,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 13000,
        "publishedAt": "2024-10-15",
        "excerpt": "confirmedPrice: 13000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 933.9,
        "publishedAt": "2024-10-15",
        "excerpt": "institutionalCompetitionRate: 933.9; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1.44,
        "publishedAt": "2024-10-15",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 1.44% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 28.06,
        "publishedAt": "2024-10-15",
        "excerpt": "circulatingSupplyRate: 28.06; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 3000000,
        "publishedAt": "2024-10-15",
        "excerpt": "offeringShareCount: 3000000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 23942906,
        "publishedAt": "2024-10-15",
        "excerpt": "listedShareCount: 23942906; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 390,
        "publishedAt": "2024-10-15",
        "excerpt": "공모 3,000,000주 × 확정공모가 13,000원 = 390억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 3112.57778,
        "publishedAt": "2024-10-15",
        "excerpt": "공모 후 주식수 23,942,906주 × 확정공모가 13,000원 ÷ 1억원 = 3112.57778억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-16",
        "publishedAt": "2024-10-15",
        "excerpt": "subscriptionStart: 2024-10-16; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-17",
        "publishedAt": "2024-10-15",
        "excerpt": "subscriptionEnd: 2024-10-17; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-21",
        "publishedAt": "2024-10-15",
        "excerpt": "refundDate: 2024-10-21; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "466100",
        "excerpt": "클로봇 | 코스닥 | 466100 | 상장일 2024-10-28",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2024-10-28",
        "excerpt": "클로봇 | 코스닥 | 466100 | 상장일 2024-10-28",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01784914",
      "receiptNo": "20241015000370",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370",
      "receivedAt": "2024-10-15",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000370"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241015000376"
        }
      ]
    },
    "businessDescription": "소프트웨어 개발 및 공급업. 주요 제품·서비스: 로봇 소프트웨어(카멜레온, 크롬스).",
    "listingPriceEvidence": {
      "code": "466100",
      "tradeDate": "2024-10-28",
      "source": "official_broker_original_listing_day",
      "sourceUrl": "https://www.eugenefn.com/common/files/amail/20241104_B90_jongsun.park_2230.pdf",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "inspien",
    "name": "인스피언",
    "code": "465480",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2024-10-07",
    "subscriptionEnd": "2024-10-08",
    "refundDate": "2024-10-11",
    "listingDate": "2024-10-18",
    "priceBandMin": 8000,
    "priceBandMax": 10000,
    "confirmedPrice": 12000,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 562500,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1069.68,
    "lockupCommitmentRate": 2.98,
    "circulatingSupplyRate": 23.21,
    "totalOfferingAmount": 270,
    "marketCapAtIpo": 1216.53264,
    "openingPrice": 20000,
    "openingReturnRate": 66.7,
    "closingPrice": 15820,
    "closingReturnRate": 31.8,
    "aiSummary": {
      "headline": "2024-10-18 상장 · 시초가 20,000원(+66.7%) · 종가 15,820원(+31.8%)",
      "bulletPoints": [
        "2024-10-07~2024-10-08 일반청약, 환불 2024-10-11.",
        "확정 공모가 12,000원, 총 공모금액 270억원.",
        "기관 수요예측 1,069.68:1, 신청수량 기준 의무보유확약 2.98%.",
        "소프트웨어 개발 및 공급업. 주요 제품·서비스: SAP 보안 솔루션, SAP PO/CPI 컨설팅, EDI SaaS 플랫폼."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 23.21%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 88,
      "neutralRatio": 9,
      "cautionRatio": 3
    },
    "expertReviews": [],
    "aiScore": 90,
    "scoreGrade": "S",
    "generalCompetitionRate": 1538.44,
    "subscriptionResults": {
      "totalDepositAmount": 5.19,
      "proportionalCompetitionRate": 3076.88
    },
    "offeringShareCount": 2250000,
    "listedShareCount": 10137772,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 12000,
        "publishedAt": "2024-10-02",
        "excerpt": "confirmedPrice: 12000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1069.68,
        "publishedAt": "2024-10-02",
        "excerpt": "institutionalCompetitionRate: 1069.68; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2.98,
        "publishedAt": "2024-10-02",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 2.98% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 23.21,
        "publishedAt": "2024-10-02",
        "excerpt": "circulatingSupplyRate: 23.21; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2250000,
        "publishedAt": "2024-10-02",
        "excerpt": "offeringShareCount: 2250000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 10137772,
        "publishedAt": "2024-10-02",
        "excerpt": "listedShareCount: 10137772; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 270,
        "publishedAt": "2024-10-02",
        "excerpt": "공모 2,250,000주 × 확정공모가 12,000원 = 270억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1216.53264,
        "publishedAt": "2024-10-02",
        "excerpt": "공모 후 주식수 10,137,772주 × 확정공모가 12,000원 ÷ 1억원 = 1216.53264억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-07",
        "publishedAt": "2024-10-02",
        "excerpt": "subscriptionStart: 2024-10-07; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-08",
        "publishedAt": "2024-10-02",
        "excerpt": "subscriptionEnd: 2024-10-08; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-11",
        "publishedAt": "2024-10-02",
        "excerpt": "refundDate: 2024-10-11; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "465480",
        "excerpt": "인스피언 | 코스닥 | 465480 | 상장일 2024-10-18",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2024-10-18",
        "excerpt": "인스피언 | 코스닥 | 465480 | 상장일 2024-10-18",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01284876",
      "receiptNo": "20241002000231",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231",
      "receivedAt": "2024-10-02",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000231"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241002000239"
        }
      ]
    },
    "businessDescription": "소프트웨어 개발 및 공급업. 주요 제품·서비스: SAP 보안 솔루션, SAP PO/CPI 컨설팅, EDI SaaS 플랫폼.",
    "listingPriceEvidence": {
      "code": "465480",
      "tradeDate": "2024-10-18",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=465480&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "toprun-total",
    "name": "탑런토탈솔루션",
    "code": "336680",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2024-10-23",
    "subscriptionEnd": "2024-10-24",
    "refundDate": "2024-10-28",
    "listingDate": "2024-11-01",
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
    "institutionalCompetitionRate": 841.12,
    "lockupCommitmentRate": 1.73,
    "circulatingSupplyRate": 12.77,
    "totalOfferingAmount": 450,
    "marketCapAtIpo": 3523.10022,
    "openingPrice": 15120,
    "openingReturnRate": -16,
    "closingPrice": 13740,
    "closingReturnRate": -23.7,
    "aiSummary": {
      "headline": "2024-11-01 상장 · 시초가 15,120원(-16%) · 종가 13,740원(-23.7%)",
      "bulletPoints": [
        "2024-10-23~2024-10-24 일반청약, 환불 2024-10-28.",
        "확정 공모가 18,000원, 총 공모금액 450억원.",
        "기관 수요예측 841.12:1, 신청수량 기준 의무보유확약 1.73%.",
        "전자부품 제조업. 주요 제품·서비스: 전장디스플레이 및 pOLED 부품."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 12.77%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 81,
      "neutralRatio": 15,
      "cautionRatio": 4
    },
    "expertReviews": [],
    "aiScore": 81,
    "scoreGrade": "A",
    "generalCompetitionRate": 984.39,
    "subscriptionResults": {
      "totalDepositAmount": 5.54,
      "proportionalCompetitionRate": 1968.78
    },
    "offeringShareCount": 2500000,
    "listedShareCount": 19572779,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 18000,
        "publishedAt": "2024-10-22",
        "excerpt": "confirmedPrice: 18000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 841.12,
        "publishedAt": "2024-10-22",
        "excerpt": "institutionalCompetitionRate: 841.12; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1.73,
        "publishedAt": "2024-10-22",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 1.73% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 12.77,
        "publishedAt": "2024-10-22",
        "excerpt": "circulatingSupplyRate: 12.77; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2500000,
        "publishedAt": "2024-10-22",
        "excerpt": "offeringShareCount: 2500000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 19572779,
        "publishedAt": "2024-10-22",
        "excerpt": "listedShareCount: 19572779; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 450,
        "publishedAt": "2024-10-22",
        "excerpt": "공모 2,500,000주 × 확정공모가 18,000원 = 450억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 3523.10022,
        "publishedAt": "2024-10-22",
        "excerpt": "공모 후 주식수 19,572,779주 × 확정공모가 18,000원 ÷ 1억원 = 3523.10022억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-23",
        "publishedAt": "2024-10-22",
        "excerpt": "subscriptionStart: 2024-10-23; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-24",
        "publishedAt": "2024-10-22",
        "excerpt": "subscriptionEnd: 2024-10-24; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-28",
        "publishedAt": "2024-10-22",
        "excerpt": "refundDate: 2024-10-28; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "336680",
        "excerpt": "탑런토탈솔루션 | 코스닥 | 336680 | 상장일 2024-11-01",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2024-11-01",
        "excerpt": "탑런토탈솔루션 | 코스닥 | 336680 | 상장일 2024-11-01",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "00814582",
      "receiptNo": "20241022000214",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214",
      "receivedAt": "2024-10-22",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000214"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241022000215"
        }
      ]
    },
    "businessDescription": "전자부품 제조업. 주요 제품·서비스: 전장디스플레이 및 pOLED 부품.",
    "listingPriceEvidence": {
      "code": "336680",
      "tradeDate": "2024-11-01",
      "source": "official_broker_original_listing_day",
      "sourceUrl": "https://www.eugenefn.com/common/files/amail/20241202_B90_jongsun.park_2272.pdf",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "tomocube",
    "name": "토모큐브",
    "code": "475960",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2024-10-28",
    "subscriptionEnd": "2024-10-29",
    "refundDate": "2024-10-31",
    "listingDate": "2024-11-07",
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
    "institutionalCompetitionRate": 967.71,
    "lockupCommitmentRate": 0.14,
    "circulatingSupplyRate": 32.17,
    "totalOfferingAmount": 320,
    "marketCapAtIpo": 2036.99104,
    "openingPrice": 12250,
    "openingReturnRate": -23.4,
    "closingPrice": 10070,
    "closingReturnRate": -37.1,
    "aiSummary": {
      "headline": "2024-11-07 상장 · 시초가 12,250원(-23.4%) · 종가 10,070원(-37.1%)",
      "bulletPoints": [
        "2024-10-28~2024-10-29 일반청약, 환불 2024-10-31.",
        "확정 공모가 16,000원, 총 공모금액 320억원.",
        "기관 수요예측 967.71:1, 신청수량 기준 의무보유확약 0.14%.",
        "사진장비 및 광학기기 제조업. 주요 제품·서비스: 홀로토모그래피 HT-X1, HT-2H."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 32.17%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 79,
      "neutralRatio": 16,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 82,
    "scoreGrade": "A",
    "generalCompetitionRate": 39.94,
    "subscriptionResults": {
      "totalDepositAmount": 0.16,
      "proportionalCompetitionRate": 79.88
    },
    "offeringShareCount": 2000000,
    "listedShareCount": 12731194,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 16000,
        "publishedAt": "2024-10-25",
        "excerpt": "confirmedPrice: 16000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 967.71,
        "publishedAt": "2024-10-25",
        "excerpt": "institutionalCompetitionRate: 967.71; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 0.14,
        "publishedAt": "2024-10-25",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 0.14% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 32.17,
        "publishedAt": "2024-10-25",
        "excerpt": "circulatingSupplyRate: 32.17; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2000000,
        "publishedAt": "2024-10-25",
        "excerpt": "offeringShareCount: 2000000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 12731194,
        "publishedAt": "2024-10-25",
        "excerpt": "listedShareCount: 12731194; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 320,
        "publishedAt": "2024-10-25",
        "excerpt": "공모 2,000,000주 × 확정공모가 16,000원 = 320억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2036.99104,
        "publishedAt": "2024-10-25",
        "excerpt": "공모 후 주식수 12,731,194주 × 확정공모가 16,000원 ÷ 1억원 = 2036.99104억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-28",
        "publishedAt": "2024-10-25",
        "excerpt": "subscriptionStart: 2024-10-28; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-29",
        "publishedAt": "2024-10-25",
        "excerpt": "subscriptionEnd: 2024-10-29; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-31",
        "publishedAt": "2024-10-25",
        "excerpt": "refundDate: 2024-10-31; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "475960",
        "excerpt": "토모큐브 | 코스닥 | 475960 | 상장일 2024-11-07",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2024-11-07",
        "excerpt": "토모큐브 | 코스닥 | 475960 | 상장일 2024-11-07",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01573336",
      "receiptNo": "20241025000261",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261",
      "receivedAt": "2024-10-25",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000261"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241025000263"
        }
      ]
    },
    "businessDescription": "사진장비 및 광학기기 제조업. 주요 제품·서비스: 홀로토모그래피 HT-X1, HT-2H.",
    "listingPriceEvidence": {
      "code": "475960",
      "tradeDate": "2024-11-07",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=475960&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "alux",
    "name": "에이럭스",
    "code": "475580",
    "market": "KOSDAQ",
    "status": "LISTED",
    "subscriptionStart": "2024-10-23",
    "subscriptionEnd": "2024-10-24",
    "refundDate": "2024-10-28",
    "listingDate": "2024-11-01",
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
    "institutionalCompetitionRate": 973.12,
    "lockupCommitmentRate": 0.36,
    "circulatingSupplyRate": 34.97,
    "totalOfferingAmount": 240,
    "marketCapAtIpo": 2118.0688,
    "openingPrice": 12460,
    "openingReturnRate": -22.1,
    "closingPrice": 9880,
    "closingReturnRate": -38.2,
    "aiSummary": {
      "headline": "2024-11-01 상장 · 시초가 12,460원(-22.1%) · 종가 9,880원(-38.2%)",
      "bulletPoints": [
        "2024-10-23~2024-10-24 일반청약, 환불 2024-10-28.",
        "확정 공모가 16,000원, 총 공모금액 240억원.",
        "기관 수요예측 973.12:1, 신청수량 기준 의무보유확약 0.36%.",
        "그외 기타 제품 제조업. 주요 제품·서비스: 교육용 드론/로봇 및 코딩 콘텐츠."
      ],
      "positivePoints": [],
      "riskPoints": [
        "공모 후 기준 상장일 유통가능물량 34.97%. 의무보유확약은 신청수량 기준이며 최종 배정비율과 다릅니다."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "aiScore": 77,
    "scoreGrade": "A",
    "generalCompetitionRate": 539.86,
    "subscriptionResults": {
      "totalDepositAmount": 1.6,
      "proportionalCompetitionRate": 1079.72
    },
    "offeringShareCount": 1500000,
    "listedShareCount": 13237930,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 16000,
        "publishedAt": "2024-10-21",
        "excerpt": "confirmedPrice: 16000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 973.12,
        "publishedAt": "2024-10-21",
        "excerpt": "institutionalCompetitionRate: 973.12; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 0.36,
        "publishedAt": "2024-10-21",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 0.36% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 34.97,
        "publishedAt": "2024-10-21",
        "excerpt": "circulatingSupplyRate: 34.97; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1500000,
        "publishedAt": "2024-10-21",
        "excerpt": "offeringShareCount: 1500000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 13237930,
        "publishedAt": "2024-10-21",
        "excerpt": "listedShareCount: 13237930; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 240,
        "publishedAt": "2024-10-21",
        "excerpt": "공모 1,500,000주 × 확정공모가 16,000원 = 240억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2118.0688,
        "publishedAt": "2024-10-21",
        "excerpt": "공모 후 주식수 13,237,930주 × 확정공모가 16,000원 ÷ 1억원 = 2118.0688억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-23",
        "publishedAt": "2024-10-21",
        "excerpt": "subscriptionStart: 2024-10-23; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-24",
        "publishedAt": "2024-10-21",
        "excerpt": "subscriptionEnd: 2024-10-24; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "refundDate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": "2024-10-28",
        "publishedAt": "2024-10-21",
        "excerpt": "refundDate: 2024-10-28; 일반청약 기일 및 초과청약증거금 환불일 직접 명시",
        "parserVersion": "manual-historical-correction-v1"
      },
      "code": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "475580",
        "excerpt": "에이럭스 | 코스닥 | 475580 | 상장일 2024-11-01",
        "parserVersion": "krx-company-list-v1"
      },
      "listingDate": {
        "sourceTitle": "한국거래소 KIND 상장법인 목록",
        "sourceUrl": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
        "checkedAt": "2026-11-01T11:50:57.416Z",
        "value": "2024-11-01",
        "excerpt": "에이럭스 | 코스닥 | 475580 | 상장일 2024-11-01",
        "parserVersion": "krx-company-list-v1"
      }
    },
    "discovery": {
      "corpCode": "01641600",
      "receiptNo": "20241021000237",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237",
      "receivedAt": "2024-10-21",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-11-01T12:48:12.320Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000237"
        },
        {
          "title": "DART 투자설명서 공모 후 주식수·청약·환불",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20241021000241"
        }
      ]
    },
    "businessDescription": "그외 기타 제품 제조업. 주요 제품·서비스: 교육용 드론/로봇 및 코딩 콘텐츠.",
    "listingPriceEvidence": {
      "code": "475580",
      "tradeDate": "2024-11-01",
      "source": "fchart_origin",
      "sourceUrl": "https://fchart.stock.naver.com/sise.nhn?symbol=475580&timeframe=day&count=1000&requestType=0",
      "checkedAt": "2026-11-01T12:48:12.320Z"
    }
  },
  {
    "id": "hanwha-plus-spac6",
    "name": "한화플러스제6호기업인수목적",
    "code": "450043",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
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
        "allocatedShares": 1500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1256.48,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 93.6,
    "totalOfferingAmount": 120,
    "marketCapAtIpo": 128.2,
    "aiScore": 72,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "공모가 2,000원 신규 스팩! 한화플러스제6호스팩 10월 20일~21일 청약",
      "bulletPoints": [
        "공모가 2,000원 고정, 청약 기간: 2026년 10월 20일(화) ~ 10월 21일(수)",
        "환불일: 10월 23일(금), 대표 주관사: 한화투자증권 (일반 청약한도 15만주)",
        "합병 실패 시에도 원금과 3년치 은행 이자 보장되는 안정적 하방 구조"
      ],
      "positivePoints": [],
      "riskPoints": [
        "수요예측 기관 참여 경쟁률 및 의무확약 비율 체크 필요"
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "offeringShareCount": 6000000,
    "listedShareCount": 6410000,
    "pendingForecastFields": [],
    "fieldEvidence": {
      "confirmedPrice": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 2000,
        "publishedAt": "2026-10-19",
        "excerpt": "confirmedPrice: 2000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 1256.48,
        "publishedAt": "2026-10-19",
        "excerpt": "institutionalCompetitionRate: 1256.48; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 0,
        "publishedAt": "2026-10-19",
        "excerpt": "기관 수요예측 신청수량 기준 의무보유확약 0% (배정 후 확약과 구분)",
        "parserVersion": "manual-historical-correction-v1"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 93.6,
        "publishedAt": "2026-10-19",
        "excerpt": "circulatingSupplyRate: 93.6; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "offeringShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 6000000,
        "publishedAt": "2026-10-19",
        "excerpt": "offeringShareCount: 6000000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "listedShareCount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 6410000,
        "publishedAt": "2026-10-19",
        "excerpt": "listedShareCount: 6410000; 정정 후 공모조건·공모 후 기준 대조",
        "parserVersion": "manual-historical-correction-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 120,
        "publishedAt": "2026-10-19",
        "excerpt": "공모 6,000,000주 × 확정공모가 2,000원 = 120억원",
        "parserVersion": "manual-historical-correction-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "DART 공모조건·수요예측·공모 후 주식수 원문 대조",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187",
        "checkedAt": "2026-11-01T12:48:12.320Z",
        "value": 128.2,
        "publishedAt": "2026-10-19",
        "excerpt": "공모 후 주식수 6,410,000주 × 확정공모가 2,000원 ÷ 1억원 = 128.2억원 (옵션·전환사채 전환 후 수량 제외)",
        "parserVersion": "manual-historical-correction-v1"
      }
    },
    "dataQuality": {
      "status": "unverified",
      "sources": [
        {
          "title": "한국거래소 KIND 상장법인 목록",
          "url": "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13"
        },
        {
          "title": "DART 확정 공모조건·수요예측",
          "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261019000187"
        }
      ]
    }
  },
  {
    "id": "est",
    "name": "이에스티",
    "code": "412170",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-22",
    "subscriptionEnd": "2026-10-23",
    "refundDate": "2026-10-27",
    "listingDate": "2026-11-04",
    "priceBandMin": 10600,
    "priceBandMax": 12400,
    "confirmedPrice": 12400,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 550000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 630.1,
    "lockupCommitmentRate": 0.24,
    "circulatingSupplyRate": 37.7,
    "totalOfferingAmount": 273,
    "marketCapAtIpo": 1550,
    "aiScore": 77,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "반도체 정전척(ESC) 국산화 선도기업 이에스티, 공모가 12,400원 상단 확정",
      "bulletPoints": [
        "공모가 12,400원(희망 밴드 상단) 최종 확정, 기관 경쟁률 630.1:1 기록",
        "상장 예정일: 11월 4일(수)로 확정 (대신증권 공식 공고 기준, 기존 11월 5일에서 조정)",
        "웨이퍼 초정밀 고정 핵심 정전척 원천기술 보유 소부장 특례상장",
        "청약일: 10월 22일(목) ~ 10월 23일(금), 환불일: 10월 27일(화), 대표 주관사: 대신증권"
      ],
      "positivePoints": [],
      "riskPoints": [
        "의무보유확약 비율(0.24%) 및 상장일 유통가능비율(37.7%) 오버행 점검 필요"
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
    "id": "iam-spac1",
    "name": "아이엠기업인수목적1호",
    "code": "469272",
    "market": "KOSDAQ",
    "status": "WAITING_LISTING",
    "subscriptionStart": "2026-10-26",
    "subscriptionEnd": "2026-10-27",
    "refundDate": "2026-10-29",
    "listingDate": "2026-11-04",
    "priceBandMin": 2000,
    "priceBandMax": 2000,
    "confirmedPrice": 2000,
    "depositRatePercent": 100,
    "underwriters": [
      {
        "name": "iM증권",
        "allocatedShares": 1250000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 1266.52,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 95.42,
    "totalOfferingAmount": 100,
    "marketCapAtIpo": 104.8,
    "aiScore": 71,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "공모가 2,000원! iM증권 신규 스팩 아이엠1호스팩 10월 26일~27일 청약",
      "bulletPoints": [
        "확정 공모가 2,000원, 청약 일정: 10월 26일(월) ~ 10월 27일(화)",
        "환불일: 10월 29일(목), 주관사: iM증권",
        "공모 주식 5,000,000주는 상장 직후 유통가능하며 상장예정 보통주의 95.42%입니다."
      ],
      "positivePoints": [
        "DART 발행조건확정 신고서에서 공모가 2,000원을 확인했습니다.",
        "기관 수요예측 경쟁률 1,266.52:1, 확약 신청 비율 0% (신청수량 기준)"
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
    "expertReviews": [],
    "fieldEvidence": {
      "depositRatePercent": {
        "sourceTitle": "DART 2026-10-22 발행조건확정 신고서 · 일반청약자 증거금률",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373",
        "checkedAt": "2026-10-25T00:09:21.203Z"
      },
      "institutionalCompetitionRate": {
        "sourceTitle": "DART 2026-10-22 발행조건확정 신고서",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373",
        "checkedAt": "2026-10-25T00:05:57.787Z"
      },
      "lockupCommitmentRate": {
        "sourceTitle": "DART 2026-10-22 발행조건확정 신고서",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373",
        "checkedAt": "2026-10-25T00:05:57.787Z"
      },
      "confirmedPrice": {
        "sourceTitle": "DART 2026-10-22 발행조건확정 신고서",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373",
        "checkedAt": "2026-10-25T00:05:57.787Z"
      },
      "subscriptionStart": {
        "sourceTitle": "DART 2026-10-22 발행조건확정 신고서",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373",
        "checkedAt": "2026-10-25T00:05:57.787Z"
      },
      "subscriptionEnd": {
        "sourceTitle": "DART 2026-10-22 발행조건확정 신고서",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261022000373",
        "checkedAt": "2026-10-25T00:05:57.787Z"
      },
      "circulatingSupplyRate": {
        "sourceTitle": "DART 2026-10-08 정정 신고서 · 공모 전 주주 보호예수",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261008000225",
        "checkedAt": "2026-10-25T00:05:57.787Z"
      }
    }
  },
  {
    "id": "al-robot",
    "name": "에이엘로봇",
    "code": "417970",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-06",
    "subscriptionEnd": "2026-11-09",
    "refundDate": "2026-11-11",
    "listingDate": "2026-11-18",
    "priceBandMin": 15700,
    "priceBandMax": 17600,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 600000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 35.01,
    "totalOfferingAmount": 422,
    "marketCapAtIpo": 2121,
    "aiScore": 78,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "협동로봇 및 스마트 팩토리 센서 국산화 에이엘로봇, 11월 6일~9일 청약",
      "bulletPoints": [
        "협동로봇 및 스마트 팩토리 필수 초정밀 센서 융합 시스템 국산화 전문 기업",
        "기관 수요예측(10월 28일~11월 3일) 종료 후 공모가 확정 예정, 대표 주관사: 대신증권"
      ],
      "positivePoints": [],
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
    "id": "mbd",
    "name": "엠비디",
    "code": "417050",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-12",
    "subscriptionEnd": "2026-11-13",
    "refundDate": "2026-11-17",
    "listingDate": "2026-11-25",
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
    "totalOfferingAmount": 234,
    "marketCapAtIpo": 1798,
    "aiScore": 75,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "3D 세포배양 맞춤형 약물 반응 예측 플랫폼 엠비디, 11월 12일~13일 청약",
      "bulletPoints": [
        "3D 세포배양 및 오가노이드 기반 환자 맞춤형 항암제 효능 예측 플랫폼 전문 기업",
        "기관 수요예측(11월 2일~6일) 종료 후 공모가 확정 예정, 대표 주관사: 하나증권"
      ],
      "positivePoints": [],
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
    "id": "nex-i",
    "name": "넥스아이",
    "code": "447253",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-03",
    "subscriptionEnd": "2026-11-04",
    "refundDate": "2026-11-06",
    "priceBandMin": 10500,
    "priceBandMax": 13000,
    "confirmedPrice": 8000,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 1250000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 66.58,
    "lockupCommitmentRate": 0.06,
    "circulatingSupplyRate": 36.97,
    "totalOfferingAmount": 400,
    "marketCapAtIpo": 3667.61912,
    "aiScore": 34,
    "scoreGrade": "C",
    "aiSummary": {
      "headline": "항체 기반 항암 신약개발 기업 넥스아이",
      "bulletPoints": [
        "타깃 발굴 플랫폼 NEXORA™를 활용해 항암 신약 후보물질을 개발합니다."
      ],
      "positivePoints": [],
      "riskPoints": [
        "신약 개발 성과와 사업화 일정의 불확실성을 공시에서 확인하세요."
      ]
    },
    "sentimentConsensus": {
      "positiveRatio": 75,
      "neutralRatio": 20,
      "cautionRatio": 5
    },
    "expertReviews": [],
    "discovery": {
      "corpCode": "01863318",
      "receiptNo": "20261030000467",
      "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000467",
      "receivedAt": "2026-10-30",
      "reportName": "[발행조건확정]증권신고서(지분증권)"
    },
    "fieldEvidence": {
      "subscriptionStart": {
        "sourceTitle": "넥스아이 DART 공시 일정",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000467",
        "checkedAt": "2026-10-30T15:54:12.835Z",
        "value": "2026-11-03",
        "publishedAt": "2026-10-30",
        "excerpt": "청약기일(주3) | 일반투자자 | 개시일 | 2026년 11월 03일(화)",
        "parserVersion": "official-verification-v2"
      },
      "subscriptionEnd": {
        "sourceTitle": "넥스아이 DART 공시 일정",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000467",
        "checkedAt": "2026-10-30T15:54:12.835Z",
        "value": "2026-11-04",
        "publishedAt": "2026-10-30",
        "excerpt": "청약기일(주3) | 일반투자자 | 종료일 | 2026년 11월 04일(수)",
        "parserVersion": "official-verification-v2"
      },
      "refundDate": {
        "sourceTitle": "넥스아이 DART 공시 일정",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000467",
        "checkedAt": "2026-10-30T15:54:12.835Z",
        "value": "2026-11-06",
        "publishedAt": "2026-10-30",
        "excerpt": "초과 청약증거금이 있는 경우에는 이를 주금납입기일 당일(2026년 11월 06일(금))에 환불합니다",
        "parserVersion": "official-verification-v2"
      },
      "listingDate": {
        "sourceTitle": "(주)넥스아이 확정발행가액 공지 및 청약 안내",
        "sourceUrl": "https://www.truefriend.com/main/research/corporate/ipo/Pre01.jsp?cmd=TF09ac010002&num=669",
        "checkedAt": "2026-10-31T05:35:10.796Z",
        "value": "2026-11-12",
        "publishedAt": "2026-10-30T03:10:00+09:00",
        "excerpt": "상장 예정일은 2026년 11월 12일",
        "parserVersion": "official-verification-v2"
      },
      "confirmedPrice": {
        "sourceTitle": "(주)넥스아이 확정발행가액 공지 및 청약 안내",
        "sourceUrl": "https://www.truefriend.com/main/research/corporate/ipo/Pre01.jsp?cmd=TF09ac010002&num=669",
        "checkedAt": "2026-10-31T05:35:10.796Z",
        "value": 8000,
        "publishedAt": "2026-10-30T03:10:00+09:00",
        "excerpt": "확정 발행가액 : 8,000원",
        "parserVersion": "official-verification-v2"
      },
      "offeringShareCount": {
        "sourceTitle": "넥스아이 정정 투자설명서 공모개요",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000472",
        "checkedAt": "2026-10-31T11:33:54.758Z",
        "publishedAt": "2026-10-30",
        "value": 5000000,
        "excerpt": "보통주 일반공모 | 증권수량 5,000,000주 | 모집(매출)가액 8,000원 | 모집(매출)총액 40,000,000,000원",
        "parserVersion": "dart-offering-v1"
      },
      "totalOfferingAmount": {
        "sourceTitle": "넥스아이 정정 투자설명서 공모개요",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000472",
        "checkedAt": "2026-10-31T11:33:54.758Z",
        "publishedAt": "2026-10-30",
        "value": 400,
        "excerpt": "보통주 일반공모 | 증권수량 5,000,000주 | 모집(매출)가액 8,000원 | 모집(매출)총액 40,000,000,000원",
        "parserVersion": "dart-offering-v1"
      },
      "listedShareCount": {
        "sourceTitle": "넥스아이 확정 공모조건·상장예정주식수",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000467",
        "checkedAt": "2026-10-31T11:33:54.758Z",
        "publishedAt": "2026-10-30",
        "value": 45845239,
        "excerpt": "확정공모가액 8,000원 기준 상장예정주식수 45,845,239주(기발행 40,670,239주 + 공모 5,000,000주 + 의무인수 175,000주).",
        "parserVersion": "editorial-filing-facts-v1"
      },
      "marketCapAtIpo": {
        "sourceTitle": "넥스아이 확정 공모조건 기준 시가총액",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000467",
        "checkedAt": "2026-10-31T11:33:54.758Z",
        "publishedAt": "2026-10-30",
        "value": 3667.61912,
        "excerpt": "상장예정주식수 45,845,239주 × 확정공모가액 8,000원 ÷ 100,000,000 = 3,667.61912억원. 옵션 포함 평가용 주식수는 제외.",
        "parserVersion": "editorial-filing-facts-v1"
      },
      "businessDescription": {
        "sourceTitle": "넥스아이 정정 증권신고서 사업의 개요",
        "sourceUrl": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261016000268",
        "checkedAt": "2026-10-31T11:33:54.758Z",
        "publishedAt": "2026-10-16",
        "value": "항암·면역치료 불응인자를 표적으로 항체 기반 항암 신약을 연구·개발하는 기업입니다.",
        "excerpt": "항암ㆍ면역치료 불응인자 발굴 및 first-in-class 항암 신약을 연구하는 신약개발 기업. 항체 기반의 혁신신약 후보물질 도출, 핵심기술 NEXORA™ 플랫폼.",
        "parserVersion": "editorial-filing-facts-v1"
      }
    },
    "scheduleVerification": {
      "status": "verified",
      "checkedAt": "2026-10-31T05:35:10.796Z",
      "conflicts": [],
      "coveredFields": [
        "subscriptionStart",
        "subscriptionEnd",
        "refundDate",
        "listingDate",
        "confirmedPrice"
      ]
    },
    "listingDate": "2026-11-12",
    "offeringShareCount": 5000000,
    "listedShareCount": 45845239,
    "businessDescription": "항암·면역치료 불응인자를 표적으로 항체 기반 항암 신약을 연구·개발하는 기업입니다.",
    "dataQuality": {
      "status": "unverified"
    }
  },
  {
    "id": "yky-mc",
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
        "name": "대신증권",
        "allocatedShares": 575000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 28,
    "totalOfferingAmount": 253,
    "marketCapAtIpo": 1591,
    "aiScore": 73,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "정밀 금속 가공 및 알루미늄 아노다이징 영광와이케이엠씨, 11월 4일~5일 청약",
      "bulletPoints": [
        "희망 공모가: 9,400 ~ 11,000원, 청약 기간: 11월 4일(수) ~ 11월 5일(목)",
        "환불일: 11월 9일(월), 대표 주관사: 대신증권"
      ],
      "positivePoints": [],
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
    "id": "optronics",
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
        "name": "한국투자증권",
        "allocatedShares": 550000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 27,
    "totalOfferingAmount": 264,
    "marketCapAtIpo": 1148,
    "aiScore": 74,
    "scoreGrade": "B",
    "aiSummary": {
      "headline": "초정밀 광학 렌즈 및 레이저 모듈 전문 옵토닉스, 11월 5일~6일 청약",
      "bulletPoints": [
        "희망 공모가: 10,000 ~ 12,000원, 청약 기간: 11월 5일(목) ~ 11월 6일(금)",
        "환불일: 11월 10일(화), 대표 주관사: 한국투자증권"
      ],
      "positivePoints": [],
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
    "id": "hana-aerodynamics",
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
        "name": "IBK투자증권",
        "allocatedShares": 1100000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 30.83,
    "totalOfferingAmount": 251,
    "marketCapAtIpo": 1011,
    "aiScore": 76,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "항공우주 복합재 및 가스터빈 부품사 하나에어로다이내믹스, 11월 10일~11일 청약",
      "bulletPoints": [
        "희망 공모가: 4,700 ~ 5,700원, 청약일: 11월 10일(화) ~ 11월 11일(수)",
        "환불일: 11월 13일(금), 대표 주관사: IBK투자증권"
      ],
      "positivePoints": [],
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
    "id": "enki-whitehat",
    "name": "엔키화이트햇",
    "code": "417950",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-12-01",
    "subscriptionEnd": "2026-12-02",
    "refundDate": "2026-12-04",
    "listingDate": "2026-12-11",
    "priceBandMin": 13000,
    "priceBandMax": 16500,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "신영증권",
        "allocatedShares": 425000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 37.95,
    "totalOfferingAmount": 281,
    "marketCapAtIpo": 1749,
    "aiScore": 76,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "사이버 침해사고 대응 및 보안 솔루션 엔키화이트햇, 12월 1일~2일 청약",
      "bulletPoints": [
        "화이트해커 기반 사이버 침해사고 대응 및 모의해킹 보안 솔루션 전문 기업",
        "상장 직후 유통가능비율 37.95% (상장예정주식 10,598,414주 중 4,021,887주)"
      ],
      "positivePoints": [],
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
    "id": "jntg",
    "name": "제이앤티지",
    "code": "414030",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-12",
    "subscriptionEnd": "2026-11-13",
    "refundDate": "2026-11-17",
    "listingDate": "2026-11-24",
    "priceBandMin": 26400,
    "priceBandMax": 31900,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "대신증권",
        "allocatedShares": 1075000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 22.5,
    "totalOfferingAmount": 1372,
    "marketCapAtIpo": 6035,
    "aiScore": 79,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "수소연료전지 기체확산층(GDL) 국산화 제이앤티지, 11월 12일~13일 일반 청약",
      "bulletPoints": [
        "희망 공모가: 26,400 ~ 30,000원, 청약일: 11월 12일(목) ~ 11월 13일(금)",
        "환불일: 11월 17일(화), 주관사: 대신증권"
      ],
      "positivePoints": [],
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
    "id": "cnm",
    "name": "씨앤엠",
    "code": "406180",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-12",
    "subscriptionEnd": "2026-11-13",
    "refundDate": "2026-11-17",
    "listingDate": "2026-11-25",
    "priceBandMin": 10000,
    "priceBandMax": 13000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "한국투자증권",
        "allocatedShares": 737500,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 36.25,
    "totalOfferingAmount": 384,
    "marketCapAtIpo": 2077,
    "aiScore": 75,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "반도체 패키징 검사 장비 전문 씨앤엠, 11월 12일~13일 공모 청약 개시",
      "bulletPoints": [
        "공모가 10,000원, 청약 기간: 11월 12일(목) ~ 11월 13일(금)",
        "환불일: 11월 17일(화), 대표 주관사: 한국투자증권"
      ],
      "positivePoints": [],
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
    "id": "adel",
    "name": "아델",
    "code": "463510",
    "market": "KOSDAQ",
    "status": "UPCOMING",
    "subscriptionStart": "2026-11-23",
    "subscriptionEnd": "2026-11-24",
    "refundDate": "2026-11-26",
    "listingDate": "2026-12-03",
    "priceBandMin": 18000,
    "priceBandMax": 25000,
    "confirmedPrice": 0,
    "underwriters": [
      {
        "name": "삼성증권",
        "allocatedShares": 325500,
        "fee": 2000
      },
      {
        "name": "미래에셋증권",
        "allocatedShares": 217000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 25,
    "totalOfferingAmount": 543,
    "marketCapAtIpo": 5415,
    "aiScore": 78,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "알츠하이머 타우 단백질 표적 항체 치료제 바이오텍 아델, 11월 23일~24일 청약",
      "bulletPoints": [
        "희망 공모가: 18,000 ~ 25,000원, 청약일: 11월 23일(월) ~ 11월 24일(화)",
        "환불일: 11월 26일(목), 주관사: 삼성증권, 미래에셋증권"
      ],
      "positivePoints": [],
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
    "id": "kmf",
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
        "name": "IBK투자증권",
        "allocatedShares": 500000,
        "fee": 2000
      }
    ],
    "institutionalCompetitionRate": 0,
    "lockupCommitmentRate": 0,
    "circulatingSupplyRate": 44.56,
    "totalOfferingAmount": 356,
    "marketCapAtIpo": 1510,
    "aiScore": 76,
    "scoreGrade": "A",
    "aiSummary": {
      "headline": "발효공학 및 타깃전달(TDS) 기술 기반 기능성 효소·바이오 소재 전문 케이엠에프, 11월 24일~25일 청약",
      "bulletPoints": [
        "희망 공모가: 15,000 ~ 17,800원, 청약 기간: 11월 24일(화) ~ 11월 25일(수)",
        "환불일: 11월 27일(금), 주관사: IBK투자증권"
      ],
      "positivePoints": [
        "발효 효소 및 콤부차 소재 등 발효공학 기반 기능성 소재 원스톱 생산 역량"
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
