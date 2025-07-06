export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  consentDate: Date;
  version: string;
  ipAddress?: string;
}

export interface PrivacySettings {
  userId: string;
  cookieConsent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  dataProcessingConsent: {
    profiling: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  emailMarketing: boolean;
  smsMarketing: boolean;
  profilingConsent: boolean;
  thirdPartyDataSharing: boolean;
  updatedAt: Date;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
  dataCategories: DataCategory[];
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  scheduledDeletionDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  reason?: string;
  retentionReasons?: string[];
  anonymizationComplete: boolean;
  adminNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  adminUserId?: string;
  action: AuditAction;
  dataCategory: string;
  details: string | object;
  resource: string;
  resourceId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'consent_granted'
  | 'consent_denied'
  | 'consent_withdrawn'
  | 'consent_updated'
  | 'privacy_settings_changed'
  | 'login'
  | 'logout';

export type DataCategory = 'profile' | 'authentication' | 'reservations' | 'orders' | 'loyalty' | 'events' | 'analytics' | 'communication' | 'privacy';

export type ProcessingPurpose = 
  | 'reservation_processing'
  | 'order_processing' 
  | 'loyalty_program'
  | 'marketing_communications'
  | 'analytics';

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ProcessingPurpose;
  granted: boolean;
  timestamp: Date;
  withdrawnAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export interface PrivacyDashboardData {
  user: {
    profile: any;
    dataCategories: DataCategory[];
    lastDataExport?: Date;
    accountCreated: Date;
  };
  consents: ConsentRecord[];
  privacySettings: PrivacySettings;
  dataRequests: {
    exports: DataExportRequest[];
    deletions: DataDeletionRequest[];
  };
  auditLog: AuditLogEntry[];
}

export interface GDPRComplianceStatus {
  cookieConsent: boolean;
  privacyPolicyAccepted: boolean;
  dataProcessingConsents: Record<string, boolean>;
  lastConsentUpdate: Date;
  hasOutstandingRequests: boolean;
} 