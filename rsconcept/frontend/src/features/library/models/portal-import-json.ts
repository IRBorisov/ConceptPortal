import { z } from 'zod';

import { globalTx } from '@/i18n';

import { limits, PORTAL_JSON_CONTRACT_VERSION } from '@/utils/constants';

export const schemaPortalImportMetadata = z.strictObject({
  contract_version: z.literal(PORTAL_JSON_CONTRACT_VERSION),
  title: z
    .string()
    .max(limits.len_title, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_title})`)
    .nonempty(globalTx('tx.general.field.required')),
  alias: z
    .string()
    .max(limits.len_alias, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_alias})`)
    .nonempty(globalTx('tx.general.field.required')),
  description: z
    .string()
    .max(limits.len_description, `${globalTx('tx.general.symbol.count.limit')} (${limits.len_description})`)
});
