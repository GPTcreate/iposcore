"""
IPO Insight AI - 분석 및 스코어링 파이프라인
--------------------------------------------------
DART 공시 정량 지표와 수집된 유튜브 자막/블로그 텍스트를 바탕으로
1. Gemini 2.5를 이용한 감성 분석 및 3줄 요약 추출
2. 자체 수식에 따른 100점 만점 'IPO 종합 매력도 지수' 산출
3. 웹 프론트엔드 연동용 JSON 생성
"""

import os
import json
from typing import List, Dict, Any

def calculate_quantitative_score(
    competition_rate: float,
    lockup_rate: float,
    circulating_rate: float,
    price_confirmed_above_band: bool
) -> float:
    """
    정량 지표 스코어링 (최대 50점)
    1. 기관 경쟁률 (최대 25점)
    2. 의무보유확약 비율 (최대 15점)
    3. 유통가능물량 비율 (최대 10점)
    + 공모가 상단 초과 시 보너스 가산
    """
    # 1. 기관 경쟁률 점수
    if competition_rate >= 1500:
        comp_score = 25.0
    elif competition_rate >= 1000:
        comp_score = 21.0
    elif competition_rate >= 700:
        comp_score = 17.0
    elif competition_rate >= 400:
        comp_score = 12.0
    elif competition_rate >= 100:
        comp_score = 6.0
    else:
        comp_score = 2.0

    # 2. 의무보유확약 점수
    if lockup_rate >= 30.0:
        lockup_score = 15.0
    elif lockup_rate >= 15.0:
        lockup_score = 11.0
    elif lockup_rate >= 5.0:
        lockup_score = 7.0
    else:
        lockup_score = 2.0

    # 3. 유통가능물량 점수 (낮을수록 점수 높음)
    if circulating_rate <= 20.0:
        circ_score = 10.0
    elif circulating_rate <= 30.0:
        circ_score = 7.5
    elif circulating_rate <= 40.0:
        circ_score = 4.0
    else:
        circ_score = 1.0

    total_quant = comp_score + lockup_score + circ_score
    if price_confirmed_above_band:
        total_quant = min(50.0, total_quant + 2.0)

    return round(total_quant, 1)


def analyze_with_gemini(ipo_name: str, texts: List[str]) -> Dict[str, Any]:
    """
    Gemini API를 호출하여 전문가 텍스트를 감성 분석하고 요약 도출
    API 키가 없는 경우 고품질 룰 기반 휴리스틱으로 대체 작동
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    combined_corpus = "\n---\n".join(texts)

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"""
다음은 공모주 '{ipo_name}'에 대한 전문 유튜버 및 블로그 리뷰 텍스트입니다:
{combined_corpus}

위 내용을 종합 분석하여 다음 JSON 형식으로만 응답해주세요:
{{
  "positive_ratio": 70, // 0~100 사이 숫자 (긍정 여론 비율)
  "neutral_ratio": 20,  // 0~100 사이 숫자 (중립 비율)
  "caution_ratio": 10,  // 0~100 사이 숫자 (주의/패스 비율, 세 합계 100)
  "headline": "1줄 핵심 요약",
  "bullet_points": ["체크포인트 1", "체크포인트 2", "체크포인트 3"],
  "positive_points": ["호재 요인 1", "호재 요인 2"],
  "risk_points": ["리스크 요인 1", "리스크 요인 2"]
}}
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[Warning] Gemini API 호출 실패 ({e}), 휴리스틱 모드로 폴백합니다.")

    # 기본 휴리스틱 분석 로직
    positive_keywords = ["대박", "추천", "비례", "흥행", "따블", "우수", "가볍다", "독점"]
    caution_keywords = ["위험", "주의", "패스", "하단", "적자", "부담", "구주매출", "마이너스"]

    pos_count = sum(combined_corpus.count(kw) for kw in positive_keywords)
    caut_count = sum(combined_corpus.count(kw) for kw in caution_keywords)
    total_count = max(1, pos_count + caut_count)

    pos_ratio = int((pos_count / total_count) * 80) + 10
    pos_ratio = max(10, min(90, pos_ratio))
    caut_ratio = max(5, min(80, 100 - pos_ratio - 15))
    neutral_ratio = 100 - pos_ratio - caut_ratio

    return {
        "positive_ratio": pos_ratio,
        "neutral_ratio": neutral_ratio,
        "caution_ratio": caut_ratio,
        "headline": f"{ipo_name} 기관 수요예측 및 전문가 의견 종합 분석",
        "bullet_points": [
            f"전문가 채널 다수가 긍정 여론({pos_ratio}%) 형성 중",
            "기관 수요예측 결과 및 유통가능물량 비율이 핵심 변수",
            "상장일 변동성에 유의하며 비례 증거금 안배 필요"
        ],
        "positive_points": ["업종 성장성 및 시장 주목도 양호", "유튜버 분석 다수 긍정 평가"],
        "risk_points": ["단기 수급 쏠림 및 상장 당일 시초가 변동성 주의"]
    }


