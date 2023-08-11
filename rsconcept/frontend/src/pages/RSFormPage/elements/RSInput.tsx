import { Extension } from '@codemirror/state';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { Ref } from 'react';

import { useConceptTheme } from '../../../context/ThemeContext';

const lightTheme: Extension = createTheme({
  theme: 'light',
  settings: {
    fontFamily: 'inherit',
    background: '#ffffff',
    foreground: '#000000',
    selection: '#036dd626'
  },
  styles: [
    // { tag: t.comment, color: '#787b8099' },
    // { tag: t.variableName, color: '#0080ff' },
    // { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
    // { tag: t.definition(t.typeName), color: '#5c6166' },
  ]
});

const darkTheme: Extension = createTheme({
  theme: 'dark',
  settings: {
    fontFamily: 'inherit',
    background: '#000000',
    foreground: '#ffffff',
    selection: '#036dd626'
  },
  styles: [
    // { tag: t.comment, color: '#787b8099' },
    // { tag: t.variableName, color: '#0080ff' },
    // { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
    // { tag: t.definition(t.typeName), color: '#5c6166' },
  ]
});

const editorSetup: BasicSetupOptions = {
  highlightSpecialChars: true,
  history: true,
  drawSelection: true,
  syntaxHighlighting: true,
  defaultKeymap: true,
  historyKeymap: true,

  lineNumbers: false,
  highlightActiveLineGutter: false,
  foldGutter: false,
  dropCursor: false,
  allowMultipleSelections: false,
  indentOnInput: false,
  bracketMatching: true,
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

const editorExtensions = [
  EditorView.lineWrapping
];

interface RSInputProps {
  ref?: Ref<ReactCodeMirrorRef>
  value?: string
  disabled?: boolean
  height?: string
  placeholder?: string
  onChange: (newValue: string) => void
}

function RSInput({ 
  disabled, onChange,
  height='10rem',
  ...props 
}: RSInputProps) {
  const { darkMode } = useConceptTheme();

  return (
    <div className={`w-full h-[${height}]`}>
    <CodeMirror
      basicSetup={editorSetup}
      extensions={editorExtensions}
      editable={!disabled}
      height={height}
      indentWithTab={false}
      theme={darkMode ? darkTheme : lightTheme}
      onChange={(value) => onChange(value)}
      {...props}
    />
    </div>
  );
}

export default RSInput;
