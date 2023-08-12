import {styleTags, tags} from '@lezer/highlight';

export const highlighting = styleTags({
  Index: tags.unit,
  ComplexIndex: tags.unit,
  Integer: tags.literal,

  Radical: tags.propertyName,
  Global: tags.name,
  Local: tags.variableName,

  TextFunction: tags.keyword,
  ConstructPrefix: tags.controlKeyword
});