/**
 * Switches the demo tools (More > Demo tools) flip at runtime. The adapter
 * reads them on every request.
 */
import type { DemoDataSet } from "./types";

export const demoControl = {
  /** Data set of the latest signed-in request (the pickers choose photos by it). */
  dataSet: null as DemoDataSet | null,
  /** Every private request answers 401, so the Session expired screen shows. */
  sessionExpired: false,
  /** Every request fails like a dropped connection. */
  offline: false,
  /** Milliseconds each fake request takes. */
  latency: 450,
};

/** Setters, so UI code never assigns to the shared object directly. */
export function expireDemoSession() {
  demoControl.sessionExpired = true;
}

export function setDemoOffline(offline: boolean) {
  demoControl.offline = offline;
}
