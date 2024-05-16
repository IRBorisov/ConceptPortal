import { HelpTopic } from '@/models/miscellaneous';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

import LinkTopic from '../ui/LinkTopic';

interface TopicItemProps {
  topic: HelpTopic;
}

function TopicItem({ topic }: TopicItemProps) {
  return (
    <li>
      <LinkTopic text={labelHelpTopic(topic)} topic={topic} /> – {describeHelpTopic(topic)}
    </li>
  );
}

export default TopicItem;
