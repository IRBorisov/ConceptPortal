import { useConceptOptions } from '@/context/OptionsContext';

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
  // prettier-ignore
  return (
  <div className='dense'>
    <h1>Редактор конституенты</h1>
    <li><IconSave className='inline-icon'/> сохранить изменения: Ctrl + S</li>
    <li><IconEdit className='inline-icon'/> кнопка переименования справа от Имени</li>

    <h2>Термин и Текстовое определение</h2>
    <li><IconEdit className='inline-icon'/> кнопка редактирования словоформ справа от Термина</li>
    <li>Ctrl + Пробел открывает редактирование отсылок</li>
    
    <h2>Определение понятия</h2>
    <li><IconStatusOK className='inline-icon'/> индикатор статуса определения сверху</li>
    <li><IconText className='inline-icon'/> переключение шрифта</li>
    <li><IconControls className='inline-icon'/> специальная клавиатура и горячие клавиши</li>
    <li><IconList className='inline-icon'/> отображение списка конституент</li>
    <li><IconTree className='inline-icon'/> отображение дерева разбора</li>
    <li>Ctrl + Пробел дополняет до незанятого имени</li>
    
    <h2>Список конституент</h2>
    <li>фильтрация в верхней части</li>
    <li>при наведении на имя конституенты отображаются атрибуты</li>
    <li><span style={{backgroundColor: colors.bgSelected}}>цветом фона</span> выделена текущая конституента</li>
    <li><span style={{backgroundColor: colors.bgGreen50}}>цветом фона</span> выделена основа текущей</li>
    <li><span style={{backgroundColor: colors.bgOrange50}}>цветом фона</span> выделены порожденные текущей</li>
  </div>);
}

export default HelpCstEditor;
