import Divider from '@/components/ui/Divider';

import { IconDestroy, IconEdit, IconReset } from '../Icons';

function HelpTermGraph() {
  // prettier-ignore
  return (
  <div className='flex'>
    <div className='dense min-w-[18rem]'>
      <h1>Настройка графа</h1>
      <li>Цвет – правила покраски</li>
      <li>Граф – модель расположения</li>
      <li>Размер – модель размера</li>
    </div>

    <Divider vertical margins='mx-3' />
    
    <div className='dense min-w-[18rem]'>
      <h1>Управление</h1>
      <li>Клик на конституенту – выделение</li>
      <li>Ctrl + клик – выбор фокус-конституенты</li>
      <li><IconReset className='inline-icon'/> Esc – сбросить выделение</li>
      <li><IconEdit className='inline-icon'/>Двойной клик – редактирование</li>
      <li><IconDestroy className='inline-icon'/> Delete – удалить выбранные</li>
    </div>
  </div>);
}

export default HelpTermGraph;
