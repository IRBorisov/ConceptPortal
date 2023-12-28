import { styleTags, tags } from '@lezer/highlight';

export const highlighting = styleTags({
  'Index': tags.unit,
  'ComplexIndex': tags.unit,
  'Literal': tags.literal,

  'Radical': tags.propertyName,
  'Function': tags.name,
  'Predicate': tags.name,
  'Global': tags.name,
  'Local': tags.variableName,

  'TextFunction': tags.keyword,
  'Filter': tags.keyword,
  'PrefixR': tags.controlKeyword,
  'PrefixI': tags.controlKeyword,
  'PrefixD': tags.controlKeyword,
  '{': tags.brace,
  '}': tags.brace,
  '|': tags.brace,
  ';': tags.brace
});
