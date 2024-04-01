import InfoCstStatus from '@/components/info/InfoCstStatus';
import Divider from '@/components/ui/Divider';

function HelpRSFormItems() {
  // prettier-ignore
  return (
  <div className='dense'>
    <h1>Список конституент</h1>
    <p>Конституенты обладают уникальным Именем, включающим их тип</p>
    <p>Список поддерживает выделение и перемещение</p>
    <h2>Управление списком</h2>
    <p><b>Клик на строку</b> - выделение</p>
    <p><b>Shift + клик</b> - выделение нескольких</p>
    <p><b>Alt + клик</b> - Редактор</p>
    <p><b>Двойной клик</b> - Редактор</p>
    <p><b>Alt + вверх/вниз</b> - перемещение</p>
    <p><b>Delete</b> - удаление</p>
    <p><b>Alt + 1-6,Q,W</b> - добавление</p>
    <Divider margins='mt-2' />
    <InfoCstStatus title='Статусы' />
  </div>);
}

export default HelpRSFormItems;
