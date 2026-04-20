import { Divider } from '@/components/container';
import {
  IconAdmin,
  IconAlert,
  IconCalculateAll,
  IconClone,
  IconDestroy,
  IconEditor,
  IconLibrary,
  IconMenu,
  IconOwner,
  IconQR,
  IconReader,
  IconRSForm,
  IconSandbox,
  IconShare
} from '@/components/icons';

import { LinkTopic } from '../../components/link-topic';
import { HelpTopic } from '../../models/help-topic';

export function HelpRSModelMenu() {
  return (
    <div>
      <h1>Редактирование модели</h1>
      <p>
        При переходе к отдельной концептуальной модели сверху отображается меню модели и набор вкладок для просмотра
        атрибутов, состава и данных. Доступные команды зависят от прав пользователя, режима доступа и состояния модели.
      </p>

      <p>Некоторые действия могут быть недоступны в анонимном режиме или при отсутствии прав на редактирование.</p>

      <h2>Вкладки</h2>
      <ul>
        <li>
          <LinkTopic text='Паспорт' topic={HelpTopic.UI_MODEL_CARD} /> - атрибуты модели и связь с концептуальной схемой
        </li>
        <li>
          <LinkTopic text='Список' topic={HelpTopic.UI_MODEL_LIST} /> - табличная работа с конституентами модели
        </li>
        <li>
          <LinkTopic text='Понятие' topic={HelpTopic.UI_SCHEMA_EDITOR} /> – редактирование отдельной{' '}
          <LinkTopic text='Конституенты' topic={HelpTopic.CC_CONSTITUENTA} />
        </li>
        <li>
          <LinkTopic text='Граф' topic={HelpTopic.UI_GRAPH_TERM} /> – графическое представление связей конституент
        </li>
        <li>
          <LinkTopic text='Данные' topic={HelpTopic.UI_MODEL_VALUE} /> - ввод, просмотр и редактирование значений модели
        </li>
        <li>
          <LinkTopic text='Расчет' topic={HelpTopic.UI_MODEL_EVALUATOR} /> - проверка и вычисление произвольных
          выражений
        </li>
      </ul>

      <div className='flex my-3'>
        <div>
          <h2>Меню модели</h2>
          <ul>
            <li>
              <IconMenu size='1.25rem' className='inline-icon' /> Меню модели - выпадающее меню с общими функциями
            </li>
            <li>
              <IconCalculateAll className='inline-icon icon-green' /> Пересчитать модель - пересчет всех вычислений
            </li>
            <li>
              <IconShare className='inline-icon icon-primary' /> Поделиться - копирование публичной ссылки на модель
            </li>
            <li>
              <IconQR className='inline-icon icon-primary' /> QR-код - показать QR-код страницы модели
            </li>
            <li>
              <IconClone className='inline-icon icon-green' /> Клонировать - создать копию модели
            </li>
            <li>
              <IconSandbox className='inline-icon icon-green' /> Перенести в песочницу - дублировать модель в песочницу
            </li>
            <li>
              <IconDestroy className='inline-icon icon-red' /> Удалить модель - удаление модели из библиотеки
            </li>
            <li>
              <IconRSForm className='inline-icon icon-primary' /> Перейти к схеме - переход к концептуальной схеме
            </li>
            <li>
              <IconLibrary className='inline-icon icon-primary' /> Библиотека - переход в библиотеку
            </li>
          </ul>
        </div>

        <Divider vertical margins='mx-3' />

        <div className='w-72'>
          <h2>Режимы работы</h2>
          <ul>
            <li>
              <IconAlert size='1.25rem' className='inline-icon icon-red' /> работа в анонимном режиме. Переход на
              страницу логина
            </li>
            <li>
              <IconReader size='1.25rem' className='inline-icon' /> режим Читатель
            </li>
            <li>
              <IconEditor size='1.25rem' className='inline-icon' /> режим Редактор
            </li>
            <li>
              <IconOwner size='1.25rem' className='inline-icon' /> режим Владелец
            </li>
            <li>
              <IconAdmin size='1.25rem' className='inline-icon' /> режим Администратор
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
