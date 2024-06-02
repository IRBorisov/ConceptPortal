import { IconEditor, IconNewItem, IconShare, IconUpload, IconVersions } from '@/components/Icons';

function HelpVersions() {
  return (
    <div className=''>
      <h1>Версионирование схем</h1>
      <p>
        Версионирование доступно <IconEditor size='1rem' className='inline-icon' /> Редакторам.
      </p>
      <p>Версионирование сохраняет текущее состояние схемы под определенным именем (версией) с доступом по ссылке.</p>
      <p>После создания версии ее содержание изменить нельзя.</p>

      <h2>Действия</h2>
      <li>
        <IconShare size='1.25rem' className='inline-icon' /> Поделиться включает версию в ссылку
      </li>
      <li>
        <IconUpload size='1.25rem' className='inline-icon icon-red' /> Загрузить версию в актуальную схему
      </li>
      <li>
        <IconNewItem size='1.25rem' className='inline-icon icon-green' /> Создать версию можно только из актуальной
        схемы
      </li>

      <li>
        <IconVersions size='1.25rem' className='inline-icon' /> Редактировать атрибуты версий
      </li>
    </div>
  );
}

export default HelpVersions;
