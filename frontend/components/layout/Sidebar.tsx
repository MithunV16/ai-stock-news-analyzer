'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardNav } from '@/context/DashboardNavContext';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS, type DashboardViewId, type NavItem } from '@/types/navigation';

function SidebarNavItem({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onSelect: (id: DashboardViewId) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
        active
          ? 'bg-surface-hover font-medium text-zinc-100'
          : 'text-zinc-500 hover:bg-surface-hover/60 hover:text-zinc-300',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          active ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400',
        )}
        strokeWidth={1.75}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

export function Sidebar() {
  const {
    activeView,
    setActiveView,
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useDashboardNav();

  const handleSelect = (id: DashboardViewId) => {
    setActiveView(id);
    setMobileSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-surface-border px-3 py-2.5',
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between',
        )}
      >
        {!sidebarCollapsed && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Markets
          </p>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-md p-1 text-zinc-500 hover:bg-surface-hover hover:text-zinc-300 md:inline-flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className={cn(section.id !== 'primary' && 'mt-3')}>
            {section.label && !sidebarCollapsed && (
              <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                {section.label}
              </p>
            )}
            {section.label && sidebarCollapsed && (
              <div className="mx-auto mb-1 h-px w-6 bg-surface-border" aria-hidden />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  active={activeView === item.id}
                  collapsed={sidebarCollapsed}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="shrink-0 border-t border-surface-border px-3 py-2">
          <p className="text-[10px] text-zinc-600">NSE · BSE · Live feed</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-surface-border bg-surface pt-12 transition-transform md:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-surface-border bg-surface transition-[width] duration-200 md:flex',
          sidebarCollapsed ? 'w-14' : 'w-52',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
