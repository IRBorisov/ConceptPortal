import InfoCstClass from '@/components/info/InfoCstClass';
import InfoCstStatus from '@/components/info/InfoCstStatus';
import Divider from '@/components/ui/Divider';

function HelpTermGraph() {
  // prettier-ignore
  return (
  <div className='flex max-w-[80rem] min-w-[45rem]'>
    <div className='dense'>
      <h1>Настройка графа</h1>
      <p><b>Цвет</b> - выбор правила покраски узлов</p>
      <p><b>Граф</b> - выбор модели расположения узлов</p>
      <p><b>Удалить несвязанные</b> - скрыть одинокие вершины</p>
      <p><b>Транзитивная редукция</b> - скрыть транзитивные пути</p>

      <Divider margins='mt-2' />
      
      <InfoCstStatus title='Статусы конституент' />
    </div>

    <Divider vertical margins='mx-3' />
    
    <div className='dense'>
      <h1>Клавиши</h1>
      <p><b>Клик на конституенту</b> - выделение</p>
      <p><b>Клик на выделенную</b> - редактирование</p>
      <p><b>Delete</b> - удалить выбранные</p>
      <br />

      <Divider margins='mt-2' />
      
      <InfoCstClass header='Классы конституент' />
    </div>
  </div>);
}

export default HelpTermGraph;
