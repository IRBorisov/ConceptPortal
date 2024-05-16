import { HelpTopic } from '@/models/miscellaneous';

import Subtopics from './Subtopics';

function HelpConceptSystem() {
  // prettier-ignore
  return (
  <div>
    <h1>Концептуализация</h1>
    <p>TBD</p>
    
    <Subtopics headTopic={HelpTopic.CONCEPTUAL} />
  </div>);
}

export default HelpConceptSystem;
