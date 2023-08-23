import { useCallback, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { HelpTopic } from '../../utils/models';
import TopicsList from './TopicsList';
import ViewTopic from './ViewTopic';

function ManualsPage() {
  const navigate = useNavigate();
  const search = useLocation().search;
  const [activeTopic, setActiveTopic] = useState<HelpTopic>(HelpTopic.MAIN);

  const navigateTo = useCallback(
  (newTopic: HelpTopic) => {
    navigate(`/manuals?topic=${newTopic}`);
  }, [navigate]);
  

  function onSelectTopic(newTopic: HelpTopic) {
    navigateTo(newTopic);
  }

  useLayoutEffect(() => {
    const topic = new URLSearchParams(search).get('topic') as HelpTopic;
    if (!Object.values(HelpTopic).includes(topic)) {
      navigateTo(HelpTopic.MAIN);
      return;
    } else {
      setActiveTopic(topic);
    }
  }, [search, setActiveTopic, navigateTo]);

  return (
    <div className='flex w-full gap-2 justify-stretch'>
      <TopicsList 
        activeTopic={activeTopic}
        onChangeTopic={topic => onSelectTopic(topic)}
      />
      <ViewTopic 
        topic={activeTopic}
      />
    </div>
  );
}

export default ManualsPage;
