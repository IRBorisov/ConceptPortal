function HelpRSFormMeta() {
  return (
  <div>
    <h1>Паспорт схемы</h1>
    <p><b>Владелец</b> - пользователь, обладающий правом редактирования</p>
    <p>Для <b>общедоступных</b> схем владельцем может стать любой пользователь</p>
    <p>Для <b>неизменных</b> схем правом редактирования обладают только администраторы</p>
    <p><b>Клонировать</b> - создать копию схемы для дальнейшего редактирования</p>
    <p><b>Отслеживание</b> - возможность видеть схему в Библиотеке и использовать фильтры</p>
    <p><b>Загрузить/Выгрузить схему</b> - взаимодействие с Экстеор через файлы формата TRS</p>
  </div>);
}

export default HelpRSFormMeta;
