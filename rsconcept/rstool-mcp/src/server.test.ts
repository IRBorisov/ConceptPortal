import { describe, expect, it } from 'vitest';

import { buildRSToolMcpServer } from './server';
import { TOOL_DEFINITIONS } from './tools';

describe('buildRSToolMcpServer', () => {
  it('exposes the full rstool contract as MCP tools', () => {
    const server = buildRSToolMcpServer();
    expect(server).toBeDefined();
    expect(TOOL_DEFINITIONS.map(t => t.name)).toEqual([
      'ping',
      'list_methods',
      'create_session',
      'add_or_update_constituenta',
      'analyze_expression',
      'get_form_state',
      'list_diagnostics',
      'commit_step',
      'export_session',
      'import_session',
      'set_constituenta_value',
      'set_constituenta_values',
      'clear_constituenta_values',
      'get_model_state',
      'evaluate_expression',
      'evaluate_constituenta',
      'recalculate_model'
    ]);
  });

  it('each tool has a permissive but well-formed input schema', () => {
    for (const definition of TOOL_DEFINITIONS) {
      expect(definition.inputSchema.type).toBe('object');
      expect(typeof definition.description).toBe('string');
      expect(definition.description.length).toBeGreaterThan(0);
    }
  });
});
