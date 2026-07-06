import http from "k6/http";
import { check } from "k6";

import { config } from "./config.js";

/**
 * Log in once per VU iteration setup and return cookies for session auth.
 * @param {import('k6/options').Options} [requestOptions]
 */
export function login(requestOptions = {}) {
  const url = `${config.baseUrl}/users/api/login`;
  const body = JSON.stringify({
    username: config.username,
    password: config.password,
  });

  const res = http.post(url, body, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(requestOptions.headers || {}),
    },
    tags: { name: "login" },
  });

  check(res, {
    "login accepted": (r) => r.status === 202,
  });

  return res.cookies;
}

/** Build request options that reuse Django session cookies. */
export function authedOptions(cookies, extra = {}) {
  return {
    cookies,
    ...extra,
    headers: {
      ...(extra.headers || {}),
    },
  };
}
