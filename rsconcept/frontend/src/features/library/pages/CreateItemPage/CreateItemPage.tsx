import { RequireAuth } from '@/features/auth';

import { FormCreateItem } from './FormCreateItem';

export function CreateItemPage() {
  return (
    <RequireAuth>
      <FormCreateItem />
    </RequireAuth>
  );
}
