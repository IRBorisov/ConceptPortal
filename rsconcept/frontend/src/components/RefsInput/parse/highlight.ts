import {styleTags, tags} from '@lezer/highlight';

export const highlighting = styleTags({
  RefEntity: tags.name,
  Global: tags.name,
  Grams: tags.name,

  RefSyntactic: tags.literal,
  Offset: tags.literal,
  Nominal: tags.literal,
});