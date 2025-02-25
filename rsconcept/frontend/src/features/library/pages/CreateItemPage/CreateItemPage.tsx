import { RequireAuth } from '@/features/auth/components';

import { FormCreateItem } from './FormCreateItem';

export function CreateItemPage() {
  return (
    <RequireAuth>
      <FormCreateItem />
    </RequireAuth>
  );
}
