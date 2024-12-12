import RequireAuth from '@/components/wrap/RequireAuth';

import FormCreateItem from './FormCreateItem';

function CreateItemPage() {
  return (
    <RequireAuth>
      <FormCreateItem />
    </RequireAuth>
  );
}

export default CreateItemPage;
