import type { ApiErrorPayload } from './types';

/**
 * Pluggable callback signature for error notifications.
 * A's design system toast component will subscribe to this.
 */
export type ErrorListener = (code: string, message: string) => void;

/**
 * Mapping table from Backend Error Codes to user-facing titles and descriptive guidance.
 */
export const ERROR_CODE_MAP: Record<
  string,
  { title: string; defaultDescription: string }
> = {
  ASTRONAUT_NOT_FOUND: {
    title: 'Astronaut Not Found',
    defaultDescription: 'The specified crew member could not be located in mission archives.',
  },
  TELEMETRY_UNAVAILABLE: {
    title: 'Telemetry Unavailable',
    defaultDescription: 'Biometric telemetry stream is currently offline or blocked by solar blackout.',
  },
  SUIT_PRESSURE_CRITICAL: {
    title: 'Critical Suit Pressure Anomaly',
    defaultDescription: 'EVA suit atmosphere is outside safe operating parameters. Seek airlock immediately.',
  },
  RATE_LIMIT_EXCEEDED: {
    title: 'Uplink Rate Limit Exceeded',
    defaultDescription: 'Ground station telemetry command threshold reached. Please wait before retrying.',
  },
  UNAUTHORIZED: {
    title: 'Security Clearance Required',
    defaultDescription: 'Flight operations credentials are missing or have insufficient clearance.',
  },
  GROUND_STATION_OFFLINE: {
    title: 'Ground Station Offline',
    defaultDescription: 'Downlink transmitter has lost line-of-sight with Deep Space Network tracking antennae.',
  },
  INVALID_COMMAND_SEQUENCE: {
    title: 'Invalid Flight Command',
    defaultDescription: 'Flight computer rejected the command sequence due to validation failure.',
  },
  INTERNAL_SERVER_ERROR: {
    title: 'Mission Server Exception',
    defaultDescription: 'Telemetry hub encountered an unexpected internal error during data processing.',
  },
  NETWORK_ERROR: {
    title: 'Network Communication Error',
    defaultDescription: 'Failed to establish connection with telemetry services.',
  },
  TIMEOUT: {
    title: 'Request Timed Out',
    defaultDescription: 'Telemetry gateway took too long to respond.',
  },
};

const listeners = new Set<ErrorListener>();

/**
 * Register an onError callback.
 * Designed specifically for Person A's toast system to plug in cleanly.
 * Returns an unsubscribe cleanup function.
 *
 * Example:
 * const unsubscribe = onError((code, message) => {
 *   toast.error(`${code}: ${message}`);
 * });
 */
export function onError(callback: ErrorListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Manually notify all registered error listeners of an error.
 */
export function notifyError(code: string, message?: string): void {
  const resolvedMessage = getErrorMessage(code, message);
  listeners.forEach((listener) => {
    try {
      listener(code, resolvedMessage);
    } catch (err) {
      console.error('[errorHandler] Error inside listener callback:', err);
    }
  });
}

/**
 * Type guard to check if an object conforms to backend error shape { code, message, request_id }
 */
export function isApiErrorPayload(data: unknown): data is ApiErrorPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'message' in data &&
    typeof (data as ApiErrorPayload).code === 'string' &&
    typeof (data as ApiErrorPayload).message === 'string'
  );
}

/**
 * Maps a backend error code to a human-friendly user message.
 */
export function getErrorMessage(code: string, serverMessage?: string): string {
  const mapping = ERROR_CODE_MAP[code];
  if (mapping) {
    return serverMessage || mapping.defaultDescription;
  }
  return serverMessage || `An unexpected error occurred (${code}).`;
}

/**
 * Central Error Handler:
 * Parses backend error shapes and dispatches to all registered onError listeners.
 * Does NOT instantiate UI toasts directly; delegates presentation to Person A's toast component.
 */
export function handleApiError(error: unknown): void {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return;
  }

  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred while communicating with mission control.';

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    if ('payload' in errorObj && isApiErrorPayload(errorObj.payload)) {
      code = errorObj.payload.code;
      message = errorObj.payload.message;
    } else if (isApiErrorPayload(errorObj)) {
      code = errorObj.code;
      message = errorObj.message;
    } else {
      if (typeof errorObj.code === 'string') code = errorObj.code;
      if (typeof errorObj.message === 'string') message = errorObj.message;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  notifyError(code, message);
}
