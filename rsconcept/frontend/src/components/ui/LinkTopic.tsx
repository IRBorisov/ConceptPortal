import { urls } from '@/app/urls';
import { HelpTopic } from '@/models/miscellaneous';

import TextURL from './TextURL';

interface TextURLProps {
  text: string;
  topic: HelpTopic;
}

function LinkTopic({ text, topic }: TextURLProps) {
  return <TextURL text={text} href={urls.help_topic(topic)} />;
}

export default LinkTopic;
