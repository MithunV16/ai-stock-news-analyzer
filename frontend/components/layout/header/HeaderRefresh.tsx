'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

export function HeaderRefresh() {
  const queryClient = useQueryClient();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    setSpinning(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } finally {
      setTimeout(() => setSpinning(false), 600);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleRefresh()}
      className="rounded-md p-1.5 text-zinc-500 hover:bg-surface-hover hover:text-zinc-300"
      aria-label="Refresh dashboard data"
      title="Refresh"
    >
      <RefreshCw
        className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`}
        strokeWidth={1.75}
      />
    </button>
  );
}
