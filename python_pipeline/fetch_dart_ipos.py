"""
DART 전자공시 오픈 API 연동 모듈 (fetch_dart_ipos.py)
-----------------------------------------------------------
금융감독원 DART Open API를 통해 최신 공모주(증권신고서 지분증권) 공시를 조회하고
신규 청약 종목, 희망공모가액, 주관사, 청약일정을 자동으로 가져옵니다.
"""

import os
import sys
import requests
import json
from pathlib import Path
from datetime import datetime, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_dart_api_key():
    key = os.environ.get("DART_API_KEY", "")
    if key:
        return key
    # .env.local 탐색
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("DART_API_KEY="):
                return line.split("=", 1)[1].strip()
    return ""

DART_API_KEY = get_dart_api_key()

def fetch_latest_ipo_filings(days: int = 30):
    """
    최근 N일간 금융감독원 전자공시에 접수된 공모주 증권신고서 검색
    """
    if not DART_API_KEY:
        print("[안내] DART_API_KEY 환경변수가 설정되지 않았습니다.")
        print("[참고] https://opendart.fss.or.kr 에서 무료 인증키를 발급받으실 수 있습니다.")
        return []

    end_date = datetime.now().strftime("%Y%m%d")
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")

    url = "https://opendart.fss.or.kr/api/list.json"
    params = {
        "crtfc_key": DART_API_KEY,
        "bgn_de": start_date,
        "end_de": end_date,
        "pblntf_detail_ty": "C001",  # 증권신고(지분증권)
        "page_no": 1,
        "page_count": 50
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if data.get("status") == "000":
            filings = data.get("list", [])
            print(f"[DART] 성공적으로 {len(filings)}건의 증권신고서 공시를 조회했습니다.")
            return filings
        else:
            print(f"[DART 오류] {data.get('message')}")
            return []
    except Exception as e:
        print(f"[DART 요청 예외] {e}")
        return []

if __name__ == "__main__":
    print("=== DART 공모주 공시 수집기 실행 테스트 ===")
    filings = fetch_latest_ipo_filings(14)
    for f in filings[:5]:
        print(f"- [{f.get('corp_name')}] {f.get('report_nm')} (접수일: {f.get('rcept_dt')})")
