import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogType, useDialogsStore } from './dialogs';

interface DialogMethodCase {
  method: keyof ReturnType<typeof useDialogsStore.getState>;
  expectedType: DialogType;
  withProps: boolean;
}

const dialogMethodCases: DialogMethodCase[] = [
  { method: 'showVideo', expectedType: DialogType.SHOW_VIDEO, withProps: true },
  { method: 'showStructurePlanner', expectedType: DialogType.STRUCTURE_PLANNER, withProps: true },
  { method: 'showCstTemplate', expectedType: DialogType.CONSTITUENTA_TEMPLATE, withProps: true },
  { method: 'showCreateCst', expectedType: DialogType.CREATE_CONSTITUENTA, withProps: true },
  { method: 'showCreateSynthesis', expectedType: DialogType.CREATE_SYNTHESIS, withProps: true },
  { method: 'showCreateBlock', expectedType: DialogType.CREATE_BLOCK, withProps: true },
  { method: 'showDeleteCst', expectedType: DialogType.DELETE_CONSTITUENTA, withProps: true },
  { method: 'showEditEditors', expectedType: DialogType.EDIT_EDITORS, withProps: true },
  { method: 'showEditOperation', expectedType: DialogType.EDIT_OPERATION, withProps: true },
  { method: 'showEditBlock', expectedType: DialogType.EDIT_BLOCK, withProps: true },
  { method: 'showEditVersions', expectedType: DialogType.EDIT_VERSIONS, withProps: true },
  { method: 'showEditWordForms', expectedType: DialogType.EDIT_WORD_FORMS, withProps: true },
  { method: 'showInlineSynthesis', expectedType: DialogType.INLINE_SYNTHESIS, withProps: true },
  { method: 'showShowFlatAst', expectedType: DialogType.SHOW_FLAT_AST, withProps: true },
  { method: 'showShowAstExtract', expectedType: DialogType.AST_EXTRACT_SUBTREE, withProps: true },
  { method: 'showShowTypeGraph', expectedType: DialogType.SHOW_TYPE_GRAPH, withProps: true },
  { method: 'showShowTermGraph', expectedType: DialogType.SHOW_TERM_GRAPH, withProps: true },
  { method: 'showChangeInputSchema', expectedType: DialogType.CHANGE_INPUT_SCHEMA, withProps: true },
  { method: 'showChangeLocation', expectedType: DialogType.CHANGE_LOCATION, withProps: true },
  { method: 'showCloneLibraryItem', expectedType: DialogType.CLONE_LIBRARY_ITEM, withProps: true },
  { method: 'showCreateVersion', expectedType: DialogType.CREATE_VERSION, withProps: true },
  { method: 'showDeleteOperation', expectedType: DialogType.DELETE_OPERATION, withProps: true },
  { method: 'showDeleteReference', expectedType: DialogType.DELETE_REFERENCE, withProps: true },
  { method: 'showGraphParams', expectedType: DialogType.GRAPH_PARAMETERS, withProps: false },
  { method: 'showOssOptions', expectedType: DialogType.OSS_SETTINGS, withProps: false },
  { method: 'showRelocateConstituents', expectedType: DialogType.RELOCATE_CONSTITUENTS, withProps: true },
  { method: 'showRenameCst', expectedType: DialogType.RENAME_CONSTITUENTA, withProps: true },
  { method: 'showQR', expectedType: DialogType.SHOW_QR_CODE, withProps: true },
  { method: 'showSubstituteCst', expectedType: DialogType.SUBSTITUTE_CONSTITUENTS, withProps: true },
  { method: 'showUploadRSForm', expectedType: DialogType.UPLOAD_RSFORM, withProps: true },
  { method: 'showEditCst', expectedType: DialogType.EDIT_CONSTITUENTA, withProps: true },
  { method: 'showCreateSchema', expectedType: DialogType.CREATE_SCHEMA, withProps: true },
  { method: 'showImportSchema', expectedType: DialogType.IMPORT_SCHEMA, withProps: true },
  { method: 'showModelEditValue', expectedType: DialogType.MODEL_EDIT_VALUE, withProps: true },
  { method: 'showModelViewValue', expectedType: DialogType.MODEL_VIEW_VALUE, withProps: true },
  { method: 'showModelEditBinding', expectedType: DialogType.MODEL_EDIT_BINDING, withProps: true },
  { method: 'showAIPrompt', expectedType: DialogType.AI_PROMPT, withProps: false },
  { method: 'showCreatePromptTemplate', expectedType: DialogType.CREATE_PROMPT_TEMPLATE, withProps: true }
];

describe('useDialogsStore', () => {
  beforeEach(() => {
    useDialogsStore.setState({ active: null, props: null });
  });

  it.each(dialogMethodCases)('$method sets active and props correctly', ({ method, expectedType, withProps }) => {
    const props = withProps ? { id: expectedType } : undefined;
    const state = useDialogsStore.getState();

    const fn = state[method] as (arg?: unknown) => void;
    fn(props);

    const next = useDialogsStore.getState();
    expect(next.active).toBe(expectedType);
    expect(next.props).toBe(withProps ? props : null);
  });

  it('hideDialog calls onHide and resets state', () => {
    const onHide = vi.fn();
    useDialogsStore.setState({ active: DialogType.SHOW_VIDEO, props: { onHide } });

    useDialogsStore.getState().hideDialog();

    const state = useDialogsStore.getState();
    expect(onHide).toHaveBeenCalledOnce();
    expect(state.active).toBeNull();
    expect(state.props).toBeNull();
  });

  it('hideDialog does not fail when props are null', () => {
    useDialogsStore.setState({ active: DialogType.SHOW_VIDEO, props: null });

    expect(() => useDialogsStore.getState().hideDialog()).not.toThrow();

    const state = useDialogsStore.getState();
    expect(state.active).toBeNull();
    expect(state.props).toBeNull();
  });
});
