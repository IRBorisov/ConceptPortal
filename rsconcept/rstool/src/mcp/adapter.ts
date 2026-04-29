import { type RSFormAgentToolContract } from '../contracts/tool-contract';

export interface MCPAdapter {
  start(): Promise<void>;
}

/**
 * Placeholder for Phase 3. Keeps MCP integration isolated from core logic.
 */
export class RSFormMCPAdapter implements MCPAdapter {
  public constructor(private readonly tool: RSFormAgentToolContract) {}

  public async start(): Promise<void> {
    void this.tool.contractVersion;
    throw new Error('MCP adapter is not implemented yet. Use library API directly in v1.');
  }
}
