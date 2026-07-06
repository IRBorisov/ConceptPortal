import http from "k6/http";
import { check, sleep } from "k6";

import { authedOptions, login } from "../lib/auth.js";
import { config, defaultStages, defaultThresholds } from "../lib/config.js";

export const options = {
  insecureSkipTLSVerify: config.insecureTls,
  stages: defaultStages,
  thresholds: {
    ...defaultThresholds,
    http_req_duration: ["p(95)<4000"],
  },
};

export function setup() {
  return login();
}

export default function mixedRead(cookies) {
  const listRes = http.get(
    `${config.baseUrl}/api/library`,
    authedOptions(cookies, { tags: { name: "library_list" } }),
  );
  check(listRes, { "library list ok": (r) => r.status === 200 });

  const detailsRes = http.get(
    `${config.baseUrl}/api/rsforms/${config.rsformId}/details`,
    authedOptions(cookies, { tags: { name: "rsform_details" } }),
  );
  check(detailsRes, { "rsform details ok": (r) => r.status === 200 });

  const authRes = http.get(
    `${config.baseUrl}/users/api/auth`,
    authedOptions(cookies, { tags: { name: "auth" } }),
  );
  check(authRes, { "auth ok": (r) => r.status === 200 });

  sleep(0.2);
}
