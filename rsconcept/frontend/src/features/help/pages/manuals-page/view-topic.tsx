'use client';

import { useMainHeight } from '@/stores/app-layout';

import { type HelpTopic } from '../../models/help-topic';

import { TopicPage } from './topic-page';

interface ViewTopicProps {
  topic: HelpTopic;
}

export function ViewTopic({ topic }: ViewTopicProps) {
  const mainHeight = useMainHeight();
  return (
    <div key={topic} className='py-2 px-6 mx-auto sm:mx-0 lg:px-12 overflow-y-auto' style={{ maxHeight: mainHeight }}>
      <TopicPage topic={topic} />
    </div>
  );
}
