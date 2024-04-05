import InfoCstStatus from '@/components/info/InfoCstStatus';
import Divider from '@/components/ui/Divider';

function HelpConstituenta() {
  // prettier-ignore
  return (
  <div className='dense'>
    <h1>Редактор конституент</h1>
    <p>При выделении также подсвечиваются производные и основание</p>
    <p><b>Сохранить изменения</b>: Ctrl + S или клик по кнопке Сохранить</p>
    <p className='mt-1'><b>Формальное определение</b></p>
    <p>- Ctrl + Пробел дополняет до незанятого имени</p>
    <p>- специальные конструкции вводятся с помощью кнопок снизу</p>
    <p className='mt-1'><b>Термин и Определение</b></p>
    <p>- Ctrl + Пробел открывает редактирование отсылок</p>
    <p className='mt-1'><b>Список конституент</b></p>
    <p>- первая настройка - атрибуты конституенты</p>
    <p>- вторая настройка - отбор по графу термов</p>
    <p>- текущая конституента выделена цветом строки</p>
    <p>- при наведении на имя конституенты отображаются атрибуты</p>

    <Divider margins='my-2' />
    
    <InfoCstStatus title='Статусы' />
  </div>);
}

export default HelpConstituenta;
