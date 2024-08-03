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
  IconReset,
  IconRotate3D,
  IconText
} from '@/components/Icons';
import Divider from '@/components/ui/Divider';
import LinkTopic from '@/components/ui/LinkTopic';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

function HelpTermGraph() {
  const { colors } = useConceptOptions();
  return (
    <div className='flex flex-col'>
      <h1>Граф термов</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='w-full sm:w-[14rem]'>
          <h1>Настройка графа</h1>
          <li>Цвет – покраска узлов</li>
          <li>Граф – расположение</li>
          <li>Размер – размер узлов</li>
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

        <div className='w-full sm:w-[21rem]'>
          <h1>Изменение узлов</h1>
          <li>Клик на конституенту – выделение</li>
          <li>
            Ctrl + клик – выбор <span style={{ color: colors.fgPurple }}>фокус-конституенты</span>
          </li>
          <li>
            <IconReset className='inline-icon' /> Esc – сбросить выделение
          </li>
          <li>
            <IconEdit className='inline-icon' /> Двойной клик – редактирование
          </li>
          <li>
            <IconDestroy className='inline-icon' /> Delete – удалить выбранные
          </li>
          <li>
            <IconNewItem className='inline-icon' /> Новая со ссылками на выделенные
          </li>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='w-full sm:w-[14rem]'>
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
            <IconImage className='inline-icon' /> Сохранить в формат PNG
          </li>
          <li>
            * <LinkTopic text='наследованные' topic={HelpTopic.CC_OSS} /> в ОСС
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
        </div>
      </div>
    </div>
  );
}

export default HelpTermGraph;
