import { HelpTopic, topicParent } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';

import TopicItem from './TopicItem';

interface SubtopicsProps {
  headTopic: HelpTopic;
}

function Subtopics({ headTopic }: SubtopicsProps) {
  return (
    <>
      <h2>Содержание раздела</h2>
      {Object.values(HelpTopic)
        .filter(topic => topic !== headTopic && topicParent.get(topic) === headTopic)
        .map(topic => (
          <TopicItem key={`${prefixes.topic_item}${topic}`} topic={topic} />
        ))}
    </>
  );
}

export default Subtopics;
