import Divider from '../Common/Divider';
import InfoCstStatus from './InfoCstStatus';

function HelpRSFormItems() {
  return (
  <div>
    <h1>Горячие клавиши</h1>
    <p><b>Двойной клик / Alt + клик</b> - редактирование конституенты</p>
    <p><b>Клик на квадрат слева</b> - выделение конституенты</p>
    <p><b>Alt + вверх/вниз</b> - движение конституент</p>
    <p><b>Delete</b> - удаление конституент</p>
    <p><b>Alt + 1-6,Q,W</b> - добавление конституент</p>
    <Divider margins='mt-2' />
    <InfoCstStatus title='Статусы' />
  </div>);
}

export default HelpRSFormItems;
