import { useState, useCallback, useRef, useEffect } from 'react';
import { retryFirebaseOperation, createCancellableOperation } from '../utils/retryOperation';

export interface AdminDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  lastUpdated: Date | null;
  retryCount: number;
}

export interface AdminDataActions<T> {
  loadData: (fetcher: () => Promise<T>, options?: LoadDataOptions) => Promise<void>;
  reload: () => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface LoadDataOptions {
  skipRetry?: boolean;
  showLoadingState?: boolean;
  preserveData?: boolean;
  timeout?: number;
}

export interface UseAdminDataLoaderOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  checkEmpty?: (data: T) => boolean;
  autoRetry?: boolean;
  retryDelay?: number;
}

/**
 * Centralized loading state management hook for admin components
 * Provides robust error handling, retry logic, and loading states
 */
export const useAdminDataLoader = <T>(
  options: UseAdminDataLoaderOptions<T> = {}
): AdminDataState<T> & AdminDataActions<T> => {
  const {
    initialData = null,
    onSuccess,
    onError,
    checkEmpty = (data) => Array.isArray(data) ? data.length === 0 : !data,
    autoRetry = false,
    retryDelay = 5000
  } = options;

  const [state, setState] = useState<AdminDataState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isEmpty: false,
    lastUpdated: null,
    retryCount: 0
  });

  const lastFetcherRef = useRef<(() => Promise<T>) | null>(null);
  const currentOperationRef = useRef<{ cancel: () => void } | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentOperationRef.current) {
        currentOperationRef.current.cancel();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      isEmpty: false,
      lastUpdated: null,
      retryCount: 0
    });
    
    if (currentOperationRef.current) {
      currentOperationRef.current.cancel();
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      isEmpty: data ? checkEmpty(data) : false,
      lastUpdated: new Date(),
      error: null
    }));
  }, [checkEmpty]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  const loadData = useCallback(async (
    fetcher: () => Promise<T>,
    loadOptions: LoadDataOptions = {}
  ): Promise<void> => {
    const {
      skipRetry = false,
      showLoadingState = true,
      preserveData = false,
      timeout = 10000
    } = loadOptions;

    // Cancel any ongoing operation
    if (currentOperationRef.current) {
      currentOperationRef.current.cancel();
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Store fetcher for retry
    lastFetcherRef.current = fetcher;

    // Update loading state
    setState(prev => ({
      ...prev,
      loading: showLoadingState,
      error: null,
      data: preserveData ? prev.data : null
    }));

    // Create cancellable operation
    const operation = createCancellableOperation<T>(async (abortSignal) => {
      if (skipRetry) {
        return await fetcher();
      }

      return await retryFirebaseOperation(
        async () => {
          if (abortSignal.aborted) {
            throw new Error('Operation was cancelled');
          }
          return await fetcher();
        },
        3
      );
    });

    currentOperationRef.current = operation;

    try {
      const result = await (timeout > 0 
        ? Promise.race([
            operation.execute(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error(`Operation timeout after ${timeout}ms`)), timeout)
            )
          ])
        : operation.execute()
      );

      const isEmpty = checkEmpty(result);

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        isEmpty,
        lastUpdated: new Date(),
        retryCount: prev.retryCount + 1
      }));

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      if (onError) {
        onError(errorMessage);
      }

      console.error('Admin data loading error:', error);

      // Auto retry on network errors
      if (autoRetry && errorMessage.includes('network') && retryDelay > 0) {
        retryTimeoutRef.current = setTimeout(() => {
          if (lastFetcherRef.current) {
            console.log('Auto-retrying failed operation...');
            loadData(lastFetcherRef.current, loadOptions);
          }
        }, retryDelay);
      }
    }
  }, [checkEmpty, onSuccess, onError, autoRetry, retryDelay]);

  const reload = useCallback(async (): Promise<void> => {
    if (lastFetcherRef.current) {
      await loadData(lastFetcherRef.current, { preserveData: true });
    } else {
      console.warn('No fetcher available for reload');
    }
  }, [loadData]);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    isEmpty: state.isEmpty,
    lastUpdated: state.lastUpdated,
    retryCount: state.retryCount,
    
    // Actions
    loadData,
    reload,
    reset,
    setData,
    setError,
    clearError
  };
};

