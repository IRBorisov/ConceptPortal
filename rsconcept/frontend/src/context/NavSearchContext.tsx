import { createContext, useCallback, useContext, useState } from 'react';

interface INavSearchContext {
  query: string
  setQuery: (value: string) => void
  resetQuery: () => void
}

const NavSearchContext = createContext<INavSearchContext | null>(null);
export const useNavSearch = () => {
  const context = useContext(NavSearchContext);
  if (!context) {
    throw new Error(
      'useNavSearch has to be used within <NavSearchState.Provider>'
    );
  }
  return context;
}

interface NavSearchStateProps {
  children: React.ReactNode
}

export const NavSearchState = ({ children }: NavSearchStateProps) => {
  const [query, setQuery] = useState('');

  const resetQuery = useCallback(() => setQuery(''), []);

  return (
    <NavSearchContext.Provider value={{ 
      query, 
      setQuery,
      resetQuery: resetQuery
    }}>
      {children}
    </NavSearchContext.Provider>
  );
}
