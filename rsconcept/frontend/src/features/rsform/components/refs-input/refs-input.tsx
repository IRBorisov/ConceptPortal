'use client';

import { forwardRef, useRef, useState } from 'react';
import { type Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, {
  type BasicSetupOptions,
  type ReactCodeMirrorProps,
  type ReactCodeMirrorRef
} from '@uiw/react-codemirror';
import clsx from 'clsx';
import { EditorView } from 'codemirror';

import { Label } from '@/components/input';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';
import { CodeMirrorWrapper } from '@/utils/codemirror';
import { PARAMETER } from '@/utils/constants';
import { withPreventDefault } from '@/utils/utils';

import { type IReferenceInputState } from '../../dialogs/dlg-edit-reference/dlg-edit-reference';
import { ReferenceType } from '../../models/language';
import { referenceToString } from '../../models/language-api';
import { type IRSForm } from '../../models/rsform';

import { RefEntity } from './parse/parser.terms';
import { refsNavigation } from './click-navigation';
import { NaturalLanguage, ReferenceTokens } from './parse';
import { refsHoverTooltip } from './tooltip';

const editorSetup: BasicSetupOptions = {
  highlightSpecialChars: false,
  history: true,
  drawSelection: false,
  syntaxHighlighting: false,
  defaultKeymap: true,
  historyKeymap: true,

  lineNumbers: false,
  highlightActiveLineGutter: false,
  foldGutter: false,
  dropCursor: true,
  allowMultipleSelections: false,
  indentOnInput: false,
  bracketMatching: false,
  closeBrackets: false,
  autocompletion: false,
  rectangularSelection: false,
  crosshairCursor: false,
  highlightActiveLine: false,
  highlightSelectionMatches: false,
  closeBracketsKeymap: false,
  searchKeymap: false,
  foldKeymap: false,
  completionKeymap: false,
  lintKeymap: false
};

interface RefsInputInputProps
  extends Pick<
    ReactCodeMirrorProps,
    | 'id' //
    | 'height'
    | 'minHeight'
    | 'maxHeight'
    | 'value'
    | 'className'
    | 'onFocus'
    | 'onBlur'
    | 'placeholder'
  > {
  value: string;
  resolved: string;
  onChange: (newValue: string) => void;

  schema: IRSForm;
  onOpenEdit?: (cstID: number) => void;

  label?: string;
  disabled?: boolean;
  initialValue?: string;
}

export const RefsInput = forwardRef<ReactCodeMirrorRef, RefsInputInputProps>(
  (
    {
      id, //
      label,
      disabled,
      schema,
      onOpenEdit,
      initialValue,
      value,
      resolved,
      onFocus,
      onBlur,
      onChange,
      ...restProps
    },
    ref
  ) => {
    const darkMode = usePreferencesStore(state => state.darkMode);

    const [isFocused, setIsFocused] = useState(false);

    const showEditReference = useDialogsStore(state => state.showEditReference);
    const [isEditing, setIsEditing] = useState(false);

    const internalRef = useRef<ReactCodeMirrorRef>(null);
    const thisRef = !ref || typeof ref === 'function' ? internalRef : ref;

    const cursor = !disabled ? 'cursor-text' : 'cursor-default';
    const customTheme: Extension = createTheme({
      theme: darkMode ? 'dark' : 'light',
      settings: {
        fontFamily: 'inherit',
        background: !disabled ? APP_COLORS.bgInput : APP_COLORS.bgDefault,
        foreground: APP_COLORS.fgDefault,
        caret: APP_COLORS.fgDefault
      },
      styles: [
        { tag: tags.name, color: APP_COLORS.fgPurple, cursor: 'default' }, // EntityReference
        { tag: tags.literal, color: APP_COLORS.fgTeal, cursor: 'default' }, // SyntacticReference
        { tag: tags.comment, color: APP_COLORS.fgRed } // Error
      ]
    });

    const editorExtensions = [
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ spellcheck: 'true' }),
      NaturalLanguage,
      ...(!onOpenEdit ? [] : [refsNavigation(schema, onOpenEdit)]),
      refsHoverTooltip(schema, onOpenEdit !== undefined)
    ];

    function handleFocusIn(event: React.FocusEvent<HTMLDivElement>) {
      setIsEditing(false);
      setIsFocused(true);
      if (onFocus) onFocus(event);
    }

    function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
      setIsFocused(false);
      if (onBlur) onBlur(event);
    }

    function onEditRef() {
      const wrap = new CodeMirrorWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
      wrap.fixSelection(ReferenceTokens);
      const nodes = wrap.getEnvelopingNodes(ReferenceTokens);

      const data: IReferenceInputState = {
        type: ReferenceType.ENTITY,
        refRaw: '',
        text: '',
        mainRefs: [],
        basePosition: 0
      };

      if (nodes.length !== 1) {
        data.text = wrap.getSelectionText();
      } else {
        data.type = nodes[0].type.id === RefEntity ? ReferenceType.ENTITY : ReferenceType.SYNTACTIC;
        data.refRaw = wrap.getSelectionText();
      }

      const selection = wrap.getSelection();
      const mainNodes = wrap
        .getAllNodes([RefEntity])
        .filter(node => node.from >= selection.to || node.to <= selection.from);
      data.mainRefs = mainNodes.map(node => wrap.getText(node.from, node.to));
      data.basePosition = mainNodes.filter(node => node.to <= selection.from).length;

      setIsEditing(true);
      showEditReference({
        schemaID: schema.id,
        initial: data,
        onCancel: () => {
          setIsEditing(false);
          setTimeout(() => {
            thisRef.current?.view?.focus();
          }, PARAMETER.minimalTimeout);
        },
        onSave: ref => {
          wrap.replaceWith(referenceToString(ref));
          setIsEditing(false);
          setTimeout(() => {
            thisRef.current?.view?.focus();
          }, PARAMETER.minimalTimeout);
        }
      });
    }

    function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
      if (!thisRef.current?.view) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        withPreventDefault(onEditRef)(event);
        return;
      }
    }

    return (
      <div className={clsx('flex flex-col gap-2', cursor)}>
        <Label text={label} />
        <CodeMirror
          id={id}
          ref={thisRef}
          basicSetup={editorSetup}
          theme={customTheme}
          extensions={editorExtensions}
          value={isFocused ? value : value !== initialValue || isEditing ? value : resolved}
          indentWithTab={false}
          onChange={onChange}
          editable={!disabled && !isEditing}
          onKeyDown={handleInput}
          onFocus={handleFocusIn}
          onBlur={handleFocusOut}
          {...restProps}
        />
      </div>
    );
  }
);
