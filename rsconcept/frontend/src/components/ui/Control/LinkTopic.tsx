import { urls } from '@/app/urls';
import { HelpTopic } from '@/models/miscellaneous';

import { TextURL } from './TextURL';

interface TextURLProps {
  /** Text to display. */
  text: string;
  /** Topic to link to. */
  topic: HelpTopic;
}

/**
 * Displays a link to a help topic.
 */
export function LinkTopic({ text, topic }: TextURLProps) {
  return <TextURL text={text} href={urls.help_topic(topic)} />;
}
