import { IconHide, IconImmutable, IconPrivate, IconProtected, IconPublic } from '@/components/Icons';

export function HelpAccess() {
  return (
    <div>
      <h1>Организация доступов</h1>
      <p>Редактирование контента осуществляется Редакторами и Владельцом.</p>
      <p>Редактирование прав и доступов осуществляется Владельцом.</p>
      <p>
        Доступ к контенту на Портале может быть ограничен владельцем каждой схемы в рамках <b>политики доступа</b>.
      </p>
      <li>
        <IconPublic className='inline-icon icon-green' /> публичная политика не ограничивает чтение схемы
      </li>
      <li>
        <IconProtected className='inline-icon icon-blue' /> защитная политика запрещает доступ для всех кроме редакторов
        и владельца схемы
      </li>
      <li>
        <IconPrivate className='inline-icon icon-red' /> личная политика оставляет доступ к схеме только владельцу
      </li>
      <li>
        <IconHide className='inline-icon' /> режим скрытия схемы из списка в Библиотеке не ограничивает доступ к схеме
        по прямой ссылке
      </li>
      <li>
        <IconImmutable className='inline-icon' /> режим защиты от редактирования предохраняет от случайных изменений
      </li>
    </div>
  );
}
