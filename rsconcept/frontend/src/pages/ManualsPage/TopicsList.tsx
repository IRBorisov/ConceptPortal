'use client';

import useWindowSize from '@/hooks/useWindowSize';
import { HelpTopic } from '@/models/miscellaneous';

import TopicsListDropDown from './TopicsListDropdown';
import TopicsListStatic from './TopicsListStatic';

interface TopicsListProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  const size = useWindowSize();

  if (!size.isSmall) {
    return <TopicsListStatic activeTopic={activeTopic} onChangeTopic={onChangeTopic} />;
  } else {
    return <TopicsListDropDown activeTopic={activeTopic} onChangeTopic={onChangeTopic} />;
  }
}

export default TopicsList;
