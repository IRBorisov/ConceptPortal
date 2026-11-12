import { describe, expect, it } from 'vitest';
import { sessionPolicyConfiguration } from './session-policy-config';

describe('operator computation limits', () => {
  it('loads limits independently without overriding unspecified defaults', () => {
    expect(sessionPolicyConfiguration({ RSTOOL_MAX_SESSION_BYTES: '1024', RSTOOL_MAX_COMPUTE_WORKERS: '3',
      RSTOOL_COMPUTE_TIMEOUT_MS: '2000', RSTOOL_COMPUTE_HEAP_MB: '64', RSTOOL_MAX_COMPUTE_RESULT_BYTES: '4096' }))
      .toMatchObject({ maxSessionBytes: 1024, maxComputeWorkers: 3, computeTimeoutMs: 2000, computeHeapMb: 64, maxComputeResultBytes: 4096 });
    expect(sessionPolicyConfiguration({}).maxSessionBytes).toBeUndefined();
  });
  it('rejects invalid limits before opening a listener', () => {
    for (const key of ['RSTOOL_MAX_SESSION_BYTES', 'RSTOOL_MAX_COMPUTE_WORKERS', 'RSTOOL_COMPUTE_TIMEOUT_MS',
      'RSTOOL_COMPUTE_HEAP_MB', 'RSTOOL_MAX_COMPUTE_RESULT_BYTES']) {
      for (const value of ['0', '-1', 'NaN', '1.5', '9007199254740992']) {
        expect(() => sessionPolicyConfiguration({ [key]: value })).toThrow();
      }
    }
    expect(() => sessionPolicyConfiguration({ RSTOOL_COMPUTE_TIMEOUT_MS: '2147483648' })).toThrow();
  });
});
