'use client';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';
import TopicPage from '@/pages/ManualsPage/TopicPage';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
  const { mainHeight } = useConceptOptions();
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
