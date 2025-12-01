import { Document, Font, Page, pdf, Text, View } from '@react-pdf/renderer';

import { type RO } from '@/utils/meta';

import { labelCstTypification } from '../labels';
import { type IConstituenta } from '../models/rsform';

import { pdfs } from './pdf-styles';
import { addSpaces, addSpacesTypification } from './pdf-utils';

export function cstListToFile(data: RO<IConstituenta[]>): Promise<Blob> {
  return pdf(<CstListDocument data={data} />).toBlob();
}

function CstListDocument({ data }: { data: RO<IConstituenta[]> }) {
  return (
    <CDocument>
      <CstTable data={data} />
      <Text fixed style={pdfs.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </CDocument>
  );
}

// ======== Internal components ========
const documentMetadata = {
  language: 'ru',
  creator: 'Concept Portal',
  subject: 'Rubik (OFL 1.1), ConceptMath (based on Fira Code & Noto Sans Math, OFL 1.1)',
  producer:
    'Embedded Fonts & Licenses: ' +
    'Rubik — © Google, licensed under SIL Open Font License 1.1. ' +
    'ConceptMath — based on glyphs from Fira Code and Noto Sans Math. ' +
    'Fira Code © 2014–2020 The Fira Code Project Authors. ' +
    'Noto Sans Math © 2022 Google LLC. Both licensed under the SIL Open Font License 1.1. ' +
    'See http://scripts.sil.org/OFL for full terms.'
};

function CDocument({ children }: { children: React.ReactNode }) {
  Font.register({
    family: 'Rubik',
    fonts: [
      { src: '/fonts/Rubik-Regular.ttf', fontWeight: 'normal' },
      { src: '/fonts/Rubik-Medium.ttf', fontWeight: 'bold' }
    ]
  });
  Font.register({
    family: 'CodeMath',
    fonts: [{ src: '/fonts/ConceptMath-Regular.ttf' }]
  });

  Font.registerHyphenationCallback(word => [word]);

  return (
    <Document {...documentMetadata}>
      <Page size='A4' orientation='landscape' style={pdfs.page}>
        {children}
      </Page>
    </Document>
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
            <Text style={{ ...pdfs.cell, width: '38mm', fontFamily: 'CodeMath' }}>
              {addSpacesTypification(labelCstTypification(cst))}
            </Text>
            <Text style={{ ...pdfs.cell, width: '40mm' }}>{cst.term_resolved}</Text>
            <Text style={{ ...pdfs.cell, width: '82mm', borderRightWidth: 0 }}>{getCommentColumnText(cst)}</Text>
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
