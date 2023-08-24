import { prefixes } from '../../utils/constants';
import { HelpTopic } from '../../utils/models';
import { mapTopicInfo } from '../../utils/staticUI';

interface TopicsListProps {
  activeTopic: HelpTopic
  onChangeTopic: (newTopic: HelpTopic) => void
}

function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  return (
    <div className='sticky top-0 left-0 border-r border-b min-w-[13rem] pt-2 select-none flex flex-col clr-bg-pop'>
      <div className='mb-2 font-bold text-center'>Справка</div>
      { [... mapTopicInfo.entries()].map(
      ([topic, info], index) => {
        return (
          <div key={`${prefixes.topic_list}${index}`}
            className={`px-3 py-1 border-y cursor-pointer clr-hover ${activeTopic === topic ? 'font-semibold underline' : ''}`}
            title={info.tooltip}
            onClick={() => onChangeTopic(topic)}
          >
            {info.text}
          </div>)
      })}
    </div>
  );
}

export default TopicsList;
