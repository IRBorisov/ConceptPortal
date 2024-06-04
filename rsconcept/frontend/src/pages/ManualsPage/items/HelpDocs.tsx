import { HelpTopic } from '@/models/miscellaneous';

import Subtopics from '../Subtopics';

function HelpDocs() {
  return (
    <div>
      <h1>Документы</h1>
      <p>TBD.</p>

      <Subtopics headTopic={HelpTopic.DOCS} />
    </div>
  );
}

export default HelpDocs;
