/**
 * Robust retry utility for Firebase operations with exponential backoff
 * Handles network failures, permission errors, and other transient issues
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

const DEFAULT_RETRYABLE_ERRORS = [
  'unavailable',
  'network-request-failed',
  'timeout',
  'cancelled',
  'deadline-exceeded',
  'resource-exhausted',
  'internal',
  'aborted'
];

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: DEFAULT_RETRYABLE_ERRORS,
  onRetry: () => {}
};

/**
 * Check if an error is retryable based on error code/message
 */
const isRetryableError = (error: any, retryableErrors: string[]): boolean => {
  if (!error) return false;
  
  const errorString = error.toString().toLowerCase();
  const errorCode = error.code?.toLowerCase() || '';
  const errorMessage = error.message?.toLowerCase() || '';
  
  return retryableErrors.some(retryableError => 
    errorString.includes(retryableError) ||
    errorCode.includes(retryableError) ||
    errorMessage.includes(retryableError)
  );
};

/**
 * Calculate delay for next retry with exponential backoff and jitter
 */
const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
  const baseDelay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * baseDelay; // Add 10% jitter
  const delay = Math.min(baseDelay + jitter, options.maxDelay);
  
  return Math.floor(delay);
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry an operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        attempts: attempt
      };
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt > config.maxRetries) {
        break;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error, config.retryableErrors)) {
        break;
      }
      
      // Calculate delay and notify
      const delay = calculateDelay(attempt, config);
      config.onRetry(lastError, attempt);
      
      console.warn(`Retrying operation (attempt ${attempt}/${config.maxRetries}) after ${delay}ms:`, lastError.message);
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: config.maxRetries + 1
  };
};

/**
 * Retry a Firebase operation with predefined settings
 */
export const retryFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  const result = await retryOperation(operation, {
    maxRetries,
    initialDelay: 1000,
    maxDelay: 5000,
    onRetry: (error, attempt) => {
      console.warn(`🔄 Retrying Firebase operation (${attempt}/${maxRetries}):`, error.message);
    }
  });
  
  if (!result.success) {
    throw result.error;
  }
  
  return result.data!;
};

/**
 * Create a cancellable operation that can be aborted
 */
export const createCancellableOperation = <T>(
  operation: (abortSignal: AbortSignal) => Promise<T>
) => {
  let abortController: AbortController | null = null;
  
  const execute = async (): Promise<T> => {
    abortController = new AbortController();
    
    try {
      return await operation(abortController.signal);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Operation was cancelled');
      }
      throw error;
    }
  };
  
  const cancel = () => {
    if (abortController) {
      abortController.abort();
    }
  };
  
  return { execute, cancel };
};

/**
 * Timeout wrapper for operations
 */
export const withTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([operation(), timeoutPromise]);
};

/**
 * Combined retry with timeout
 */
export const retryWithTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000,
  maxRetries: number = 3
): Promise<T> => {
  return retryFirebaseOperation(
    () => withTimeout(operation, timeoutMs),
    maxRetries
  );
}; 