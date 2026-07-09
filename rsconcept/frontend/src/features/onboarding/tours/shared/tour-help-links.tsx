import { urls } from '@/app/urls';
import { type HelpTopic } from '@/features/help';

import { TextURL } from '@/components/control';

interface TourHelpLinkProps {
  text: string;
  topic: HelpTopic;
}

/** Inline link to a help manual topic from tour copy. */
export function TourHelpLink({ text, topic }: TourHelpLinkProps) {
  return <TextURL text={text} href={urls.help_topic(topic)} />;
}
