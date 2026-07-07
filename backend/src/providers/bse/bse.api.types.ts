/** Raw BSE corporate announcement row — provider-internal only */
export interface BseAnnouncementRow {
  /** Browser API field */
  Subject?: string;
  /** Browser API field */
  Newsid?: string;
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

/** BSE returns a JSON array directly — not { Table: [] } */
export type BseAnnouncementsApiResponse = BseAnnouncementRow[];

export interface BseHttpFetchResult {
  rows: BseAnnouncementRow[];
  requestUrl: string;
  httpStatus: number;
  durationMs: number;
}