/**
 * Hook for managing multiple data sources with loading states
 */
export const useMultipleAdminDataLoader = <T extends Record<string, any>>(
  options: UseAdminDataLoaderOptions<T> = {}
) => {
  const {
    initialData = {} as T,
    onSuccess,
    onError,
    checkEmpty = (data) => Object.keys(data).length === 0
  } = options;

  const [state, setState] = useState<AdminDataState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isEmpty: false,
    lastUpdated: null,
    retryCount: 0
  });

  const operationsRef = useRef<Map<string, { cancel: () => void }>>(new Map());
  const lastFetchersRef = useRef<Record<string, () => Promise<any>> | null>(null);

  const loadMultipleData = useCallback(async (
    fetchers: Record<string, () => Promise<any>>,
    loadOptions: LoadDataOptions = {}
  ): Promise<void> => {
    // Store fetchers for reload
    lastFetchersRef.current = fetchers;
    const { showLoadingState = true, preserveData = false } = loadOptions;

    // Cancel ongoing operations
    operationsRef.current.forEach(op => op.cancel());
    operationsRef.current.clear();

    setState(prev => ({
      ...prev,
      loading: showLoadingState,
      error: null,
      data: preserveData ? prev.data : initialData
    }));

    try {
      const results = await Promise.allSettled(
        Object.entries(fetchers).map(async ([key, fetcher]) => {
          const operation = createCancellableOperation(async () => {
            return await retryFirebaseOperation(fetcher, 3);
          });
          
          operationsRef.current.set(key, operation);
          
          const result = await operation.execute();
          return { key, result };
        })
      );

      const successResults: Record<string, any> = {};
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { key, result: data } = result.value;
          successResults[key] = data;
        } else {
          const key = Object.keys(fetchers)[index];
          errors.push(`${key}: ${result.reason.message}`);
        }
      });

      const finalData = { ...initialData, ...successResults } as T;
      const isEmpty = checkEmpty(finalData);

      setState(prev => ({
        ...prev,
        data: finalData,
        loading: false,
        error: errors.length > 0 ? errors.join('; ') : null,
        isEmpty,
        lastUpdated: new Date(),
        retryCount: prev.retryCount + 1
      }));

      if (onSuccess && errors.length === 0) {
        onSuccess(finalData);
      }

      if (onError && errors.length > 0) {
        onError(errors.join('; '));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [initialData, checkEmpty, onSuccess, onError]);

  const reload = useCallback(async () => {
    if (lastFetchersRef.current) {
      await loadMultipleData(lastFetchersRef.current);
    }
  }, [loadMultipleData]);

  return {
    ...state,
    loadMultipleData,
    reload
  };
};

/**
 * Hook for real-time data with proper cleanup
 */
export const useRealtimeAdminData = <T>(
  initialData: T | null = null,
  checkEmpty: (data: T) => boolean = (data) => Array.isArray(data) ? data.length === 0 : !data
) => {
  const [state, setState] = useState<AdminDataState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isEmpty: false,
    lastUpdated: null,
    retryCount: 0
  });

  const unsubscribeFunctionsRef = useRef<Set<() => void>>(new Set());

  const setupRealtimeListener = useCallback(<K>(
    listenerSetup: (callback: (data: K) => void) => () => void,
    dataProcessor?: (data: K) => T
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const unsubscribe = listenerSetup((data: K) => {
        const processedData = dataProcessor ? dataProcessor(data) : data as unknown as T;
        
        setState(prev => ({
          ...prev,
          data: processedData,
          loading: false,
          error: null,
          isEmpty: checkEmpty(processedData),
          lastUpdated: new Date(),
          retryCount: prev.retryCount + 1
        }));
      });

      unsubscribeFunctionsRef.current.add(unsubscribe);

      return unsubscribe;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      return () => {};
    }
  }, [checkEmpty]);

  const cleanup = useCallback(() => {
    unsubscribeFunctionsRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    unsubscribeFunctionsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    setupRealtimeListener,
    cleanup
  };
}; 