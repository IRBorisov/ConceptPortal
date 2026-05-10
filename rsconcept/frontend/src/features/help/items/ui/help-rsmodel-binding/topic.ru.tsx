import { useTx } from '@/i18n';

import { IconNewItem, IconRemove, IconSearch } from '@/components/icons';

export function HelpRSModelBindingRu() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.binding')}</h1>
      <p>Диалог задаёт таблицу значений элементов для неопределяемого понятия (базисного множества) в модели</p>

      <ul>
        <li>выделите строку для редактирования значения</li>
        <li>
          <IconSearch className='inline-icon' /> поиск по тексту значения элемента
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> добавить новую строку в модель
        </li>
        <li>
          <IconRemove className='inline-icon icon-red' /> удалить строку из модели
        </li>
      </ul>
    </>
  );
}
