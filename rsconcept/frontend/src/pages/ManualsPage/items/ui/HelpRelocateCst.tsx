import { IconMoveDown, IconMoveUp, IconPredecessor } from '@/components/Icons';
import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpRelocateCst() {
  return (
    <div className='text-justify'>
      <h1>Перенос конституент</h1>
      <p>
        Перенос конституент – операция, при которой выбранные конституенты переносятся в другую КС в рамках одной
        <LinkTopic text='операционной схемы синтеза' topic={HelpTopic.CC_OSS} />.
      </p>
      <li>
        только для <IconPredecessor size='1rem' className='inline-icon' /> собственных конституент схемы-источника
      </li>
      <li>
        <IconMoveUp size='1rem' className='inline-icon' />
        <IconMoveDown size='1rem' className='inline-icon' /> направление переноса - вверх или вниз по дереву синтеза
      </li>
      <li>
        при переносе вверх собственные конституенты становятся наследованными, а их копии добавляются в целевую КС
      </li>
      <li>
        при переносе вниз собственные конституенты становятся собственными конституентами целевой КС и удаляются из
        исходной КС
      </li>
      <li>при переносе вверх нельзя выбирать конституенты, зависящие от конституент КС, отличных от целевой</li>
    </div>
  );
}

export default HelpRelocateCst;
