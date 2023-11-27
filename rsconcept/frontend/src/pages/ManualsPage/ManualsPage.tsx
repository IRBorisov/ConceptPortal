import { useCallback, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useConceptNavigation } from '../../context/NagivationContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { HelpTopic } from '../../models/miscelanious';
import TopicsList from './TopicsList';
import ViewTopic from './ViewTopic';

function ManualsPage() {
  const { navigateTo } = useConceptNavigation();
  const search = useLocation().search;
  const { mainHeight } = useConceptTheme();
  const [activeTopic, setActiveTopic] = useState<HelpTopic>(HelpTopic.MAIN);

  const navigateTopic = useCallback(
  (newTopic: HelpTopic) => {
    navigateTo(`/manuals?topic=${newTopic}`);
  }, [navigateTo]);
  

  function onSelectTopic(newTopic: HelpTopic) {
    navigateTopic(newTopic);
  }

  useLayoutEffect(() => {
    const topic = new URLSearchParams(search).get('topic') as HelpTopic;
    if (!Object.values(HelpTopic).includes(topic)) {
      navigateTopic(HelpTopic.MAIN);
      return;
    } else {
      setActiveTopic(topic);
    }
  }, [search, setActiveTopic, navigateTopic]);

  return (
  <div
    className='flex items-start justify-start w-full gap-2'
    style={{minHeight: mainHeight}}
  >
    <TopicsList 
      activeTopic={activeTopic}
      onChangeTopic={topic => onSelectTopic(topic)}
    />
    <ViewTopic topic={activeTopic} />
  </div>);
}

export default ManualsPage;
