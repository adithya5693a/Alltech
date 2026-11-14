# AstroCare Frontend API & State Layer (`src/lib`)

Part of the **AstroCare** spaceflight medical telemetry prototype for NASA Space Apps weekend.  
*Prototype on synthetic data, not a medical device.*

---

## Table of Contents

1. [Architecture & Ownership](#architecture--ownership)
2. [Setup & Provider](#setup--provider)
3. [Exported React Query Hooks](#exported-react-query-hooks)
   - [`useVitals`](#usevitals)
   - [`useCrew`](#usecrew)
   - [`useAlerts`](#usealerts)
   - [`useMissionStatus`](#usemissionstatus)
4. [Real-time WebSocket Hook](#real-time-websocket-hook)
   - [`useWebSocket`](#usewebsocket)
5. [Typed API Client & Environment](#typed-api-client--environment)
6. [Error Handling & Toast Integration Guide (For Person A)](#error-handling--toast-integration-guide-for-person-a)
7. [Shared Types](#shared-types)
8. [Mock Data (`src/mocks/b.*`)](#mock-data-srcmocksb)

---

## 1. Architecture & Ownership

- **Owner**: Person B (`src/lib/`, `src/mocks/b.*`, `routes/b.routes.tsx`, `nav/navB.ts`).
- **Integration**: Toasts and design system components belong to Person A. `src/lib/` does not render UI toasts directly; instead, it exposes a clean `onError(code, message)` event bus so Person A can attach their custom Toast UI.

---

## 2. Setup & Provider

Wrap your application (or sub-route) with `QueryProvider`:

```tsx
import { QueryProvider } from './src/lib';

export function App() {
  return (
    <QueryProvider>
      <YourFeatureScreens />
    </QueryProvider>
  );
}
```

---

## 3. Exported React Query Hooks

### `useVitals`
Fetches biometric vitals telemetry for a specific astronaut or the entire crew. Automatically falls back to synthetic mock data if the backend is unreachable.

```tsx
import { useVitals } from './src/lib';

export function AstronautVitals({ crewId }: { crewId: string }) {
  const { data: vitals, isLoading, error } = useVitals(crewId);

  if (isLoading) return <div>Acquiring biometrics...</div>;

  return (
    <div>
      {vitals?.map((v) => (
        <div key={v.metric}>
          <span>{v.metric}: </span>
          <strong>{v.value}</strong> (Baseline: {v.baseline}) - [{v.state}]
        </div>
      ))}
    </div>
  );
}
```

### `useCrew`
Retrieves the active mission crew roster with status, mission roles, and risk scores.

```tsx
import { useCrew } from './src/lib';

export function CrewList() {
  const { data: crew, isLoading } = useCrew();

  if (isLoading) return <div>Loading crew roster...</div>;

  return (
    <ul>
      {crew?.map((astronaut) => (
        <li key={astronaut.id}>
          {astronaut.name} ({astronaut.role}) — Risk Score: {astronaut.riskScore}
        </li>
      ))}
    </ul>
  );
}
```

### `useAlerts`
Retrieves active telemetry alerts, filtered optionally by `crewId`.

```tsx
import { useAlerts } from './src/lib';

export function MissionAlertsFeed({ crewId }: { crewId?: string }) {
  const { data: alerts } = useAlerts(crewId);

  return (
    <div>
      {alerts?.map((alert) => (
        <div key={alert.id} className={`alert-${alert.severity}`}>
          <strong>[{alert.code}]</strong>: {alert.message}
        </div>
      ))}
    </div>
  );
}
```

### `useMissionStatus`
Retrieves mission metadata, orbit phase, cabin pressure, and DSN downlink status.

```tsx
import { useMissionStatus } from './src/lib';

export function MissionHUD() {
  const { data: status } = useMissionStatus();

  return (
    <div>
      <h3>{status?.missionName}</h3>
      <p>Phase: {status?.orbitPhase}</p>
      <p>Cabin Pressure: {status?.cabinPressureKpa} kPa</p>
    </div>
  );
}
```

---

## 4. Real-time WebSocket Hook

### `useWebSocket`
Manages real-time biometrics or telemetry push streams with automatic reconnect, exponential backoff, and explicit connection state.

```tsx
import { useWebSocket } from './src/lib';

export function LiveTelemetryStream() {
  const { status, lastMessage, send, reconnect, disconnect } = useWebSocket(
    'wss://telemetry.astrocare.local/live',
    {
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffFactor: 1.5,
      onMessage: (data) => console.log('Live packet:', data),
    }
  );

  return (
    <div>
      <div>Connection: <strong>{status}</strong></div>
      <button onClick={reconnect}>Force Reconnect</button>
      <button onClick={disconnect}>Disconnect</button>
      <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
    </div>
  );
}
```

**Connection States**:
- `'connecting'`: Opening TCP / TLS handshake or retrying via exponential backoff.
- `'open'`: Active stream.
- `'closed'`: Socket terminated or disconnected.

---

## 5. Typed API Client & Environment

The API client reads the backend URL from the environment variable `VITE_API_BASE_URL` (falling back to `/api`):

```bash
# In your .env or .env.local:
VITE_API_BASE_URL=https://api.astrocare.example.com
```

### Auth Token Configuration
```ts
import { setAuthToken } from './src/lib';

// Sets Authorization: Bearer <token> on all subsequent requests
setAuthToken('flight-surgeon-session-jwt');
```

---

## 6. Error Handling & Toast Integration Guide (For Person A)

`src/lib` maintains a code-to-message dictionary and dispatches errors to `onError`.  
**Person A does not need to edit `src/lib/` to plug in their Toast system.**

In `AppShell.tsx` or Person A's layout/design-system root:

```tsx
import { useEffect } from 'react';
import { onError } from './src/lib';
import { ToastComponent } from './src/design-system/Toast'; // Person A's component

export function AppShell() {
  useEffect(() => {
    // Person A plugs into the onError event bus:
    const unsubscribe = onError((code, message) => {
      ToastComponent.show({
        title: code,
        body: message,
        variant: 'destructive',
      });
    });

    return () => unsubscribe();
  }, []);

  return <main>{/* Shell content */}</main>;
}
```

---

## 7. Shared Types

`src/lib/types.ts` defines all vital biometrics:

```ts
export interface VitalMetric {
  metric: string;
  value: number;
  baseline: number;
  state: 'normal' | 'watch' | 'alert';
  source: 'REAL' | 'SIMULATED';
  timestamp: string | number;
}
```

---

## 8. Mock Data (`src/mocks/b.*`)

Pre-populated realistic astronaut telemetry datasets for zero-backend UI development:
- `b.vitals.ts`: Heart rate, O2 saturation, suit pressure, core temperature, and respiration rate for crew members `AST-042`, `AST-089`, etc.
- `b.crew.ts`: 6 active astronauts with medical risk scores.
- `b.alerts.ts`: High/critical telemetry warnings (e.g. `SUIT_PRESSURE_CRITICAL`).
- `b.missionStatus.ts`: Orbital flight parameters.
