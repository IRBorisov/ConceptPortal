import { IconCalculateAll, IconStatusOK, IconText, IconTree, IconTypeGraph } from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSModelEvaluator() {
  return (
    <div className='dense'>
      <h1>Расчет выражения</h1>
      <p>
        Вкладка позволяет проверять и вычислять произвольные выражения в контексте текущей модели без изменения
        конституент и их интерпретаций. Это удобно для отладки формул, проверки типизации и просмотра промежуточных
        результатов
      </p>

      <h2>Управление</h2>
      <ul>
        <li>в верхнем поле задается родоструктурное выражение</li>
        <li>ниже отображаются типизация, ошибки разбора и вычисленное значение</li>
        <li>
          для запуска вычисления нажмите на кнопку со <LinkTopic text='статусом' topic={HelpTopic.UI_EVAL_STATUS} /> по
          центру
        </li>
        <li>
          <IconStatusOK className='inline-icon' /> результат можно открыть в диалоге просмотра значения
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> кнопка на панели пересчитывает модель целиком
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> отображение{' '}
          <LinkTopic text='графа ступеней типизации' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> отображение{' '}
          <LinkTopic text='дерева разбора' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <IconText className='inline-icon' /> отображение текста или идентификаторов
        </li>
      </ul>
    </div>
  );
}
