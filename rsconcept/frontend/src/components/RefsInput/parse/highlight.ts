import {styleTags, tags} from '@lezer/highlight';

export const highlighting = styleTags({
  RefEntity: tags.name,
  Global: tags.name,
  Gram: tags.name,

  RefSyntactic: tags.literal,
  Offset: tags.literal,
});