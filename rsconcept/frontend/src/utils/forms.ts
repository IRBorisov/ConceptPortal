/** Utility types for Tanstack forms. */

import { type ReactNode } from 'react';

/** Generic field state interface. */
export interface FieldStateData<TValue> {
  state: {
    value: TValue;
    meta: {
      errors: { message?: string; }[];
    };
  };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
}

export interface CreateFieldProps<TValue> {
  children: (field: FieldStateData<TValue>) => ReactNode;
}
