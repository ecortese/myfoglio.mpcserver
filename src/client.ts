import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { clearCachedToken, ensureAccessToken, getDefaultAcceptHeader } from "./auth.js";
import { config } from "./config.js";

/**
 * Creates an axios instance pre-configured for the MyFoglio API.
 *
 * @param baseUrlOverride Optional URL override for the base URL.
 */
export function createClient(baseUrlOverride?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrlOverride ?? config.MYFOGLIO_BASE_URL,
    headers: {
      Accept: getDefaultAcceptHeader(),
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(async (req) => {
    const token = await ensureAccessToken();
    req.headers.set("Authorization", `Bearer ${token}`);
    req.headers.set("Accept", getDefaultAcceptHeader());
    return req;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status: number | undefined = err.response?.status;
      const detail: string =
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message ??
        "Unknown error";

      const requestConfig = err.config as (InternalAxiosRequestConfig & { __retry?: boolean }) | undefined;
      if (status === 401 && requestConfig && !requestConfig.__retry) {
        requestConfig.__retry = true;

        try {
          clearCachedToken();
          const refreshedToken = await ensureAccessToken();
          const nextHeaders = AxiosHeaders.from({
            ...(requestConfig.headers ?? {}),
            Authorization: `Bearer ${refreshedToken}`,
            Accept: getDefaultAcceptHeader(),
          });
          requestConfig.headers = nextHeaders;
          return instance.request(requestConfig);
        } catch {
          // Fall through to the normalized error below.
        }
      }

      return Promise.reject(new Error(`API error ${status ?? ""}: ${detail}`));
    }
  );

  return instance;
}

/** Default client using the base URL from environment variables. */
export const apiClient = createClient();
