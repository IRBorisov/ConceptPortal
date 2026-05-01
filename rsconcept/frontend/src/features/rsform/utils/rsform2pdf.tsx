import type { ReactNode } from 'react';

import { Link, pdf, Text, View } from '@react-pdf/renderer';
import { IntlProvider, useIntl, type IntlShape } from 'react-intl';

import { type Constituenta, type RSForm } from '@/domain/library';
import { labelType } from '@/domain/rslang/labels';

import { urls } from '@/app';
import { DEFAULT_LOCALE } from '@/app/i18n/locales';
import { getMessagesForLocale } from '@/app/i18n/messages';

import { CDocument } from '@/components/pdf/CDocument';
import { usePreferencesStore } from '@/stores/preferences';
import { external_urls } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { pdfs } from '../../../components/pdf/pdf-styles';

import { addSpaces, addSpacesTypification, hyphenateCyrillic, protectShortRussianWords } from './pdf-utils';

function PdfIntlRoot({ children }: { children: ReactNode }) {
  const locale = usePreferencesStore.getState().locale;
  const messages = getMessagesForLocale(locale);
  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={messages}>
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
        {intl.formatMessage(
          { id: 'ui.rsform.pdf.schemaTitle', defaultMessage: 'Conceptual schema {title}' },
          { title: schema.title }
        )}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {intl.formatMessage(
          { id: 'ui.rsform.pdf.aliasLabel', defaultMessage: 'Short name: {alias}' },
          { alias: schema.alias }
        )}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {intl.formatMessage({ id: 'ui.rsform.pdf.onlineVersion', defaultMessage: 'Online version:' })}{' '}
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
      <Text>
        {intl.formatMessage({ id: 'ui.rsform.pdf.footerLine', defaultMessage: 'CS {alias}' }, { alias: schema.alias })}
      </Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          intl.formatMessage(
            { id: 'ui.rsform.pdf.sheetPages', defaultMessage: 'Sheet {pageNumber} / {totalPages}' },
            { pageNumber, totalPages }
          )
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
          <Text style={{ ...pdfs.cell, width: '82mm' }}>
            {intl.formatMessage({
              id: 'ui.rsform.pdf.colFormalExpression',
              defaultMessage: 'Formal expression'
            })}
          </Text>
          <Text style={{ ...pdfs.cell, width: '38mm' }}>
            {intl.formatMessage({ id: 'ui.label.typification', defaultMessage: 'Typification' })}
          </Text>
          <Text style={{ ...pdfs.cell, width: '40mm' }}>
            {intl.formatMessage({ id: 'ui.label.term', defaultMessage: 'Term' })}
          </Text>
          <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>
            {intl.formatMessage({
              id: 'ui.rsform.pdf.colSchemaInterpretation',
              defaultMessage: 'Schema interpretation / Term'
            })}
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
    result += formatMessage({ id: 'ui.rsform.pdf.conventionPrefix', defaultMessage: 'Convention: ' }) + cst.convention;
  }
  return result;
}
