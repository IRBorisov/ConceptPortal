'use client';

import { HelpTopic } from '@/models/miscellaneous';
import TopicPage from '@/pages/ManualsPage/TopicPage';
import { useMainHeight } from '@/stores/appLayout';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
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

export default ViewTopic;
