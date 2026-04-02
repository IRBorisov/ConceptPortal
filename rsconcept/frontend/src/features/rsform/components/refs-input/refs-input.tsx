'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
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
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';
import { CodeMirrorWrapper } from '@/utils/codemirror';
import { withPreventDefault } from '@/utils/utils';

import { ReferenceType } from '../../models/language';
import { referenceToString } from '../../models/language-api';
import { type RSForm } from '../../models/rsform';

import { refsNavigation } from './click-navigation';
import { InlineReferenceEntityEditor } from './inline-entity';
import { InlineReferenceSyntacticEditor } from './inline-syntactic';
import { NaturalLanguage } from './parse';
import { buildReferenceSelectionContext } from './selection';
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
    | 'id'
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

  schema: RSForm;
  onOpenEdit?: (cstID: number) => void;

  label?: string;
  disabled?: boolean;
  initialValue?: string;
}

export const RefsInput = forwardRef<ReactCodeMirrorRef, RefsInputInputProps>(
  (
    { label, disabled, schema, onOpenEdit, initialValue, value, resolved, onFocus, onBlur, onChange, ...restProps },
    ref
  ) => {
    const darkMode = usePreferencesStore(state => state.darkMode);

    const [isFocused, setIsFocused] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [entityEditor, setEntityEditor] = useState<{
    initial: ReturnType<typeof buildReferenceSelectionContext>['initial'];
    selection: {
      from: number;
      to: number;
    };
    position: {
      top: number;
      left: number;
    };
    } | null>(null);
    const [syntacticEditor, setSyntacticEditor] = useState<{
    initial: ReturnType<typeof buildReferenceSelectionContext>['initial'];
    selection: {
      from: number;
      to: number;
    };
    position: {
      top: number;
      left: number;
    };
    } | null>(null);

    const internalRef = useRef<ReactCodeMirrorRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
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
      { tag: tags.name, color: APP_COLORS.fgPurple, cursor: 'default' },
      { tag: tags.literal, color: APP_COLORS.fgTeal, cursor: 'default' },
      { tag: tags.comment, color: APP_COLORS.fgRed }
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
    setIsFocused(true);
    if (onFocus) onFocus(event);
  }

    function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  }

    const closeInlineEditor = useCallback(() => {
    setEntityEditor(null);
    setSyntacticEditor(null);
    setIsEditing(false);
    thisRef.current?.view?.focus();
    }, [thisRef]);

    useEffect(() => {
    if (!entityEditor && !syntacticEditor) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeInlineEditor();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
    }, [closeInlineEditor, entityEditor, syntacticEditor]);

    function getInlineEditorPosition(selection: { from: number; to: number }) {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    const wrapper = wrapperRef.current;
    if (!cmRef?.view || !wrapper) {
      return null;
    }

    const coords = cmRef.view.coordsAtPos(selection.to) ?? cmRef.view.coordsAtPos(selection.from);
    const wrapperRect = wrapper.getBoundingClientRect();

    return {
      top: Math.max((coords?.bottom ?? wrapperRect.top) - wrapperRect.top + 8, 8),
      left: Math.min(
        Math.max((coords?.left ?? wrapperRect.left) - wrapperRect.left, 8),
        Math.max(wrapperRect.width - 560, 8)
      )
    };
    }

    function openEntityEditor() {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef?.view) {
      return;
    }

    const context = buildReferenceSelectionContext(cmRef, { targetType: ReferenceType.ENTITY });
    const position = getInlineEditorPosition(context.selection);
    if (!position) {
      return;
    }

    setSyntacticEditor(null);
    setEntityEditor({
      initial: context.initial,
      selection: context.selection,
      position
    });
    setIsEditing(true);
    }

    function openSyntacticEditor() {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef?.view) {
      return;
    }

    const context = buildReferenceSelectionContext(cmRef, { targetType: ReferenceType.SYNTACTIC });
    const position = getInlineEditorPosition(context.selection);
    if (!position) {
      return;
    }

    setEntityEditor(null);
    setSyntacticEditor({
      initial: context.initial,
      selection: context.selection,
      position
    });
    setIsEditing(true);
    }

    function handleSaveEntityEditor(payload: { entity: string; form: string }) {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef || !entityEditor) {
      return;
    }

    const wrap = new CodeMirrorWrapper(cmRef);
    wrap.setSelection(entityEditor.selection.from, entityEditor.selection.to);
    wrap.replaceWith(
      referenceToString({
        type: ReferenceType.ENTITY,
        data: payload
      })
    );
    closeInlineEditor();
    }

    function handleSaveSyntacticEditor(payload: { offset: number; nominal: string }) {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef || !syntacticEditor) {
      return;
    }

    const wrap = new CodeMirrorWrapper(cmRef);
    wrap.setSelection(syntacticEditor.selection.from, syntacticEditor.selection.to);
    wrap.replaceWith(
      referenceToString({
        type: ReferenceType.SYNTACTIC,
        data: payload
      })
    );
    closeInlineEditor();
    }

    function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!thisRef.current?.view) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

      if (event.altKey && event.code === 'Digit1') {
      withPreventDefault(openEntityEditor)(event);
      return;
      }

      if (event.altKey && event.code === 'Digit2') {
      withPreventDefault(openSyntacticEditor)(event);
      }
    }
    

    return (
    <div ref={wrapperRef} className={clsx('relative flex flex-col gap-2', cursor)}>
      <Label text={label} />
      <CodeMirror
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
      {entityEditor ? (
        <InlineReferenceEntityEditor
          schema={schema}
          initial={entityEditor.initial}
          position={entityEditor.position}
          onCancel={closeInlineEditor}
          onSave={handleSaveEntityEditor}
        />
      ) : null}
      {syntacticEditor ? (
        <InlineReferenceSyntacticEditor
          initial={syntacticEditor.initial}
          position={syntacticEditor.position}
          onCancel={closeInlineEditor}
          onSave={handleSaveSyntacticEditor}
        />
        ) : null}
      </div>
    );
  }
);
