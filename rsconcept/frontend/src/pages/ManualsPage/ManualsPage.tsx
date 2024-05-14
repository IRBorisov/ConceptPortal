'use client';

import { useCallback, useState } from 'react';

import { urls } from '@/app/urls';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useConceptOptions } from '@/context/OptionsContext';
import useQueryStrings from '@/hooks/useQueryStrings';
import { HelpTopic, topicParent } from '@/models/miscellaneous';

import TopicsList from './TopicsList';
import ViewTopic from './ViewTopic';

function ManualsPage() {
  const router = useConceptNavigation();
  const query = useQueryStrings();
  const activeTopic = (query.get('topic') || HelpTopic.MAIN) as HelpTopic;
  const [topicFolded, setFolded] = useState<Map<HelpTopic, boolean>>(
    new Map(
      Object.values(HelpTopic).map(value => {
        const topic = value as HelpTopic;
        return [
          topic,
          topicParent.get(activeTopic) !== topic && topicParent.get(topicParent.get(activeTopic)!) !== topic
        ];
      })
    )
  );

  const { mainHeight } = useConceptOptions();
  const onFoldTopic = useCallback(
    (target: HelpTopic, showChildren: boolean) => {
      if (topicFolded.get(target) === !showChildren) {
        return;
      }
      setFolded(
        new Map(
          Object.values(HelpTopic).map(value => {
            const topic = value as HelpTopic;
            if (topic === target) {
              return [topic, !showChildren];
            }
            if (
              !showChildren &&
              (topicParent.get(topic) === target || topicParent.get(topicParent.get(topic)!) === target)
            ) {
              return [topic, true];
            }
            const oldValue = topicFolded.get(topic)!;
            return [topic, oldValue];
          })
        )
      );
    },
    [topicFolded]
  );

  const onSelectTopic = useCallback(
    (newTopic: HelpTopic) => {
      router.push(urls.help_topic(newTopic));
    },
    [router]
  );

  return (
    <div className='flex w-full gap-2' style={{ minHeight: mainHeight }}>
      <TopicsList
        activeTopic={activeTopic}
        onChangeTopic={topic => onSelectTopic(topic)}
        topicFolded={topicFolded}
        onFoldTopic={onFoldTopic}
      />
      <ViewTopic topic={activeTopic} />
    </div>
  );
}

export default ManualsPage;
