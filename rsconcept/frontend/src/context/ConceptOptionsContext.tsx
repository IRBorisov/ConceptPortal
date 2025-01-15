'use client';

import { createContext, useContext, useState } from 'react';

import InfoConstituenta from '@/components/info/InfoConstituenta';
import Loader from '@/components/ui/Loader';
import Tooltip from '@/components/ui/Tooltip';
import { IConstituenta } from '@/models/rsform';
import { globals } from '@/utils/constants';
import { contextOutsideScope } from '@/utils/labels';

interface IOptionsContext {
  setHoverCst: (newValue: IConstituenta | undefined) => void;
}

const OptionsContext = createContext<IOptionsContext | null>(null);
export const useConceptOptions = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error(contextOutsideScope('useConceptTheme', 'ThemeState'));
  }
  return context;
};

export const OptionsState = ({ children }: React.PropsWithChildren) => {
  const [hoverCst, setHoverCst] = useState<IConstituenta | undefined>(undefined);

  return (
    <OptionsContext
      value={{
        setHoverCst
      }}
    >
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

        {children}
      </>
    </OptionsContext>
  );
};
