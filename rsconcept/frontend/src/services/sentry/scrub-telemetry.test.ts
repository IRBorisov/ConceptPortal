import { describe, expect, it } from 'vitest';

import {
  FILTERED_TELEMETRY_VALUE,
  isCredentialTelemetryKey,
  redactCredentialFields,
  TELEMETRY_HEADER_DENY
} from './scrub-telemetry';

describe('telemetry credential denylist', () => {
  it('names the CSRF header the frontend sends on unsafe requests', () => {
    expect(TELEMETRY_HEADER_DENY).toEqual(expect.arrayContaining(['csrftoken', 'authorization', 'cookie']));
    expect(isCredentialTelemetryKey('x-csrftoken')).toBe(true);
    expect(isCredentialTelemetryKey('X-CSRFToken')).toBe(true);
    expect(isCredentialTelemetryKey('http.request.header.x-csrftoken')).toBe(true);
    expect(isCredentialTelemetryKey('Authorization')).toBe(true);
    expect(isCredentialTelemetryKey('Set-Cookie')).toBe(true);
    expect(isCredentialTelemetryKey('Accept')).toBe(false);
    expect(isCredentialTelemetryKey('http.request.header.referer')).toBe(false);
  });

  it('redacts CSRF headers, cookies, and nested request header maps', () => {
    const event = {
      request: {
        url: 'https://p.example/api/rsforms',
        headers: {
          'Accept': 'application/json',
          'x-csrftoken': 'csrf-secret',
          'Authorization': 'Bearer session-secret'
        },
        cookies: {
          csrftoken: 'csrf-secret',
          sessionid: 'session-secret'
        }
      },
      breadcrumbs: [
        {
          data: {
            url: '/api/login',
            request_headers: {
              'X-CSRFToken': 'csrf-secret',
              'Accept': 'application/json'
            }
          }
        }
      ],
      contexts: {
        response: {
          status_code: 403,
          headers: {
            'set-cookie': 'sessionid=session-secret'
          }
        }
      }
    };

    redactCredentialFields(event.request);
    redactCredentialFields(event.contexts);
    for (const breadcrumb of event.breadcrumbs) {
      redactCredentialFields(breadcrumb.data);
    }

    expect(event.request.headers).toEqual({
      'Accept': 'application/json',
      'x-csrftoken': FILTERED_TELEMETRY_VALUE,
      'Authorization': FILTERED_TELEMETRY_VALUE
    });
    expect(event.request.cookies).toBe(FILTERED_TELEMETRY_VALUE);
    expect(event.request.url).toBe('https://p.example/api/rsforms');
    expect(event.breadcrumbs[0]?.data.request_headers).toEqual({
      'X-CSRFToken': FILTERED_TELEMETRY_VALUE,
      'Accept': 'application/json'
    });
    expect(event.contexts.response.headers).toEqual({
      'set-cookie': FILTERED_TELEMETRY_VALUE
    });
    expect(event.contexts.response.status_code).toBe(403);
  });

  it('redacts span header attributes, including string arrays', () => {
    const attributes: Record<string, unknown> = {
      'http.request.header.x-csrftoken': ['csrf-secret'],
      'http.request.header.accept': ['application/json'],
      'http.url': 'https://p.example/api/rsforms'
    };

    redactCredentialFields(attributes);

    expect(attributes['http.request.header.x-csrftoken']).toBe(FILTERED_TELEMETRY_VALUE);
    expect(attributes['http.request.header.accept']).toEqual(['application/json']);
    expect(attributes['http.url']).toBe('https://p.example/api/rsforms');
  });
});
