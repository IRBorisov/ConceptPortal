import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { CodeMirrorWrapper } from '@/utils/codemirror';

import { type IReferenceInputState } from '../../dialogs/dlg-edit-reference/dlg-edit-reference';
import { ReferenceType } from '../../models/language';

import { RefEntity } from './parse/parser.terms';
import { ReferenceTokens } from './parse';

interface BuildReferenceSelectionOptions {
  targetType: ReferenceType;
}

export interface ReferenceSelectionContext {
  selection: {
    from: number;
    to: number;
  };
  initial: IReferenceInputState;
}

export function buildReferenceSelectionContext(
  ref: Required<ReactCodeMirrorRef>,
  { targetType }: BuildReferenceSelectionOptions
): ReferenceSelectionContext {
  const wrap = new CodeMirrorWrapper(ref);
  wrap.fixSelection(ReferenceTokens);
  const nodes = wrap.getEnvelopingNodes(ReferenceTokens);

  const initial: IReferenceInputState = {
    type: targetType,
    refRaw: '',
    text: '',
    mainRefs: [],
    basePosition: 0
  };

  if (nodes.length !== 1) {
    initial.text = wrap.getSelectionText();
  } else {
    const nodeType = nodes[0].type.id === RefEntity ? ReferenceType.ENTITY : ReferenceType.SYNTACTIC;
    if (nodeType === targetType) {
      initial.refRaw = wrap.getSelectionText();
    } else {
      initial.text = wrap.getSelectionText();
    }
  }

  const selection = wrap.getSelection();
  const mainNodes = wrap
    .getAllNodes([RefEntity])
    .filter(node => node.from >= selection.to || node.to <= selection.from);
  initial.mainRefs = mainNodes.map(node => wrap.getText(node.from, node.to));
  initial.basePosition = mainNodes.filter(node => node.to <= selection.from).length;

  return {
    selection: {
      from: selection.from,
      to: selection.to
    },
    initial
  };
}
