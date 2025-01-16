'use client';

import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import clsx from 'clsx';
import { EditorView } from 'codemirror';
import { forwardRef, useRef, useState } from 'react';

import Label from '@/components/ui/Label';
import { ReferenceType } from '@/models/language';
import { DialogType } from '@/models/miscellaneous';
import { ConstituentaID, IRSForm } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/color';
import { CodeMirrorWrapper } from '@/utils/codemirror';

import { refsNavigation } from './clickNavigation';
import { NaturalLanguage, ReferenceTokens } from './parse';
import { RefEntity } from './parse/parser.terms';
import { refsHoverTooltip } from './tooltip';

const editorSetup: BasicSetupOptions = {
  highlightSpecialChars: false,
  history: true,
  drawSelection: true,
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
    | 'id' // prettier: split-lines
    | 'height'
    | 'minHeight'
    | 'maxHeight'
    | 'value'
    | 'className'
    | 'onFocus'
    | 'onBlur'
    | 'placeholder'
  > {
  label?: string;
  onChange?: (newValue: string) => void;
  schema?: IRSForm;
  onOpenEdit?: (cstID: ConstituentaID) => void;
  disabled?: boolean;

  initialValue?: string;
  value?: string;
  resolved?: string;
}

const RefsInput = forwardRef<ReactCodeMirrorRef, RefsInputInputProps>(
  (
    {
      id, // prettier: split-lines
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
    const activeDialog = useDialogsStore(state => state.active);
    const isActive = activeDialog === DialogType.EDIT_REFERENCE;

    const [currentType, setCurrentType] = useState<ReferenceType>(ReferenceType.ENTITY);
    const [refText, setRefText] = useState('');
    const [hintText, setHintText] = useState('');
    const [basePosition, setBasePosition] = useState(0);
    const [mainRefs, setMainRefs] = useState<string[]>([]);

    const internalRef = useRef<ReactCodeMirrorRef>(null);
    const thisRef = !ref || typeof ref === 'function' ? internalRef : ref;

    const cursor = !disabled ? 'cursor-text' : 'cursor-default';
    const customTheme: Extension = createTheme({
      theme: darkMode ? 'dark' : 'light',
      settings: {
        fontFamily: 'inherit',
        background: !disabled ? APP_COLORS.bgInput : APP_COLORS.bgDefault,
        foreground: APP_COLORS.fgDefault,
        selection: APP_COLORS.bgHover,
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
      ...(!schema || !onOpenEdit ? [] : [refsNavigation(schema, onOpenEdit)]),
      ...(schema ? [refsHoverTooltip(schema, onOpenEdit !== undefined)] : [])
    ];

    function handleChange(newValue: string) {
      if (onChange) onChange(newValue);
    }

    function handleFocusIn(event: React.FocusEvent<HTMLDivElement>) {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    }

    function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
      setIsFocused(false);
      if (onBlur) onBlur(event);
    }

    function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
      if (!thisRef.current?.view || !schema) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();

        const wrap = new CodeMirrorWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
        wrap.fixSelection(ReferenceTokens);
        const nodes = wrap.getEnvelopingNodes(ReferenceTokens);
        if (nodes.length !== 1) {
          setCurrentType(ReferenceType.ENTITY);
          setRefText('');
          setHintText(wrap.getSelectionText());
        } else {
          setCurrentType(nodes[0].type.id === RefEntity ? ReferenceType.ENTITY : ReferenceType.SYNTACTIC);
          setRefText(wrap.getSelectionText());
        }

        const selection = wrap.getSelection();
        const mainNodes = wrap
          .getAllNodes([RefEntity])
          .filter(node => node.from >= selection.to || node.to <= selection.from);
        setMainRefs(mainNodes.map(node => wrap.getText(node.from, node.to)));
        setBasePosition(mainNodes.filter(node => node.to <= selection.from).length);

        showEditReference({
          schema: schema,
          initial: {
            type: currentType,
            refRaw: refText,
            text: hintText,
            basePosition: basePosition,
            mainRefs: mainRefs
          },
          onSave: handleInputReference
        });
      }
    }

    function handleInputReference(referenceText: string) {
      if (!thisRef.current?.view) {
        return;
      }
      thisRef.current.view.focus();
      const wrap = new CodeMirrorWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
      wrap.replaceWith(referenceText);
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
          value={isFocused ? value : value !== initialValue || isActive ? value : resolved}
          indentWithTab={false}
          onChange={handleChange}
          editable={!disabled && !isActive}
          onKeyDown={handleInput}
          onFocus={handleFocusIn}
          onBlur={handleFocusOut}
          {...restProps}
        />
      </div>
    );
  }
);

export default RefsInput;
