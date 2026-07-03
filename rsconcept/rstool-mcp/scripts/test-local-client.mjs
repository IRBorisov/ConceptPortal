import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

async function main() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "--yes",
      "pnpm@9.15.9",
      "--filter",
      "@rsconcept/rstool-mcp",
      "run",
      "start",
    ],
    cwd: root,
  });

  const client = new Client({ name: "local-test", version: "1.0.0" });
  await client.connect(transport);

  console.log("Connected to local rstool-mcp (workspace deps via pnpm).");

  const tools = await client.listTools();
  console.log("\ntools/list:", tools.tools.map((t) => t.name).join(", "));

  const ping = await client.callTool({ name: "ping", arguments: {} });
  console.log("\nping:", JSON.stringify(ping, null, 2));

  const session = await client.callTool({
    name: "ensure_session",
    arguments: {},
  });
  console.log("\nensure_session:", JSON.stringify(session, null, 2));

  await client.close();
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
