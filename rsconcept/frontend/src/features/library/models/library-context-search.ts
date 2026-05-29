/**
 * Context search field toggles for library items.
 */

export type LibraryContextSearchField =
  | 'alias'
  | 'title'
  | 'description'
  | 'term'
  | 'definition_formal'
  | 'definition_text'
  | 'convention'
  | 'operation'
  | 'block';

export type LibraryContextSearchFields = Record<LibraryContextSearchField, boolean>;

export const LIBRARY_CONTEXT_SEARCH_FIELDS: readonly LibraryContextSearchField[] = [
  'alias',
  'title',
  'description',
  'term',
  'definition_formal',
  'definition_text',
  'convention',
  'operation',
  'block'
];

export const DEFAULT_LIBRARY_CONTEXT_SEARCH_FIELDS: LibraryContextSearchFields = {
  alias: true,
  title: true,
  description: true,
  term: true,
  definition_formal: true,
  definition_text: true,
  convention: true,
  operation: true,
  block: true
};

export function enabledContextSearchFields(fields: LibraryContextSearchFields): LibraryContextSearchField[] {
  return LIBRARY_CONTEXT_SEARCH_FIELDS.filter(field => fields[field]);
}

export function isDefaultContextSearchFields(fields: LibraryContextSearchFields): boolean {
  return LIBRARY_CONTEXT_SEARCH_FIELDS.every(field => fields[field]);
}

export function normalizeContextSearchFields(
  fields: Partial<LibraryContextSearchFields> | undefined
): LibraryContextSearchFields {
  return {
    alias: fields?.alias ?? true,
    title: fields?.title ?? true,
    description: fields?.description ?? true,
    term: fields?.term ?? true,
    definition_formal: fields?.definition_formal ?? true,
    definition_text: fields?.definition_text ?? true,
    convention: fields?.convention ?? true,
    operation: fields?.operation ?? true,
    block: fields?.block ?? true
  };
}
