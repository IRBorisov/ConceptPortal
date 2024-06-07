import { HelpTopic } from '@/models/miscellaneous';

import Subtopics from '../Subtopics';

function HelpInfo() {
  return (
    <div>
      <h1>Документы</h1>
      <p>TBD.</p>

      <Subtopics headTopic={HelpTopic.INFO} />
    </div>
  );
}

export default HelpInfo;
