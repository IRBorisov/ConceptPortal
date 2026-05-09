export { type UnsavedPromptResult, type UnsavedSaveHandler, useUnsavedChanges } from './changes/use-unsaved-changes';
export { useConceptNavigation, useRegisterUnsavedSave } from './navigation/navigation-context';
export { urls } from './urls';
import { RouterProvider } from 'react-router';

import { Router } from './router';

export function App() {
  return <RouterProvider router={Router} />;
}
