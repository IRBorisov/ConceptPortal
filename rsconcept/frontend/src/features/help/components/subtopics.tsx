import { useTx } from '@/i18n/use-tx';

import { prefixes } from '@/utils/constants';

import { HelpTopic, topicParent } from '../models/help-topic';

import { TopicItem } from './topic-item';

interface SubtopicsProps {
  headTopic: HelpTopic;
}

export function Subtopics({ headTopic }: SubtopicsProps) {
  const tx = useTx();
  return (
    <details className='text-left open:mb-3'>
      <summary className='text-center font-semibold'>{tx('tx.general.chapter.content')}</summary>
      {Object.values(HelpTopic)
        .filter(topic => topic !== headTopic && topicParent.get(topic) === headTopic)
        .map(topic => (
          <TopicItem key={`${prefixes.topic_item}${topic}`} topic={topic} />
        ))}
    </details>
  );
}
