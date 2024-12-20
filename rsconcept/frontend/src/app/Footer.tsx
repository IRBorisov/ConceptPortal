import clsx from 'clsx';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { external_urls } from '@/utils/constants';

import TextURL from '../components/ui/TextURL';

function Footer() {
  const { noNavigation, noFooter } = useConceptOptions();
  if (noNavigation || noFooter) {
    return null;
  }
  return (
    <footer
      className={clsx(
        'z-navigation',
        'mx-auto',
        'px-3 py-2 flex flex-col items-center gap-1',
        'text-xs sm:text-sm select-none whitespace-nowrap text-prim-600 bg-prim-100'
      )}
    >
      <div className='flex gap-3'>
        <TextURL text='Библиотека' href='/library' color='' />
        <TextURL text='Справка' href='/manuals' color='' />
        <TextURL text='Центр Концепт' href={external_urls.concept} color='' />
        <TextURL text='Экстеор' href='/manuals?topic=exteor' color='' />
      </div>
      <div>
        <p>© 2024 ЦИВТ КОНЦЕПТ</p>
      </div>
    </footer>
  );
}

export default Footer;
