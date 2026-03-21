import { removeTags } from '@/utils/format';

import { describeHelpTopic, labelHelpTopic } from '../labels';
import { type HelpTopic } from '../models/help-topic';

import { LinkTopic } from './link-topic';

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
