import { StyleSheet } from '@react-pdf/renderer';

//** PDF styles */
export const pdfs = StyleSheet.create({
  page: {
    paddingTop: '20mm',
    paddingBottom: '20mm',
    paddingLeft: '20mm',
    paddingRight: '20mm',
    fontFamily: 'Rubik',
    fontSize: 11
  },
  footer: {
    position: 'absolute',
    bottom: '10mm',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: '#000'
  },
  headerRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
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
