#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { buildRSToolMcpServer } from '../server';

async function main(): Promise<void> {
  const server = buildRSToolMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('rstool-mcp server ready on stdio\n');
}

main().catch(error => {
  process.stderr.write(`rstool-mcp fatal: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
