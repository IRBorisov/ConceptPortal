import { CstType, RSToolWrapperClient, type AnalyzeExpressionInput } from '../src';

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

    await client.call('applySchemaPatch', {
      items: [{ alias: 'X1' }, { alias: 'D1', definitionFormal: '1+2' }]
    });

    await client.call('setModelValues', {
      set: [{ target: 1, value: { 0: 'zero', 1: 'one' } }]
    });

    const evalResult = await client.call('evaluate', {
      constituentId: 2
    });
    console.log('Evaluation result:', evalResult);

    const analyzeInput: AnalyzeExpressionInput = {
      expression: '(',
      cstType: CstType.TERM
    };
    const analysis = await client.call<{ diagnostics: unknown[] }>('analyzeExpression', analyzeInput);
    console.log('Scratch analysis diagnostics:', analysis.diagnostics.length);

    const sessionDiagnostics = await client.call<unknown[]>('listDiagnostics', {});
    console.log('Session diagnostics count:', sessionDiagnostics.length);
  } finally {
    await client.close();
  }
}

runExample().catch(error => {
  console.error(error);
  process.exit(1);
});
