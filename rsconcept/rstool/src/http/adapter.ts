import { type RSFormAgentToolContract } from '../contracts/tool-contract';

export interface HTTPAdapter {
  registerRoutes(): void;
}

/**
 * Placeholder for Phase 3. Keeps HTTP transport outside the core contract.
 */
export class RSFormHTTPAdapter implements HTTPAdapter {
  public constructor(private readonly tool: RSFormAgentToolContract) {}

  public registerRoutes(): void {
    void this.tool.contractVersion;
    throw new Error('HTTP adapter is not implemented yet. Use library API directly in v1.');
  }
}
