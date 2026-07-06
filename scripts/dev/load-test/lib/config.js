/** Shared load-test settings (override via k6 `-e` / RunLoadTest.ps1). */

/** @typedef {'prod-local' | 'dev' | 'production'} StackId */

/** @type {Record<StackId, { baseUrl: string; insecureTls: boolean }>} */
const STACKS = {
  "prod-local": {
    baseUrl: "https://localhost:8001",
    insecureTls: true,
  },
  dev: {
    baseUrl: "http://localhost:8002",
    insecureTls: false,
  },
  production: {
    baseUrl: "https://api.portal.acconcept.ru",
    insecureTls: false,
  },
};

const stackId = /** @type {StackId} */ (
  __ENV.PORTAL_LOAD_STACK || "prod-local"
);
const stack = STACKS[stackId] || STACKS["prod-local"];

export const config = {
  stack: stackId,
  baseUrl: __ENV.PORTAL_LOAD_BASE_URL || stack.baseUrl,
  insecureTls:
    (__ENV.PORTAL_LOAD_INSECURE_TLS || String(stack.insecureTls)) === "true",
  username: __ENV.PORTAL_LOAD_USERNAME || "admin",
  password: __ENV.PORTAL_LOAD_PASSWORD || "1234",
  /** RSForm library item id from fixtures/InitialData.json */
  rsformId: Number(__ENV.PORTAL_LOAD_RSFORM_ID || 34),
  /** Inclusive range for random library/schema id picks (production load tests). */
  schemaIdMin: Number(__ENV.PORTAL_LOAD_SCHEMA_ID_MIN || 1),
  schemaIdMax: Number(__ENV.PORTAL_LOAD_SCHEMA_ID_MAX || 800),
};

/** Default ramp profile: warm up, hold, ramp down. */
export const defaultStages = [
  { duration: "15s", target: 5 },
  { duration: "30s", target: 20 },
  { duration: "30s", target: 50 },
  { duration: "15s", target: 0 },
];

export const defaultThresholds = {
  http_req_failed: ["rate<0.01"],
  http_req_duration: ["p(95)<2000"],
};
