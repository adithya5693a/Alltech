import type { MissionStatus } from '../lib/types';

/**
 * Mock mission status dataset for Person B screens.
 */
export const mockMissionStatusData: MissionStatus = {
  missionId: 'EXP-72-BIO',
  missionName: 'AstroCare Orbital Health Evaluation',
  missionElapsedTime: 'MET 042:14:38:12',
  orbitPhase: 'Low Earth Orbit (418 km altitude, Inclination 51.6°)',
  cabinPressureKpa: 101.3,
  radiationLevel: '0.42 mSv/day (Nominal)',
  activeAlertsCount: 2,
  crewCount: 6,
  timestamp: '2026-11-14T08:30:00Z',
};
