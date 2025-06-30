import { useEffect, useRef, useCallback } from 'react';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const refreshCallbacks = new Set<() => Promise<void> | void>();
let globalInterval: NodeJS.Timeout | null = null;

const startGlobalRefresh = () => {
  if (globalInterval) return;
  
  globalInterval = setInterval(async () => {
    console.log('Auto-refreshing all weather data...');
    const promises = Array.from(refreshCallbacks).map(callback => 
      Promise.resolve(callback()).catch(error => 
        console.error('Error in auto-refresh callback:', error)
      )
    );
    await Promise.all(promises);
  }, REFRESH_INTERVAL);
};

const stopGlobalRefresh = () => {
  if (globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
};

export const useAutoRefresh = (refreshCallback: () => Promise<void> | void, enabled = true) => {
  const callbackRef = useRef(refreshCallback);
  
  useEffect(() => {
    callbackRef.current = refreshCallback;
  }, [refreshCallback]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const wrappedCallback = () => callbackRef.current();
    
    refreshCallbacks.add(wrappedCallback);
    
    if (refreshCallbacks.size === 1) {
      startGlobalRefresh();
    }
    
    return () => {
      refreshCallbacks.delete(wrappedCallback);
      
      if (refreshCallbacks.size === 0) {
        stopGlobalRefresh();
      }
    };
  }, [enabled]);
  
  const manualRefresh = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch (error) {
      console.error('Error in manual refresh:', error);
    }
  }, []);
  
  return { manualRefresh };
};
