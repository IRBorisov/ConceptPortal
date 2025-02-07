import { PDFViewer } from '@/components/ui/View';
import { resources } from '@/utils/constants';

interface HelpPrivacyProps {
  offsetXpx: number;
  minWidth: number;
}

function HelpPrivacy({ offsetXpx, minWidth }: HelpPrivacyProps) {
  return (
    <div>
      <PDFViewer file={resources.privacy_policy} offsetXpx={offsetXpx} minWidth={minWidth} />
    </div>
  );
}

export default HelpPrivacy;
