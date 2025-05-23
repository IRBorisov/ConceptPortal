import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

import { Subtopics } from '../components/subtopics';
import { HelpTopic } from '../models/help-topic';

export function HelpConcept() {
  return (
    <div className='text-justify'>
      <h1>Концептуализация</h1>
      <p>
        Сложные предметные области требуют применения специальных подходов к их пониманию и описанию.{' '}
        <b>Системный подход</b> заключается в установлении границы системы, выделении отдельных подсистем и установления
        связей между ними. Подсистемы описываются раздельно. Далее их описания синтезируются с учетом установленных
        связей. Таким образом формируется описания системы в целом через описания ее частей
      </p>
      <p>
        <b>Концептуализация</b> заключается в дедуктивном построении концептуальных схем (систем определений),
        описывающих содержательные отношения в рамках каждой подсистемы. Концептуальные схемы могут быть синтезированы
        для получения общей системы определений в выбранной предметной области.
      </p>
      <p>
        Концептуализация применяется в условиях поставленной задачи в рамках предметной области. Решаемая прикладная
        проблема позволяет определить границы концептуализации и разумно распределить ресурсы. Результатом
        концептуализации является сформированный объект управления, в отношении которого возможна выработка решений,
        реализующих поставленную задачу.
      </p>
      <p>
        В ходе многократной концептуализации и решения с помощью построенных концептуальных схем прикладных задач
        формируется навык <b>Концептуального мышления</b>. Это особый способ мышления, при котором строго контролируются
        используемые определения и предположения, в которых происходит описание предметного содержания.
      </p>

      <p>
        Более подробно Концептуализация описана в{' '}
        <TextURL text='сборнике лекций Кучкарова З.А.' href={external_urls.zak_lectures} />
        <br />
        Методы концептуального анализа и синтеза в теоретическом исследовании и проектировании социально-экономических
        систем : Учебное пособие. / З.А. Кучкаров. — М: Концепт, 2008. — 3-е издание, дополненное и исправленное.
      </p>

      <Subtopics headTopic={HelpTopic.CONCEPTUAL} />
    </div>
  );
}
