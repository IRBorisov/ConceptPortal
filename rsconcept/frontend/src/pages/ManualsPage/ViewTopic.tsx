import AnimateFade from '@/components/AnimateFade';
import InfoTopic from '@/components/InfoTopic';
import { HelpTopic } from '@/models/miscellaneous';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <AnimateFade key={topic} className='px-2 py-2 mx-auto'>
      <InfoTopic topic={topic} />
    </AnimateFade>
  );
}

export default ViewTopic;
