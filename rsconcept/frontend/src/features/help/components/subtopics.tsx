import { prefixes } from '@/utils/constants';

import { HelpTopic, topicParent } from '../models/help-topic';

import { TopicItem } from './topic-item';

interface SubtopicsProps {
  headTopic: HelpTopic;
}

export function Subtopics({ headTopic }: SubtopicsProps) {
  return (
    <details>
      <summary className='text-center font-semibold'>Содержание раздела</summary>
      {Object.values(HelpTopic)
        .filter(topic => topic !== headTopic && topicParent.get(topic) === headTopic)
        .map(topic => (
          <TopicItem key={`${prefixes.topic_item}${topic}`} topic={topic} />
        ))}
    </details>
  );
}
