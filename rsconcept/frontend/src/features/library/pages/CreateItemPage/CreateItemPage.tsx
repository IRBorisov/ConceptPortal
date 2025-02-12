import { RequireAuth } from '@/features/auth';

import FormCreateItem from './FormCreateItem';

function CreateItemPage() {
  return (
    <RequireAuth>
      <FormCreateItem />
    </RequireAuth>
  );
}

export default CreateItemPage;
