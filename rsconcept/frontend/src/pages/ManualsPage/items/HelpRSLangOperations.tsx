import { HelpTopic } from '@/models/miscellaneous';

import {
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconKeepAliasOn,
  IconKeepTermOn,
  IconReplace,
  IconSortList,
  IconTemplates
} from '../../../components/Icons';
import LinkTopic from '../../../components/ui/LinkTopic';

function HelpRSLangOperations() {
  return (
    <div>
      <h1>Операции над концептуальными схемами</h1>
      <p>В данном разделе поясняются различные операции над концептуальными схемами.</p>

      <h2>
        <IconSortList size='1.25rem' className='inline-icon' /> Упорядочение
      </h2>
      <p>
        Упорядочение списка конституент по следующим правилам
        <li>базисные и константные множества объявляются первыми</li>
        <li>
          конституенты <LinkTopic text='Ядра' topic={HelpTopic.CC_SYSTEM} /> располагаются до остальных
        </li>
        <li>
          <b>топологический порядок</b>: связи вывода от ранее объявленных к производным
        </li>
        <li>
          <LinkTopic text='порожденные' topic={HelpTopic.CC_RELATIONS} /> конституенты следуют сразу за исходной
        </li>
        <li>максимальное сохранение исходного порядка при выполнении предыдущих правил</li>
      </p>

      <h2>
        <IconGenerateNames size='1.25rem' className='inline-icon' /> Порядковые имена
      </h2>
      <p>
        Генерация имен конституент таким образом, чтобы порядок на индексах соответствовал порядка объявления
        конституент в списке. Например, <code>{'Rename({X4, X2, D1, D3}) = {X1, X2, D1, D2}'}</code>
      </p>

      <h2>
        <IconGenerateStructure size='1.25rem' className='inline-icon' /> Порождение структуры
      </h2>
      <p>
        Порождение полной совокупности термов, раскрывающих структуру выбранной конституенты. Операция применима к
        терм-функциям, термам и родовым структурам с <LinkTopic text='типизацией' topic={HelpTopic.RSL_TYPES} />{' '}
        множество и кортеж.
        <br />
        <code>{'Generate(S1∈ℬ(X1×ℬ(X1))) = {Pr1(S1), Pr2(S1), red(Pr2(S1))}'}</code>
      </p>

      <h2>
        <IconReplace size='1.25rem' className='inline-icon' /> Отождествление
      </h2>
      <p>
        Формирование таблицы отождествлений и ее применение к текущей схеме. В результате будет удален ряд конституент и
        их вхождения заменены на другие. Возможна настройка какой термин использовать для оставшихся конституент
        <li>
          <IconKeepAliasOn size='1.25rem' className='inline-icon' /> выбор сохраняемой конституенты
        </li>
        <li>
          <IconKeepTermOn size='1.25rem' className='inline-icon' /> выбор сохраняемого термина
        </li>
      </p>

      <h2>
        <IconTemplates size='1.25rem' className='inline-icon' /> Генерация из шаблона
      </h2>
      <p>
        Данная операция позволяет вставить конституенту из{' '}
        <LinkTopic text='шаблона выражения' topic={HelpTopic.RSL_TEMPLATES} />.
      </p>

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
