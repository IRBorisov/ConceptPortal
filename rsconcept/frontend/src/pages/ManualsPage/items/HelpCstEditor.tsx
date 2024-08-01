import {
  IconClone,
  IconControls,
  IconDestroy,
  IconEdit,
  IconList,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconOSS,
  IconReset,
  IconSave,
  IconStatusOK,
  IconText,
  IconTree
} from '@/components/Icons';
import LinkTopic from '@/components/ui/LinkTopic';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

function HelpCstEditor() {
  const { colors } = useConceptOptions();
  return (
    <div className='dense'>
      <h1>Редактор конституенты</h1>
      <li>
        <IconOSS className='inline-icon' /> переход к связанной <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />
      </li>
      <li>
        <IconSave className='inline-icon' /> сохранить изменения: Ctrl + S
      </li>
      <li>
        <IconReset className='inline-icon' /> сбросить несохраненные изменения
      </li>
      <li>
        <IconClone className='inline-icon icon-green' /> клонировать текущую: Alt + V
      </li>
      <li>
        <IconNewItem className='inline-icon icon-green' /> новая конституента
      </li>
      <li>
        <IconDestroy className='inline-icon icon-red' /> удаление текущей
      </li>

      <h2>Термин и Текстовое определение</h2>
      <li>
        <IconEdit className='inline-icon' /> кнопка переименования справа от{' '}
        <LinkTopic text='Имени' topic={HelpTopic.CC_CONSTITUENTA} />
      </li>
      <li>
        <IconEdit className='inline-icon' /> кнопка редактирования словоформ справа от{' '}
        <LinkTopic text='Термина' topic={HelpTopic.CC_CONSTITUENTA} />
      </li>
      <li>Ctrl + Пробел открывает редактирование отсылок</li>

      <h2>Определение понятия</h2>
      <li>
        <IconStatusOK className='inline-icon' /> индикатор статуса определения сверху
      </li>
      <li>
        <IconText className='inline-icon' /> переключение шрифта
      </li>
      <li>
        <IconControls className='inline-icon' /> специальная клавиатура и горячие клавиши
      </li>
      <li>
        <IconTree className='inline-icon' /> отображение{' '}
        <LinkTopic text='дерева разбора' topic={HelpTopic.UI_FORMULA_TREE} />
      </li>
      <li>Ctrl + Пробел дополняет до незанятого имени</li>

      <h2>Список конституент</h2>
      <li>
        <IconList className='inline-icon' /> отображение списка конституент
      </li>
      <li>
        <IconMoveDown className='inline-icon' />
        <IconMoveUp className='inline-icon' /> Alt + вверх/вниз – перемещение
      </li>
      <li>фильтрация в верхней части</li>
      <li>
        <span style={{ backgroundColor: colors.bgSelected }}>цветом фона</span> выделена текущая конституента
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgGreen50 }}>цветом фона</span> выделена{' '}
        <LinkTopic text='основа' topic={HelpTopic.CC_RELATIONS} /> текущей
      </li>
      <li>
        <span style={{ backgroundColor: colors.bgOrange50 }}>цветом фона</span> выделены{' '}
        <LinkTopic text='порожденные' topic={HelpTopic.CC_RELATIONS} /> текущей
      </li>
    </div>
  );
}

export default HelpCstEditor;
