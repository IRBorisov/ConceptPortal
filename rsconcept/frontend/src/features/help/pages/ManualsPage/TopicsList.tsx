'use client';

import useWindowSize from '@/hooks/useWindowSize';

import { HelpTopic } from '../../models/helpTopic';
import TopicsDropdown from './TopicsDropdown';
import TopicsStatic from './TopicsStatic';

interface TopicsListProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  const size = useWindowSize();

  if (!size.isSmall) {
    return <TopicsStatic activeTopic={activeTopic} onChangeTopic={onChangeTopic} />;
  } else {
    return <TopicsDropdown activeTopic={activeTopic} onChangeTopic={onChangeTopic} />;
  }
}

export default TopicsList;
