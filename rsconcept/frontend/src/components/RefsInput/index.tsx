
import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import useResolveText from '../../hooks/useResolveText';
import Label from '../Common/Label';
import Modal from '../Common/Modal';
import PrettyJson from '../Common/PrettyJSON';
import { NaturalLanguage } from './parse';
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
  dropCursor: false,
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
extends Pick<ReactCodeMirrorProps, 
  'id'| 'editable' | 'height' | 'value' | 'className' | 'onFocus' | 'onBlur' | 'placeholder'
> {
  label?: string
  innerref?: RefObject<ReactCodeMirrorRef> | undefined
  onChange?: (newValue: string) => void
  
  initialValue?: string
  value?: string
  resolved?: string
}

function RefsInput({ 
  id, label, innerref, onChange, editable, 
  initialValue, value, resolved,
  onFocus, onBlur,
  ...props 
}: RefsInputInputProps) {
  const { darkMode, colors } = useConceptTheme();
  const { schema } = useRSForm();

  const { resolveText, refsData } = useResolveText({schema: schema});

  const [showResolve, setShowResolve] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const internalRef = useRef<ReactCodeMirrorRef>(null);
  const thisRef = useMemo(
  () => {
    return innerref ?? internalRef;
  }, [internalRef, innerref]);

  const cursor = useMemo(() => editable ? 'cursor-text': 'cursor-default', [editable]);
  const customTheme: Extension = useMemo(
  () => createTheme({
    theme: darkMode ? 'dark' : 'light',
    settings: {
      fontFamily: 'inherit',
      background: editable ? colors.bgInput : colors.bgDefault,
      foreground: colors.fgDefault,
      selection: colors.bgHover
    },
    styles: [
      { tag: tags.name, color: colors.fgPurple, cursor: 'default' }, // EntityReference
      { tag: tags.literal, color: colors.fgTeal, cursor: 'default' }, // SyntacticReference
      { tag: tags.comment, color: colors.fgRed }, // Error
    ]
  }), [editable, colors, darkMode]);

  const editorExtensions = useMemo(
  () => [
    EditorView.lineWrapping,
    NaturalLanguage,
    refsHoverTooltip(schema?.items || [], colors),
  ], [schema?.items, colors]);

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
    if (!thisRef.current) {
      event.preventDefault();
      return;
    }
    if (event.altKey) {
      if (event.key === 'r' && value) {
        event.preventDefault();
        resolveText(value, () => {
          setShowResolve(true);
        });
        return;
      }
    }
  }, [thisRef, resolveText, value]);

  return (
  <>
    { showResolve &&
    <Modal
      readonly
      hideWindow={() => setShowResolve(false)}
    >
      <div className='max-h-[60vh] max-w-[80vw] overflow-auto'>
        <PrettyJson data={refsData} />
      </div>
    </Modal>}
    <div className={`flex flex-col  w-full ${cursor}`}>
    {label && 
    <Label
      text={label}
      required={false}
      htmlFor={id}
      className='mb-2'
    />}
    <CodeMirror id={id}
      ref={thisRef}
      basicSetup={editorSetup}
      theme={customTheme}
      extensions={editorExtensions}

      value={isFocused ? value : (value !== initialValue ? value : resolved)}

      indentWithTab={false}
      onChange={handleChange}
      editable={editable}
      onKeyDown={handleInput}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      {...props}
    />
    </div>
  </>);
}

export default RefsInput;
