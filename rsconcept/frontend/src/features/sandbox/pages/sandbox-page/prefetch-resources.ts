/**
 * Warm Vite code-split chunks used by sandbox tooltips (BadgeHelp → TopicPage) and
 * GlobalDialogs entries reachable from the sandbox editor. Best-effort; does not block UI.
 */
export function prefetchResources(): null {
  void Promise.allSettled(
    SANDBOX_PREFETCH_MODULES.map(function loadModule(load) {
      return load();
    })
  );
  return null;
}

const SANDBOX_PREFETCH_MODULES: (() => Promise<unknown>)[] = [
  () => import('@/features/help/pages/manuals-page/topic-page'),
  () => import('@/features/rsform/dialogs/dlg-create-cst'),
  () => import('@/features/rsform/dialogs/dlg-delete-cst'),
  () => import('@/features/rsform/dialogs/dlg-cst-template'),
  () => import('@/features/rsform/dialogs/dlg-edit-word-forms'),
  () => import('@/features/rsform/dialogs/dlg-rename-cst'),
  () => import('@/features/rsform/dialogs/dlg-substitute-cst'),
  () => import('@/features/rsmodel/dialogs/dlg-edit-value'),
  () => import('@/features/rsmodel/dialogs/dlg-view-value'),
  () => import('@/features/rsmodel/dialogs/dlg-edit-binding')
];
