import {
  AxiosError,
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { demoControl } from "./control";
import { dataSetFromToken, resolveRoute, type DemoResult } from "./handlers";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  // FormData (document uploads) has nothing the demo needs to read.
  return data && typeof data === "object" && !(data instanceof FormData)
    ? (data as Record<string, unknown>)
    : {};
}

function splitUrl(config: InternalAxiosRequestConfig) {
  let url = config.url ?? "";
  const base = config.baseURL ?? "";
  if (base && url.startsWith(base)) url = url.slice(base.length);
  url = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/api\/v2/, "");

  const [path, search = ""] = url.split("?");
  const query: Record<string, unknown> = { ...config.params };
  new URLSearchParams(search).forEach((value, key) => {
    query[key] = value;
  });
  return { path: path.startsWith("/") ? path : `/${path}`, query };
}

function respond(
  config: InternalAxiosRequestConfig,
  result: DemoResult,
): AxiosResponse {
  const status = result.status ?? 200;
  const response: AxiosResponse = {
    data: result.data,
    status,
    statusText: String(status),
    headers: {},
    config,
    request: {},
  };
  if (status < 400) return response;

  const data = result.data as { message?: unknown };
  throw new AxiosError(
    typeof data?.message === "string" ? data.message : `HTTP ${status}`,
    status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response,
  );
}

/**
 * Axios adapter that answers every request from the bundled demo data, so the
 * vendor app runs end to end without the Stuqet API.
 */
export const demoAdapter: AxiosAdapter = async (config) => {
  await wait(demoControl.latency);

  if (demoControl.offline) {
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
  const set = dataSetFromToken(authorization.replace(/^Bearer\s+/i, ""));
  if (!match.route.public && (!set || demoControl.sessionExpired)) {
    return respond(config, {
      status: 401,
      data: { message: "Unauthenticated." },
    });
  }
  if (set) demoControl.dataSet = set;

  const body = parseBody(config.data);

  // Upload progress, so the photo tiles show a short progress ring.
  if (config.onUploadProgress) {
    const total = 100;
    for (const loaded of [30, 70, 100]) {
      config.onUploadProgress({
        loaded,
        total,
        bytes: loaded,
        lengthComputable: true,
      });
      await wait(120);
    }
  }

  return respond(
    config,
    match.route.handler({ method, path, query, body, set }, match.params),
  );
};

/** Routes every request of these axios instances to the demo data. */
export function installDemoAdapter(instances: AxiosInstance[]) {
  instances.forEach((instance) => {
    instance.defaults.adapter = demoAdapter;
  });
}
