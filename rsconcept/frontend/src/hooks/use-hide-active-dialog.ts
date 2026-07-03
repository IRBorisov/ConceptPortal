'use client';

import { useAiDialogsStore } from '@/features/ai/dialogs/ai-dialog-store';
import { useHelpDialogsStore } from '@/features/help/dialogs/help-dialog-store';
import { useLibraryDialogsStore } from '@/features/library/dialogs/library-dialog-store';
import { useOssDialogsStore } from '@/features/oss/dialogs/oss-dialog-store';
import { useRsformDialogsStore } from '@/features/rsform/dialogs/rsform-dialog-store';
import { useRsmodelDialogsStore } from '@/features/rsmodel/dialogs/rsmodel-dialog-store';

/** Closes whichever feature dialog store currently has an active dialog. */
export function useHideActiveDialog() {
  const rsformActive = useRsformDialogsStore(state => state.active);
  const hideRsform = useRsformDialogsStore(state => state.hideDialog);
  const libraryActive = useLibraryDialogsStore(state => state.active);
  const hideLibrary = useLibraryDialogsStore(state => state.hideDialog);
  const ossActive = useOssDialogsStore(state => state.active);
  const hideOss = useOssDialogsStore(state => state.hideDialog);
  const rsmodelActive = useRsmodelDialogsStore(state => state.active);
  const hideRsmodel = useRsmodelDialogsStore(state => state.hideDialog);
  const aiActive = useAiDialogsStore(state => state.active);
  const hideAi = useAiDialogsStore(state => state.hideDialog);
  const helpActive = useHelpDialogsStore(state => state.active);
  const hideHelp = useHelpDialogsStore(state => state.hideDialog);

  return () => {
    if (rsformActive !== null) {
      hideRsform();
    } else if (libraryActive !== null) {
      hideLibrary();
    } else if (ossActive !== null) {
      hideOss();
    } else if (rsmodelActive !== null) {
      hideRsmodel();
    } else if (aiActive !== null) {
      hideAi();
    } else if (helpActive !== null) {
      hideHelp();
    }
  };
}
