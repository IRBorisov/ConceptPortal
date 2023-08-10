import { Extension } from '@codemirror/state';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';

import { useConceptTheme } from '../../../context/ThemeContext';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const lightTheme: Extension = createTheme({
  theme: 'light',
  settings: {
    fontFamily: 'Roboto',
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const darkTheme: Extension = createTheme({
  theme: 'dark',
  settings: {
    fontFamily: 'Roboto',
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

interface RSInputProps {
  disabled?: boolean
  placeholder?: string
  value: string
  onChange: (newValue: string) => void
  setValue: (expression: string) => void
}

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

function RSInput({ value, disabled, placeholder, setValue }: RSInputProps) {
  const { darkMode } = useConceptTheme();

  return (
    <div className='w-full h-[10rem] border text-lg'>
    <CodeMirror
      value={value}
      basicSetup={editorSetup}
      extensions={[EditorView.lineWrapping]}
      editable={!disabled}
      placeholder={placeholder}
      height='10rem'
      indentWithTab={false}

      theme={darkMode ? darkTheme : lightTheme}
      onChange={(value) => setValue(value)}
    />
    </div>
  );
}

export default RSInput;
