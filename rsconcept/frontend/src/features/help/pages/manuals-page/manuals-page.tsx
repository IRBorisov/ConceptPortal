'use client';

import { urls, useConceptNavigation } from '@/app';

import { useQueryStrings } from '@/hooks/use-query-strings';
import { useMainHeight } from '@/stores/app-layout';

import { HelpTopic } from '../../models/help-topic';

import { TopicsList } from './topics-list';
import { ViewTopic } from './view-topic';

export function ManualsPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTopic = (query.get('topic') ?? HelpTopic.MAIN) as HelpTopic;

  const mainHeight = useMainHeight();

  function onSelectTopic(newTopic: HelpTopic) {
    router.push({ path: urls.help_topic(newTopic) });
  }

  if (!Object.values(HelpTopic).includes(activeTopic)) {
    router.push({ path: urls.page404, force: true });
    return null;
  }

  return (
    <div className='flex mx-auto max-w-320' role='manuals' style={{ minHeight: mainHeight }}>
      <TopicsList activeTopic={activeTopic} onChangeTopic={topic => onSelectTopic(topic)} />
      <ViewTopic topic={activeTopic} />
    </div>
  );
}
