import { IconConsolidation, IconExecute, IconOSS } from '@/components/Icons';
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
        Базовыми операциями ОСС являются загрузка и синтез. Схема может быть загружена из другой локации (
        <b>внешняя КС</b>) или создана в ОСС (<b>собственная КС</b>). Загрузка схем, полученных синтезом в других ОСС не
        допускается. Также запрещена повторная загрузка той же КС в рамках одной ОСС.
      </p>
      <p>
        Операция синтеза в рамках ОСС задаются набором операций-аргументов и <b>таблицей отождествлений</b> понятий из
        КС, привязанных к выбранным аргументам. Таким образом{' '}
        <LinkTopic text='конституенты' topic={HelpTopic.CC_CONSTITUENTA} /> в каждой КС разделяются на исходные
        (дописанные), наследованные, отождествленные (удаляемые).
      </p>
      <p>
        После задания аргументов и таблицы отождествления необходимо единожды{' '}
        <span className='text-nowrap'>
          <IconExecute className='inline-icon icon-green' /> выполнить Синтез
        </span>
        , чтобы активировать <LinkTopic text='сквозные изменения' topic={HelpTopic.CC_PROPAGATION} />.
      </p>
      <p>
        <span className='text-nowrap'>
          <IconConsolidation className='inline-icon' /> <b>Ромбовидным синтезом</b>
        </span>{' '}
        называется операция, где используются КС, имеющие общих предков. При таком синтезе могут возникать дубликаты и
        неоднозначности в результате. Необходимо внимательно формировать таблицу отождествлений, добавляя дублирующиеся
        понятия из синтезируемых схем.
      </p>
    </div>
  );
}

export default HelpConceptOSS;
