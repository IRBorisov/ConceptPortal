import { Divider } from '@/components/container';
import {
  IconAnimation,
  IconAnimationOff,
  IconChild,
  IconConceptBlock,
  IconConnect,
  IconConsolidation,
  IconCoordinates,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconFitImage,
  IconFixLayout,
  IconGrid,
  IconLineStraight,
  IconLineWave,
  IconNewItem,
  IconNewRSForm,
  IconReset,
  IconRSForm,
  IconSave,
  IconSettings
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpOssGraph() {
  return (
    <div className='flex flex-col'>
      <h1 className='sm:pr-24'>Граф синтеза</h1>
      <div className='flex flex-col sm:flex-row'>
        <div className='sm:w-56'>
          <h1>Настройка графа</h1>
          <li>
            <IconReset className='inline-icon' /> Сбросить изменения
          </li>
          <li>
            <IconFitImage className='inline-icon' /> Вписать в экран
          </li>
          <li>
            <IconFixLayout className='inline-icon' /> Исправить расположения
          </li>
          <li>
            <IconSettings className='inline-icon' /> Диалог настроек
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
          <li>
            <IconCoordinates className='inline-icon' /> Отображение координат
          </li>
          <li>черта сверху - Загрузка</li>
          <li>
            черта слева - КС <LinkTopic text='внешняя' topic={HelpTopic.CC_OSS} />
          </li>
        </div>

        <Divider vertical margins='mx-3 mt-3' className='hidden sm:block' />

        <div className='sm:w-84'>
          <h1>Изменение узлов</h1>
          <li>
            <kbd>Клик</kbd> на операцию – выделение
          </li>
          <li>
            <kbd>Esc</kbd> – сбросить выделение
          </li>
          <li>
            <kbd>Двойной клик</kbd> – переход к связанной <LinkTopic text='КС' topic={HelpTopic.CC_SYSTEM} />
          </li>
          <li>
            <IconConceptBlock className='inline-icon icon-green' /> Новый блок
          </li>
          <li>
            <IconNewItem className='inline-icon icon-green' /> Новая операция
          </li>
          <li>
            <IconEdit2 className='inline-icon' /> Редактирование узла
          </li>
          <li>
            <IconDestroy className='inline-icon icon-red' /> <kbd>Delete</kbd> – удалить выбранные
          </li>
        </div>
      </div>

      <Divider margins='my-3' className='hidden sm:block' />

      <div className='flex flex-col-reverse mb-3 sm:flex-row'>
        <div className='sm:w-56'>
          <h1>Общие</h1>
          <li>
            <IconSave className='inline-icon' /> Сохранить положения
          </li>
          <li>
            <kbd>Space</kbd> – перемещение экрана
          </li>
          <li>
            <kbd>Shift</kbd> – перемещение выделенных элементов в границах родителя
          </li>
        </div>

        <Divider vertical margins='mx-3' className='hidden sm:block' />

        <div className='dense w-84'>
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
