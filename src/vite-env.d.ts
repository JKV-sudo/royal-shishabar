/// <reference types="vite/client" />

// Global type definitions for Google Analytics gtag function
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent',
      targetId: string | 'update',
      config?: {
        analytics_storage?: 'granted' | 'denied';
        ad_storage?: 'granted' | 'denied';
        [key: string]: any;
      }
    ) => void;
  }
}

export {};
