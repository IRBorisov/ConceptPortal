import { StyleSheet } from '@react-pdf/renderer';

//** PDF styles */
export const pdfs = StyleSheet.create({
  page: {
    paddingTop: '20mm',
    paddingBottom: '20mm',
    paddingLeft: '20mm',
    paddingRight: '20mm',
    fontFamily: 'ConceptText',
    fontSize: 11
  },
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

  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#000'
  },
  headerRow: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#000',

    fontWeight: 'bold',
    textAlign: 'center'
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRightWidth: 0.5
  }
});
