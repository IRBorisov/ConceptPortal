import { HelpTopic } from '@/models/miscellaneous';

import LinkTopic from '../ui/LinkTopic';

function HelpRSLangCorrect() {
  return (
    <div className='text-justify'>
      <h1>Переносимость и корректность</h1>
      <p>
        <b>Биективная переносимость выражений</b> заключается в независимости значений определений от биективной замены
        интерпретаций неопределяемых понятий. Она основана на принципиальной не сравнимости элементов базисных множеств.
      </p>
      <p>
        Проверка выражений, содержащих глобальные идентификаторы проводится в заданном глобальном контексте (известны
        типизации и биективная переносимость, информация об аргументах функций). Все неизвестные идентификаторы
        считаются некорректными.
      </p>
      <p>
        Правила проверки теоретико-множественных выражений выводятся из условия биективной переносимости предиката
        принадлежности – элемент должен соответствовать множеству, для которого проверяется принадлежность. Необходимым
        условием биективной переносимости является выполнение{' '}
        <LinkTopic text='соотношения типизации' topic={HelpTopic.RSL_TYPES} /> для всех локальных и глобальных
        идентификаторов.
      </p>
      <p>
        Логическая корректность (непротиворечивость) выражений в общем случае не может быть автоматически проверена.
        Однако наличие примера интерпретации на объектах предметной области является основанием утверждения о
        непротиворечивости накладываемых аксиом.
      </p>
      <p>
        Редактор выражений на Портале оснащен инструментами проверки выражений и вычисления их типизации. Найденные
        ошибки диагностируются и выводится соответствующее сообщение об ошибке.
      </p>
    </div>
  );
}

export default HelpRSLangCorrect;
