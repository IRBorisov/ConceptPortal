import { Document, Font, Page } from '@react-pdf/renderer';

import { type AppLocale } from '@/i18n';

import { pdfFontSrc } from './font-path';
import { pdfs } from './styles';

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

const documentProducer =
  'Embedded Fonts & Licenses: ' +
  'Concept Text — based on DejaVu Sans. ' +
  'ConceptMath — based on glyphs from Fira Code and Noto Sans Math. ' +
  'DejaVu Sans © 2003 by Bitstream. ' +
  'Fira Code © 2014–2020 The Fira Code Project Authors. ' +
  'Noto Sans Math © 2022 Google LLC. Both licensed under the SIL Open Font License 1.1. ' +
  'See http://scripts.sil.org/OFL for full terms.';

/**
 * Props for {@link PdfDocument}.
 *
 * Importing this module registers Portal PDF fonts (`ConceptText`, `CodeMath`) as a side effect.
 */
export interface PdfDocumentProps {
  /** Page body (tables, titles, etc.) drawn inside a single landscape A4 page. */
  children: React.ReactNode;
  /** Document language metadata (defaults to `ru`). */
  language?: AppLocale;
}

/**
 * Root PDF document shell used by all Portal exports.
 *
 * - Landscape A4 with {@link pdfs}.`page` margins and default body font
 * - Registers custom fonts on first import (required before any `Text` that uses them)
 * - Embeds font license metadata in the PDF producer field
 *
 * Content that should repeat on every page (headers/footers) belongs inside `children` with
 * react-pdf `fixed`, not as siblings of {@link PdfDocument}.
 */
export function PdfDocument({ children, language = 'ru' }: PdfDocumentProps) {
  return (
    <Document language={language} creator='Concept Portal' producer={documentProducer}>
      <Page size='A4' orientation='landscape' style={pdfs.page}>
        {children}
      </Page>
    </Document>
  );
}
