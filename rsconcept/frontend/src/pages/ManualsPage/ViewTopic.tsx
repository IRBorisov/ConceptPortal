import InfoTopic from '@/components/Help/InfoTopic';
import { HelpTopic } from '@/models/miscelanious';

interface ViewTopicProps {
  topic: HelpTopic
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
  <div className='px-2 py-2 mx-auto'>
    <InfoTopic topic={topic}/>
  </div>);
}

export default ViewTopic;