import { CONTRACT_VERSION, type AnalyzeExpressionInput, type AnalysisResult } from '../contracts/tool-contract';
import { SchemaAdapter } from '../mappers/schema-adapter';
import { SessionStore } from '../session/session-store';

export class AnalyzerFacade {
  public constructor(
    private readonly sessions: SessionStore,
    private readonly adapter: SchemaAdapter
  ) {}

  public analyzeExpression(sessionId: string, input: AnalyzeExpressionInput): AnalysisResult {
    const envelope = this.sessions.get(sessionId);
    const { result } = this.adapter.analyzeAgainstSession(envelope.state, {
      id: -1,
      alias: '_temporary',
      cstType: input.cstType,
      definitionFormal: input.expression
    });
    return result;
  }

  public getContractVersion(): string {
    return CONTRACT_VERSION;
  }
}
