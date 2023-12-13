import Divider from '@/components/Common/Divider';
import InfoCstClass from '@/components/Shared/InfoCstClass';
import InfoCstStatus from '@/components/Shared/InfoCstStatus';

function HelpTermGraph() {
  return (
  <div className='flex'>
    <div> 
      <h1>Настройка графа</h1>
      <p><b>Цвет</b> - выбор правила покраски узлов</p>
      <p><b>Граф</b> - выбор модели расположения узлов</p>
      <p><b>Удалить несвязанные</b> - скрыть одинокие вершины</p>
      <p><b>Транзитивная редукция</b> - скрыть транзитивные пути</p>

      <Divider margins='mt-2' />
      
      <InfoCstStatus title='Статусы конституент' />
    </div>

    <Divider vertical margins='mx-3' />
    
    <div>
      <h1>Горячие клавиши</h1>
      <p><b>Клик на конституенту</b> - выделение, включая скрытые конституенты</p>
      <p><b>Двойной клик</b> - редактирование конституенты</p>
      <p><b>Delete</b> - удалить выбранные</p>
      <br />

      <Divider margins='mt-2' />
      
      <InfoCstClass title='Классы конституент' />
    </div>
  </div>);
}

export default HelpTermGraph;