import { Document, Font, Page } from '@react-pdf/renderer';

import { pdfs } from './pdf-styles';

Font.register({
  family: 'ConceptText',
  fonts: [
    { src: '/fonts/ConceptText-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/ConceptText-Bold.ttf', fontWeight: 'bold' }
  ]
});
Font.register({
  family: 'CodeMath',
  fonts: [{ src: '/fonts/ConceptMath-Regular.ttf' }]
});

Font.registerHyphenationCallback(word => [word]);

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

export function CDocument({ children }: { children: React.ReactNode }) {
  return (
    <Document {...documentMetadata}>
      <Page size='A4' orientation='landscape' style={pdfs.page}>
        {children}
      </Page>
    </Document>
  );
}
