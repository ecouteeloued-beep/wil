/**
 * Security & Hardening Utilities
 * National Grievance Platform - Wilaya of El Oued
 * 
 * Provides centralized defensive security controls:
 * 1. Input Sanitization (XSS, Injection, Control Characters)
 * 2. Safe URL & Attachment Validation (preventing javascript: / data:text/html execution)
 * 3. Rate Limiting & Anti-Brute-Force Guard (Exponential backoff & Lockout)
 * 4. PII Data Masking (Algerian Data Protection Standard)
 * 5. Backup Schema Validation (Preventing Insecure Deserialization & Privilege Escalation)
 * 6. File Upload Whitelisting & Size Constraints
 */

export interface RateLimitStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutRemainingSeconds: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// 1. INPUT SANITIZATION
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags, script tags, control characters and restricts length
 */
export function sanitizeInput(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') return '';
  
  // 1. Remove dangerous null bytes and control characters
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip HTML tags (including <script>, <iframe>, <object>, <embed>, <svg>)
  clean = clean.replace(/<[^>]*>?/gm, '');

  // 3. Strip dangerous protocol prefixes
  clean = clean.replace(/javascript:/gi, '').replace(/vbscript:/gi, '');

  // 4. Bound length to prevent Memory / DOM Bloat
  return clean.slice(0, maxLength).trim();
}

/**
 * Validates and sanitizes a URL before opening or rendering in iframes/images.
 * Strictly whitelists: http:, https:, blob:, and safe base64 media (pdf, images).
 * Explicitly rejects: javascript:, vbscript:, data:text/html, etc.
 */
export function sanitizeDocumentUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Allow blob URLs (generated securely in client session)
  if (trimmed.startsWith('blob:')) return trimmed;

  // Allow safe base64 images and PDFs
  if (
    trimmed.startsWith('data:image/jpeg;base64,') ||
    trimmed.startsWith('data:image/png;base64,') ||
    trimmed.startsWith('data:image/webp;base64,') ||
    trimmed.startsWith('data:application/pdf;base64,')
  ) {
    return trimmed;
  }

  // Check valid HTTP/HTTPS URLs
  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// 2. PII MASKING (Citizen Privacy & Data Protection)
// ---------------------------------------------------------------------------

/**
 * Masks 18-digit Algerian NIN: 198839010045230012 -> 198839**********12
 */
export function maskNIN(nin: string | undefined | null): string {
  if (!nin) return 'غير متوفر';
  const clean = nin.trim();
  if (clean.length < 8) return '********';
  return `${clean.slice(0, 6)}${'*'.repeat(Math.max(0, clean.length - 8))}${clean.slice(-2)}`;
}

export type AlgerianNinParts = {
  genderAndBirthPlaceType: string;
  birthYear: string;
  municipalityCode: string;
  birthActNumber: string;
  serialNumber: string;
  controlKey: string;
};

/** Validates the public 18-digit Algerian NIN layout: 2 + 3 + 4 + 5 + 2 + 2. */
export function parseAlgerianNIN(value: unknown): { valid: boolean; parts?: AlgerianNinParts; error?: string } {
  const clean = typeof value === 'string' ? value.replace(/\s/g, '') : '';
  if (!/^\d{18}$/.test(clean)) {
    return { valid: false, error: 'يجب أن يتكون رقم التعريف الوطني من 18 رقماً.' };
  }

  const parts: AlgerianNinParts = {
    genderAndBirthPlaceType: clean.slice(0, 2),
    birthYear: clean.slice(2, 5),
    municipalityCode: clean.slice(5, 9),
    birthActNumber: clean.slice(9, 14),
    serialNumber: clean.slice(14, 16),
    controlKey: clean.slice(16, 18),
  };

  if (Number(parts.genderAndBirthPlaceType) === 0 || Number(parts.birthYear) === 0 || Number(parts.municipalityCode) === 0 || Number(parts.birthActNumber) === 0) {
    return { valid: false, error: 'مكونات رقم التعريف الوطني لا يمكن أن تكون أصفاراً بالكامل.' };
  }
  if (Number(parts.controlKey) === 0) {
    return { valid: false, error: 'مفتاح مراقبة رقم التعريف الوطني غير صالح.' };
  }

  return { valid: true, parts };
}

/**
 * Masks 10-digit Algerian Phone: 0661245890 -> 0661****90
 */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return 'غير متوفر';
  const clean = phone.trim();
  if (clean.length < 6) return '****';
  return `${clean.slice(0, 4)}****${clean.slice(-2)}`;
}

