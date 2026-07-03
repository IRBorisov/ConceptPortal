import { useAiDialogsStore } from '@/features/ai/dialogs/ai-dialog-store';
import { useHelpDialogsStore } from '@/features/help/dialogs/help-dialog-store';
import { useLibraryDialogsStore } from '@/features/library/dialogs/library-dialog-store';
import { useOssDialogsStore } from '@/features/oss/dialogs/oss-dialog-store';
import { useRsformDialogsStore } from '@/features/rsform/dialogs/rsform-dialog-store';
import { useRsmodelDialogsStore } from '@/features/rsmodel/dialogs/rsmodel-dialog-store';

/** True when any feature dialog is open. */
export function useDialogInert() {
  const rsformActive = useRsformDialogsStore(state => state.active);
  const libraryActive = useLibraryDialogsStore(state => state.active);
  const ossActive = useOssDialogsStore(state => state.active);
  const rsmodelActive = useRsmodelDialogsStore(state => state.active);
  const aiActive = useAiDialogsStore(state => state.active);
  const helpActive = useHelpDialogsStore(state => state.active);

  return (
    rsformActive !== null ||
    libraryActive !== null ||
    ossActive !== null ||
    rsmodelActive !== null ||
    aiActive !== null ||
    helpActive !== null
  );
}
