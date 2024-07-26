/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as icons from '@/components/Icons';

export function IconsPage() {
  const iconsList = Object.keys(icons).filter(key => key.startsWith('Icon'));
  return (
    <div className='flex flex-col items-center px-6 py-3'>
      <h1 className='mb-6'>Всего иконок: {iconsList.length}</h1>
      <div className='grid grid-cols-4'>
        {iconsList.map((key, index) => (
          <div key={`icons_list_${index}`} className='flex flex-col items-center px-3 pb-6'>
            <p>{icons[key]({ size: '2rem' })}</p>
            <p>{key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IconsPage;
