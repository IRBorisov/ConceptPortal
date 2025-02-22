import { removeTags } from '@/utils/utils';

import { LinkTopic } from '../components/LinkTopic';
import { describeHelpTopic, labelHelpTopic } from '../labels';
import { type HelpTopic } from '../models/helpTopic';

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
