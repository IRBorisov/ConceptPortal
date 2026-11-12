import { describe, expect, it } from 'vitest';

import { HostedRSToolAgent } from './hosting';

function detached(live: HostedRSToolAgent, ids: string[] = []) {
  const base = live.captureExecutionState(ids);
  const copy = new HostedRSToolAgent();
  copy.seedExecutionState(base);
  return { base, copy };
}

describe('hosted computation staging', () => {
  it('keeps a draft invisible until its authoritative commit', () => {
    const live = new HostedRSToolAgent();
    live.applySchemaPatch({ items: [{ alias: 'X1' }] });
    const { base, copy } = detached(live);
    copy.applySchemaPatch({ items: [{ alias: 'X2' }] });
    expect(live.getSessionState().items).toHaveLength(1);
    live.commitExecutionState(base, copy.completedExecutionState());
    expect(live.getSessionState().items).toHaveLength(2);
  });

  it('rejects a stale result without rolling back a newer live mutation', () => {
    const live = new HostedRSToolAgent();
    live.applySchemaPatch({ items: [{ alias: 'X1' }] });
    const { base, copy } = detached(live);
    copy.applySchemaPatch({ items: [{ alias: 'X2' }] });
    live.applySchemaPatch({ items: [{ alias: 'X3' }] });
    expect(() => live.commitExecutionState(base, copy.completedExecutionState())).toThrow('changed');
    expect(live.getSessionState().items.map(item => item.alias)).toEqual(['X1', 'X3']);
  });

  it('checks every source before committing any mutation', () => {
    const live = new HostedRSToolAgent();
    const first = live.createSession();
    const second = live.createSession();
    const { base, copy } = detached(live, [first.sessionId]);
    copy.applySchemaPatch({ items: [{ alias: 'X1' }] }, second.sessionId);
    live.applySchemaPatch({ items: [{ alias: 'X9' }] }, first.sessionId);
    expect(() => live.commitExecutionState(base, copy.completedExecutionState())).toThrow('changed');
    expect(live.getSessionState().items).toHaveLength(0);
  });

  it('adopts one new session while preserving its result timestamps', () => {
    const live = new HostedRSToolAgent();
    const { base, copy } = detached(live);
    const handle = copy.createSession({ alias: 'NEW' });
    const next = copy.completedExecutionState();
    live.commitExecutionState(base, next);
    expect(live.getCurrentSession()?.sessionId).toBe(handle.sessionId);
    expect(live.getSessionState('full')).toEqual(next.sessions[0].state);
  });

  it('does not bypass authoritative quota hooks when a worker creates a session', () => {
    const live = new HostedRSToolAgent({ sessionLifecycle: {
      beforeCreate: () => { throw new Error('quota'); }, created: () => {}, access: () => {},
    } });
    const { base, copy } = detached(live);
    copy.createSession();
    expect(() => live.commitExecutionState(base, copy.completedExecutionState())).toThrow('quota');
    expect(live.getCurrentSession()).toBeNull();
    expect(() => live.seedExecutionState(base)).toThrow('transient');
  });

  it('rejects multiple changed sessions before applying either one', () => {
    const live = new HostedRSToolAgent();
    const a = live.createSession();
    const b = live.createSession();
    const { base, copy } = detached(live, [a.sessionId]);
    copy.applySchemaPatch({ items: [{ alias: 'X1' }] }, a.sessionId);
    copy.applySchemaPatch({ items: [{ alias: 'X2' }] }, b.sessionId);
    expect(() => live.commitExecutionState(base, copy.completedExecutionState())).toThrow('only one');
    expect(live.getSessionState('full', a.sessionId).items).toHaveLength(0);
    expect(live.getSessionState('full', b.sessionId).items).toHaveLength(0);
  });
  it('does not renew an unrelated current session during explicit-session work', () => {
    const accessed: string[] = [];
    const live = new HostedRSToolAgent({ sessionLifecycle: {
      beforeCreate: () => {}, created: () => {}, access: id => { accessed.push(id); },
    } });
    const target = live.createSession();
    const selected = live.createSession();
    accessed.length = 0;
    const base = live.captureExecutionState([target.sessionId], [], false);
    const copy = new HostedRSToolAgent();
    copy.seedExecutionState(base);
    copy.applySchemaPatch({ items: [{ alias: 'X1' }] }, target.sessionId);
    live.commitExecutionState(base, copy.completedExecutionState());
    expect(accessed).toContain(target.sessionId);
    expect(accessed).not.toContain(selected.sessionId);
  });

});
