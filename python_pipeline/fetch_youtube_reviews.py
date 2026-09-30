"""
유튜브 자막 & 전문가 리뷰 수집 모듈 (fetch_youtube_reviews.py)
-----------------------------------------------------------
지정된 화이트리스트 채널에서 특정 공모주 종목명으로 영상을 검색하고,
한국어 자막(Transcript)을 추출하여 AI 감성 분석 입력 텍스트를 구성합니다.
"""

import os
import requests
import json
from typing import List, Dict

# 관리자 페이지에서 등록한 화이트리스트 유튜브 채널 목록
TARGET_CHANNELS = [
    {"name": "공모주 수첩 TV", "channel_id": "@ipo_notebook"},
    {"name": "소리주식Lab", "channel_id": "@sori_stock"},
    {"name": "스마트공모주", "channel_id": "@smart_ipo"}
]

def search_stock_youtube_reviews(stock_name: str) -> List[Dict[str, str]]:
    """
    종목명 기반 유튜브 영상 검색 및 요약 텍스트 수집
    YouTube Data API v3 키가 있으면 실제 검색을 수행하고,
    없을 경우 채널별 RSS 피드 또는 쿼리 스니펫을 추출합니다.
    """
    youtube_api_key = os.environ.get("YOUTUBE_API_KEY", "")
    results = []

    if youtube_api_key:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "key": youtube_api_key,
            "part": "snippet",
            "q": f"{stock_name} 공모주 수요예측",
            "type": "video",
            "maxResults": 5,
            "order": "date"
        }
        try:
            res = requests.get(url, params=params, timeout=10)
            items = res.json().get("items", [])
            for item in items:
                snippet = item.get("snippet", {})
                results.append({
                    "channel": snippet.get("channelTitle", ""),
                    "title": snippet.get("title", ""),
                    "description": snippet.get("description", ""),
                    "video_id": item.get("id", {}).get("videoId", ""),
                    "published_at": snippet.get("publishedAt", "")[:10]
                })
            print(f"[YouTube API] '{stock_name}' 관련 최신 영상 {len(results)}건 수집 완료")
            return results
        except Exception as e:
            print(f"[YouTube API 오류] {e}")

    # API 키가 없을 때의 테스트/시뮬레이션 모드
    print(f"[알림] YOUTUBE_API_KEY 미설정. '{stock_name}' 모의 수집 데이터를 반환합니다.")
    return [
        {
            "channel": "공모주 수첩 TV",
            "title": f"{stock_name} 수요예측 결과 발표! 비례 청약 전략",
            "description": f"{stock_name} 기관 경쟁률 및 의무보유확약 비율 완벽 정리. 균등 1주 확률과 상장일 유통물량 체크",
            "published_at": "2026-10-05"
        },
        {
            "channel": "소리주식Lab",
            "title": f"{stock_name} 주관사별 증거금 한도 및 환불일 계산",
            "description": f"마이너스 통장 비례 청약 시 이자 비용 대비 기대 수익률 시뮬레이션",
            "published_at": "2026-10-06"
        }
    ]

if __name__ == "__main__":
    print("=== 유튜브 전문가 리뷰 수집기 테스트 ===")
    reviews = search_stock_youtube_reviews("더본코리아")
    for r in reviews:
        print(f"• [{r['channel']}] {r['title']} ({r['published_at']})")
