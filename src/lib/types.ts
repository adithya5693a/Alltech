/**
 * Shared TypeScript types for AstroCare telemetry & mission state.
 * Prototype on synthetic data, not a medical device.
 */

export type VitalState = 'normal' | 'watch' | 'alert';
export type VitalSource = 'REAL' | 'SIMULATED';

/**
 * Standard vitals reading structure.
 * Matches checklist: metric, value, baseline, state, source, timestamp.
 */
export interface VitalMetric {
  metric: string;
  value: number;
  baseline: number;
  state: VitalState;
  source: VitalSource;
  timestamp: string | number;
}

export type CrewStatus = 'optimal' | 'nominal' | 'elevated' | 'critical';

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  missionRole?: string;
  status: CrewStatus;
  riskScore: number;
  location?: string;
  suitPressureKpa?: number;
  vitals?: Record<string, VitalMetric>;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  crewId?: string;
  severity: AlertSeverity;
  code: string;
  message: string;
  timestamp: string | number;
  acknowledged: boolean;
}

export interface MissionStatus {
  missionId: string;
  missionName: string;
  missionElapsedTime: string;
  orbitPhase: string;
  cabinPressureKpa: number;
  radiationLevel: string;
  activeAlertsCount: number;
  crewCount: number;
  timestamp: string | number;
}

export type WebSocketConnectionStatus = 'connecting' | 'open' | 'closed';

export interface ApiErrorPayload {
  code: string;
  message: string;
  request_id?: string;
}
