import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpVersions() {
  return (
    <div className='text-justify'>
      <h1>Версионирование схем</h1>
      <p>
        Версионирование позволяет сохранить текущее состояние схемы под определенным именем (версией) и использовать
        ссылку на него для совместной работы. После создания версии ее содержание изменить нельзя
      </p>
      <li>Владелец обладает правом редактирования названий и создания новых версий</li>
      <li>
        Управление версиями происходит в <LinkTopic text='Карточке схемы' topic={HelpTopic.UI_RS_CARD} />
      </li>
      <li>Функция Поделиться включает версию в ссылку</li>
    </div>
  );
}

export default HelpVersions;
