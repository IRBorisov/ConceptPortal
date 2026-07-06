import http from "k6/http";
import { check, sleep } from "k6";

import { authedOptions, login } from "../lib/auth.js";
import { config, defaultStages, defaultThresholds } from "../lib/config.js";

export const options = {
  insecureSkipTLSVerify: config.insecureTls,
  stages: defaultStages,
  thresholds: {
    ...defaultThresholds,
    http_req_duration: ["p(95)<5000"],
  },
};

export function setup() {
  return login();
}

export default function rsformDetails(cookies) {
  const res = http.get(
    `${config.baseUrl}/api/rsforms/${config.rsformId}/details`,
    authedOptions(cookies, { tags: { name: "rsform_details" } }),
  );

  check(res, {
    "rsform details ok": (r) => r.status === 200,
  });

  sleep(0.1);
}
