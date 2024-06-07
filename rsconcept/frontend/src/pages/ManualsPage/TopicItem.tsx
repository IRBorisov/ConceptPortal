import { HelpTopic } from '@/models/miscellaneous';
import { describeHelpTopic, labelHelpTopic, removeTags } from '@/utils/labels';

import LinkTopic from '../../components/ui/LinkTopic';

interface TopicItemProps {
  topic: HelpTopic;
}

function TopicItem({ topic }: TopicItemProps) {
  return (
    <li>
      <LinkTopic text={labelHelpTopic(topic)} topic={topic} /> – {removeTags(describeHelpTopic(topic))}
    </li>
  );
}

export default TopicItem;