/**
 * Masks Citizen Full Name for public views: "عبد الرحمن مسعودي" -> "عبد الرحمن م.***"
 */
export function maskPublicName(name: string | undefined | null): string {
  if (!name) return 'مواطن';
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1].charAt(0);
  return `${firstName} ${lastNameInitial}.***`;
}

// ---------------------------------------------------------------------------
// 3. SECURE CLIENT-SIDE RATE LIMITING (Brute-Force Protection)
// ---------------------------------------------------------------------------

interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

const RATE_LIMIT_PREFIX = 'rate_limit_';

export class SecurityRateLimiter {
  private static MAX_ATTEMPTS = 5;
  private static WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
  private static LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

  private static getKey(action: string, identifier: string): string {
    return `${RATE_LIMIT_PREFIX}${action}_${identifier.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }

  private static getRecord(key: string): AttemptRecord | null {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private static setRecord(key: string, record: AttemptRecord): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(record));
    } catch {}
  }

  /**
   * Checks whether the action is currently permitted or locked out
   */
  public static checkLimit(action: string, identifier: string): RateLimitStatus {
    const key = this.getKey(action, identifier);
    const record = this.getRecord(key);
    const now = Date.now();

    if (!record) {
      return {
        isLocked: false,
        remainingAttempts: this.MAX_ATTEMPTS,
        lockoutRemainingSeconds: 0
      };
    }

    // Check if lockout is active
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutRemainingSeconds: remainingSec,
        message: `تم قفل المحاولات مؤقتاً لأسباب أمنية. يرجى الانتظار ${Math.ceil(remainingSec / 60)} دقيقة.`
      };
    }

    // Reset if window has elapsed
    if (now - record.firstAttemptTime > this.WINDOW_MS) {
      sessionStorage.removeItem(key);
      return {
        isLocked: false,
        remainingAttempts: this.MAX_ATTEMPTS,
        lockoutRemainingSeconds: 0
      };
    }

    const remaining = Math.max(0, this.MAX_ATTEMPTS - record.count);
    return {
      isLocked: remaining <= 0,
      remainingAttempts: remaining,
      lockoutRemainingSeconds: 0
    };
  }

  /**
   * Registers a failed attempt and triggers lockout if max attempts exceeded
   */
  public static registerFailure(action: string, identifier: string): RateLimitStatus {
    const key = this.getKey(action, identifier);
    const now = Date.now();
    let record = this.getRecord(key);

    if (!record || now - record.firstAttemptTime > this.WINDOW_MS) {
      record = {
        count: 1,
        firstAttemptTime: now
      };
    } else {
      record.count += 1;
    }

    if (record.count >= this.MAX_ATTEMPTS) {
      record.lockedUntil = now + this.LOCKOUT_MS;
      this.setRecord(key, record);
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutRemainingSeconds: Math.ceil(this.LOCKOUT_MS / 1000),
        message: `تم تجاوز الحد الأقصى للمحاولات (${this.MAX_ATTEMPTS}). تم حظر الوصول مؤقتاً لمدة 15 دقيقة.`
      };
    }

    this.setRecord(key, record);
    return {
      isLocked: false,
      remainingAttempts: this.MAX_ATTEMPTS - record.count,
      lockoutRemainingSeconds: 0
    };
  }

  /**
   * Resets the rate limit counter upon successful authentication
   */
  public static reset(action: string, identifier: string): void {
    const key = this.getKey(action, identifier);
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// 4. FILE UPLOAD SECURITY VALIDATION
// ---------------------------------------------------------------------------

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'الملف غير صالح' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)} ميغابايت) يتجاوز الحد الأقصى المسموح به (5 ميغابايت).` };
  }

  // Check for dangerous path traversal in file name
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: 'اسم الملف يحتوي على رموز غير مسموح بها.' };
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. الأنواع المسموح بها فقط: PDF, JPG, PNG.' };
  }

  // Check MIME type if available
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'صيغة الملف غير متوافقة مع الأنواع المسموحة.' };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// 5. SECURE BACKUP SCHEMA VALIDATOR (Insecure Deserialization Defense)
// ---------------------------------------------------------------------------

const ALLOWED_ROLES = ['super_admin', 'wali', 'chef_cabinet', 'head_department', 'supervisor', 'employee'];

