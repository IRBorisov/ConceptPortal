import { urls } from '@/app';

import { TextURL } from '@/components/control';

import { type HelpTopic } from '../models/help-topic';

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
