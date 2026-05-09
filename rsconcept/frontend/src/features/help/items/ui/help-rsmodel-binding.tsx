import { IconNewItem, IconRemove, IconSearch } from '@/components/icons';

export function HelpRSModelBinding() {
  return (
    <div className='dense'>
      <h1>Редактор базовой интерпретации</h1>
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
    </div>
  );
}
