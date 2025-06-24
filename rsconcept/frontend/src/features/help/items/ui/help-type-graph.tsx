import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpTypeGraph() {
  return (
    <div>
      <h1>Граф ступеней</h1>
      <p>
        Граф связей между ступенями, используемыми в данном выражении или{' '}
        <LinkTopic text='КС' topic={HelpTopic.CC_OSS} />.<br />
        Исторически отображался в форме мультиграфа (М-граф).
        <br />
        Кратные ребра представлены перечислением индексов компонент произведения.
      </p>
      <ul>
        <li>ребра без надписей означают взятие булеана</li>
        <li>цифры на ребрах означают номера компонент декартова произведения</li>
        <li>цифры на узлах означают количество конституент в данной ступени</li>
        <li>основаниями дерева являются ступени базисных, константных множеств</li>
        <li>ступень терм-функции - произведение ступеней результата и аргументов</li>
        <li>ступень предикат-функции - произведение ступеней аргументов</li>
      </ul>

      <h2>Цвета узлов</h2>

      <p className='m-0'>
        <span className='cc-sample-color bg-secondary' />
        ступень-основание
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-teal' />
        ступень-булеан
      </p>
      <p className='m-0'>
        <span className='cc-sample-color bg-accent-orange' />
        ступень декартова произведения
      </p>

      <h2>Команды</h2>
      <ul>
        <li>
          <kbd>Space</kbd> – перемещение экрана
        </li>
      </ul>
    </div>
  );
}
