import axios, { type AxiosInstance } from "axios";
import { config } from "./config.js";

/**
 * Creates an axios instance pre-configured for the myfoglio API.
 *
 * @param baseUrlOverride  Optional URL that overrides the env-var default.
 *                         Used in HTTP transport mode to honour the
 *                         X-Myfoglio-Base-Url request header.
 */
export function createClient(baseUrlOverride?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrlOverride ?? config.MYFOGLIO_BASE_URL,
    headers: {
      Accept: `application/vnd.myfoglio.v${config.API_VERSION}+json`,
      "Content-Type": "application/json",
    },
  });

  // Inject the bearer token and API version on every request
  instance.interceptors.request.use((req) => {
    req.headers.Authorization = `Bearer ${config.MYFOGLIO_TOKEN}`;
    req.headers.Accept = `application/vnd.myfoglio.v${config.API_VERSION}+json`;
    return req;
  });

  // Normalise errors into a readable message for MCP tool responses
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status: number | undefined = err.response?.status;
      const detail: string =
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message ??
        "Unknown error";
      return Promise.reject(new Error(`API error ${status ?? ""}: ${detail}`));
    }
  );

  return instance;
}

/** Default client using the base URL from environment variables. */
export const apiClient = createClient();
