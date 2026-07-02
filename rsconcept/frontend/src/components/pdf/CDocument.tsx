import { Document, Font, Page } from '@react-pdf/renderer';

import { pdfFontSrc } from './pdf-font-path';
import { pdfs } from './pdf-styles';

Font.register({
  family: 'ConceptText',
  fonts: [
    { src: pdfFontSrc('ConceptText-Regular.ttf'), fontWeight: 'normal' },
    { src: pdfFontSrc('ConceptText-Bold.ttf'), fontWeight: 'bold' }
  ]
});
Font.register({
  family: 'CodeMath',
  fonts: [{ src: pdfFontSrc('ConceptMath-Regular.ttf') }]
});

const documentMetadata = {
  language: 'ru',
  creator: 'Concept Portal',
  producer:
    'Embedded Fonts & Licenses: ' +
    'Concept Text — based on DejaVu Sans. ' +
    'ConceptMath — based on glyphs from Fira Code and Noto Sans Math. ' +
    'DejaVu Sans © 2003 by Bitstream. ' +
    'Fira Code © 2014–2020 The Fira Code Project Authors. ' +
    'Noto Sans Math © 2022 Google LLC. Both licensed under the SIL Open Font License 1.1. ' +
    'See http://scripts.sil.org/OFL for full terms.'
};

interface CDocumentProps {
  /** PDF page content rendered inside a landscape A4 page. */
  children: React.ReactNode;
}

/** Root PDF document with registered Portal fonts and landscape A4 layout. */
export function CDocument({ children }: CDocumentProps) {
  return (
    <Document {...documentMetadata}>
      <Page size='A4' orientation='landscape' style={pdfs.page}>
        {children}
      </Page>
    </Document>
  );
}
