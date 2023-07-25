import { useEffect, useState } from 'react';

function getStorageValue<ValueType>(key: string, defaultValue: ValueType) {
  const saved = localStorage.getItem(key);
  const initial = saved ? JSON.parse(saved) : undefined;
  return initial || defaultValue;
}

const useLocalStorage =
<ValueType>(key: string, defaultValue: ValueType):
  [ValueType, React.Dispatch<React.SetStateAction<ValueType>>] => {
  const [value, setValue] = useState<ValueType>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    if (value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
