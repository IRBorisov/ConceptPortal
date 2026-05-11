import { useTx } from '@/i18n/use-tx';

import { IconEditor, IconNewVersion, IconShare, IconUpload, IconVersions } from '@/components/icons';

export function HelpVersionsRu() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lib.versioning')}</h1>
      <p>
        Версионирование доступно <IconEditor size='1rem' className='inline-icon' /> Редакторам.
      </p>
      <p>Версионирование сохраняет текущее состояние схемы под определенным именем (версией) с доступом по ссылке.</p>
      <p>После создания версии ее содержание изменить нельзя.</p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>
          <IconShare className='inline-icon' /> Поделиться включает версию в ссылку
        </li>
        <li>
          <IconUpload className='inline-icon icon-red' /> Загрузить версию в актуальную схему
        </li>
        <li>
          <IconNewVersion className='inline-icon icon-green' /> Создать версию можно только из актуальной схемы
        </li>

        <li>
          <IconVersions className='inline-icon' /> Редактировать атрибуты версий
        </li>
      </ul>
    </>
  );
}
