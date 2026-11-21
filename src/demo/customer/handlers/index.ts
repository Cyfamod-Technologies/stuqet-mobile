// Importing these registers their routes with the router.
import "./account";
import "./food";
import "./orders";
import "~/demo/rider/handlers";

export { personaFromToken, resolveRoute, tokenFor } from "../router";
export type { DemoRequest, DemoResult } from "../router";
