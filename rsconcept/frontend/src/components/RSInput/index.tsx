
import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { RefObject, useCallback, useMemo, useRef } from 'react';

import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { TokenID } from '../../models/rslang';
import Label from '../Common/Label';
import { ccBracketMatching } from './bracketMatching';
import { RSLanguage } from './rslang';
import { getSymbolSubstitute,RSTextWrapper } from './textEditing';
import { rsHoverTooltip } from './tooltip';

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

interface RSInputProps 
extends Pick<ReactCodeMirrorProps, 
  'id'| 'editable' | 'height' | 'value' | 'className' | 'onFocus' | 'onBlur' | 'placeholder'
> {
  label?: string
  innerref?: RefObject<ReactCodeMirrorRef> | undefined
  onChange?: (newValue: string) => void
}

function RSInput({ 
  id, label, innerref, onChange, editable,
  ...props 
}: RSInputProps) {
  const { darkMode, colors } = useConceptTheme();
  const { schema } = useRSForm();

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
      { tag: tags.name, color: colors.fgPurple, cursor: 'default' }, // GlobalID
      { tag: tags.variableName, color: colors.fgGreen }, // LocalID
      { tag: tags.propertyName, color: colors.fgTeal }, // Radical
      { tag: tags.keyword, color: colors.fgBlue }, // keywords
      { tag: tags.literal, color: colors.fgBlue }, // literals
      { tag: tags.controlKeyword, fontWeight: '500'}, // R | I | D
      { tag: tags.unit, fontSize: '0.75rem' }, // indicies
    ]
  }), [editable, colors, darkMode]);

  const editorExtensions = useMemo(
  () => [
    EditorView.lineWrapping,
    RSLanguage,
    ccBracketMatching(darkMode),
    rsHoverTooltip(schema?.items || []),
  ], [darkMode, schema?.items]);

  const handleInput = useCallback(
  (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!thisRef.current) {
      return;
    }
    const text = new RSTextWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
    if (event.shiftKey && event.key === '*' && !event.altKey) {
      text.insertToken(TokenID.DECART);
    } else if (event.altKey) {
      if (!text.processAltKey(event.code, event.shiftKey)) {
        return;
      }
    } else if (!event.ctrlKey) {
      const newSymbol = getSymbolSubstitute(event.code, event.shiftKey);
      if (!newSymbol) {
        return;
      }
      text.replaceWith(newSymbol);
    } else {
      return;
    }
    event.preventDefault();
  }, [thisRef]);

  return (
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
      indentWithTab={false}
      onChange={onChange}
      editable={editable}
      onKeyDown={handleInput}
      {...props}
    />
    </div>
  );
}

export default RSInput;
