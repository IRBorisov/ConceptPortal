import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpTypeGraph() {
  return (
    <div className='dense'>
      <h1>Граф ступеней</h1>
      <p>
        Граф связей между ступенями, используемыми в выражении или{' '}
        <LinkTopic text='схеме' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        Исторически отображался в форме мультиграфа (М-граф). Кратные ребра представлены перечислением индексов
        компонент произведения.
      </p>

      <h2>Обозначения</h2>

      <ul>
        <li>
          <span className='cc-sample-color bg-secondary' />
          ступень-основание
        </li>
        <li>
          <span className='cc-sample-color bg-accent-teal' />
          ступень-булеан
        </li>
        <li>
          <span className='cc-sample-color bg-accent-orange' />
          ступень декартова произведения
        </li>
        <li>ребра без надписей означают взятие булеана</li>
        <li>цифры на ребрах означают номера компонент декартова произведения</li>
        <li>цифры на узлах означают количество конституент в данной ступени</li>
        <li>основаниями дерева являются ступени базисных, константных множеств</li>
        <li>ступень терм-функции - произведение ступеней результата и аргументов</li>
        <li>ступень предикат-функции - произведение ступеней аргументов</li>
      </ul>
    </div>
  );
}
