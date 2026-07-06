import http from "k6/http";
import { check } from "k6";

import { config } from "../lib/config.js";

export const options = {
  insecureSkipTLSVerify: config.insecureTls,
  stages: [
    { duration: "15s", target: 5 },
    { duration: "30s", target: 20 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 80 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function bombardAuth() {
  const res = http.get(`${config.baseUrl}/users/api/auth`, {
    tags: { name: "auth" },
  });

  check(res, {
    "auth ok": (r) => r.status === 200,
    "csrf token present": (r) => Boolean(r.json("csrfToken")),
  });
}
