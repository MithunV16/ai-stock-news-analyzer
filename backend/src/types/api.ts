/** Standard API success envelope */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export function buildPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}

export function paginatedResponse<T>(
  data: T,
  meta: PaginationMeta,
): ApiSuccessResponse<T> {
  return { success: true, data, meta };
}

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}
