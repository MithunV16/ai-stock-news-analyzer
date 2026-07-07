import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  Building2,
  Landmark,
  LayoutDashboard,
  Megaphone,
  Settings,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';

export type DashboardViewId =
  | 'dashboard'
  | 'live-opportunities'
  | 'announcements'
  | 'high-impact'
  | 'bullish'
  | 'bearish'
  | 'results'
  | 'order-wins'
  | 'government-orders'
  | 'sectors'
  | 'watchlist'
  | 'alerts'
  | 'settings';

export interface NavItem {
  id: DashboardViewId;
  label: string;
  icon: LucideIcon;
  /** Shown when sidebar is collapsed */
  shortLabel?: string;
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'primary',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'live-opportunities', label: 'Live Opportunities', icon: Zap },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    id: 'signals',
    label: 'Signals',
    items: [
      { id: 'high-impact', label: 'High Impact', icon: Target },
      { id: 'bullish', label: 'Bullish', icon: TrendingUp },
      { id: 'bearish', label: 'Bearish', icon: TrendingDown },
      { id: 'results', label: 'Results', icon: BarChart3 },
      { id: 'order-wins', label: 'Order Wins', icon: Trophy },
      { id: 'government-orders', label: 'Government Orders', icon: Landmark },
    ],
  },
  {
    id: 'browse',
    label: 'Browse',
    items: [
      { id: 'sectors', label: 'Sectors', icon: Building2 },
      { id: 'watchlist', label: 'Watchlist', icon: Star },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'alerts', label: 'Alerts', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** Flat lookup for labels */
export const NAV_ITEMS_BY_ID = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items.map((item) => [item.id, item])),
) as Record<DashboardViewId, NavItem>;

/** Preset filter hints — wired in Module 6 */
export const VIEW_FILTER_HINTS: Partial<
  Record<DashboardViewId, { impact?: string; eventType?: string; announcementsOnly?: boolean }>
> = {
  bullish: { impact: 'Bullish' },
  bearish: { impact: 'Bearish' },
  results: { eventType: 'Results' },
  'order-wins': { eventType: 'Order' },
  'government-orders': { eventType: 'Government' },
  'high-impact': { impact: 'high' },
  announcements: { announcementsOnly: true },
};

export const PLACEHOLDER_VIEWS: DashboardViewId[] = [
  'sectors',
  'watchlist',
  'alerts',
  'settings',
];

export const DEFAULT_VIEW: DashboardViewId = 'live-opportunities';
