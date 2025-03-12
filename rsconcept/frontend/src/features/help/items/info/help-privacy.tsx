import { PDFViewer } from '@/components/view';
import { resources } from '@/utils/constants';

interface HelpPrivacyProps {
  offsetXpx: number;
  minWidth: number;
}

export function HelpPrivacy({ offsetXpx, minWidth }: HelpPrivacyProps) {
  return (
    <div>
      <PDFViewer file={resources.privacy_policy} offsetXpx={offsetXpx} minWidth={minWidth} />
    </div>
  );
}
