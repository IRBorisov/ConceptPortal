'use client';

import { Tooltip } from '@/components/Container';
import { Loader } from '@/components/Loader';
import InfoConstituenta from '@/features/rsform/components/InfoConstituenta';
import { useTooltipsStore } from '@/stores/tooltips';
import { globals } from '@/utils/constants';

export const GlobalTooltips = () => {
  const hoverCst = useTooltipsStore(state => state.activeCst);

  return (
    <>
      <Tooltip
        float
        id={globals.tooltip}
        layer='z-topmost'
        place='right-start'
        className='mt-8 max-w-[20rem] break-words'
      />
      <Tooltip
        float
        id={globals.value_tooltip}
        layer='z-topmost'
        className='max-w-[calc(min(40rem,100dvw-2rem))] text-justify'
      />
      <Tooltip clickable id={globals.constituenta_tooltip} layer='z-modalTooltip' className='max-w-[30rem]'>
        {hoverCst ? <InfoConstituenta data={hoverCst} onClick={event => event.stopPropagation()} /> : <Loader />}
      </Tooltip>
    </>
  );
};
