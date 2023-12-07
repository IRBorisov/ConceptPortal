import { resources } from '../../utils/constants';
import PDFViewer from '../Common/PDFViewer';

function HelpPrivacy() {
  return (
  <PDFViewer 
    file={resources.privacy_policy}
  />);
}

export default HelpPrivacy;
