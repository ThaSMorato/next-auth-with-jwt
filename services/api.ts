import axios, { AxiosError } from "axios";

import { parseCookies, setCookie, destroyCookie } from "nookies";
import { signOut } from "../contexts/AuthContexts";
import { AuthTokenError } from "../errors/AuthTokenError";

let isRefreshing = false;
let failedRequestQueue = [];

interface ApiError {
  code: string;
}

interface ApiTokenResponse {
  token: string;
  refreshToken: string;
}

export const setupAPIClient = (ctx = undefined) => {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["NextAuth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);

          const { "NextAuth.refreshToken": refreshTokenOld } = cookies;

          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;
            api
              .post<ApiTokenResponse>("/refresh", {
                refreshToken: refreshTokenOld,
              })
              .then((response) => {
                const { token, refreshToken } = response.data;

                setCookie(ctx, "NextAuth.token", token, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                });

                setCookie(ctx, "NextAuth.refreshToken", refreshToken, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                });

                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) => request.onSuccess(token));
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              onFailure: (error: AxiosError) => {
                reject(error);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};
