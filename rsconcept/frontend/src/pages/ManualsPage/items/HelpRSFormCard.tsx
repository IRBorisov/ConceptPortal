import { HelpTopic } from '@/models/miscellaneous';

import {
  IconClone,
  IconDestroy,
  IconDownload,
  IconFollow,
  IconImmutable,
  IconOwner,
  IconPublic,
  IconSave
} from '../../../components/Icons';
import LinkTopic from '../../../components/ui/LinkTopic';

function HelpRSFormCard() {
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
    <li><IconDownload className='inline-icon'/> Загрузить/Выгрузить – взаимодействие с Экстеор</li>
    <li><IconDestroy className='inline-icon icon-red'/> Удалить – полностью удаляет схему из базы Портала</li>
  </div>);
}

export default HelpRSFormCard;