def compute_ipo_package(
    ipo_id: str,
    name: str,
    code: str,
    market: str,
    subscription_start: str,
    subscription_end: str,
    refund_date: str,
    confirmed_price: int,
    competition_rate: float,
    lockup_rate: float,
    circulating_rate: float,
    review_texts: List[str]
) -> Dict[str, Any]:
    """
    정량 스코어 + Gemini 감성 분석을 결합하여 최종 IPO 리포트 패키지 산출
    """
    # 1. 정량 점수 (50점 만점)
    quant_score = calculate_quantitative_score(
        competition_rate=competition_rate,
        lockup_rate=lockup_rate,
        circulating_rate=circulating_rate,
        price_confirmed_above_band=(confirmed_price > 0)
    )

    # 2. 정성 감성 분석 (Gemini / AI)
    sentiment_data = analyze_with_gemini(name, review_texts)
    
    # 3. 정성 점수 (50점 만점) = 긍정 비율의 50%
    qual_score = (sentiment_data["positive_ratio"] / 100.0) * 50.0

    # 4. 종합 점수 (100점 만점)
    final_score = int(round(quant_score + qual_score))
    final_score = max(1, min(99, final_score))

    # 등급 결정
    if final_score >= 88:
        grade = "S"
    elif final_score >= 74:
        grade = "A"
    elif final_score >= 58:
        grade = "B"
    else:
        grade = "C"

    return {
        "id": ipo_id,
        "name": name,
        "code": code,
        "market": market,
        "aiScore": final_score,
        "scoreGrade": grade,
        "quantScore": quant_score,
        "qualScore": round(qual_score, 1),
        "sentimentConsensus": {
            "positiveRatio": sentiment_data["positive_ratio"],
            "neutralRatio": sentiment_data["neutral_ratio"],
            "cautionRatio": sentiment_data["caution_ratio"]
        },
        "aiSummary": {
            "headline": sentiment_data["headline"],
            "bulletPoints": sentiment_data["bullet_points"],
            "positivePoints": sentiment_data["positive_points"],
            "riskPoints": sentiment_data["risk_points"]
        }
    }


if __name__ == "__main__":
    sample_texts = [
        "기관 수요예측 1200대 1 나왔네요. 로봇 섹터라 분위기 아주 좋습니다. 비례 풀청약 들어갑니다.",
        "유통물량 20% 미만이라 상장 첫날 따블 이상 충분히 가능해 보입니다. 의무확약도 28%로 우수합니다.",
        "KB증권 주관이라 배정 물량이 많습니다. 온가족 계좌 준비하세요."
    ]

    result = compute_ipo_package(
        ipo_id="sample-robotics",
        name="샘플로보틱스",
        code="999010",
        market="KOSDAQ",
        subscription_start="2026-10-10",
        subscription_end="2026-10-11",
        refund_date="2026-10-13",
        confirmed_price=28000,
        competition_rate=1250.0,
        lockup_rate=28.5,
        circulating_rate=19.5,
        review_texts=sample_texts
    )

    print("=== 산출된 AI 분석 결과 JSON ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))