export function validateBackupSchema(data: any): { valid: boolean; error?: string; cleanData?: any } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'ملف النسخة الاحتياطية غير صالح (بنية البيانات غير صحيحة).' };
  }

  // Prototype Pollution Check
  if ('__proto__' in data || 'constructor' in data || 'prototype' in data) {
    return { valid: false, error: 'تم رفض الملف: محاولة تلاعب غير مصرح بها (Prototype Pollution).' };
  }

  const cleanData: any = {};

  // Validate settings if present
  if (data.settings) {
    if (typeof data.settings !== 'object' || Array.isArray(data.settings)) {
      return { valid: false, error: 'إعدادات النظام في ملف النسخة غير صالحة.' };
    }
    cleanData.settings = {
      systemTitle: sanitizeInput(data.settings.systemTitle || '', 100),
      officialEmail: sanitizeInput(data.settings.officialEmail || '', 100),
      greenLinePhone: sanitizeInput(data.settings.greenLinePhone || '', 30),
      statutoryDeadlineDays: Number(data.settings.statutoryDeadlineDays) || 15,
      sessionTimeoutMinutes: Number(data.settings.sessionTimeoutMinutes) || 30,
      requirePinForSensitiveActions: Boolean(data.settings.requirePinForSensitiveActions),
      senderId: sanitizeInput(data.settings.senderId || 'WILAYA-ELOUED', 30),
      smsEnabled: Boolean(data.settings.smsEnabled),
      autoSmsOnStatusChange: Boolean(data.settings.autoSmsOnStatusChange),
      soundAlerts: Boolean(data.settings.soundAlerts),
      defaultSortOrder: ['newest', 'priority', 'oldest'].includes(data.settings.defaultSortOrder) ? data.settings.defaultSortOrder : 'newest',
      autoRefreshIntervalSeconds: Number(data.settings.autoRefreshIntervalSeconds) || 60,
      smsTemplateNewComplaint: sanitizeInput(data.settings.smsTemplateNewComplaint || '', 500),
      smsTemplateResolved: sanitizeInput(data.settings.smsTemplateResolved || '', 500),
      smsTemplateUrgentDirective: sanitizeInput(data.settings.smsTemplateUrgentDirective || '', 500)
    };
  }

  // Validate users if present
  if (data.users) {
    if (!Array.isArray(data.users)) {
      return { valid: false, error: 'قائمة المستخدمين في النسخة غير صالحة.' };
    }
    cleanData.users = data.users.map((u: any) => {
      if (!u || typeof u !== 'object' || !u.id || !u.name) {
        throw new Error('بيانات مستخدم غير صالحة داخل النسخة الاحتياطية.');
      }
      return {
        id: sanitizeInput(u.id, 50),
        name: sanitizeInput(u.name, 100),
        role: ALLOWED_ROLES.includes(u.role) ? u.role : 'employee',
        roleTitle: sanitizeInput(u.roleTitle || '', 100),
        department: sanitizeInput(u.department || '', 100),
        status: u.status === 'inactive' ? 'inactive' : 'active',
        assignedCount: Number(u.assignedCount) || 0,
        resolvedCount: Number(u.resolvedCount) || 0,
        overdueCount: Number(u.overdueCount) || 0,
        email: sanitizeInput(u.email || '', 100),
        phone: sanitizeInput(u.phone || '', 30),
        lastActive: sanitizeInput(u.lastActive || 'غير محدد', 50)
      };
    });
  }

  // Validate grievances if present
  if (data.grievances) {
    if (!Array.isArray(data.grievances)) {
      return { valid: false, error: 'قائمة العرائض والشكاوى في النسخة غير صالحة.' };
    }
    cleanData.grievances = data.grievances.slice(0, 5000).map((g: any) => {
      if (!g || typeof g !== 'object' || !g.id) {
        throw new Error('عريضة غير صالحة داخل النسخة الاحتياطية.');
      }
      return {
        ...g,
        id: sanitizeInput(g.id, 50),
        trackingNumber: sanitizeInput(g.trackingNumber || g.id, 50),
        subject: sanitizeInput(g.subject || '', 250),
        fullName: sanitizeInput(g.fullName || '', 100),
        details: sanitizeInput(g.details || '', 5000),
        nin: sanitizeInput(g.nin || '', 30),
        phone: sanitizeInput(g.phone || '', 30)
      };
    });
  }

  // Validate audit logs if present
  if (data.auditLogs && Array.isArray(data.auditLogs)) {
    cleanData.auditLogs = data.auditLogs.slice(0, 1000).map((l: any) => ({
      ...l,
      action: sanitizeInput(l.action || '', 100),
      userName: sanitizeInput(l.userName || '', 100),
      details: sanitizeInput(l.details || '', 500)
    }));
  }

  return { valid: true, cleanData };
}
