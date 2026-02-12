import { type Extension } from '@codemirror/state';
import { EditorView } from '@uiw/react-codemirror';

import { type RSForm } from '../../models/rsform';

import { findReferenceAt } from './utils';

const navigationProducer = (schema: RSForm, onOpenEdit: (cstID: number) => void) => {
  return EditorView.domEventHandlers({
    click: (event: MouseEvent, view: EditorView) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (!pos) {
        return;
      }

      const parse = findReferenceAt(pos, view.state);
      if (!parse || !('entity' in parse.ref)) {
        return;
      }

      const cst = schema.cstByAlias.get(parse.ref.entity);
      if (!cst) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onOpenEdit(cst.id);
    }
  });
};

export function refsNavigation(schema: RSForm, onOpenEdit: (cstID: number) => void): Extension {
  return [navigationProducer(schema, onOpenEdit)];
}
