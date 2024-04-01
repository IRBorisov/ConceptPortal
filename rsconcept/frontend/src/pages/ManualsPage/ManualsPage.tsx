'use client';

import { urls } from '@/app/urls';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { HelpTopic } from '@/models/miscellaneous';

import TopicsList from './TopicsList';
import ViewTopic from './ViewTopic';

function ManualsPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const topic = (query.get('topic') || HelpTopic.MAIN) as HelpTopic;

  const { mainHeight } = useConceptOptions();

  function onSelectTopic(newTopic: HelpTopic) {
    router.push(urls.help_topic(newTopic));
  }

  return (
    <div className='flex w-full gap-2' style={{ minHeight: mainHeight }}>
      <TopicsList activeTopic={topic} onChangeTopic={topic => onSelectTopic(topic)} />
      <ViewTopic topic={topic} />
    </div>
  );
}

export default ManualsPage;
