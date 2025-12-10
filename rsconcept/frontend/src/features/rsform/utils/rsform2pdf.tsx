import { Link, pdf, Text, View } from '@react-pdf/renderer';

import { urls } from '@/app';

import { CDocument } from '@/components/pdf/CDocument';
import { external_urls } from '@/utils/constants';
import { type RO } from '@/utils/meta';

import { pdfs } from '../../../components/pdf/pdf-styles';
import { labelCstTypification } from '../labels';
import { type IConstituenta, type IRSForm } from '../models/rsform';

import { addSpaces, addSpacesTypification, hyphenateCyrillic } from './pdf-utils';

/** Renders a PDF file with a list of Constituenta.
 * WARNING! Large library load, use lazy loading.
 */
export function cstListToFile(data: RO<IConstituenta[]>): Promise<Blob> {
  return pdf(<CstListDocument data={data} />).toBlob();
}

/** Renders a PDF file with target Schema.
 * WARNING! Large library load, use lazy loading.
 */
export function createSchemaFile(data: IRSForm): Promise<Blob> {
  return pdf(<SchemaDocument data={data} />).toBlob();
}

function CstListDocument({ data }: { data: RO<IConstituenta[]> }) {
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

function SchemaDocument({ data }: { data: IRSForm }) {
  return (
    <CDocument>
      <SchemaTitle schema={data} />
      <CstTable data={data.items} />
      <SchemaFooter schema={data} />
    </CDocument>
  );
}

// ======== Internal components ========
function SchemaTitle({ schema }: { schema: IRSForm }) {
  const url = `${external_urls.portal}${urls.schema(schema.id)}`;
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '3mm' }}>Концептуальная схема {schema.title}</Text>
      <Text style={{ fontSize: 12 }}>Сокращенное название: {schema.alias}</Text>
      <Text style={{ fontSize: 12 }}>
        Онлайн версия:{' '}
        <Link src={url} style={{ textDecoration: 'underline' }}>
          {url}
        </Link>
      </Text>
    </View>
  );
}

function SchemaFooter({ schema }: { schema: IRSForm }) {
  return (
    <View fixed style={pdfs.footer}>
      <Text>КС {schema.alias}</Text>
      <Text render={({ pageNumber, totalPages }) => `Лист ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function CstTable({ data }: { data: RO<IConstituenta[]> }) {
  return (
    <>
      <View style={{ flex: 1 }}>
        {/* Table Header */}
        <View fixed style={pdfs.headerRow}>
          <Text style={{ ...pdfs.cell, width: '13mm' }}>ID</Text>
          <Text style={{ ...pdfs.cell, width: '82mm' }}>Формальное выражение</Text>
          <Text style={{ ...pdfs.cell, width: '38mm' }}>Типизация</Text>
          <Text style={{ ...pdfs.cell, width: '40mm' }}>Термин</Text>
          <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>Схемная интерпретация / Термин</Text>
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
              {addSpacesTypification(labelCstTypification(cst))}
            </Text>
            <Text style={{ ...pdfs.cell, width: '40mm' }} hyphenationCallback={hyphenateCyrillic}>
              {cst.term_resolved}
            </Text>
            <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }} hyphenationCallback={hyphenateCyrillic}>
              {getCommentColumnText(cst)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

function getCommentColumnText(cst: RO<IConstituenta>) {
  let result = cst.definition_resolved;
  if (cst.convention) {
    if (result) {
      result += '\n';
    }
    result += 'Конвенция: ' + cst.convention;
  }
  return result;
}
