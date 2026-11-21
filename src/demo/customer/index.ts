/**
 * Demo mode for the customer + rider app: the whole customer and delivery-boy
 * API answered from bundled data, plus sample values for every form. Enabled
 * with `EXPO_PUBLIC_DEMO_MODE="true"` in the customer build
 * (`npm run dev:customer:demo`); see README.md in this folder.
 *
 * Load this module only through `require()` behind a literal
 * `process.env.EXPO_PUBLIC_DEMO_MODE === "true"` check (see axios.ts) so
 * release builds do not ship it. Use ~/demo/flag for the boolean alone.
 */
import { demoControl, expireDemoSession, setDemoOffline } from "~/demo/control";
import { resetCustomerDemoData } from "./db";
import { resetRiderDemoData } from "~/demo/rider/db";
import { assignDemoDelivery } from "~/demo/rider/handlers";
import { personaFromToken } from "./router";

export { installCustomerDemoAdapter } from "./adapter";
export { DEMO_ACCOUNTS, DEMO_CODE, DEMO_PASSWORD } from "./data/accounts";
export { customerImage } from "./images";
export { pickDemoPhoto, pickDemoDocument } from "./picker";
export { customerSamples } from "./samples";
export { demoControl, expireDemoSession, setDemoOffline, assignDemoDelivery };

/** Throws every change of both roles away; the next request rebuilds the data. */
export function resetDemoData(): void {
  resetCustomerDemoData();
  resetRiderDemoData();
}

/** Persona of a stored demo session token (used by demo tools). */
export { personaFromToken };
