import {
  IconAnimation,
  IconAnimationOff,
  IconChild,
  IconConnect,
  IconConsolidation,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconFitImage,
  IconGrid,
  IconImage,
  IconLineStraight,
  IconLineWave,
  IconNewItem,
  IconNewRSForm,
  IconReset,
  IconRSForm,
  IconSave
} from '@/components/Icons';
import { Divider } from '@/components/ui/Container';
import { LinkTopic } from '@/components/ui/Control';
import { HelpTopic } from '@/models/miscellaneous';

function HelpOssGraph() {
  return (
    <div className='flex flex-col'>
      <h1 className='sm:pr-[6rem]'>Граф синтеза</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-[14rem]'>
          <h1>Настройка графа</h1>
          <li>
            <IconFitImage className='inline-icon' /> Вписать в экран
          </li>
          <li>
            <IconGrid className='inline-icon' /> Отображение сетки
          </li>
          <li>
            <IconLineWave className='inline-icon' />
            <IconLineStraight className='inline-icon' /> Тип линии
          </li>
          <li>
            <IconAnimation className='inline-icon' />
            <IconAnimationOff className='inline-icon' /> Анимация
          </li>
          <li>черта сверху - Загрузка</li>
          <li>
            черта слева - КС <LinkTopic text='внешняя' topic={HelpTopic.CC_OSS} />
          </li>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-[21rem]'>
          <h1>Изменение узлов</h1>
          <li>Клик на операцию – выделение</li>
          <li>Esc – сбросить выделение</li>
          <li>
            Двойной клик – переход к связанной <LinkTopic text='КС' topic={HelpTopic.CC_SYSTEM} />
          </li>
          <li>
            <IconEdit2 className='inline-icon' /> Редактирование операции
          </li>
          <li>
            <IconNewItem className='inline-icon icon-green' /> Новая операция
          </li>
          <li>
            <IconDestroy className='inline-icon icon-red' /> Delete – удалить выбранные
          </li>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-[14rem]'>
          <h1>Общие</h1>
          <li>
            <IconReset className='inline-icon' /> Сбросить изменения
          </li>
          <li>
            <IconSave className='inline-icon' /> Сохранить положения
          </li>
          <li>
            <IconImage className='inline-icon' /> Сохранить в SVG
          </li>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-[21rem]'>
          <h1>Контекстное меню</h1>
          <li>
            <IconRSForm className='inline-icon icon-green' /> Статус связанной{' '}
            <LinkTopic text='КС' topic={HelpTopic.CC_SYSTEM} />
          </li>
          <li>
            <IconConsolidation className='inline-icon' />{' '}
            <LinkTopic text='Ромбовидный синтез' topic={HelpTopic.CC_OSS} />
          </li>
          <li>
            <IconNewRSForm className='inline-icon icon-green' /> Создать пустую КС для загрузки
          </li>
          <li>
            <IconConnect className='inline-icon' /> Выбрать КС для загрузки
          </li>
          <li>
            <IconChild className='inline-icon icon-green' />{' '}
            <LinkTopic text='Перенести конституенты' topic={HelpTopic.UI_RELOCATE_CST} />
          </li>
          <li>
            <IconExecute className='inline-icon icon-green' /> Активировать операцию
          </li>
        </div>
      </div>
    </div>
  );
}

export default HelpOssGraph;
