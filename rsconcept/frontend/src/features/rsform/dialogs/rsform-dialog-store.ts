import { create } from 'zustand';

import { type DlgCreateCstProps } from './dlg-create-cst/dlg-create-cst';
import { type DlgCstTemplateProps } from './dlg-cst-template/dlg-cst-template';
import { type DlgDeleteCstProps } from './dlg-delete-cst/dlg-delete-cst';
import { type DlgEditCstProps } from './dlg-edit-cst/dlg-edit-cst';
import { type DlgInlineSynthesisProps } from './dlg-inline-synthesis/dlg-inline-synthesis';
import { type DlgShowTermGraphProps } from './dlg-show-term-graph/dlg-show-term-graph';
import { type DlgShowTypeGraphProps } from './dlg-show-type-graph/dlg-show-type-graph';
import { type DlgStructurePlannerProps } from './dlg-structure-planner/dlg-structure-planner';
import { type DlgEditWordFormsProps } from './dlg-edit-word-forms';
import { type DlgRenameCstProps } from './dlg-rename-cst';
import { type DlgShowFlatAstProps } from './dlg-show-ast';
import { type DlgShowAstExtractProps } from './dlg-show-ast-extract';
import { type DlgShowQRProps } from './dlg-show-qr';
import { type DlgSubstituteCstProps } from './dlg-substitute-cst';
import { type DlgUploadRSFormProps } from './dlg-upload-rsform';

/** RSForm feature dialog identifiers. */
export const RsformDialogType = {
  CONSTITUENTA_TEMPLATE: 'constituenta-template',
  SUBSTITUTE_CONSTITUENTS: 'substitute-constituents',
  CREATE_CONSTITUENTA: 'create-constituenta',
  DELETE_CONSTITUENTA: 'delete-constituenta',
  RENAME_CONSTITUENTA: 'rename-constituenta',
  EDIT_WORD_FORMS: 'edit-word-forms',
  INLINE_SYNTHESIS: 'inline-synthesis',
  SHOW_QR_CODE: 'show-qr-code',
  SHOW_FLAT_AST: 'show-flat-ast',
  SHOW_TYPE_GRAPH: 'show-type-graph',
  GRAPH_PARAMETERS: 'graph-parameters',
  SHOW_TERM_GRAPH: 'show-term-graph',
  UPLOAD_RSFORM: 'upload-rsform',
  EDIT_CONSTITUENTA: 'edit-constituenta',
  STRUCTURE_PLANNER: 'structure-planner',
  AST_EXTRACT_SUBTREE: 'ast-extract-subtree'
} as const;
export type RsformDialogType = (typeof RsformDialogType)[keyof typeof RsformDialogType];

interface DialogProps {
  onHide?: () => void;
}

interface RsformDialogsStore {
  active: RsformDialogType | null;
  props: unknown;
  hideDialog: () => void;

  showStructurePlanner: (props: DlgStructurePlannerProps) => void;
  showCstTemplate: (props: DlgCstTemplateProps) => void;
  showCreateCst: (props: DlgCreateCstProps) => void;
  showDeleteCst: (props: DlgDeleteCstProps) => void;
  showEditWordForms: (props: DlgEditWordFormsProps) => void;
  showInlineSynthesis: (props: DlgInlineSynthesisProps) => void;
  showShowFlatAst: (props: DlgShowFlatAstProps) => void;
  showShowAstExtract: (props: DlgShowAstExtractProps) => void;
  showShowTypeGraph: (props: DlgShowTypeGraphProps) => void;
  showShowTermGraph: (props: DlgShowTermGraphProps) => void;
  showGraphParams: () => void;
  showRenameCst: (props: DlgRenameCstProps) => void;
  showQR: (props: DlgShowQRProps) => void;
  showSubstituteCst: (props: DlgSubstituteCstProps) => void;
  showUploadRSForm: (props: DlgUploadRSFormProps) => void;
  showEditCst: (props: DlgEditCstProps) => void;
}

export const useRsformDialogsStore = create<RsformDialogsStore>()(set => ({
  active: null,
  props: null,
  hideDialog: () => {
    set(state => {
      (state.props as DialogProps | null)?.onHide?.();
      return { active: null, props: null };
    });
  },

  showStructurePlanner: props => set({ active: RsformDialogType.STRUCTURE_PLANNER, props }),
  showCstTemplate: props => set({ active: RsformDialogType.CONSTITUENTA_TEMPLATE, props }),
  showCreateCst: props => set({ active: RsformDialogType.CREATE_CONSTITUENTA, props }),
  showDeleteCst: props => set({ active: RsformDialogType.DELETE_CONSTITUENTA, props }),
  showEditWordForms: props => set({ active: RsformDialogType.EDIT_WORD_FORMS, props }),
  showInlineSynthesis: props => set({ active: RsformDialogType.INLINE_SYNTHESIS, props }),
  showShowFlatAst: props => set({ active: RsformDialogType.SHOW_FLAT_AST, props }),
  showShowAstExtract: props => set({ active: RsformDialogType.AST_EXTRACT_SUBTREE, props }),
  showShowTypeGraph: props => set({ active: RsformDialogType.SHOW_TYPE_GRAPH, props }),
  showShowTermGraph: props => set({ active: RsformDialogType.SHOW_TERM_GRAPH, props }),
  showGraphParams: () => set({ active: RsformDialogType.GRAPH_PARAMETERS, props: null }),
  showRenameCst: props => set({ active: RsformDialogType.RENAME_CONSTITUENTA, props }),
  showQR: props => set({ active: RsformDialogType.SHOW_QR_CODE, props }),
  showSubstituteCst: props => set({ active: RsformDialogType.SUBSTITUTE_CONSTITUENTS, props }),
  showUploadRSForm: props => set({ active: RsformDialogType.UPLOAD_RSFORM, props }),
  showEditCst: props => set({ active: RsformDialogType.EDIT_CONSTITUENTA, props })
}));
