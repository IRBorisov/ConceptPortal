import { useTx } from '@/i18n/use-tx';

import { IconHide, IconImmutable, IconPrivate, IconProtected, IconPublic } from '@/components/icons';

export function HelpAccessRu() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.access.plural')}</h1>
      <p>Редактирование контента осуществляется Редакторами и Владельцом.</p>
      <p>Редактирование прав и доступов осуществляется Владельцем.</p>
      <p>
        Доступ к контенту на Портале может быть ограничен владельцем каждого объекта библиотеки в рамках{' '}
        <b>политики доступа</b>.
      </p>
      <ul>
        <li>
          <IconPublic className='inline-icon icon-green' /> публичная политика не ограничивает чтение объекта
        </li>
        <li>
          <IconProtected className='inline-icon icon-blue' /> защитная политика запрещает доступ для всех кроме
          редакторов и владельца объекта
        </li>
        <li>
          <IconPrivate className='inline-icon icon-red' /> личная политика оставляет доступ к объекту только владельцу
        </li>
        <li>
          <IconHide className='inline-icon' /> режим скрытия объекта из списка в библиотеке не ограничивает доступ к
          нему по прямой ссылке
        </li>
        <li>
          <IconImmutable className='inline-icon' /> режим защиты от редактирования предохраняет от случайных изменений
        </li>
      </ul>
    </>
  );
}
