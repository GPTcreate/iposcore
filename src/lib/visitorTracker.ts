import fs from 'fs';
import path from 'path';

export interface VisitorStats {
  today: number;
  total: number;
  todayDate: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const VISITOR_FILE = path.join(DATA_DIR, 'visitors.json');

// KST 날짜 계산
export function getKstDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// 메모리 스토어 (서버리스 인스턴스 캐시)
let memoryVisitorStats: VisitorStats = {
  today: 0,
  total: 0,
  todayDate: getKstDate(),
};

function loadVisitorStats(): VisitorStats {
  const currentKst = getKstDate();
  try {
    if (fs.existsSync(VISITOR_FILE)) {
      const content = fs.readFileSync(VISITOR_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.total === 'number') {
        memoryVisitorStats = {
          todayDate: parsed.todayDate || currentKst,
          today: parsed.todayDate === currentKst ? (parsed.today || 0) : 0,
          total: parsed.total || 0,
        };
        return memoryVisitorStats;
      }
    }
  } catch (err) {
    console.warn('[VisitorTracker] 로컬 파일 로드 에러:', err);
  }

  if (memoryVisitorStats.todayDate !== currentKst) {
    memoryVisitorStats.todayDate = currentKst;
    memoryVisitorStats.today = 0;
  }
  return memoryVisitorStats;
}

function saveVisitorStats(stats: VisitorStats) {
  memoryVisitorStats = stats;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VISITOR_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[VisitorTracker] 로컬 저장 불가(서버리스 메모리 유지):', err);
  }
}

/**
 * 방문자 수 1 증가 (기록)
 */
export async function recordVisit(): Promise<VisitorStats> {
  const currentKst = getKstDate();
  const current = loadVisitorStats();

  let todayCount = current.today;
  let totalCount = current.total;

  if (current.todayDate !== currentKst) {
    todayCount = 1;
  } else {
    todayCount += 1;
  }
  totalCount += 1;

  const updated: VisitorStats = {
    todayDate: currentKst,
    today: todayCount,
    total: totalCount,
  };

  saveVisitorStats(updated);

  // 구글 스프레드시트 웹훅이 연동되어 있다면 방문 통계도 비동기 전송
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VISIT',
          today: updated.today,
          total: updated.total,
          todayDate: updated.todayDate,
          timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        }),
      }).catch(() => {});
    } catch {}
  }

  return updated;
}

/**
 * 현재 방문자 통계 가져오기
 */
export function getVisitorStats(): VisitorStats {
  return loadVisitorStats();
}
