import { HostedRSToolAgent, type ExecutionSnapshot } from '@rsconcept/rstool/hosting';
import { TOOL_DEFINITIONS } from './tools';

interface Job {
  name: string;
  args: Record<string, unknown>;
  snapshot: ExecutionSnapshot;
  maxSessionBytes: number;
  maxResultBytes: number;
}

/** One disposable process, no persistence directory, Portal publisher, or credential is supplied. */
process.once('message', async (job: Job) => {
  try {
    const definition = TOOL_DEFINITIONS.find(item => item.name === job.name);
    if (!definition) throw new Error('Unknown computation');
    const agent = new HostedRSToolAgent();
    agent.seedExecutionState(job.snapshot);
    const result = await definition.invoke(agent, job.args);
    const snapshot = agent.completedExecutionState();
    if (snapshot.sessions.some(envelope => Buffer.byteLength(JSON.stringify(envelope, null, 2), 'utf8') > job.maxSessionBytes)) {
      process.send?.({ ok: false, error: { code: 'SESSION_TOO_LARGE', message: 'Session exceeds the configured serialized byte limit.' } });
      return;
    }
    if (Buffer.byteLength(JSON.stringify(result) ?? '', 'utf8') > job.maxResultBytes) {
      process.send?.({ ok: false, error: { code: 'COMPUTE_RESULT_TOO_LARGE', message: 'Computation result exceeds the configured byte limit.' } });
      return;
    }
    process.send?.({ ok: true, result, snapshot });
  } catch (error) {
    const value = error as { code?: unknown; message?: unknown };
    process.send?.({ ok: false, error: { code: typeof value?.code === 'string' ? value.code : 'TOOL_EXECUTION_FAILED',
      message: typeof value?.message === 'string' ? value.message.slice(0, 1000) : 'Computation failed' } });
  }
});
