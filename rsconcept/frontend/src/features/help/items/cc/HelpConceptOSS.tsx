import {
  IconConsolidation,
  IconDownload,
  IconExecute,
  IconOSS,
  IconRSFormImported,
  IconRSFormOwned,
  IconSynthesis
} from '@/components/Icons';

import { LinkTopic } from '../../components/LinkTopic';
import { HelpTopic } from '../../models/helpTopic';

export function HelpConceptOSS() {
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
        Базовыми операциями ОСС являются <IconDownload size='1rem' className='inline-icon' /> загрузка и{' '}
        <IconSynthesis size='1rem' className='inline-icon' /> синтез. Схема может быть загружена из другой локации{' '}
        <span className='text-nowrap'>
          (<IconRSFormImported size='1rem' className='inline-icon' />
          <b>внешняя КС</b>)
        </span>{' '}
        или создана в ОСС{' '}
        <span className='text-nowrap'>
          (<IconRSFormOwned size='1rem' className='inline-icon' />
          <b>собственная КС</b>)
        </span>
        . Загрузка схем, полученных синтезом в других ОСС не допускается. Также запрещена повторная загрузка той же КС в
        рамках одной ОСС.
      </p>
      <p>
        При изменении расположения или владельца ОСС соответствующие атрибуты изменяются у собственных КС. Также при
        удалении ОСС удаляются и все собственные КС. При удалении операции, собственная КС отвязывается от ОСС и
        становится свободной КС.
      </p>
      <p>
        Операция синтеза в рамках ОСС задаются набором операций-аргументов и <b>таблицей отождествлений</b> понятий из
        КС, привязанных к выбранным аргументам. Таким образом{' '}
        <LinkTopic text='конституенты' topic={HelpTopic.CC_CONSTITUENTA} /> в каждой КС разделяются на исходные и
        наследованные. При формировании таблицы отождествлений пользователю предлагается синтезировать производные
        понятия, выражения которых совпадают после проведения заданных отождествлений.
      </p>
      <p>
        После задания аргументов и таблицы отождествления необходимо единожды{' '}
        <span className='text-nowrap'>
          <IconExecute className='inline-icon icon-green' /> активировать Синтез
        </span>
        , чтобы выполнить операцию и активировать{' '}
        <LinkTopic text='сквозные изменения' topic={HelpTopic.CC_PROPAGATION} />.
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
