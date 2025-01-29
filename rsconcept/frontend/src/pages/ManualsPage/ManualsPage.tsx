'use client';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import useQueryStrings from '@/hooks/useQueryStrings';
import { HelpTopic } from '@/models/miscellaneous';
import { useMainHeight } from '@/stores/appLayout';
import { PARAMETER } from '@/utils/constants';

import TopicsList from './TopicsList';
import ViewTopic from './ViewTopic';

export function ManualsPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTopic = (query.get('topic') || HelpTopic.MAIN) as HelpTopic;

  const mainHeight = useMainHeight();

  function onSelectTopic(newTopic: HelpTopic) {
    router.push(urls.help_topic(newTopic));
  }

  if (!Object.values(HelpTopic).includes(activeTopic)) {
    setTimeout(() => {
      router.push(urls.page404);
    }, PARAMETER.refreshTimeout);
    return null;
  }

  return (
    <div className='flex mx-auto max-w-[80rem]' role='manuals' style={{ minHeight: mainHeight }}>
      <TopicsList activeTopic={activeTopic} onChangeTopic={topic => onSelectTopic(topic)} />
      <ViewTopic topic={activeTopic} />
    </div>
  );
}
