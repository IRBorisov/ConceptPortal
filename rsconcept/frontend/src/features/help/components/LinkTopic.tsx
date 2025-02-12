import { urls } from '@/app';

import { TextURL } from '@/components/Control';

import { HelpTopic } from '../models/helpTopic';

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
