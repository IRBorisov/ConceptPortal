import { Subtopics } from '../components/subtopics';
import { HelpTopic } from '../models/help-topic';

export function HelpInfo() {
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
