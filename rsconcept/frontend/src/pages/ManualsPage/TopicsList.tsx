import { HelpTopic } from '../../models/miscelanious';
import { prefixes } from '../../utils/constants';
import { describeHelpTopic, labelHelpTopic } from '../../utils/labels';

interface TopicsListProps {
  activeTopic: HelpTopic
  onChangeTopic: (newTopic: HelpTopic) => void
}

function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  return (
    <div className='sticky top-0 left-0 border-x min-w-[13rem] select-none flex flex-col clr-controls small-caps h-fit'>
      <div className='my-2 text-lg text-center'>Справка</div>
      {Object.values(HelpTopic).map(
      (topic, index) => {
        const isActive = activeTopic === topic;
        return (
          <div key={`${prefixes.topic_list}${index}`}
            className={`px-3 py-1 border-y cursor-pointer clr-hover ${isActive ? 'clr-selected ' : ''}`}
            title={describeHelpTopic(topic)}
            onClick={() => onChangeTopic(topic)}
          >
            {labelHelpTopic(topic)}
          </div>);
      })}
    </div>
  );
}

export default TopicsList;
