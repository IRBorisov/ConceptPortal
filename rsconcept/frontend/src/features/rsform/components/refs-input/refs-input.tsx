'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type Extension, type SelectionRange } from '@codemirror/state';
import { EditorView, tooltips } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, {
  type BasicSetupOptions,
  type ReactCodeMirrorProps,
  type ReactCodeMirrorRef
} from '@uiw/react-codemirror';
import clsx from 'clsx';
import { useDebounce } from 'use-debounce';

import { Label } from '@/components/input';
import {
  type EntityRefState,
  type Grammeme,
  type InlinePosition,
  parseEntityReference,
  parseGrammemes,
  parseSyntacticReference,
  referenceToString,
  ReferenceType,
  supportedGrammemes,
  type SyntacticRefState
} from '@/domain/cctext';
import { type RSForm } from '@/domain/library';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';
import { CodeMirrorWrapper } from '@/utils/codemirror';
import { PARAMETER } from '@/utils/constants';
import { withPreventDefault } from '@/utils/utils';

import { RefEntity, RefSyntactic } from './parse/parser.terms';
import { refsNavigation } from './click-navigation';
import { InlineEntityEditor } from './inline-entity';
import { InlineSyntacticEditor } from './inline-syntactic';
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

const ENTITY_INLINE_HEIGHT = 250;
const ENTITY_INLINE_WIDTH = 480;
const SYNTACTIC_INLINE_HEIGHT = 80;
const SYNTACTIC_INLINE_WIDTH = 320;
const BOTTOM_MARGIN = 20;
const RIGHT_MARGIN = 40;

interface RefsInputInputProps extends Pick<
  ReactCodeMirrorProps,
  'id' | 'height' | 'minHeight' | 'maxHeight' | 'value' | 'className' | 'onFocus' | 'onBlur' | 'placeholder'
> {
  value: string;
  resolved: string;
  onChange: (newValue: string) => void;

  schema: RSForm;
  onOpenEdit?: (cstID: number) => void;
  ref?: React.Ref<ReactCodeMirrorRef>;

  label?: string;
  disabled?: boolean;
  initialValue?: string;
  portalHoverTooltips?: boolean;
}

