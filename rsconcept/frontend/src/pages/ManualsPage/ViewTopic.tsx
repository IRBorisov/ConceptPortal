import InfoTopic from '@/components/Help/InfoTopic';
import { HelpTopic } from '@/models/miscelanious';

interface ViewTopicProps {
  topic: HelpTopic
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
  <div className='w-full px-2 py-2 max-w-[80rem]'>
    <InfoTopic topic={topic}/>
  </div>);
}

export default ViewTopic;