import type { ReactNode } from 'react';
import { IntlProvider, type IntlShape, useIntl } from 'react-intl';
import { Link, pdf, Text, View } from '@react-pdf/renderer';

import { type Constituenta, type RSForm } from '@/domain/library';
import { labelType } from '@/domain/rslang/labels';
import { type AppLocale, DEFAULT_LOCALE, getMessageMapForLocale } from '@/i18n';

import { urls } from '@/app';

import { CDocument } from '@/components/pdf/CDocument';
import { pdfs } from '@/components/pdf/pdf-styles';
import { usePreferencesStore } from '@/stores/preferences';
import { external_urls } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { addSpaces, addSpacesTypification, hyphenateCyrillic, protectShortRussianWords } from './pdf-utils';

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
export function cstListToFile(data: RO<Constituenta[]>): Promise<Blob> {
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

function CstListDocument({ data }: { data: RO<Constituenta[]> }) {
  return (
    <CDocument>
      <CstTable data={data} />
      <Text
        fixed
        style={{ ...pdfs.footer, textAlign: 'center' }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
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
  const intl = useIntl();
  const url = `${external_urls.portal}${urls.schema(schema.id)}`;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '3mm' }}>
        {intl.formatMessage({ id: 'tx.schema' }) + ' ' + schema.title}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {intl.formatMessage({ id: 'ui.rsform.pdf.aliasLabel' }, { alias: schema.alias })}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {intl.formatMessage({ id: 'ui.rsform.pdf.onlineVersion' })}{' '}
        <Link src={url} style={{ textDecoration: 'underline' }}>
          {url}
        </Link>
      </Text>
    </View>
  );
}

function SchemaFooter({ schema }: { schema: RSForm }) {
  const intl = useIntl();
  return (
    <View fixed style={pdfs.footer}>
      <Text>{intl.formatMessage({ id: 'ui.rsform.pdf.footerLine' }, { alias: schema.alias })}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          intl.formatMessage({ id: 'ui.rsform.pdf.sheetPages' }, { pageNumber, totalPages })
        }
      />
    </View>
  );
}

function CstTable({ data }: { data: RO<Constituenta[]> }) {
  const intl = useIntl();
  return (
    <>
      <View style={{ flex: 1 }}>
        {/* Table Header */}
        <View fixed style={pdfs.headerRow}>
          <Text style={{ ...pdfs.cell, width: '13mm' }}>ID</Text>
          <Text style={{ ...pdfs.cell, width: '82mm' }}>{intl.formatMessage({ id: 'tx.lib.definitionFormal' })}</Text>
          <Text style={{ ...pdfs.cell, width: '38mm' }}>{intl.formatMessage({ id: 'tx.rslang.typification' })}</Text>
          <Text style={{ ...pdfs.cell, width: '40mm' }}>{intl.formatMessage({ id: 'tx.lang.term' })}</Text>
          <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>
            {intl.formatMessage({ id: 'ui.rsform.pdf.colSchemaInterpretation' })}
          </Text>
        </View>

        {/* Table Rows */}
        {data.map((cst, idx) => (
          <View key={cst.id ?? idx} style={pdfs.row} wrap={false}>
            <Text style={{ ...pdfs.cell, width: '13mm', fontFamily: 'CodeMath', textAlign: 'center' }}>
              {cst.alias}
            </Text>
            <Text style={{ ...pdfs.cell, width: '82mm', fontFamily: 'CodeMath' }} hyphenationCallback={word => [word]}>
              {addSpaces(cst.definition_formal)}
            </Text>
            <Text style={{ ...pdfs.cell, width: '38mm', fontFamily: 'CodeMath' }} hyphenationCallback={word => [word]}>
              {addSpacesTypification(labelType(cst.analysis.type))}
            </Text>
            <Text style={{ ...pdfs.cell, width: '40mm' }} hyphenationCallback={hyphenateCyrillic}>
              {protectShortRussianWords(cst.term_resolved)}
            </Text>
            <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }} hyphenationCallback={hyphenateCyrillic}>
              {protectShortRussianWords(getCommentColumnText(cst, intl.formatMessage))}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function getCommentColumnText(cst: RO<Constituenta>, formatMessage: IntlShape['formatMessage']) {
  let result = cst.definition_resolved;
  if (cst.convention) {
    if (result) {
      result += '\n';
    }
    result += formatMessage({ id: 'tx.lib.convention' }) + ': ' + cst.convention;
  }
  return result;
}
