import axios from "axios";
import { config } from "./config.js";

export type OAuthGrantType = "client_credentials" | "refresh_token";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number;
}

const tokenState: TokenState = {
  accessToken: null,
  refreshToken: process.env.MYFOGLIO_REFRESH_TOKEN ?? null,
  expiresAt: 0,
};

export function getDefaultAcceptHeader(): string {
  return `application/vnd.myfoglio.v${config.API_VERSION}+json`;
}

export function clearCachedToken(): void {
  tokenState.accessToken = null;
  tokenState.refreshToken = process.env.MYFOGLIO_REFRESH_TOKEN ?? null;
  tokenState.expiresAt = 0;
}

function getBasicAuthHeader(): string {
  if (!config.MYFOGLIO_API_KEY || !config.MYFOGLIO_API_SECRET) {
    throw new Error(
      "MYFOGLIO_API_KEY and MYFOGLIO_API_SECRET are required to obtain a MyFoglio access token."
    );
  }

  return `Basic ${Buffer.from(
    `${config.MYFOGLIO_API_KEY}:${config.MYFOGLIO_API_SECRET}`
  ).toString("base64")}`;
}

function buildFormBody(grantType: OAuthGrantType): URLSearchParams {
  const params = new URLSearchParams();
  params.set("grant_type", grantType);

  if (grantType === "refresh_token") {
    const refreshToken = tokenState.refreshToken ?? process.env.MYFOGLIO_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error("A refresh token is required to use the refresh grant.");
    }

    params.set("refresh_token", refreshToken);
  }

  return params;
}

async function requestToken(grantType: OAuthGrantType): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    new URL("/Authorization", config.MYFOGLIO_BASE_URL).toString(),
    buildFormBody(grantType).toString(),
    {
      headers: {
        Authorization: getBasicAuthHeader(),
        Accept: getDefaultAcceptHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const payload = response.data;
  if (!payload.access_token) {
    throw new Error("MyFoglio OAuth token response did not include an access_token.");
  }

  tokenState.accessToken = payload.access_token;
  tokenState.refreshToken = payload.refresh_token ?? tokenState.refreshToken ?? process.env.MYFOGLIO_REFRESH_TOKEN ?? null;
  tokenState.expiresAt =
    Date.now() + (payload.expires_in ? payload.expires_in * 1000 : 60 * 60 * 1000) - 30000;

  return payload;
}

export async function ensureAccessToken(): Promise<string> {
  const isFresh = Boolean(tokenState.accessToken) && Date.now() < tokenState.expiresAt;
  if (isFresh && tokenState.accessToken) {
    return tokenState.accessToken;
  }

  const refreshToken = tokenState.refreshToken ?? process.env.MYFOGLIO_REFRESH_TOKEN;
  if (refreshToken) {
    const refreshed = await requestToken("refresh_token");
    return refreshed.access_token;
  }

  const token = await requestToken("client_credentials");
  return token.access_token;
}