export function RefsInput({
  label,
  disabled,
  schema,
  initialValue,
  value,
  resolved,
  portalHoverTooltips,
  onOpenEdit,
  onFocus,
  onBlur,
  onChange,
  ref,
  ...restProps
}: RefsInputInputProps) {
  const darkMode = usePreferencesStore(state => state.darkMode);

  const [isFocused, setIsFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Debounce editing to avoid text flickering after closing inline editor
  const [editingDebounce] = useDebounce(isEditing, 2 * PARAMETER.minimalTimeout);

  const [inlinePosition, setInlinePosition] = useState<InlinePosition | null>(null);
  const [syntacticEditor, setSyntacticEditor] = useState<SyntacticRefState | null>(null);
  const [entityEditor, setEntityEditor] = useState<EntityRefState | null>(null);

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
    ...(portalHoverTooltips
      ? [
          tooltips({
            parent: document.body,
            position: 'fixed'
          })
        ]
      : []),
    NaturalLanguage,
    ...(!onOpenEdit ? [] : [refsNavigation(schema, onOpenEdit)]),
    refsHoverTooltip(schema, onOpenEdit !== undefined)
  ];

  function handleFocusIn(event: React.FocusEvent<HTMLDivElement>) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
    setIsFocused(false);
    onBlur?.(event);
  }

  function closeInlineEditor() {
    setEntityEditor(null);
    setSyntacticEditor(null);
    setIsEditing(false);
    setTimeout(function focusAfterEditingEnabled() {
      thisRef.current?.view?.focus();
    }, PARAMETER.minimalTimeout);
  }

  function getInlineEditorPosition(selection: SelectionRange, height: number, width: number) {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef?.view) {
      return null;
    }

    const coords = cmRef.view.coordsAtPos(selection.to) ?? cmRef.view.coordsAtPos(selection.from);
    if (!coords) {
      return null;
    }

    const baseTop = Math.max((coords.bottom ?? 0) + 4, 8);
    const baseLeft = Math.max(coords.left ?? 0, 8);
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const adjustedTop =
      baseTop > viewportHeight - height - BOTTOM_MARGIN ? Math.max((coords.bottom ?? 0) - 4 - height, 8) : baseTop;
    const adjustedLeft = Math.min(baseLeft, viewportWidth - width - RIGHT_MARGIN);
    return {
      top: adjustedTop,
      left: adjustedLeft
    };
  }

  function openEntityEditor() {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef?.view) {
      return;
    }

    const wrap = new CodeMirrorWrapper(cmRef);
    wrap.fixSelection(ReferenceTokens);
    const selection = wrap.getSelection();
    const position = getInlineEditorPosition(selection, ENTITY_INLINE_HEIGHT, ENTITY_INLINE_WIDTH);
    if (!position) {
      return;
    }

    const nodes = wrap.getEnvelopingNodes(ReferenceTokens);
    const text = wrap.getSelectionText();
    let entity = '';
    let grams: Grammeme[] = [];
    if (nodes.length === 1 && nodes[0].type.id === RefEntity) {
      const refRaw = wrap.getText(nodes[0].from, nodes[0].to);
      const ref = parseEntityReference(refRaw);
      entity = ref.entity;
      grams = parseGrammemes(ref.form);
    }

    setSyntacticEditor(null);
    setInlinePosition(position);
    setEntityEditor({
      query: entity ? '' : text,
      entity: entity,
      grams: grams ? supportedGrammemes.filter(data => grams.includes(data)) : []
    });
    setIsEditing(true);
  }

  function openSyntacticEditor() {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef?.view) {
      return;
    }

    const wrap = new CodeMirrorWrapper(cmRef);
    wrap.fixSelection(ReferenceTokens);
    const selection = wrap.getSelection();
    const position = getInlineEditorPosition(selection, SYNTACTIC_INLINE_HEIGHT, SYNTACTIC_INLINE_WIDTH);
    if (!position) {
      return;
    }

    const nodes = wrap.getEnvelopingNodes(ReferenceTokens);
    const text = wrap.getSelectionText();
    let nominal = '';
    let offset = 1;
    if (nodes.length === 1 && nodes[0].type.id === RefSyntactic) {
      const refRaw = wrap.getText(nodes[0].from, nodes[0].to);
      const ref = parseSyntacticReference(refRaw);
      nominal = ref.nominal;
      offset = ref.offset;
    }

    const entityRefs = wrap
      .getAllNodes([RefEntity])
      .filter(node => node.from >= selection.to || node.to <= selection.from);

    setEntityEditor(null);
    setInlinePosition(position);
    setSyntacticEditor({
      nominal: nominal || text,
      offset: offset,
      refsCount: entityRefs.length,
      baseIndex: entityRefs.filter(node => node.to <= selection.from).length
    });
    setIsEditing(true);
  }

  function handleSaveEntityEditor(entity: string, form: string) {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef || !entityEditor) {
      return;
    }

    const wrap = new CodeMirrorWrapper(cmRef);
    wrap.replaceWith(
      referenceToString({
        type: ReferenceType.ENTITY,
        data: { entity, form }
      })
    );
    closeInlineEditor();
  }

  function handleSaveSyntacticEditor(offset: number, nominal: string) {
    const cmRef = thisRef.current as Required<ReactCodeMirrorRef> | null;
    if (!cmRef || !syntacticEditor) {
      return;
    }

    const wrap = new CodeMirrorWrapper(cmRef);
    wrap.replaceWith(
      referenceToString({
        type: ReferenceType.SYNTACTIC,
        data: { offset, nominal }
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

    if (event.key === 'Escape') {
      withPreventDefault(closeInlineEditor)(event);
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
        value={isFocused || value !== initialValue || isEditing || editingDebounce ? value : resolved}
        indentWithTab={false}
        onChange={onChange}
        editable={!disabled && !isEditing}
        onKeyDown={handleInput}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        {...restProps}
      />
      {entityEditor && inlinePosition
        ? createPortal(
            <InlineEntityEditor
              schema={schema}
              initial={entityEditor}
              position={inlinePosition}
              onCancel={closeInlineEditor}
              onSave={handleSaveEntityEditor}
            />,
            document.body
          )
        : null}
      {syntacticEditor && inlinePosition
        ? createPortal(
            <InlineSyntacticEditor
              initial={syntacticEditor}
              position={inlinePosition}
              onCancel={closeInlineEditor}
              onSave={handleSaveSyntacticEditor}
            />,
            document.body
          )
        : null}
    </div>
  );
}
