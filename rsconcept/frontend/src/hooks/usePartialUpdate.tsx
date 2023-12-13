'use client';

import { useReducer } from 'react';

function usePartialUpdate<ValueType>(initialValue: ValueType) {
  const [value, updateValue] = useReducer(
    (data: ValueType, newData: Partial<ValueType>) => ({
      ...data,
      ...newData,
    }),
    initialValue
  );

  return [value, updateValue] as [ValueType, typeof updateValue];
}

export default usePartialUpdate;