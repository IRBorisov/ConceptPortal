import { HelpTopic } from '@/models/miscellaneous';

import { IconInlineSynthesis, IconTemplates } from '../../../components/Icons';
import LinkTopic from '../../../components/ui/LinkTopic';

function HelpRSLangOperations() {
  return (
    <div>
      <h1>Операции над концептуальными схемами</h1>
      <p>В данном разделе поясняются различные операции над концептуальными схемами.</p>

      <h2>
        <IconTemplates size='1.25rem' className='inline-icon' /> Генерация из шаблона
      </h2>
      <p>
        Данная операция позволяет вставить конституенту из{' '}
        <LinkTopic text='шаблона выражения' topic={HelpTopic.RSL_TEMPLATES} />.
      </p>
      <br />

      <h2>
        <IconInlineSynthesis size='1.25rem' className='inline-icon' /> Встраивание
      </h2>
      <p>
        Реализация операции синтеза концептуальных схем в рамках одной концептуальной схемы. Операции заключается в
        копировании выбранного подмножества конституент из схемы-источника в текущую схему. Также задается Таблица
        отождествлений, позволяющая связать добавляемые конституенты с текущей схемой.
      </p>
    </div>
  );
}

export default HelpRSLangOperations;
