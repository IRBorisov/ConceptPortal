import http from "k6/http";
import { check, sleep } from "k6";

import { config } from "../lib/config.js";

/** 404 is common when probing random ids; do not count 4xx as k6 request failures. */
http.setResponseCallback(http.expectedStatuses(200, 403, 404));

export const options = {
  insecureSkipTLSVerify: config.insecureTls,
  stages: [
    { duration: "15s", target: 3 },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
  },
};

function randomSchemaId() {
  const span = config.schemaIdMax - config.schemaIdMin + 1;
  return config.schemaIdMin + Math.floor(Math.random() * span);
}

export default function libraryRandom() {
  const id = randomSchemaId();

  const itemRes = http.get(`${config.baseUrl}/api/library/${id}`, {
    tags: { name: "library_item" },
  });
  check(itemRes, {
    "library item responded": (r) => [200, 403, 404].includes(r.status),
  });

  const activeRes = http.get(`${config.baseUrl}/api/library/active`, {
    tags: { name: "library_active" },
  });
  check(activeRes, {
    "library active ok": (r) => r.status === 200,
  });

  sleep(0.1);
}
