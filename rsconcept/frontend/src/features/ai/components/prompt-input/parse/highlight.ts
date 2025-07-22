import { styleTags, tags } from '@lezer/highlight';

export const highlighting = styleTags({
  Variable: tags.name,
  Error: tags.comment
});
