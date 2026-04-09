import { IconNewItem, IconRemove, IconReset, IconText } from '@/components/icons';

export function HelpRSModelValueEdit() {
  return (
    <div className='dense'>
      <h1>Диалог значения</h1>
      <p>
        Этот диалог открывает отдельное значение в структурированном виде
      </p>
      <p>
        Единовременно отображаются элементы только одной структуры, вложенные подмножества раскрываются по клику
      </p>

      <h2>Управление</h2>
      <ul>
        <li>заголовки и подписи помогают ориентироваться по вложенным компонентам значения</li>
        <li>кликните на значение для его редактирования</li>
        <li>
          <span className='text-accent-red-foreground'>красным</span> выделены некорректные идентификаторы и множества
        </li>
        <li>
          <span className='text-accent-green-foreground'>зеленым</span> выделены результаты фильтрации
        </li>
        <li><IconReset className='inline-icon' /> показать исходное множество</li>
        <li>
          <IconText className='inline-icon' /> отображение текста или идентификаторов
        </li>
        <li>
          <IconNewItem className='inline-icon icon-green' /> добавить новый элемент в текущее множество
        </li>
        <li>
          <IconRemove className='inline-icon icon-red' /> удалить элемент из текущего множества
        </li>
      </ul>
    </div>
  );
}
