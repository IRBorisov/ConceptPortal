import LinkTopic from '@/components/ui/LinkTopic';
import { useConceptOptions } from '@/context/OptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

import {
  IconControls,
  IconEdit,
  IconList,
  IconSave,
  IconStatusOK,
  IconText,
  IconTree
} from '../../../components/Icons';

function HelpCstEditor() {
  const { colors } = useConceptOptions();
  return (
    <div className='dense'>
      <h1>Редактор конституенты</h1>
      <li>
        <IconSave className='inline-icon' /> сохранить изменения: Ctrl + S
      </li>
      <li>
        <IconEdit className='inline-icon' /> кнопка переименования справа от{' '}
        <LinkTopic text='Имени' topic={HelpTopic.CC_CONSTITUENTA} />
      </li>

      <h2>Термин и Текстовое определение</h2>
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
        <IconList className='inline-icon' /> отображение списка конституент
      </li>
      <li>
        <IconTree className='inline-icon' /> отображение{' '}
        <LinkTopic text='дерева разбора' topic={HelpTopic.UI_FORMULA_TREE} />
      </li>
      <li>Ctrl + Пробел дополняет до незанятого имени</li>

      <h2>Список конституент</h2>
      <li>фильтрация в верхней части</li>
      <li>при наведении на имя конституенты отображаются атрибуты</li>
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
