import PDFViewer from '@/components/PDFViewer';
import { resources } from '@/utils/constants';

function HelpPrivacy() {
  return <PDFViewer file={resources.privacy_policy} />;
}

export default HelpPrivacy;
