'use client';

import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import clsx from 'clsx';
import { EditorView } from 'codemirror';
import { AnimatePresence } from 'framer-motion';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';

import Label from '@/components/ui/Label';
import { useConceptOptions } from '@/context/OptionsContext';
import DlgEditReference from '@/dialogs/DlgEditReference';
import { ReferenceType } from '@/models/language';
import { IRSForm } from '@/models/rsform';
import { CodeMirrorWrapper } from '@/utils/codemirror';
import { PARAMETER } from '@/utils/constants';

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
  disabled?: boolean;

  initialValue?: string;
  value?: string;
  resolved?: string;
}

const RefsInput = forwardRef<ReactCodeMirrorRef, RefsInputInputProps>(
  ({ id, label, disabled, schema, initialValue, value, resolved, onFocus, onBlur, onChange, ...restProps }, ref) => {
    const { darkMode, colors } = useConceptOptions();

    const [isFocused, setIsFocused] = useState(false);

    const [showEditor, setShowEditor] = useState(false);
    const [currentType, setCurrentType] = useState<ReferenceType>(ReferenceType.ENTITY);
    const [refText, setRefText] = useState('');
    const [hintText, setHintText] = useState('');
    const [basePosition, setBasePosition] = useState(0);
    const [mainRefs, setMainRefs] = useState<string[]>([]);

    const internalRef = useRef<ReactCodeMirrorRef>(null);
    const thisRef = useMemo(() => (!ref || typeof ref === 'function' ? internalRef : ref), [internalRef, ref]);

    const cursor = useMemo(() => (!disabled ? 'cursor-text' : 'cursor-default'), [disabled]);
    const customTheme: Extension = useMemo(
      () =>
        createTheme({
          theme: darkMode ? 'dark' : 'light',
          settings: {
            fontFamily: 'inherit',
            background: !disabled ? colors.bgInput : colors.bgDefault,
            foreground: colors.fgDefault,
            selection: colors.bgHover,
            caret: colors.fgDefault
          },
          styles: [
            { tag: tags.name, color: colors.fgPurple, cursor: 'default' }, // EntityReference
            { tag: tags.literal, color: colors.fgTeal, cursor: 'default' }, // SyntacticReference
            { tag: tags.comment, color: colors.fgRed } // Error
          ]
        }),
      [disabled, colors, darkMode]
    );

    const editorExtensions = useMemo(
      () => [
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ spellcheck: 'true' }),
        NaturalLanguage,
        ...(schema ? [refsHoverTooltip(schema, colors)] : [])
      ],
      [schema, colors]
    );

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

    const handleInput = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!thisRef.current?.view) {
          event.preventDefault();
          return;
        }
        if (event.ctrlKey && event.code === 'Space') {
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

          setShowEditor(true);
        }
      },
      [thisRef]
    );

    const handleInputReference = useCallback(
      (referenceText: string) => {
        if (!thisRef.current?.view) {
          return;
        }
        thisRef.current.view.focus();
        const wrap = new CodeMirrorWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
        wrap.replaceWith(referenceText);
      },
      [thisRef]
    );

    const hideEditReference = useCallback(() => {
      setShowEditor(false);
      setTimeout(() => thisRef.current?.view?.focus(), PARAMETER.refreshTimeout);
    }, [thisRef]);

    return (
      <div className={clsx('flex flex-col gap-2', cursor)}>
        <AnimatePresence>
          {showEditor && schema ? (
            <DlgEditReference
              hideWindow={hideEditReference}
              schema={schema}
              initial={{
                type: currentType,
                refRaw: refText,
                text: hintText,
                basePosition: basePosition,
                mainRefs: mainRefs
              }}
              onSave={handleInputReference}
            />
          ) : null}
        </AnimatePresence>
        <Label text={label} />
        <CodeMirror
          id={id}
          ref={thisRef}
          basicSetup={editorSetup}
          theme={customTheme}
          extensions={editorExtensions}
          value={isFocused ? value : value !== initialValue || showEditor ? value : resolved}
          indentWithTab={false}
          onChange={handleChange}
          editable={!disabled && !showEditor}
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
