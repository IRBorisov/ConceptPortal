import { prefixes } from '@/utils/constants';

import { HelpTopic, topicParent } from '../models/helpTopic';

import { TopicItem } from './TopicItem';

interface SubtopicsProps {
  headTopic: HelpTopic;
}

export function Subtopics({ headTopic }: SubtopicsProps) {
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
