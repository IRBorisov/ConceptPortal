import { StyleSheet } from '@react-pdf/renderer';

/**
 * Shared `@react-pdf` style sheet for Portal PDF documents.
 *
 * Keys are intentionally domain-neutral so any export can reuse the same page chrome and
 * bordered table primitives:
 *
 * - `page` — body margins, default font family / size (used by `PdfDocument`)
 * - `footer` — absolutely positioned page footer row
 * - `headerRow` / `row` / `cell` — bordered table layout for multi-column lists
 *
 * Column widths are set per-cell at the call site (mm), not in this sheet.
 */
export const pdfs = StyleSheet.create({
  /** Full-page padding and default typography for landscape A4. */
  page: {
    paddingTop: '20mm',
    paddingBottom: '20mm',
    paddingLeft: '20mm',
    paddingRight: '20mm',
    fontFamily: 'ConceptText',
    fontSize: 11
  },
  /** Fixed footer strip; pair with react-pdf `fixed` on the footer `View` / `Text`. */
  footer: {
    position: 'absolute',
    bottom: '10mm',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '20mm',
    fontSize: 10,
    color: '#888'
  },

  /** Data row: horizontal flex with outer left/right/bottom borders. */
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#000'
  },
  /** Sticky table header row (`fixed`) with full outer border. */
  headerRow: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#000',

    fontWeight: 'bold',
    textAlign: 'center'
  },
  /** Single table cell; set `width` and optionally clear `borderRightWidth` on the last column. */
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.5
  }
});
