import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ReconnectionState {
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastError: Error | null;
  isConnected: boolean;
  lastReconnectTime: number;
  lastToastTime: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_BASE = 1000; // 1 second
const TOAST_COOLDOWN = 5000; // 5 seconds between toasts
const ERROR_DEBOUNCE = 2000; // 2 seconds debounce for errors

/**
 * Hook to manage automatic actor reconnection with connection state tracking
 * Detects actor failures and triggers reinitialization only when truly disconnected
 */
export function useActorReconnection() {
  const queryClient = useQueryClient();
  const reconnectionState = useRef<ReconnectionState>({
    isReconnecting: false,
    reconnectAttempts: 0,
    lastError: null,
    isConnected: true,
    lastReconnectTime: 0,
    lastToastTime: 0,
  });
  const toastIdRef = useRef<string | number | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActorError = useCallback((error: unknown): boolean => {
    if (!error) return false;
    
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    // Detect common actor/canister errors that indicate disconnection
    return (
      errorMessage.includes('actor not available') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('canister rejected') ||
      errorMessage.includes('network error') ||
      errorMessage.includes('connection refused') ||
      errorMessage.includes('timeout')
    );
  }, []);

  const handleReconnection = useCallback(async (error: Error) => {
    const state = reconnectionState.current;
    const now = Date.now();

    // Prevent multiple simultaneous reconnection attempts
    if (state.isReconnecting) {
      return;
    }

    // Check if we've exceeded max attempts
    if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      state.isConnected = false;
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      // Only show error toast if enough time has passed
      if (now - state.lastToastTime > TOAST_COOLDOWN) {
        toast.error('Unable to reconnect to Soly. Please refresh the page.', {
          duration: 10000,
        });
        state.lastToastTime = now;
      }
      return;
    }

    state.isReconnecting = true;
    state.isConnected = false;
    state.reconnectAttempts += 1;
    state.lastError = error;
    state.lastReconnectTime = now;

    // Show reconnecting toast only if not shown recently
    if (now - state.lastToastTime > TOAST_COOLDOWN) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast.loading(
        `Reconnecting to Soly... (Attempt ${state.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
        { duration: Infinity }
      );
      state.lastToastTime = now;
    }

    try {
      // Calculate exponential backoff delay with jitter
      const delay = Math.min(
        RECONNECT_DELAY_BASE * Math.pow(2, state.reconnectAttempts - 1) + Math.random() * 1000,
        10000 // Max 10 seconds
      );

      await new Promise(resolve => setTimeout(resolve, delay));

      // Invalidate and refetch the actor query to trigger reinitialization
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      await queryClient.refetchQueries({ queryKey: ['actor'] });

      // Wait a bit for actor to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if actor is now available
      const actorQuery = queryClient.getQueryState(['actor']);
      if (actorQuery?.data) {
        // Success - reset state
        state.isReconnecting = false;
        state.reconnectAttempts = 0;
        state.lastError = null;
        state.isConnected = true;

        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
        
        // Show success toast only once per reconnection event
        const timeSinceLastToast = Date.now() - state.lastToastTime;
        if (timeSinceLastToast > TOAST_COOLDOWN) {
          toast.success('Successfully reconnected to Soly! 🎉', {
            duration: 3000,
          });
          state.lastToastTime = Date.now();
        }

        // Refetch dependent queries after successful reconnection
        await queryClient.refetchQueries({
          predicate: (query) => !query.queryKey.includes('actor'),
        });
      } else {
        throw new Error('Actor still not available after reconnection attempt');
      }
    } catch (reconnectError) {
      state.isReconnecting = false;
      
      // Retry recursively if we haven't exceeded max attempts
      if (state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        await handleReconnection(error);
      } else {
        state.isConnected = false;
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
        const now = Date.now();
        if (now - state.lastToastTime > TOAST_COOLDOWN) {
          toast.error('Unable to reconnect to Soly. Please refresh the page.', {
            duration: 10000,
          });
          state.lastToastTime = now;
        }
      }
    }
  }, [queryClient]);

  const checkAndReconnect = useCallback((error: unknown) => {
    const state = reconnectionState.current;
    
    // Only attempt reconnection if:
    // 1. It's an actor error
    // 2. We're not already reconnecting
    // 3. We're not already connected (or think we are)
    // 4. Enough time has passed since last reconnection attempt
    if (
      isActorError(error) && 
      error instanceof Error && 
      !state.isReconnecting &&
      (Date.now() - state.lastReconnectTime > ERROR_DEBOUNCE)
    ) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Debounce error handling to prevent rapid-fire reconnection attempts
      errorTimeoutRef.current = setTimeout(() => {
        handleReconnection(error);
      }, 500);
    }
  }, [isActorError, handleReconnection]);

  // Mark as connected when actor query succeeds
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'updated' && event.query.queryKey.includes('actor')) {
        if (event.query.state.data && event.query.state.status === 'success') {
          const state = reconnectionState.current;
          if (!state.isConnected && !state.isReconnecting) {
            state.isConnected = true;
            state.reconnectAttempts = 0;
            state.lastError = null;
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return {
    checkAndReconnect,
    isReconnecting: reconnectionState.current.isReconnecting,
    reconnectAttempts: reconnectionState.current.reconnectAttempts,
    isConnected: reconnectionState.current.isConnected,
  };
}
