'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '@/services/dashboard.service';
import type { DashboardData } from '@/types/domain';

export function useDashboard(limit = 30) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', limit],
    queryFn: () => fetchDashboard(limit),
  });
}
