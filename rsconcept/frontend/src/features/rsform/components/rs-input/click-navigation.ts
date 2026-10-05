import { type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

import { readRSContext, rsContextField } from './rs-context';
import { findAliasAt } from './utils';

/** Ctrl/Cmd + click on a global identifier opens its constituenta; reads data from {@link RSEditorContext}. */
export const rsNavigation: Extension = [
  rsContextField,
  EditorView.domEventHandlers({
    click: (event: MouseEvent, view: EditorView) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      const { schema, onOpenEdit } = readRSContext(view.state);
      if (!schema || !onOpenEdit) {
        return;
      }

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (!pos) {
        return;
      }

      const alias = findAliasAt(pos, view.state)?.alias;
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
  })
];
