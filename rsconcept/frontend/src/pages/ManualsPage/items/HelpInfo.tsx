import { HelpTopic } from '@/models/miscellaneous';

import Subtopics from '../Subtopics';

function HelpInfo() {
  return (
    <div>
      <h1>Справочная информация и документы</h1>
      <p>
        Раздел содержит различные документы, задающие правовой статус Портала,
        <br />а также документацию для разработчиков.
      </p>

      <Subtopics headTopic={HelpTopic.INFO} />
    </div>
  );
}

export default HelpInfo;
