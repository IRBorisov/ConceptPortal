import { APP_COLORS } from '@/styling/color';

import { LinkTopic } from '../../components/LinkTopic';
import { HelpTopic } from '../../models/helpTopic';

function HelpTypeGraph() {
  return (
    <div>
      <h1>Граф ступеней</h1>
      <p>
        Граф связей между ступенями, используемыми в данном выражении или{' '}
        <LinkTopic text='КС' topic={HelpTopic.CC_OSS} />. Исторически отображался в форме мультиграфа (М-граф). В
        Портале кратные ребра представлены перечислением индексов компонент произведения.
      </p>
      <li>ребра без надписей означают взятие булеана</li>
      <li>цифры на ребрах означают номера компонент декартова произведения</li>
      <li>цифры на узлах означают количество конституент в данной ступени</li>
      <li>основаниями дерева являются ступени базисных, константных множеств</li>
      <li>ступень терм-функции - произведение ступеней результата и аргументов</li>
      <li>ступень предикат-функции - произведение ступеней аргументов</li>

      <h2>Виды узлов</h2>
      <li>
        <span style={{ backgroundColor: APP_COLORS.bgControls }}>ступень-основание</span>
      </li>
      <li>
        <span style={{ backgroundColor: APP_COLORS.bgTeal }}>ступень-булеан</span>
      </li>
      <li>
        <span style={{ backgroundColor: APP_COLORS.bgOrange }}>ступень декартова произведения</span>
      </li>
    </div>
  );
}

export default HelpTypeGraph;
