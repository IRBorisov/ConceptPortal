import { z } from 'zod';

export const schemaApiKey = z.object({
  id: z.number(),
  label: z.string(),
  prefix: z.string(),
  created_at: z.iso.datetime({ offset: true }).or(z.string()),
  last_used_at: z.iso.datetime({ offset: true }).or(z.string()).nullable(),
  revoked_at: z.iso.datetime({ offset: true }).or(z.string()).nullable()
});
export type ApiKeyDTO = z.infer<typeof schemaApiKey>;

export const schemaApiKeyCreated = schemaApiKey.omit({ last_used_at: true, revoked_at: true }).extend({
  secret: z.string()
});
export type ApiKeyCreatedDTO = z.infer<typeof schemaApiKeyCreated>;

export const schemaCreateApiKey = z.object({
  label: z.string().min(1).max(100)
});
export type CreateApiKeyDTO = z.infer<typeof schemaCreateApiKey>;

export const schemaAgentActionLog = z.object({
  id: z.number(),
  api_key: z.number().nullable(),
  key_label: z.string(),
  key_prefix: z.string(),
  action: z.string(),
  item_id: z.number().nullable(),
  item_alias: z.string(),
  item_title: z.string(),
  status_code: z.number(),
  summary: z.string(),
  created_at: z.iso.datetime({ offset: true }).or(z.string())
});
export type AgentActionLogDTO = z.infer<typeof schemaAgentActionLog>;

export const schemaAgentActionLogList = z.object({
  count: z.number(),
  results: z.array(schemaAgentActionLog)
});
export type AgentActionLogListDTO = z.infer<typeof schemaAgentActionLogList>;
