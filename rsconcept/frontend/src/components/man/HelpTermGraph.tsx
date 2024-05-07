import InfoCstClass from '@/components/info/InfoCstClass';
import InfoCstStatus from '@/components/info/InfoCstStatus';
import Divider from '@/components/ui/Divider';

function HelpTermGraph() {
  // prettier-ignore
  return (
  <div className='flex max-w-[80rem] min-w-[45rem]'>
    <div className='dense'>
      <h1>Настройка графа</h1>
      <p>Цвет – правила покраски узлов</p>
      <p>Граф – модель расположения узлов</p>
      <p>Размер – модель размера узлов</p>

      <Divider margins='my-2' />
      
      <InfoCstStatus title='Статусы конституент' />
    </div>

    <Divider vertical margins='mx-3' />
    
    <div className='dense'>
      <h1>Управление</h1>
      <p>Клик на конституенту – выделение</p>
      <p>Двойной клик – редактирование</p>
      <p>Delete – удалить выбранные</p>

      <Divider margins='my-2' />
      
      <InfoCstClass header='Классы конституент' />
    </div>
  </div>);
}

export default HelpTermGraph;
