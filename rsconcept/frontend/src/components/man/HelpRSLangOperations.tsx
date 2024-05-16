import { HelpTopic } from '@/models/miscellaneous';

import { IconTemplates } from '../Icons';
import LinkTopic from '../ui/LinkTopic';

function HelpRSLangOperations() {
  return (
    <div>
      <h1>Операции над концептуальными схемами</h1>
      <p>В данном разделе поясняются различные операции над концептуальными схемами</p>

      <h2>
        <IconTemplates size='1.25rem' className='inline-icon' /> Генерация из шаблона
      </h2>
      <p>
        Данная операция позволяет вставить конституенту из{' '}
        <LinkTopic text='шаблона выражения' topic={HelpTopic.RSL_TEMPLATES} />.
      </p>
    </div>
  );
}

export default HelpRSLangOperations;
