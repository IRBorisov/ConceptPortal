'use client';

import { useMainHeight } from '@/stores/appLayout';

import { type HelpTopic } from '../../models/helpTopic';

import { TopicPage } from './TopicPage';

interface ViewTopicProps {
  topic: HelpTopic;
}

export function ViewTopic({ topic }: ViewTopicProps) {
  const mainHeight = useMainHeight();
  return (
    <div
      key={topic}
      className='cc-fade-in py-2 px-6 mx-auto sm:mx-0 lg:px-12 overflow-y-auto'
      style={{ maxHeight: mainHeight }}
    >
      <TopicPage topic={topic} />
    </div>
  );
}
