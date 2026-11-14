import type { CrewMember } from '../lib/types';

/**
 * Mock crew roster dataset for Person B screens.
 */
export const mockCrewData: CrewMember[] = [
  {
    id: 'AST-042',
    name: 'Dr. Sarah Chen',
    role: 'Mission Commander',
    missionRole: 'Commander & Systems Lead',
    status: 'optimal',
    riskScore: 12,
    location: 'Cupola Observation Module',
    suitPressureKpa: 29.6,
  },
  {
    id: 'AST-089',
    name: 'Marcus Vance',
    role: 'EVA Specialist',
    missionRole: 'Lead Spacewalk Engineer',
    status: 'elevated',
    riskScore: 78,
    location: 'Airlock Exterior / Truss segment P6',
    suitPressureKpa: 28.1,
  },
  {
    id: 'AST-064',
    name: 'Elena Rostova',
    role: 'Flight Surgeon',
    missionRole: 'Chief Medical Officer',
    status: 'nominal',
    riskScore: 24,
    location: 'Medical Bay / Destiny Lab',
    suitPressureKpa: 30.1,
  },
  {
    id: 'AST-103',
    name: 'Kenji Sato',
    role: 'Payload Specialist',
    missionRole: 'Robotics Operator',
    status: 'nominal',
    riskScore: 18,
    location: 'Kibo Module',
    suitPressureKpa: 30.0,
  },
  {
    id: 'AST-117',
    name: 'Amina Diallo',
    role: 'Science Officer',
    missionRole: 'Exobiology Researcher',
    status: 'optimal',
    riskScore: 8,
    location: 'Columbus Laboratory',
    suitPressureKpa: 29.9,
  },
  {
    id: 'AST-129',
    name: 'Liam Henderson',
    role: 'Systems Engineer',
    missionRole: 'Life Support Specialist',
    status: 'critical',
    riskScore: 91,
    location: 'Tranquility Life Support Node',
    suitPressureKpa: 26.8,
  },
];
