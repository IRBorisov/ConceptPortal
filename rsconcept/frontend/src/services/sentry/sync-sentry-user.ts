import { isSentryEnabled, Sentry } from './init-sentry';

interface SentryUserIdentity {
  id: number | null;
  username: string;
}

/** Attach Portal auth identity to Sentry events, logs, and replays. */
export function syncSentryUser(user: SentryUserIdentity): void {
  if (!isSentryEnabled()) {
    return;
  }

  if (user.id === null) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: String(user.id),
    username: user.username
  });
}
