import Divider from '../Common/Divider';
import InfoCstStatus from './InfoCstStatus';

function HelpConstituenta() {
  return (
    <div className=''>
      <h1>Подсказки</h1>
      <p><b className='text-warning'>Изменения сохраняются ПОСЛЕ нажатия на кнопку снизу или слева вверху</b></p>
      <p><b>Клик на формальное выражение</b> - обратите внимание на кнопки снизу.<br/>Для каждой есть горячая клавиша в подсказке</p>
      <p><b>Список конституент справа</b> - обратите внимание на настройки фильтрации</p>
      <p>- слева от ввода текста настраивается набор атрибутов конституенты</p>
      <p>- справа от ввода текста настраивается список конституент, которые фильтруются</p>
      <p>- текущая конституента выделена цветом строки</p>
      <p>- двойной клик / Alt + клик - выбор редактируемой конституенты</p>
      <p>- при наведении на ID конституенты отображаются ее атрибуты</p>
      <p>- столбец "Описание" содержит один из непустых текстовых атрибутов</p>

      <Divider margins='mt-2' />
      
      <InfoCstStatus title='Статусы' />
    </div>
  );
}

export default HelpConstituenta;
