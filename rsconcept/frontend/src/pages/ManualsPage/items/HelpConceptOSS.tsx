import { IconOSS, IconPredecessor } from '@/components/Icons';
import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpConceptOSS() {
  return (
    <div className='text-justify'>
      <h1>Операционная схема синтеза</h1>
      <p>
        Работа со сложными предметными областями требует многократного{' '}
        <LinkTopic text='синтеза' topic={HelpTopic.CC_SYNTHESIS} /> для построения целевых понятий. Последовательность
        синтезов задается с помощью{' '}
        <span className='text-nowrap'>
          <IconOSS className='inline-icon' /> <b>Операционной схемы синтеза (ОСС)</b>
        </span>{' '}
        и отображается в форме <LinkTopic text='Графа синтеза' topic={HelpTopic.UI_OSS_GRAPH} />.
      </p>
      <p>
        Отдельные операции в рамках ОСС задаются <b>таблицами отождествлений</b> понятий из синтезируемых схем. Таким
        образом <LinkTopic text='конституенты' topic={HelpTopic.CC_CONSTITUENTA} /> в каждой КС разделяются на исходные
        (дописанные), наследованные, отождествленные (удаляемые).
      </p>
      <p>
        Портал поддерживает <b>сквозные изменения</b> в рамках ОСС. Изменения, внесенные в исходные концептуальные схемы
        автоматически проносятся через граф синтеза (путем обновления наследованных конституент). Формальные определения
        наследованных конституент можно редактировать только путем изменения{' '}
        <span className='text-nowrap'>
          <IconPredecessor className='inline-icon' /> исходных конституент.
        </span>
      </p>
      <p>
        <b>Ромбовидным синтезом</b> называется операция, где используются КС, имеющие общих предков. При таком синтезе
        могут возникать дубликаты и неоднозначности в результате. Необходимо внимательно формировать таблицу
        отождествлений, добавляя дублирующиеся понятия из синтезируемых схем.
      </p>
    </div>
  );
}

export default HelpConceptOSS;
