'use client';

import { AiDialogHost } from '@/features/ai/dialogs/ai-dialog-host';
import { HelpDialogHost } from '@/features/help/dialogs/help-dialog-host';
import { LibraryDialogHost } from '@/features/library/dialogs/library-dialog-host';

/** Dialog hosts for modals reachable from the app shell (navigation, library, help). */
export function AppShellDialogHosts() {
  return (
    <>
      <HelpDialogHost />
      <AiDialogHost />
      <LibraryDialogHost />
    </>
  );
}
