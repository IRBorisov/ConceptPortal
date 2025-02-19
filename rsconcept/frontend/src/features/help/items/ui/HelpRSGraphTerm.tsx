import { Divider } from '@/components/Container';
import {
  IconClustering,
  IconDestroy,
  IconEdit,
  IconFilter,
  IconFitImage,
  IconGraphCollapse,
  IconGraphCore,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphMaximize,
  IconGraphOutputs,
  IconImage,
  IconNewItem,
  IconOSS,
  IconPredecessor,
  IconReset,
  IconRotate3D,
  IconText,
  IconTypeGraph
} from '@/components/Icons';
import { APP_COLORS } from '@/styling/colors';

import { LinkTopic } from '../../components/LinkTopic';
import { HelpTopic } from '../../models/helpTopic';

export function HelpRSGraphTerm() {
  return (
    <div className='flex flex-col'>
      <h1>Граф термов</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-[14rem]'>
          <h1>Настройка графа</h1>
          <li>Цвет – покраска узлов</li>
          <li>
            <IconText className='inline-icon' /> Отображение текста
          </li>
          <li>
            <IconClustering className='inline-icon' /> Скрыть порожденные
          </li>
          <li>
            <IconRotate3D className='inline-icon' /> Вращение 3D
          </li>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-[21rem]'>
          <h1>Изменение узлов</h1>
          <li>Клик на конституенту – выделение</li>
          <li>
            Alt + клик – выбор <span style={{ color: APP_COLORS.fgPurple }}>фокус-конституенты</span>
          </li>
          <li>
            <IconReset className='inline-icon' /> Esc – сбросить выделение
          </li>
          <li>
            <IconEdit className='inline-icon' /> Двойной клик – редактирование
          </li>
          <li>
            <IconDestroy className='inline-icon icon-red' /> Delete – удалить выбранные
          </li>
          <li>
            <IconNewItem className='inline-icon icon-green' /> Новая со ссылками на выделенные
          </li>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-[14rem]'>
          <h1>Общие</h1>
          <li>
            <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
          </li>
          <li>
            <IconFilter className='inline-icon' /> Открыть настройки
          </li>
          <li>
            <IconFitImage className='inline-icon' /> Вписать в экран
          </li>
          <li>
            <IconTypeGraph className='inline-icon' /> Открыть{' '}
            <LinkTopic text='граф ступеней' topic={HelpTopic.UI_TYPE_GRAPH} />
          </li>
          <li>
            <IconImage className='inline-icon' /> Сохранить в формат PNG
          </li>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-[21rem]'>
          <h1>Выделение</h1>
          <li>
            <IconGraphCollapse className='inline-icon' /> все влияющие
          </li>
          <li>
            <IconGraphExpand className='inline-icon' /> все зависимые
          </li>
          <li>
            <IconGraphMaximize className='inline-icon' /> зависимые только от выделенных
          </li>
          <li>
            <IconGraphInputs className='inline-icon' /> входящие напрямую
          </li>
          <li>
            <IconGraphOutputs className='inline-icon' /> исходящие напрямую
          </li>
          <li>
            <IconGraphCore className='inline-icon' /> выделить <LinkTopic text='Ядро' topic={HelpTopic.CC_SYSTEM} />
          </li>
          <li>
            <IconPredecessor className='inline-icon' /> выделить{' '}
            <LinkTopic text='собственные' topic={HelpTopic.CC_PROPAGATION} />
          </li>
        </div>
      </div>
    </div>
  );
}
