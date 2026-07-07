import { apiFetch } from '@/lib/api';
import type { ApiSuccessResponse, DashboardData } from '@/types/domain';

export async function fetchDashboard(limit = 30): Promise<DashboardData> {
  const response = await apiFetch<ApiSuccessResponse<DashboardData>>(
    `/api/dashboard?limit=${limit}`,
  );
  return response.data;
}
