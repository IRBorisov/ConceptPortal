import http from "k6/http";
import { check } from "k6";

import { config } from "../lib/config.js";

http.setResponseCallback(http.expectedStatuses(200, 403, 404));

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
    http_req_duration: ["p(95)<10000"],
  },
};

/** Fetch /api/library/active once; VUs reuse the rsform id list. */
export function setup() {
  const res = http.get(`${config.baseUrl}/api/library/active`, {
    tags: { name: "library_active_setup" },
  });

  check(res, {
    "library active ok": (r) => r.status === 200,
  });

  const items = res.json();
  const ids = items
    .filter((item) => item.item_type === "rsform")
    .map((item) => item.id);

  if (ids.length === 0) {
    throw new Error("No rsform ids returned from /api/library/active");
  }

  return { ids, count: ids.length };
}

function randomId(ids) {
  return ids[Math.floor(Math.random() * ids.length)];
}

export default function bombardDetails(data) {
  const id = randomId(data.ids);

  const res = http.get(`${config.baseUrl}/api/rsforms/${id}/details`, {
    tags: { name: "rsform_details" },
  });

  check(res, {
    "rsform details ok": (r) => r.status === 200,
  });
}
