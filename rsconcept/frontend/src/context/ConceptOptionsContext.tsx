'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import InfoConstituenta from '@/components/info/InfoConstituenta';
import Loader from '@/components/ui/Loader';
import Tooltip from '@/components/ui/Tooltip';
import useLocalStorage from '@/hooks/useLocalStorage';
import { IConstituenta } from '@/models/rsform';
import { globals, PARAMETER, storage } from '@/utils/constants';
import { contextOutsideScope } from '@/utils/labels';

interface IOptionsContext {
  darkMode: boolean;
  toggleDarkMode: () => void;

  folderMode: boolean;
  setFolderMode: React.Dispatch<React.SetStateAction<boolean>>;

  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;

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
  const [darkMode, setDarkMode] = useLocalStorage(storage.themeDark, false);

  const [folderMode, setFolderMode] = useLocalStorage<boolean>(storage.librarySearchFolderMode, true);
  const [location, setLocation] = useLocalStorage<string>(storage.librarySearchLocation, '');

  const [hoverCst, setHoverCst] = useState<IConstituenta | undefined>(undefined);

  function setDarkClass(isDark: boolean) {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-color-scheme', !isDark ? 'light' : 'dark');
  }

  useEffect(() => {
    setDarkClass(darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    if (!document.startViewTransition) {
      setDarkMode(prev => !prev);
    } else {
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);

      document.startViewTransition(() => {
        flushSync(() => {
          setDarkMode(prev => !prev);
        });
      });

      setTimeout(() => document.head.removeChild(style), PARAMETER.moveDuration);
    }
  }, [setDarkMode]);

  return (
    <OptionsContext
      value={{
        darkMode,
        folderMode,
        setFolderMode,
        location,
        setLocation,
        toggleDarkMode: toggleDarkMode,
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
