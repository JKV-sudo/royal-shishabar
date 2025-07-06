// Production-safe logging utility
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🔍 DEBUG: ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`ℹ️ INFO: ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`⚠️ WARN: ${message}`, ...args);
    } else {
      // In production, only log warnings to avoid noise
      console.warn(`⚠️ ${message}`);
    }
  },

  error: (message: string, error?: any, ...args: any[]) => {
    // Always log errors, even in production
    console.error(`❌ ERROR: ${message}`, error, ...args);
    
    // In production, you might want to send to error reporting service
    if (!isDevelopment && error) {
      // Example: sendToErrorReporting(message, error);
    }
  },

  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`✅ SUCCESS: ${message}`, ...args);
    }
  },
};

export default logger; 