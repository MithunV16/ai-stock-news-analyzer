/** Raw BSE corporate announcement row — provider-internal only */
export interface BseAnnouncementRow {
  SCRIP_CD?: string;
  scrip_cd?: string;
  SLONGNAME?: string;
  LONGNAME?: string;
  NEWS_DT?: string;
  DissemDT?: string;
  NEWSSUB?: string;
  HEADLINE?: string;
  CATEGORYNAME?: string;
  MORE?: string;
  ATTACHMENTNAME?: string;
  NSURL?: string;
  URL?: string;
  NEWSID?: string;
  [key: string]: unknown;
}

/** BSE paginated API response */
export interface BseAnnouncementsApiResponse {
  Table?: BseAnnouncementRow[];
  [key: string]: unknown;
}

export interface BseQueryParams {
  Pageno: number;
  strCat: string;
  strPrevDate: string;
  strScrip: string;
  strSearch: string;
  strToDate: string;
  strType: string;
}

export interface BseHttpFetchResult {
  rows: BseAnnouncementRow[];
  requestUrl: string;
  httpStatus: number;
  durationMs: number;
  pagesFetched: number;
}
