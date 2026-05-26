import { useTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library';

import { IconCstType } from '@/features/rsform/components/icon-cst-type';

import {
  IconAdmin,
  IconAlert,
  IconCalculateAll,
  IconClone,
  IconDestroy,
  IconEdit2,
  IconEditor,
  IconGenerateNames,
  IconInlineSynthesis,
  IconLibrary,
  IconMenu,
  IconOwner,
  IconQR,
  IconReader,
  IconReplace,
  IconRSForm,
  IconSandbox,
  IconShare,
  IconSortList,
  IconTemplates
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelMenuRu() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.model.edit')}</h1>
      <p>
        При переходе к отдельной концептуальной модели сверху отображается меню модели и набор вкладок для просмотра
        атрибутов, состава и данных. Доступные команды зависят от прав пользователя, режима доступа и состояния модели.
      </p>

      <p>Некоторые действия могут быть недоступны в анонимном режиме или при отсутствии прав на редактирование.</p>

      <h2>{tx('tx.general.tab.plural')}</h2>
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

      <h2>{tx('tx.model.menu')}</h2>
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
          <IconSandbox className='inline-icon icon-green' /> Открыть в песочнице - дублировать модель в песочницу
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

      <h2>{tx('tx.general.editing')}</h2>
      <ul>
        <li>
          <IconEdit2 size='1.25rem' className='inline-icon' /> Операции описаны подробно в{' '}
          <LinkTopic text='разделе Экспликация' topic={HelpTopic.RSL_OPERATIONS} />.
        </li>
        <li>
          <IconTemplates size='1.25rem' className='inline-icon' /> Генерация конституент из шаблонов выражений
        </li>
        <li>
          <IconInlineSynthesis size='1.25rem' className='inline-icon' /> Вставка конституент из другой схемы
        </li>
        <li>
          <IconCstType value={CstType.NOMINAL} size='1.25rem' className='inline-icon' /> Включение формы атрибутирования
        </li>
        <li>
          <IconSortList size='1.25rem' className='inline-icon' /> Упорядочить список конституент
        </li>
        <li>
          <IconGenerateNames size='1.25rem' className='inline-icon' /> Перенумеровать конституенты в порядке объявления
        </li>
        <li>
          <IconReplace size='1.25rem' className='inline-icon' /> Отождествление конституент текущей схемы
        </li>
      </ul>

      <h2>{tx('tx.general.role.plural')}</h2>
      <ul>
        <li>
          <IconAlert size='1.25rem' className='inline-icon icon-red' /> работа в анонимном режиме. Переход на страницу
          логина
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
    </>
  );
}
