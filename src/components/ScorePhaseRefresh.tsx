'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useKstDayRefresh } from '@/lib/useKstDayRefresh';

export default function ScorePhaseRefresh({ evaluatedAt }: { evaluatedAt: number }) {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  useKstDayRefresh(refresh, evaluatedAt);
  return null;
}
