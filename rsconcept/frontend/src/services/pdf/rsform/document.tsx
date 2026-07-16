import { Link, pdf, Text, View } from '@react-pdf/renderer';

import { type AppLocale, useTx } from '@/i18n';
import { PdfDocument } from '@/services/pdf/document';
import { PdfIntlRoot } from '@/services/pdf/intl-root';
import { pdfRowNeedsMultiPageWrap } from '@/services/pdf/layout';
import { pdfs } from '@/services/pdf/styles';
import { formatPdfPageRange, hyphenateCyrillic, protectShortRussianWords } from '@/services/pdf/text';

import { addSpaces, addSpacesTypification } from './formal-text';
import { schemaPortalUrl } from './portal-url';
import { type ConstituentaPdfRow, type SchemaPdfInput } from './protocol';

/**
 * Renders a constituenta-list PDF to a Blob (main thread or worker).
 */
export function renderCstListPdfBlob(data: ConstituentaPdfRow[], locale: AppLocale): Promise<Blob> {
  return pdf(
    <PdfIntlRoot locale={locale}>
      <CstListDocument data={data} locale={locale} />
    </PdfIntlRoot>
  ).toBlob();
}

/**
 * Renders a schema PDF to a Blob (main thread or worker).
 *
 * @param data - {@link SchemaPdfInput} (not a full `RSForm`)
 */
export function renderSchemaPdfBlob(data: SchemaPdfInput, locale: AppLocale): Promise<Blob> {
  return pdf(
    <PdfIntlRoot locale={locale}>
      <SchemaDocument data={data} locale={locale} />
    </PdfIntlRoot>
  ).toBlob();
}

function CstListDocument({ data, locale }: { data: ConstituentaPdfRow[]; locale: AppLocale }) {
  return (
    <PdfDocument language={locale}>
      <CstTable data={data} />
      <Text
        fixed
        style={{ ...pdfs.footer, textAlign: 'center' }}
        render={({ pageNumber, totalPages }) => formatPdfPageRange(pageNumber, totalPages)}
      />
    </PdfDocument>
  );
}

function SchemaDocument({ data, locale }: { data: SchemaPdfInput; locale: AppLocale }) {
  return (
    <PdfDocument language={locale}>
      <SchemaTitle schema={data} />
      <CstTable data={data.items} />
      <SchemaFooter schema={data} />
    </PdfDocument>
  );
}

function SchemaTitle({ schema }: { schema: SchemaPdfInput }) {
  const tx = useTx();
  const url = schemaPortalUrl(schema.id);
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

function SchemaFooter({ schema }: { schema: SchemaPdfInput }) {
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

function CstTable({ data }: { data: ConstituentaPdfRow[] }) {
  const tx = useTx();
  return (
    <>
      <View style={{ flex: 1 }}>
        <View fixed style={pdfs.headerRow}>
          <Text style={{ ...pdfs.cell, width: '13mm' }}>ID</Text>
          <Text style={{ ...pdfs.cell, width: '82mm' }}>{tx('tx.lib.defineFormal')}</Text>
          <Text style={{ ...pdfs.cell, width: '38mm' }}>{tx('tx.rslang.typification')}</Text>
          <Text style={{ ...pdfs.cell, width: '40mm' }}>{tx('tx.lang.term')}</Text>
          <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>
            {`${tx('tx.lib.defineText')} / ${tx('tx.lang.term')}`}
          </Text>
        </View>

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
                {addSpacesTypification(cst.typification)}
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

function rowNeedsMultiPageWrap(cst: ConstituentaPdfRow, tx: (id: string) => string): boolean {
  return pdfRowNeedsMultiPageWrap([
    { text: cst.alias, columnWidthMm: 13, avgCharWidthRatio: 0.6 },
    { text: addSpaces(cst.definition_formal), columnWidthMm: 82, avgCharWidthRatio: 0.72 },
    {
      text: addSpacesTypification(cst.typification),
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

function getCommentColumnText(cst: ConstituentaPdfRow, tx: (id: string) => string) {
  let result = cst.definition_resolved;
  if (cst.convention) {
    if (result) {
      result += '\n';
    }
    result += tx('tx.lib.convention') + ': ' + cst.convention;
  }
  return result;
}
