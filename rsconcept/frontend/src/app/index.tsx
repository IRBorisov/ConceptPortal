export { useConceptNavigation } from './Navigation/NavigationContext';
export { useBlockNavigation } from './Navigation/NavigationContext';
export { urls } from './urls';
import { RouterProvider } from 'react-router';

import { Router } from './Router';

function App() {
  return <RouterProvider router={Router} />;
}

export default App;
