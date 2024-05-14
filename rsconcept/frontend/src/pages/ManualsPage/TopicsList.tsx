'use client';

import useWindowSize from '@/hooks/useWindowSize';
import { HelpTopic } from '@/models/miscellaneous';

import TopicsDropdown from './TopicsDropdown';
import TopicsStatic from './TopicsStatic';

interface TopicsListProps {
  activeTopic: HelpTopic;
  topicFolded: Map<HelpTopic, boolean>;
  onChangeTopic: (newTopic: HelpTopic) => void;
  onFoldTopic: (target: HelpTopic, showChildren: boolean) => void;
}

function TopicsList({ activeTopic, topicFolded, onChangeTopic, onFoldTopic }: TopicsListProps) {
  const size = useWindowSize();

  if (!size.isSmall) {
    return (
      <TopicsStatic
        activeTopic={activeTopic}
        onChangeTopic={onChangeTopic}
        topicFolded={topicFolded}
        onFoldTopic={onFoldTopic}
      />
    );
  } else {
    return (
      <TopicsDropdown
        activeTopic={activeTopic}
        onChangeTopic={onChangeTopic}
        topicFolded={topicFolded}
        onFoldTopic={onFoldTopic}
      />
    );
  }
}

export default TopicsList;
