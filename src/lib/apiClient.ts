import { handleApiError, isApiErrorPayload } from './errorHandler';
import type { Alert, ApiErrorPayload, CrewMember, MissionStatus, VitalMetric } from './types';

/**
 * Custom API Error carrying structured backend response metadata.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;
  readonly payload?: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || `API error (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.requestId = payload.request_id;
    this.payload = payload;
  }
}

let storedAuthToken: string | null = null;

/**
 * Set the authentication token used in the Authorization header.
 */
export function setAuthToken(token: string | null): void {
  storedAuthToken = token;
}

/**
 * Get the currently configured authentication token.
 */
export function getAuthToken(): string | null {
  return storedAuthToken;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Resolves the base URL from Vite environment variables (VITE_API_BASE_URL).
 */
export function getBaseUrl(): string {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_API_BASE_URL;
  return envUrl ? envUrl.replace(/\/+$/, '') : '/api';
}

/**
 * Core typed fetch wrapper.
 * Handles base URL, auth token header, JSON serialization, and error normalization.
 */
export async function request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  let fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAuthToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    const networkPayload: ApiErrorPayload = {
      code: 'NETWORK_ERROR',
      message: err instanceof Error ? err.message : 'Uplink communication failure.',
      request_id: `req-net-${Date.now().toString(36)}`,
    };
    handleApiError(networkPayload);
    throw new ApiError(0, networkPayload);
  }

  if (!response.ok) {
    let payload: ApiErrorPayload;
    try {
      const data = await response.json();
      if (isApiErrorPayload(data)) {
        payload = data;
      } else {
        payload = {
          code: `HTTP_${response.status}`,
          message: data?.message || response.statusText || 'Server error',
          request_id: data?.request_id,
        };
      }
    } catch {
      payload = {
        code: `HTTP_${response.status}`,
        message: response.statusText || `Request failed with HTTP status ${response.status}`,
      };
    }

    handleApiError(payload);
    throw new ApiError(response.status, payload);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

/**
 * Typed AstroCare API operations.
 */
export const apiClient = {
  request,
  setAuthToken,
  getAuthToken,
  getBaseUrl,

  /**
   * Fetch vitals readings for a crew member or mission.
   */
  async getVitals(crewId?: string): Promise<VitalMetric[]> {
    const url = crewId ? `/crew/${encodeURIComponent(crewId)}/vitals` : '/vitals';
    return request<VitalMetric[]>(url);
  },

  /**
   * Fetch all crew members.
   */
  async getCrew(): Promise<CrewMember[]> {
    return request<CrewMember[]>('/crew');
  },

  /**
   * Fetch active alerts.
   */
  async getAlerts(crewId?: string): Promise<Alert[]> {
    const url = crewId ? `/crew/${encodeURIComponent(crewId)}/alerts` : '/alerts';
    return request<Alert[]>(url);
  },

  /**
   * Fetch current mission status and overview.
   */
  async getMissionStatus(): Promise<MissionStatus> {
    return request<MissionStatus>('/mission/status');
  },
};
