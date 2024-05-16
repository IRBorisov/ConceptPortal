import { HelpTopic } from '@/models/miscellaneous';

import Subtopics from '../Subtopics';

function HelpInterface() {
  // prettier-ignore
  return (
  <div>
    <h1>Пользовательский интерфейс</h1>
    
    <p>Общие принципы построения интерфейса</p>
    
    <h2>Навигация и настройки</h2>
    <li>Навигационную панель можно скрыть с помощью кнопки в правом верхнем углу</li>
    <li>В меню пользователя доступен ряд настроек и управление активным профилем</li>
    <br/>

    <Subtopics headTopic={HelpTopic.INTERFACE} />
  </div>);
}

export default HelpInterface;
