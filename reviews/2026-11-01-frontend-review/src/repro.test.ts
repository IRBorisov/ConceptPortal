import { QueryClient, QueryObserver } from '../../../rsconcept/frontend/node_modules/@tanstack/react-query/build/modern/index.js';
import axios from '../../../rsconcept/frontend/node_modules/axios/index.js';
import { describe, expect, it, vi } from 'vitest';
import { z } from '../../../rsconcept/frontend/node_modules/zod/index.js';

vi.mock('@/backend/api-transport', async () => {
  const actual = await vi.importActual<typeof import('@/backend/api-transport')>('@/backend/api-transport');
  return { ...actual, axiosGet: vi.fn(), axiosPost: vi.fn(), axiosPatch: vi.fn() };
});

import { axiosGet } from '@/backend/api-transport';
import { authApi } from '@/features/auth/backend/api';
import { isPasswordTooSimilar } from '@/features/auth/backend/password-validation';
import { schemaUserSignup } from '@/features/users/backend/types';
import { RSTabID } from '@/app/navigation/navigation-context';
import { tabQuerySchema } from '@/app/navigation/tab-query';

const schemaPageParams = z.strictObject({
  id: z.coerce.number(),
  version: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined),
  tab: tabQuerySchema(RSTabID, RSTabID.CARD),
  activeID: z.coerce
    .number()
    .nullish()
    .transform(v => v ?? undefined)
});

describe('signup password similarity', () => {
  it('keeps a password whose only overlap with a user field is a short fragment', () => {
    const password = 'PortalPass123';
    const parsed = schemaUserSignup.safeParse({
      username: 'ivanov',
      email: 'ivanov@example.com',
      first_name: 'Al',
      last_name: '',
      password,
      password2: password
    });
    expect({
      similar: isPasswordTooSimilar(password, ['ivanov', 'ivanov@example.com', 'Al', '']),
      signupAccepted: parsed.success
    }).toEqual({ similar: false, signupAccepted: true });
  });

  it('does not treat a one-letter email part as similar to every password that contains it', () => {
    expect(isPasswordTooSimilar('PortalPass123', ['a@b.co'])).toBe(false);
  });
});

describe('schema page query parsing', () => {
  it('does not throw on a non-numeric version and keeps a numeric id', () => {
    const urlData = schemaPageParams.parse({
      id: '12',
      version: 'foo',
      tab: 'foo',
      activeID: 'bar'
    });
    expect(urlData.id).toBe(12);
    expect(urlData.tab).toBe(RSTabID.CARD);
    expect(Number.isNaN(urlData.version)).toBe(false);
    expect(Number.isNaN(urlData.activeID)).toBe(false);
  });

  it('does not throw on a non-numeric prompt template id', () => {
    const active = z.preprocess((v: unknown) => (v ? Number(v) : undefined), z.number().nullable().default(null));
    expect(active.parse('foo')).toBeNull();
  });

  it('does not throw on a non-numeric schema id', () => {
    const urlData = schemaPageParams.parse({
      id: 'abc',
      version: null,
      tab: null,
      activeID: null
    });
    expect(Number.isNaN(urlData.id)).toBe(false);
  });
});

describe('auth query after network failure', () => {
  it('does not replace the session with an anonymous user', async () => {
    vi.mocked(axiosGet).mockRejectedValue(new axios.AxiosError('Network Error'));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const options = authApi.getAuthQueryOptions();
    const loggedIn = { id: 7, username: 'ada', is_staff: false, editor: [] as number[] };
    client.setQueryData(options.queryKey, loggedIn);
    await client.fetchQuery({ ...options, staleTime: 0 });
    expect(client.getQueryData<{ id: number | null }>(options.queryKey)?.id).toBe(7);
  });
});

describe('context search result identity', () => {
  it('does not treat a pending or failed search as the unfiltered library or as the previous query', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const seen: Array<{ key: string; ids: number[] | undefined; status: string }> = [];
    const observer = new QueryObserver(client, {
      queryKey: ['context', 'apple'],
      queryFn: async () => ({ ids: [1] }),
      placeholderData: (previous: { ids: number[] } | undefined) => previous
    });
    const unsubscribe = observer.subscribe(result => {
      seen.push({
        key: String(result.queryKey),
        ids: result.data?.ids,
        status: result.status
      });
    });
    await observer.refetch();

    let releaseFailure: (error: Error) => void = () => undefined;
    observer.setOptions({
      queryKey: ['context', 'zebra'],
      queryFn: () =>
        new Promise<{ ids: number[] }>((_resolve, reject) => {
          releaseFailure = reject;
        }),
      placeholderData: (previous: { ids: number[] } | undefined) => previous
    });
    await new Promise(resolve => setTimeout(resolve, 20));
    const pending = observer.getCurrentResult();

    releaseFailure(new axios.AxiosError('Network Error'));
    await new Promise(resolve => setTimeout(resolve, 30));
    const failed = observer.getCurrentResult();
    unsubscribe();
    expect({
      pendingIds: pending.data?.ids ?? null,
      pendingFetch: pending.fetchStatus,
      failedStatus: failed.status,
      failedIds: failed.data?.ids ?? null
    }).toEqual({
      pendingIds: null,
      pendingFetch: 'fetching',
      failedStatus: 'error',
      failedIds: null
    });
  });
});
