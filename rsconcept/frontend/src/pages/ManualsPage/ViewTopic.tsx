import InfoTopic from '../../components/Help/InfoTopic';
import { HelpTopic } from '../../models/miscelanious';

interface ViewTopicProps {
  topic: HelpTopic
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
  <div className='w-full px-2 py-2'>
    <InfoTopic topic={topic}/>
  </div>);
}

export default ViewTopic;
