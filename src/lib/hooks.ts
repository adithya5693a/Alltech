import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { Alert, CrewMember, MissionStatus, VitalMetric } from './types';
import { defaultMockVitals, mockAlertsData, mockCrewData, mockMissionStatusData, mockVitalsData } from '../mocks/b.index';

/**
 * React Query Hook for Crew Vitals Telemetry.
 * Queries backend endpoint; falls back to mock data if backend is offline.
 */
export function useVitals(
  crewId?: string,
  options?: Omit<UseQueryOptions<VitalMetric[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VitalMetric[]>({
    queryKey: ['vitals', crewId ?? 'all'],
    queryFn: async () => {
      try {
        return await apiClient.getVitals(crewId);
      } catch (err) {
        // Fallback to synthetic mock vitals during prototyping
        if (crewId && mockVitalsData[crewId]) {
          return mockVitalsData[crewId];
        }
        return defaultMockVitals;
      }
    },
    ...options,
  });
}

/**
 * React Query Hook for Crew Roster.
 * Queries backend endpoint; falls back to mock crew roster if backend is offline.
 */
export function useCrew(
  options?: Omit<UseQueryOptions<CrewMember[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CrewMember[]>({
    queryKey: ['crew'],
    queryFn: async () => {
      try {
        return await apiClient.getCrew();
      } catch (err) {
        return mockCrewData;
      }
    },
    ...options,
  });
}

/**
 * React Query Hook for Active Alerts.
 * Queries backend endpoint; falls back to mock alerts if backend is offline.
 */
export function useAlerts(
  crewId?: string,
  options?: Omit<UseQueryOptions<Alert[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', crewId ?? 'all'],
    queryFn: async () => {
      try {
        return await apiClient.getAlerts(crewId);
      } catch (err) {
        if (crewId) {
          return mockAlertsData.filter((a) => a.crewId === crewId);
        }
        return mockAlertsData;
      }
    },
    ...options,
  });
}

/**
 * React Query Hook for Mission Status and Orbit Parameters.
 * Queries backend endpoint; falls back to mock mission status if backend is offline.
 */
export function useMissionStatus(
  options?: Omit<UseQueryOptions<MissionStatus>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MissionStatus>({
    queryKey: ['missionStatus'],
    queryFn: async () => {
      try {
        return await apiClient.getMissionStatus();
      } catch (err) {
        return mockMissionStatusData;
      }
    },
    ...options,
  });
}
