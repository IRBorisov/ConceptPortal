import { useEffect, useState } from 'react';

function useLocalStorage<ValueType>(
  key: string,
  defaultValue: ValueType | (() => ValueType)
) {
  const [value, setValue] = useState<ValueType>(
  () => {
    const loadedJson = localStorage.getItem(key);
    if (loadedJson != null) {
      return JSON.parse(loadedJson) as ValueType;
    } else if (typeof defaultValue === 'function') {
      return (defaultValue as () => ValueType)();
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as [ValueType, typeof setValue];
}

export default useLocalStorage;
