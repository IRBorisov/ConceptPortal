import PDFViewer from '@/components/ui/PDFViewer';
import { resources } from '@/utils/constants';

function HelpPrivacy() {
  return (
    <div>
      <PDFViewer file={resources.privacy_policy} />
    </div>
  );
}

export default HelpPrivacy;
