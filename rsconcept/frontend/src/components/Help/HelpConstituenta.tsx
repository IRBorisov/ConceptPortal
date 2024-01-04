import InfoCstStatus from '@/components/InfoCstStatus';
import Divider from '@/components/ui/Divider';

function HelpConstituenta() {
  // prettier-ignore
  return (
  <div className='leading-tight'>
    <h1>Редактор конституент</h1>
    <p><b>Сохранить изменения</b>: Ctrl + S или клик по кнопке Сохранить</p>
    <p className='mt-1'><b>Формальное определение</b>: обратите внимание на кнопки снизу<br/>Горячие клавиши указаны в подсказках при наведении</p>
    <p className='mt-1'><b>Поля Термин и Определение</b>: Ctrl + Пробел открывает диалог редактирования отсылок<br/>Перед открытием диалога переместите текстовый курсор на заменяемое слово или ссылку</p>
    <p className='mt-1'><b>Список конституент справа</b>: обратите внимание на настройки фильтрации</p>
    <p>- первая настройка - атрибуты конституенты</p>
    <p>- вторая настройка - принцип отбора конституент по графу термов</p>
    <p>- текущая конституента выделена цветом строки</p>
    <p>- двойной клик / Alt + клик - выбор редактируемой конституенты</p>
    <p>- при наведении на имя конституенты отображаются ее атрибуты</p>
    <p>- столбец "Описание" содержит один из непустых текстовых атрибутов</p>

    <Divider margins='mt-4' />
    
    <InfoCstStatus title='Статусы' />
  </div>);
}

export default HelpConstituenta;
