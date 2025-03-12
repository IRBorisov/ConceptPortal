import { removeTags } from '@/utils/utils';

import { LinkTopic } from './link-topic';
import { describeHelpTopic, labelHelpTopic } from '../labels';
import { type HelpTopic } from '../models/help-topic';

interface TopicItemProps {
  topic: HelpTopic;
}

export function TopicItem({ topic }: TopicItemProps) {
  return (
    <li>
      <LinkTopic text={labelHelpTopic(topic)} topic={topic} /> – {removeTags(describeHelpTopic(topic))}
    </li>
  );
}
