import { CstType, RSToolWrapperClient, type AddOrUpdateConstituentaInput, type AnalyzeExpressionInput } from '../src';

interface CreateSessionResult {
  sessionId: string;
  contractVersion: string;
}

async function runExample() {
  const client = new RSToolWrapperClient();
  try {
    await client.waitUntilReady();

    const session = await client.call<CreateSessionResult>('createSession');
    console.log('Session created:', session);

    const baseInput: AddOrUpdateConstituentaInput = {
      draft: {
        id: 1,
        alias: 'X1',
        cstType: CstType.BASE,
        definitionFormal: ''
      }
    };
    await client.call('addOrUpdateConstituenta', {
      sessionId: session.sessionId,
      input: baseInput
    });

    const upsertInput: AddOrUpdateConstituentaInput = {
      draft: {
        id: 2,
        alias: 'D1',
        cstType: CstType.TERM,
        definitionFormal: '1+2'
      }
    };
    const upsert = await client.call('addOrUpdateConstituenta', {
      sessionId: session.sessionId,
      input: upsertInput
    });
    console.log('Upsert result:', upsert);

    await client.call('setConstituentaValue', {
      sessionId: session.sessionId,
      input: { target: 1, value: { 0: 'zero', 1: 'one' } }
    });

    const evalResult = await client.call('evaluateConstituenta', {
      sessionId: session.sessionId,
      input: { constituentId: 2 }
    });
    console.log('Evaluation result:', evalResult);

    const analyzeInput: AnalyzeExpressionInput = {
      expression: '(',
      cstType: CstType.TERM
    };
    const analysis = await client.call('analyzeExpression', {
      sessionId: session.sessionId,
      input: analyzeInput
    });
    console.log('Analysis result:', analysis);

    const diagnostics = await client.call('listDiagnostics', {
      sessionId: session.sessionId
    });
    console.log('Diagnostics count:', Array.isArray(diagnostics) ? diagnostics.length : diagnostics);
  } finally {
    await client.close();
  }
}

runExample().catch(error => {
  console.error(error);
  process.exit(1);
});
