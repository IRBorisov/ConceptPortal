import { beforeAll, describe, expect, it, vi } from 'vitest';

import { type AppLocale } from '@/i18n';
import { Graph } from '@rsconcept/domain/graph';
import { type Constituenta, CstClass, CstType, type RSForm } from '@rsconcept/domain/library';

type CreateSchemaFileFn = (data: RSForm) => Promise<Blob>;
type CstListToFileFn = (data: Constituenta[]) => Promise<Blob>;

let locale: AppLocale = 'ru';

vi.mock('@/stores/preferences', () => ({
  usePreferencesStore: {
    getState: () => ({ locale }),
    setState: (partial: { locale?: AppLocale }) => {
      if (partial.locale) {
        locale = partial.locale;
      }
    }
  }
}));

function mockConstituenta(
  partial: Pick<Constituenta, 'id' | 'alias' | 'definition_formal' | 'cst_class' | 'cst_type'> &
    Partial<Pick<Constituenta, 'definition_resolved' | 'term_resolved' | 'convention'>>
): Constituenta {
  return {
    schema: 1,
    crucial: false,
    convention: '',
    definition_raw: '',
    definition_resolved: '',
    term_raw: '',
    term_resolved: '',
    term_forms: [],
    typification_manual: '',
    value_is_property: false,
    homonyms: [],
    formalDuplicates: [],
    analysis: { success: true } as Constituenta['analysis'],
    effectiveType: null,
    is_type_mismatch: false,
    status: 'verified',
    is_template: false,
    is_simple_expression: true,
    parent_schema_index: 0,
    parent_schema: null,
    is_inherited: false,
    has_inherited_children: false,
    attributes: [],
    spawn: [],
    spawn_alias: [],
    ...partial
  };
}

function mockSchema(items: Constituenta[]): RSForm {
  return {
    id: 1,
    title: 'Test schema',
    alias: 'S1',
    items,
    graph: new Graph(items.map(item => [item.id]))
  } as RSForm;
}

async function pdfBlobToLatin1Text(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return new TextDecoder('latin1').decode(buffer);
}

function assertNoInvalidPdfPageNumbers(pdfText: string): void {
  expect(pdfText).not.toMatch(/(?:^|[\s(])(-1)\s*\/\s*\d/);
}

describe('rsform2pdf', () => {
  let createSchemaFile: CreateSchemaFileFn;
  let cstListToFile: CstListToFileFn;

  beforeAll(async () => {
    ({ createSchemaFile, cstListToFile } = await import('./rsform2pdf'));
  });

  it('does not embed invalid page numbers in schema PDF footers', async () => {
    locale = 'ru';

    const items = Array.from({ length: 40 }, (_, index) =>
      mockConstituenta({
        id: index + 1,
        alias: `X${index + 1}`,
        cst_class: CstClass.BASIC,
        cst_type: CstType.BASE,
        definition_formal: `[α∈ℬ(R)]Pr1(β${index})`,
        definition_resolved:
          'Длинное текстовое описание конституенты для переноса на следующие страницы PDF-документа.',
        term_resolved: `термин ${index + 1}`
      })
    );

    const blob = await createSchemaFile(mockSchema(items));
    const pdfText = await pdfBlobToLatin1Text(blob);

    assertNoInvalidPdfPageNumbers(pdfText);
    expect(pdfText.length).toBeGreaterThan(0);
  });

  it('does not embed invalid page numbers in constituent list PDF footers', async () => {
    locale = 'en';

    const items = Array.from({ length: 35 }, (_, index) =>
      mockConstituenta({
        id: index + 1,
        alias: `D${index + 1}`,
        cst_class: CstClass.DERIVED,
        cst_type: CstType.PREDICATE,
        definition_formal: `D${index + 1} ≡ Pr1(α${index})`,
        definition_resolved: 'Comment column text long enough to affect pagination in exported PDF.',
        term_resolved: `term ${index + 1}`
      })
    );

    const blob = await cstListToFile(items);
    const pdfText = await pdfBlobToLatin1Text(blob);

    assertNoInvalidPdfPageNumbers(pdfText);
    expect(pdfText.length).toBeGreaterThan(0);
  });
});
