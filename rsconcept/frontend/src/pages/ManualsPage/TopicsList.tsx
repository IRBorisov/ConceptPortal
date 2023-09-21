import { HelpTopic } from '../../models/miscelanious';
import { prefixes } from '../../utils/constants';
import { describeHelpTopic, labelHelpTopic } from '../../utils/labels';

interface TopicsListProps {
  activeTopic: HelpTopic
  onChangeTopic: (newTopic: HelpTopic) => void
}

function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  return (
    <div className='sticky top-0 left-0 border-r border-b min-w-[13rem] pt-2 select-none flex flex-col clr-controls'>
      <div className='mb-2 font-semibold text-center'>Справка</div>
      { Object.values(HelpTopic).map(
      (topic, index) => {
        return (
          <div key={`${prefixes.topic_list}${index}`}
            className={`px-3 py-1 border-y cursor-pointer clr-hover ${activeTopic === topic ? 'font-semibold clr-selected ' : ''}`}
            title={describeHelpTopic(topic)}
            onClick={() => onChangeTopic(topic)}
          >
            {labelHelpTopic(topic)}
          </div>)
      })}
    </div>
  );
}

export default TopicsList;
