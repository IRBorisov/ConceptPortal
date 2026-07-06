import http from "k6/http";
import { check, sleep } from "k6";

import { authedOptions, login } from "../lib/auth.js";
import { config, defaultStages, defaultThresholds } from "../lib/config.js";

export const options = {
  insecureSkipTLSVerify: config.insecureTls,
  stages: defaultStages,
  thresholds: defaultThresholds,
};

export function setup() {
  return login();
}

export default function libraryList(cookies) {
  const res = http.get(
    `${config.baseUrl}/api/library`,
    authedOptions(cookies, { tags: { name: "library_list" } }),
  );

  check(res, {
    "library list ok": (r) => r.status === 200,
  });

  sleep(0.1);
}
