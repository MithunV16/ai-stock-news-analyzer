'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import type { ConnectionStatus } from '@/hooks/useSocketEvents';

/** Lightweight socket connection status for header — no event subscription */
export function useSocketConnection(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      setStatus('connected');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return status;
}
