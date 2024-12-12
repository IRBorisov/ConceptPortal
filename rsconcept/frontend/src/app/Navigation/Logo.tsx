import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useWindowSize from '@/hooks/useWindowSize';

function Logo() {
  const { darkMode } = useConceptOptions();
  const size = useWindowSize();

  return (
    <img
      alt=''
      className='max-h-[1.6rem] w-fit max-w-[11.4rem]'
      src={size.isSmall ? '/logo_sign.svg' : !darkMode ? '/logo_full.svg' : '/logo_full_dark.svg'}
    />
  );
}
export default Logo;
