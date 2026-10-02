import fs from 'fs';
import path from 'path';

export interface VisitorStats {
  today: number;
  total: number;
  todayDate: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const VISITOR_FILE = path.join(DATA_DIR, 'visitors.json');
const NAMESPACE = 'iposcore.kr';

// KST 날짜 계산 (YYYY-MM-DD)
export function getKstDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

let memoryVisitorStats: VisitorStats = {
  today: 0,
  total: 0,
  todayDate: getKstDate(),
};

/**
 * 1. 로컬 파일 및 메모리 캐시 로드
 */
function loadLocalStats(): VisitorStats {
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
  } catch {}

  if (memoryVisitorStats.todayDate !== currentKst) {
    memoryVisitorStats.todayDate = currentKst;
    memoryVisitorStats.today = 0;
  }
  return memoryVisitorStats;
}

function saveLocalStats(stats: VisitorStats) {
  memoryVisitorStats = stats;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VISITOR_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch {}
}

/**
 * 2. 원격 영구 클라우드 카운터 조회 (Abacus Global Key-Value)
 */
async function fetchRemoteStats(dateStr: string): Promise<{ today: number; total: number } | null> {
  try {
    const [todayRes, totalRes] = await Promise.all([
      fetch(`https://abacus.jasoncameron.dev/get/${NAMESPACE}/day-${dateStr}`, {
        cache: 'no-store',
      }),
      fetch(`https://abacus.jasoncameron.dev/get/${NAMESPACE}/total`, {
        cache: 'no-store',
      }),
    ]);

    if (todayRes.ok && totalRes.ok) {
      const todayData = await todayRes.json();
      const totalData = await totalRes.json();
      return {
        today: typeof todayData.value === 'number' ? todayData.value : 0,
        total: typeof totalData.value === 'number' ? totalData.value : 0,
      };
    }
  } catch (err) {
    console.warn('[VisitorTracker] 원격 카운터 조회 실패:', err);
  }
  return null;
}

/**
 * 3. 원격 영구 클라우드 카운터 1 증가 (Hit)
 */
async function hitRemoteStats(dateStr: string): Promise<{ today: number; total: number } | null> {
  try {
    const [todayRes, totalRes] = await Promise.all([
      fetch(`https://abacus.jasoncameron.dev/hit/${NAMESPACE}/day-${dateStr}`, {
        method: 'GET',
        cache: 'no-store',
      }),
      fetch(`https://abacus.jasoncameron.dev/hit/${NAMESPACE}/total`, {
        method: 'GET',
        cache: 'no-store',
      }),
    ]);

    if (todayRes.ok && totalRes.ok) {
      const todayData = await todayRes.json();
      const totalData = await totalRes.json();
      return {
        today: typeof todayData.value === 'number' ? todayData.value : 1,
        total: typeof totalData.value === 'number' ? totalData.value : 1,
      };
    }
  } catch (err) {
    console.warn('[VisitorTracker] 원격 카운터 증가 실패:', err);
  }
  return null;
}

/**
 * 방문자 수 1 증가 (기록) - 서버리스 인스턴스가 꺼져도 영구 유지
 */
export async function recordVisit(): Promise<VisitorStats> {
  const currentKst = getKstDate();
  const local = loadLocalStats();

  let todayCount = local.today;
  let totalCount = local.total;

  if (local.todayDate !== currentKst) {
    todayCount = 1;
  } else {
    todayCount += 1;
  }
  totalCount += 1;

  // 원격 클라우드 카운터 동기화
  const remote = await hitRemoteStats(currentKst);
  if (remote) {
    todayCount = Math.max(todayCount, remote.today);
    totalCount = Math.max(totalCount, remote.total);
  }

  const updated: VisitorStats = {
    todayDate: currentKst,
    today: todayCount,
    total: totalCount,
  };

  saveLocalStats(updated);

  // 구글 스프레드시트 웹훅이 연동되어 있다면 전달
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
 * 현재 방문자 통계 가져오기 - 클라우드 영구 스토리지 우선 동기화
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  const currentKst = getKstDate();
  const local = loadLocalStats();

  // 원격 영구 스토리지에서 최신 수치 조회
  const remote = await fetchRemoteStats(currentKst);
  if (remote) {
    const todayCount = Math.max(local.today, remote.today);
    const totalCount = Math.max(local.total, remote.total);

    const merged: VisitorStats = {
      todayDate: currentKst,
      today: todayCount,
      total: totalCount,
    };
    saveLocalStats(merged);
    return merged;
  }

  return local;
}
