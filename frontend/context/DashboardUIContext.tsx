'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_FILTERS, type OpportunityFilters } from '@/types/filters';
import type { OpportunityRow, SortDirection, SortField } from '@/types/opportunity';

interface DashboardUIContextValue {
  selectedRow: OpportunityRow | null;
  selectRow: (row: OpportunityRow | null) => void;
  drawerOpen: boolean;
  closeDrawer: () => void;
  filters: OpportunityFilters;
  setFilters: (filters: OpportunityFilters) => void;
  updateFilter: <K extends keyof OpportunityFilters>(
    key: K,
    value: OpportunityFilters[K],
  ) => void;
  resetFilters: () => void;
  sortField: SortField;
  sortDirection: SortDirection;
  toggleSort: (field: SortField) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}

const DashboardUIContext = createContext<DashboardUIContextValue | null>(null);

export function DashboardUIProvider({ children }: { children: ReactNode }) {
  const [selectedRow, setSelectedRow] = useState<OpportunityRow | null>(null);
  const [filters, setFilters] = useState<OpportunityFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const selectRow = useCallback((row: OpportunityRow | null) => {
    setSelectedRow(row);
  }, []);

  const closeDrawer = useCallback(() => setSelectedRow(null), []);

  const updateFilter = useCallback(
    <K extends keyof OpportunityFilters>(key: K, value: OpportunityFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection(field === 'publishedAt' ? 'desc' : 'asc');
      }
    },
    [sortField],
  );

  const value = useMemo(
    () => ({
      selectedRow,
      selectRow,
      drawerOpen: selectedRow !== null,
      closeDrawer,
      filters,
      setFilters,
      updateFilter,
      resetFilters,
      sortField,
      sortDirection,
      toggleSort,
      focusedIndex,
      setFocusedIndex,
    }),
    [
      selectedRow,
      selectRow,
      closeDrawer,
      filters,
      updateFilter,
      resetFilters,
      sortField,
      sortDirection,
      toggleSort,
      focusedIndex,
    ],
  );

  return (
    <DashboardUIContext.Provider value={value}>{children}</DashboardUIContext.Provider>
  );
}

export function useDashboardUI(): DashboardUIContextValue {
  const ctx = useContext(DashboardUIContext);
  if (!ctx) {
    throw new Error('useDashboardUI must be used within DashboardUIProvider');
  }
  return ctx;
}
