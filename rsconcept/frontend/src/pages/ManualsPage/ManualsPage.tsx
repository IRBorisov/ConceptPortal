'use client';

import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptTheme } from '@/context/ThemeContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { HelpTopic } from '@/models/miscellaneous';

import TopicsList from './TopicsList';
import ViewTopic from './ViewTopic';

function ManualsPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const topic = (query.get('topic') || HelpTopic.MAIN) as HelpTopic;

  const { mainHeight } = useConceptTheme();

  function onSelectTopic(newTopic: HelpTopic) {
    router.push(`/manuals?topic=${newTopic}`);
  }

  return (
    <div className='flex w-full gap-2' style={{ minHeight: mainHeight }}>
      <TopicsList activeTopic={topic} onChangeTopic={topic => onSelectTopic(topic)} />
      <ViewTopic topic={topic} />
    </div>
  );
}

export default ManualsPage;
