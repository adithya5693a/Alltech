import type { VitalMetric } from '../lib/types';

/**
 * Mock vitals dataset for Person B screens and offline prototyping.
 * Adheres to VitalMetric: metric, value, baseline, state, source, timestamp.
 */
export const mockVitalsData: Record<string, VitalMetric[]> = {
  'AST-042': [
    {
      metric: 'heartRate',
      value: 78,
      baseline: 72,
      state: 'normal',
      source: 'REAL',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'oxygenSaturation',
      value: 98,
      baseline: 99,
      state: 'normal',
      source: 'REAL',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'suitPressure',
      value: 29.6,
      baseline: 30.0,
      state: 'watch',
      source: 'SIMULATED',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'coreTemperature',
      value: 37.1,
      baseline: 36.8,
      state: 'normal',
      source: 'REAL',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'respirationRate',
      value: 15,
      baseline: 14,
      state: 'normal',
      source: 'REAL',
      timestamp: '2026-11-14T08:30:00Z',
    },
  ],
  'AST-089': [
    {
      metric: 'heartRate',
      value: 112,
      baseline: 70,
      state: 'alert',
      source: 'SIMULATED',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'oxygenSaturation',
      value: 94,
      baseline: 98,
      state: 'watch',
      source: 'REAL',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'suitPressure',
      value: 28.1,
      baseline: 30.0,
      state: 'alert',
      source: 'REAL',
      timestamp: '2026-11-14T08:30:00Z',
    },
    {
      metric: 'coreTemperature',
      value: 38.2,
      baseline: 37.0,
      state: 'alert',
      source: 'SIMULATED',
      timestamp: '2026-11-14T08:30:00Z',
    },
  ],
};

export const defaultMockVitals: VitalMetric[] = [
  {
    metric: 'heartRate',
    value: 74,
    baseline: 72,
    state: 'normal',
    source: 'REAL',
    timestamp: '2026-11-14T08:30:00Z',
  },
  {
    metric: 'oxygenSaturation',
    value: 99,
    baseline: 98,
    state: 'normal',
    source: 'REAL',
    timestamp: '2026-11-14T08:30:00Z',
  },
  {
    metric: 'suitPressure',
    value: 29.8,
    baseline: 30.0,
    state: 'normal',
    source: 'REAL',
    timestamp: '2026-11-14T08:30:00Z',
  },
  {
    metric: 'coreTemperature',
    value: 36.9,
    baseline: 36.8,
    state: 'normal',
    source: 'SIMULATED',
    timestamp: '2026-11-14T08:30:00Z',
  },
];
