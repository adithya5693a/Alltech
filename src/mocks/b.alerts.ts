import type { Alert } from '../lib/types';

/**
 * Mock alerts dataset for Person B screens.
 */
export const mockAlertsData: Alert[] = [
  {
    id: 'ALT-1001',
    crewId: 'AST-129',
    severity: 'critical',
    code: 'SUIT_PRESSURE_CRITICAL',
    message: 'Primary oxygen loop regulator pressure below 27.0 kPa on suit EVA-02.',
    timestamp: '2026-11-14T08:28:44Z',
    acknowledged: false,
  },
  {
    id: 'ALT-1002',
    crewId: 'AST-089',
    severity: 'high',
    code: 'TACHYCARDIA_DETECTED',
    message: 'Sustained heart rate above 110 bpm during manual tether lock sequence.',
    timestamp: '2026-11-14T08:25:10Z',
    acknowledged: false,
  },
  {
    id: 'ALT-1003',
    crewId: 'AST-042',
    severity: 'medium',
    code: 'SLEEP_DEPRIVATION_RISK',
    message: 'Cumulative 24-hour sleep deficit recorded at 4.2 hours.',
    timestamp: '2026-11-14T07:15:00Z',
    acknowledged: true,
  },
  {
    id: 'ALT-1004',
    severity: 'low',
    code: 'GROUND_STATION_HANDOVER',
    message: 'Station tracking transfer from Madrid DSN-63 to Goldstone DSN-14 scheduled in 12m.',
    timestamp: '2026-11-14T08:18:00Z',
    acknowledged: true,
  },
];
