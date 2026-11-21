import type { AxiosAdapter, AxiosInstance } from "axios";
import { demoControl } from "~/demo/control";
import { parseBody, respond, splitUrl } from "~/demo/adapter";
import { personaFromToken, resolveRoute } from "./handlers";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Axios adapter that answers every request of the customer and rider app from
 * the bundled demo data, so both run end to end without the Stuqet API. The
 * switches of "Demo tools" (offline, expired session, latency) are shared with
 * the vendor demo (src/demo/control.ts).
 */
export const customerDemoAdapter: AxiosAdapter = async (config) => {
  await wait(Math.min(demoControl.latency, 350));

  if (demoControl.offline) {
    const { AxiosError } = await import("axios");
    throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, {});
  }

  const method = (config.method ?? "get").toUpperCase();
  const { path, query } = splitUrl(config);
  const match = resolveRoute(method, path);

  if (!match) {
    console.warn(`[demo] No demo endpoint for ${method} ${path}`);
    return respond(config, {
      status: 404,
      data: { result: false, message: `Demo mode has no ${method} ${path}` },
    });
  }

  const authorization = String(config.headers?.get?.("Authorization") ?? "");
  const persona = personaFromToken(authorization.replace(/^Bearer\s+/i, ""));
  if (!match.route.public && (!persona || demoControl.sessionExpired)) {
    return respond(config, {
      status: 401,
      data: { message: "Unauthenticated." },
    });
  }

  return respond(
    config,
    match.route.handler(
      { method, path, query, body: parseBody(config.data), persona },
      match.params,
    ),
  );
};

/** Routes every request of these axios instances to the customer demo data. */
export function installCustomerDemoAdapter(instances: AxiosInstance[]) {
  instances.forEach((instance) => {
    instance.defaults.adapter = customerDemoAdapter;
  });
}
