import InfoCstClass from '@/components/InfoCstClass';
import InfoCstStatus from '@/components/InfoCstStatus';
import Divider from '@/components/ui/Divider';

function HelpTermGraph() {
  // prettier-ignore
  return (
  <div className='flex max-w-[80rem]'>
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
      
      <InfoCstClass header='Классы конституент' />
    </div>
  </div>);
}

export default HelpTermGraph;
