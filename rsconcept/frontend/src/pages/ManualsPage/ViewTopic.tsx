import AnimateFade from '@/components/AnimateFade';
import InfoTopic from '@/components/InfoTopic';
import { HelpTopic } from '@/models/miscellaneous';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <AnimateFade key={topic} className='py-2 pl-6 pr-3 mx-auto'>
      <InfoTopic topic={topic} />
    </AnimateFade>
  );
}

export default ViewTopic;
