import { Extension } from '@codemirror/state';
import { EditorView } from '@uiw/react-codemirror';

import { IRSForm } from '../../models/rsform';
import { findAliasAt } from './utils';

const navigationProducer = (schema: IRSForm, onOpenEdit: (cstID: number) => void) => {
  return EditorView.domEventHandlers({
    click: (event: MouseEvent, view: EditorView) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (!pos) {
        return;
      }

      const { alias } = findAliasAt(pos, view.state);
      if (!alias) {
        return;
      }

      const cst = schema.cstByAlias.get(alias);
      if (!cst) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onOpenEdit(cst.id);
    }
  });
};

export function rsNavigation(schema: IRSForm, onOpenEdit: (cstID: number) => void): Extension {
  return [navigationProducer(schema, onOpenEdit)];
}
