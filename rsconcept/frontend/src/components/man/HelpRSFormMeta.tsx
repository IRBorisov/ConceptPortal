import { HelpTopic } from '@/models/miscellaneous';

import { IconClone, IconDownload, IconFollow, IconImmutable, IconOwner, IconPublic, IconSave } from '../Icons';
import LinkTopic from '../ui/LinkTopic';

function HelpRSFormMeta() {
  // prettier-ignore
  return (
  <div className='dense'>
    <h1>Карточка схемы</h1>
    
    <p>Карточка схемы содержит общую информацию и статистику схемы</p>
    <p>Карточка схемы позволяет управлять атрибутами схемы и ее <LinkTopic text='версиями' topic={HelpTopic.VERSIONS}/></p>

    <h2>Управление</h2>
    <li><IconSave className='inline-icon'/> сохранить изменения: Ctrl + S</li>
    <li><IconOwner className='inline-icon'/> Владелец обладает правом редактирования</li>
    <li><IconPublic className='inline-icon'/> Общедоступные схемы доступны для всех</li>
    <li><IconImmutable className='inline-icon'/> Неизменные схемы редактируют только администраторы</li>
    <li><IconClone className='inline-icon'/> Клонировать – создать копию схемы</li>
    <li><IconFollow className='inline-icon'/> Отслеживание – схема в персональном списке</li>
    <li><IconDownload className='inline-icon'/> Загрузить/Выгрузить схему – взаимодействие с Экстеор</li>
  </div>);
}

export default HelpRSFormMeta;
