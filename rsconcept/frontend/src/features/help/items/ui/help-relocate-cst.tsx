import { IconMoveDown, IconMoveUp, IconOSS, IconPredecessor } from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRelocateCst() {
  return (
    <div className='text-justify'>
      <h1>Перенос конституент</h1>
      <p>
        Перенос конституент – операция, при которой выбранные конституенты переносятся из текущей КС (источника) в
        другую КС (целевую) в рамках одной <IconOSS size='1rem' className='inline-icon' />{' '}
        <LinkTopic text='операционной схемы синтеза' topic={HelpTopic.CC_OSS} />.
      </p>
      <li>
        только для <IconPredecessor size='1rem' className='inline-icon' /> собственных конституент источника
      </li>
      <li>
        <IconMoveUp size='1rem' className='inline-icon' />
        <IconMoveDown size='1rem' className='inline-icon' /> направление переноса - вверх или вниз по дереву синтеза
      </li>

      <h2>Перенос вверх</h2>
      <li>выбранные конституенты становятся наследованными, а их копии добавляются в целевую КС</li>
      <li>нельзя выбирать конституенты, зависящие от конституент других концептуальных схем</li>

      <h2>Перенос вниз</h2>
      <li>
        выбранные конституенты становятся собственными конституентами целевой КС, удаляются из исходной КС и ее
        наследников
      </li>
    </div>
  );
}
