import { useCallback, useEffect, useState } from 'react';

const API_URL = '/api/sync';
const SYNC_INTERVAL = 5000; // Sincronizar a cada 5 segundos

interface SyncData {
  settings: any;
  stores: any;
  debts: any;
}

export function useSyncServer() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);

  // Detectar conexão online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar dados do servidor
  const loadFromServer = useCallback(async (): Promise<SyncData | null> => {
    if (!isOnline) return null;

    try {
      setIsSyncing(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load', userId: 'default-user' }),
      });

      if (!response.ok) throw new Error('Failed to load from server');

      const { data } = await response.json();
      setLastSync(Date.now());
      return data;
    } catch (error) {
      console.error('[useSyncServer] Load error:', error);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Salvar dados no servidor
  const saveToServer = useCallback(async (data: SyncData): Promise<boolean> => {
    if (!isOnline) {
      console.log('[useSyncServer] Offline, skipping save');
      return false;
    }

    try {
      setIsSyncing(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-all',
          userId: 'default-user',
          data,
        }),
      });

      if (!response.ok) throw new Error('Failed to save to server');

      setLastSync(Date.now());
      return true;
    } catch (error) {
      console.error('[useSyncServer] Save error:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  return {
    loadFromServer,
    saveToServer,
    isSyncing,
    lastSync,
    isOnline,
  };
}
