/**
 * Demo mode for the vendor app: the whole seller API answered from bundled
 * data, plus sample values for every form. Enabled with
 * `EXPO_PUBLIC_DEMO_MODE="true"`; see README.md in this folder.
 *
 * Load this module only through `require()` behind a literal
 * `process.env.EXPO_PUBLIC_DEMO_MODE === "true"` check (see axios.ts) so
 * release builds do not ship it. Use ./flag for the boolean alone.
 */
export { installDemoAdapter } from "./adapter";
export { demoControl, expireDemoSession, setDemoOffline } from "./control";
export { resetDemoData } from "./db";
export { DEMO_ACCOUNTS, DEMO_PASSWORD, DEMO_RESET_CODE } from "./data/accounts";
export { pickDemoDocument, pickDemoPhotos } from "./picker";
