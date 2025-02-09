import { describeHelpTopic, labelHelpTopic, removeTags } from '@/utils/labels';

import { LinkTopic } from '../components/LinkTopic';
import { HelpTopic } from '../models/helpTopic';

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
