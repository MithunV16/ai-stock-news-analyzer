/** Raw NSE corporate-announcements API row — provider-internal only */
export interface NseAnnouncementRow {
  symbol?: string;
  sm_symbol?: string;
  sm_name?: string;
  desc?: string;
  headline?: string;
  subject?: string;
  dt?: string;
  an_dt?: string;
  attchmntFile?: string;
  attchmntText?: string;
  seq_id?: string;
  sort_date?: string;
  fileSize?: string;
  orgid?: string;
  [key: string]: unknown;
}

/** Top-level NSE API response — full object stored as rawData per row */
export interface NseAnnouncementsApiResponse {
  data?: NseAnnouncementRow[];
  [key: string]: unknown;
}
