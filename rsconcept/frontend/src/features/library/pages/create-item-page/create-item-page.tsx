import { RequireAuth } from '@/features/auth/components/require-auth';

import { FormCreateItem } from './form-create-item';

export function CreateItemPage() {
  return (
    <RequireAuth>
      <FormCreateItem />
    </RequireAuth>
  );
}
