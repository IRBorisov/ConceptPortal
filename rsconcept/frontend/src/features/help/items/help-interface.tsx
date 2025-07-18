import {
  IconDarkTheme,
  IconHelp,
  IconHelpOff,
  IconLightTheme,
  IconLogin,
  IconLogout,
  IconPin,
  IconUser2
} from '@/components/icons';
import { isMac } from '@/utils/utils';

import { Subtopics } from '../components/subtopics';
import { HelpTopic } from '../models/help-topic';

export function HelpInterface() {
  return (
    <div>
      <h1>Пользовательский интерфейс</h1>

      <p>
        Интерфейс построен на основе динамических компонент с использованием рендеринга графики в браузере.
        Поддерживаются светлая и темная темы оформления.
      </p>
      <p>
        На всех активных элементах интерфейса при наведении отображаются контекстные подсказки. Некоторые элементы
        интерфейса изменяются (цвет, иконка) в зависимости от доступности соответствующего функционала.
      </p>
      <p>
        <IconHelp className='inline-icon' /> Помимо данного раздела справка предоставляется контекстно через специальную
        иконку <IconHelp className='inline-icon' />
      </p>

      <h2>Навигация и настройки</h2>
      <ul>
        <li>
          <kbd>{isMac() ? 'Cmd + клик' : 'Ctrl + клик'}</kbd> на объект навигации откроет новую вкладку
        </li>
        <li>
          <IconPin size='1.25rem' className='inline-icon' /> навигационную панель можно скрыть с помощью кнопки в правом
          верхнем углу
        </li>
        <li>
          <IconLightTheme className='inline-icon' />
          <IconDarkTheme className='inline-icon' /> переключатели темы
        </li>
        <li>
          <IconLogin size='1.25rem' className='inline-icon' /> вход в систему / регистрация нового пользователя
        </li>
        <li>
          <IconUser2 size='1.25rem' className='inline-icon' /> меню пользователя содержит ряд настроек и переход к
          профилю пользователя
        </li>

        <li>
          <IconHelp className='inline-icon' />
          <IconHelpOff className='inline-icon' /> отключение иконок контекстной справки
        </li>
        <li>
          <IconLogout className='inline-icon' /> выход из системы
        </li>
      </ul>

      <Subtopics headTopic={HelpTopic.INTERFACE} />
    </div>
  );
}
