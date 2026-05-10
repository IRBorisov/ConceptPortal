import { describeHelpTopic, labelHelpTopic } from '../labels';
import { type HelpTopic } from '../models/help-topic';

import { LinkTopic } from './link-topic';

interface TopicItemProps {
  topic: HelpTopic;
}

export function TopicItem({ topic }: TopicItemProps) {
  const description = describeHelpTopic(topic);
  const formattedDescription =
    description.length > 0 ? description.charAt(0).toLowerCase() + description.slice(1) : description;

  return (
    <li>
      <LinkTopic text={labelHelpTopic(topic)} topic={topic} /> – {formattedDescription}
    </li>
  );
}
