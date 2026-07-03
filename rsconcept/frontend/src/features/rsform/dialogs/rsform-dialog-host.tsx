'use client';

import React, { Suspense } from 'react';

import { ModalLoader } from '@/components/modal';

import { RsformDialogType, useRsformDialogsStore } from './rsform-dialog-store';

const DlgStructurePlanner = React.lazy(() =>
  import('./dlg-structure-planner').then(module => ({ default: module.DlgStructurePlanner }))
);
const DlgCreateCst = React.lazy(() => import('./dlg-create-cst').then(module => ({ default: module.DlgCreateCst })));
const DlgCstTemplate = React.lazy(() =>
  import('./dlg-cst-template').then(module => ({ default: module.DlgCstTemplate }))
);
const DlgDeleteCst = React.lazy(() => import('./dlg-delete-cst').then(module => ({ default: module.DlgDeleteCst })));
const DlgEditWordForms = React.lazy(() =>
  import('./dlg-edit-word-forms').then(module => ({ default: module.DlgEditWordForms }))
);
const DlgInlineSynthesis = React.lazy(() =>
  import('./dlg-inline-synthesis').then(module => ({ default: module.DlgInlineSynthesis }))
);
const DlgRenameCst = React.lazy(() => import('./dlg-rename-cst').then(module => ({ default: module.DlgRenameCst })));
const DlgShowFlatAst = React.lazy(() => import('./dlg-show-ast').then(module => ({ default: module.DlgShowFlatAst })));
const DlgShowAstExtract = React.lazy(() =>
  import('./dlg-show-ast-extract').then(module => ({ default: module.DlgShowAstExtract }))
);
const DlgShowQR = React.lazy(() => import('./dlg-show-qr').then(module => ({ default: module.DlgShowQR })));
const DlgShowTypeGraph = React.lazy(() =>
  import('./dlg-show-type-graph').then(module => ({ default: module.DlgShowTypeGraph }))
);
const DlgSubstituteCst = React.lazy(() =>
  import('./dlg-substitute-cst').then(module => ({ default: module.DlgSubstituteCst }))
);
const DlgUploadRSForm = React.lazy(() =>
  import('./dlg-upload-rsform').then(module => ({ default: module.DlgUploadRSForm }))
);
const DlgGraphParams = React.lazy(() =>
  import('./dlg-graph-params').then(module => ({ default: module.DlgGraphParams }))
);
const DlgEditCst = React.lazy(() => import('./dlg-edit-cst').then(module => ({ default: module.DlgEditCst })));
const DlgShowTermGraph = React.lazy(() =>
  import('./dlg-show-term-graph').then(module => ({ default: module.DlgShowTermGraph }))
);

export function RsformDialogHost() {
  const active = useRsformDialogsStore(state => state.active);

  if (active === null) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoader />}>
      {(() => {
        switch (active) {
          case RsformDialogType.STRUCTURE_PLANNER:
            return <DlgStructurePlanner />;
          case RsformDialogType.CONSTITUENTA_TEMPLATE:
            return <DlgCstTemplate />;
          case RsformDialogType.CREATE_CONSTITUENTA:
            return <DlgCreateCst />;
          case RsformDialogType.DELETE_CONSTITUENTA:
            return <DlgDeleteCst />;
          case RsformDialogType.EDIT_WORD_FORMS:
            return <DlgEditWordForms />;
          case RsformDialogType.INLINE_SYNTHESIS:
            return <DlgInlineSynthesis />;
          case RsformDialogType.SHOW_FLAT_AST:
            return <DlgShowFlatAst />;
          case RsformDialogType.AST_EXTRACT_SUBTREE:
            return <DlgShowAstExtract />;
          case RsformDialogType.SHOW_TYPE_GRAPH:
            return <DlgShowTypeGraph />;
          case RsformDialogType.GRAPH_PARAMETERS:
            return <DlgGraphParams />;
          case RsformDialogType.RENAME_CONSTITUENTA:
            return <DlgRenameCst />;
          case RsformDialogType.SHOW_QR_CODE:
            return <DlgShowQR />;
          case RsformDialogType.SUBSTITUTE_CONSTITUENTS:
            return <DlgSubstituteCst />;
          case RsformDialogType.UPLOAD_RSFORM:
            return <DlgUploadRSForm />;
          case RsformDialogType.EDIT_CONSTITUENTA:
            return <DlgEditCst />;
          case RsformDialogType.SHOW_TERM_GRAPH:
            return <DlgShowTermGraph />;
        }
      })()}
    </Suspense>
  );
}
