import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpAssistantEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.ai')}</h1>
      <p>
        The AI assistant supports work on the subject domain and conceptual schemes using generative LLM chatbots.
      </p>

      <h2>LLM prompts</h2>
      <p>
        Users can create prompt templates with built-in placeholders {`{{variable-name}}`} or pick from available
        templates.
      </p>
      <p>
        When a template is applied, an LLM prompt is assembled with every placeholder replaced by the corresponding
        value from the current Portal context.
      </p>
      <p>
        Direct chatbot integration is not supported. You are expected to copy the generated prompt into an external LLM
        chat manually.
      </p>

      <h2>rstool — library for external AI agents</h2>
      <p>
        The <TextURL text='@rsconcept/rstool' href={external_urls.git_rstool} /> package is a library for external AI
        agents working with Portal conceptual schemas. It supports incremental RSForm construction, RSLang expression
        analysis, diagnostics, modeling, and evaluation. Use it from code or via the stdio JSON wrapper{' '}
        <code>rstool-wrapper</code>.
      </p>
      <p>
        Agents can install the bundled <code>rstool-helper</code> skill with RS language guidance and common workflows.
        Setup and examples are in the <TextURL text='rstool documentation' href={external_urls.git_rstool} />.
      </p>

      <h2>MCP — connecting an agent</h2>
      <p>
        <TextURL text='@rsconcept/rstool-mcp' href={external_urls.git_rstool_mcp} /> is a Model Context Protocol (MCP)
        adapter for rstool. It exposes the full rstool contract (sessions, constituents, analysis, diagnostics,
        modeling) as MCP tools over stdio so you can connect rstool to Cursor, Claude Desktop, and other MCP-capable
        hosts.
      </p>
      <p>
        Run with <code>npx rstool-mcp</code>. Cursor configuration examples and the tool catalog are in the{' '}
        <TextURL text='rstool-mcp documentation' href={external_urls.git_rstool_mcp} />.
      </p>
    </>
  );
}
