// ==============================================================================
// Sentry Centralized API & Authentication Client
// Structured for easy migration to HttpOnly SameSite cookies
// ==============================================================================

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '')
  : (isLocalhost && window.location.port !== '8000' ? '' : 'http://127.0.0.1:8000');

const TOKEN_STORAGE_KEY = 'aegisnet_token';
const USER_STORAGE_KEY = 'aegisnet_user';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'auditor' | 'admin';
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface AuditFinding {
  rule_id: string;
  issue: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  remediation: string;
  frameworks?: string[];
  cve?: string;
  cvss?: number;
  threat_intel?: {
    cve?: string;
    cvss?: number;
    title?: string;
    summary?: string;
    attack_technique?: string;
    source?: string;
  };
}

export interface AuditRisk {
  security_score: number;
  risk_level: string;
  compliance_status?: string;
  critical_findings?: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  total_findings?: number;
  checks_evaluated?: number;
  checks_passed?: number;
  checks_failed?: number;
}

export interface AuditResultData {
  audit_id: string;
  filename?: string;
  vendor: string;
  hostname?: string;
  compliance_status?: string;
  audit_status?: string;
  findings: AuditFinding[];
  risk: AuditRisk;
  ai_explanation?: {
    status: string;
    summary: string;
    recommendations: string[];
  };
}

// ------------------------------------------------------------------------------
// Token & Session Storage (Zero secrets/passwords stored)
// ------------------------------------------------------------------------------

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getStoredUser = (): UserProfile | null => {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: UserProfile): void => {
  // Store only non-sensitive public profile info
  const sanitized: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitized));
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// ------------------------------------------------------------------------------
// Common Fetch Wrapper with Auth Headers
// ------------------------------------------------------------------------------

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // If token expired or invalid, purge local credentials
      clearAuth();
    }

    return response;
  } catch (err: any) {
    if (!isLocalhost) {
      throw new Error(
        'Unable to reach backend service. If using Render free tier, the instance may be spinning up (~45s). Please retry in a few seconds.'
      );
    }
    throw err;
  }
}

// ------------------------------------------------------------------------------
// Auth Methods
// ------------------------------------------------------------------------------

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });
  } catch (err: any) {
    if (isLocalhost && API_BASE !== 'http://127.0.0.1:8000') {
      try {
        response = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });
      } catch {
        throw new Error('Local backend server is not running on port 8000.');
      }
    } else {
      throw new Error(
        'Unable to connect to the backend server. If hosted on Render free tier, the instance may be waking from sleep (~45s). Please wait a moment and try again.'
      );
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(errorData.detail || 'Invalid email or password.');
  }

  const data: AuthResponse = await response.json();
  setToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  // NOTE: Role is NOT sent by client. Backend permanently assigns "auditor".
  const cleanEmail = email.trim();
  const cleanName = name.trim();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, password })
    });
  } catch (err: any) {
    if (isLocalhost && API_BASE !== 'http://127.0.0.1:8000') {
      try {
        response = await fetch('http://127.0.0.1:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, email: cleanEmail, password })
        });
      } catch {
        throw new Error('Local backend server is not running on port 8000.');
      }
    } else {
      throw new Error(
        'Unable to connect to the backend server. If hosted on Render free tier, the instance may be waking from sleep (~45s). Please wait a moment and try again.'
      );
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Unable to register account.');
  }

  const data: AuthResponse = await response.json();
  setToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const response = await apiFetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Unauthorized');
  }
  const data = await response.json();
  const profile: UserProfile = {
    id: Number(data.uid),
    name: data.name,
    email: data.email,
    role: data.role,
    created_at: data.created_at
  };
  setStoredUser(profile);
  return profile;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Graceful offline logout
  } finally {
    clearAuth();
  }
}

// ------------------------------------------------------------------------------
// Audit & File Upload Methods
// ------------------------------------------------------------------------------

export async function uploadAndAuditConfig(file: File): Promise<AuditResultData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch('/api/audits/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload audit failed' }));
    throw new Error(error.detail || 'Failed to process configuration file.');
  }

  return response.json();
}

export async function auditRawConfig(configuration: string, vendor: string, device?: string): Promise<AuditResultData> {
  const response = await apiFetch('/api/audits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      configuration,
      vendor,
      device: device || 'Network Device'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Audit failed' }));
    throw new Error(error.detail || 'Failed to audit configuration.');
  }

  return response.json();
}

export async function getAuditHistory(all: boolean = false): Promise<any[]> {
  const response = await apiFetch(`/api/audits${all ? '?all=true' : ''}`);
  if (!response.ok) {
    throw new Error('Failed to retrieve audit history.');
  }
  const data = await response.json();
  return data.audits || [];
}

export async function getAuditRecord(auditId: string): Promise<any> {
  const response = await apiFetch(`/api/audits/${encodeURIComponent(auditId)}`);
  if (!response.ok) {
    throw new Error('Audit record not found.');
  }
  return response.json();
}

export async function downloadAuditPdf(auditId: string): Promise<void> {
  const response = await apiFetch(`/api/reports/${encodeURIComponent(auditId)}`);
  if (!response.ok) {
    throw new Error('Failed to generate PDF report.');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${auditId}_Report.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function submitAuditFeedback(auditId: string, rating: 'helpful' | 'unhelpful', feedbackText?: string, ruleId?: string): Promise<any> {
  const response = await apiFetch(`/api/audits/${encodeURIComponent(auditId)}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, feedback_text: feedbackText, rule_id: ruleId })
  });
  if (!response.ok) {
    throw new Error('Failed to record feedback.');
  }
  return response.json();
}

export async function getIntegrationsStatus(): Promise<any> {
  const response = await apiFetch('/api/integrations/status');
  if (!response.ok) {
    throw new Error('Failed to retrieve integrations status.');
  }
  return response.json();
}

export async function getScannerStatus(): Promise<any> {
  const response = await apiFetch('/api/scanner/status');
  if (!response.ok) {
    throw new Error('Failed to retrieve scanner status.');
  }
  return response.json();
}

