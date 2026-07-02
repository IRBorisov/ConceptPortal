import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { Link, pdf, Text, View } from '@react-pdf/renderer';

import { type AppLocale, DEFAULT_LOCALE, getMessageMapForLocale, useTx } from '@/i18n';
import { type Constituenta, type RSForm } from '@rsconcept/domain/library';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { urls } from '@/app/urls';

import { CDocument } from '@/components/pdf/CDocument';
import { pdfs } from '@/components/pdf/pdf-styles';
import { usePreferencesStore } from '@/stores/preferences';
import { external_urls } from '@/utils/constants';

import {
  addSpaces,
  addSpacesTypification,
  formatPdfPageRange,
  hyphenateCyrillic,
  pdfRowNeedsMultiPageWrap,
  protectShortRussianWords
} from './pdf-utils';

function handleIntlError(locale: AppLocale, error: unknown) {
  if (locale === 'en' && typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === 'MISSING_TRANSLATION') {
      return;
    }
  }
  console.error(error);
}

function PdfIntlRoot({ children }: { children: ReactNode }) {
  const locale = usePreferencesStore.getState().locale;
  const messages = getMessageMapForLocale(locale);
  return (
    <IntlProvider
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={messages}
      onError={error => handleIntlError(locale, error)}
    >
      {children}
    </IntlProvider>
  );
}

/** Renders a PDF file with a list of Constituenta.
 * WARNING! Large library load, use lazy loading.
 */
export function cstListToFile(data: Constituenta[]): Promise<Blob> {
  return pdf(
    <PdfIntlRoot>
      <CstListDocument data={data} />
    </PdfIntlRoot>
  ).toBlob();
}

/** Renders a PDF file with target Schema.
 * WARNING! Large library load, use lazy loading.
 */
export function createSchemaFile(data: RSForm): Promise<Blob> {
  return pdf(
    <PdfIntlRoot>
      <SchemaDocument data={data} />
    </PdfIntlRoot>
  ).toBlob();
}

function CstListDocument({ data }: { data: Constituenta[] }) {
  return (
    <CDocument>
      <CstTable data={data} />
      <Text
        fixed
        style={{ ...pdfs.footer, textAlign: 'center' }}
        render={({ pageNumber, totalPages }) => formatPdfPageRange(pageNumber, totalPages)}
      />
    </CDocument>
  );
}

function SchemaDocument({ data }: { data: RSForm }) {
  return (
    <CDocument>
      <SchemaTitle schema={data} />
      <CstTable data={data.items} />
      <SchemaFooter schema={data} />
    </CDocument>
  );
}

// ======== Internal components ========
function SchemaTitle({ schema }: { schema: RSForm }) {
  const tx = useTx();
  const url = `${external_urls.portal}${urls.schema(schema.id)}`;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '3mm' }}>
        {tx('tx.schema') + ' ' + schema.title}
      </Text>
      <Text style={{ fontSize: 12 }}>{tx('tx.lib.alias') + tx('tx.general.colon') + schema.alias}</Text>
      <Text style={{ fontSize: 12 }}>
        {tx('tx.general.source') + tx('tx.general.colon')}
        <Link src={url} style={{ textDecoration: 'underline' }}>
          {url}
        </Link>
      </Text>
    </View>
  );
}

function SchemaFooter({ schema }: { schema: RSForm }) {
  const tx = useTx();
  return (
    <View fixed style={pdfs.footer}>
      <Text>{schema.alias}</Text>
      <Text
        render={({ pageNumber, totalPages }) => {
          const range = formatPdfPageRange(pageNumber, totalPages);
          if (!range) {
            return '';
          }
          return tx('tx.general.page.short') + ' ' + range;
        }}
      />
    </View>
  );
}

function CstTable({ data }: { data: Constituenta[] }) {
  const tx = useTx();
  return (
    <>
      <View style={{ flex: 1 }}>
        {/* Table Header */}
        <View fixed style={pdfs.headerRow}>
          <Text style={{ ...pdfs.cell, width: '13mm' }}>ID</Text>
          <Text style={{ ...pdfs.cell, width: '82mm' }}>{tx('tx.lib.defineFormal')}</Text>
          <Text style={{ ...pdfs.cell, width: '38mm' }}>{tx('tx.rslang.typification')}</Text>
          <Text style={{ ...pdfs.cell, width: '40mm' }}>{tx('tx.lang.term')}</Text>
          <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>
            {`${tx('tx.lib.defineText')} / ${tx('tx.lang.term')}`}
          </Text>
        </View>

        {/* Table Rows */}
        {data.map((cst, idx) => (
          <View key={cst.id ?? idx} style={pdfs.row} wrap={rowNeedsMultiPageWrap(cst, tx)}>
            <View style={{ ...pdfs.cell, width: '13mm' }}>
              <Text style={{ fontFamily: 'CodeMath', textAlign: 'center' }}>{cst.alias}</Text>
            </View>
            <View style={{ ...pdfs.cell, width: '82mm' }}>
              <Text style={{ fontFamily: 'CodeMath' }} hyphenationCallback={word => [word]}>
                {addSpaces(cst.definition_formal)}
              </Text>
            </View>
            <View style={{ ...pdfs.cell, width: '38mm' }}>
              <Text style={{ fontFamily: 'CodeMath' }} hyphenationCallback={word => [word]}>
                {addSpacesTypification(labelType(cst.effectiveType))}
              </Text>
            </View>
            <View style={{ ...pdfs.cell, width: '40mm' }}>
              <Text hyphenationCallback={hyphenateCyrillic}>{protectShortRussianWords(cst.term_resolved)}</Text>
            </View>
            <View style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>
              <Text hyphenationCallback={hyphenateCyrillic}>
                {protectShortRussianWords(getCommentColumnText(cst, tx))}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function rowNeedsMultiPageWrap(cst: Constituenta, tx: (id: string) => string): boolean {
  return pdfRowNeedsMultiPageWrap([
    { text: cst.alias, columnWidthMm: 13, avgCharWidthRatio: 0.6 },
    { text: addSpaces(cst.definition_formal), columnWidthMm: 82, avgCharWidthRatio: 0.72 },
    {
      text: addSpacesTypification(labelType(cst.effectiveType)),
      columnWidthMm: 38,
      avgCharWidthRatio: 0.72
    },
    { text: protectShortRussianWords(cst.term_resolved), columnWidthMm: 40 },
    {
      text: protectShortRussianWords(getCommentColumnText(cst, tx)),
      columnWidthMm: 82
    }
  ]);
}

function getCommentColumnText(cst: Constituenta, tx: (id: string) => string) {
  let result = cst.definition_resolved;
  if (cst.convention) {
    if (result) {
      result += '\n';
    }
    result += tx('tx.lib.convention') + ': ' + cst.convention;
  }
  return result;
}
