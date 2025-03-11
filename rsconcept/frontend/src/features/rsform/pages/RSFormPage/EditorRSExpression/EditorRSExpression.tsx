'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { errorMsg } from '@/utils/labels';

import {
  type ICheckConstituentaDTO,
  type IExpressionParseDTO,
  type IRSErrorDescription,
  TokenID
} from '../../../backend/types';
import { useCheckConstituenta } from '../../../backend/useCheckConstituenta';
import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { RSInput } from '../../../components/RSInput';
import { parser as rslangParser } from '../../../components/RSInput/rslang/parserAST';
import { RSTextWrapper } from '../../../components/RSInput/textEditing';
import { type IConstituenta } from '../../../models/rsform';
import { getDefinitionPrefix } from '../../../models/rsformAPI';
import { transformAST } from '../../../models/rslangAPI';
import { useRSEdit } from '../RSEditContext';

import { ParsingResult } from './ParsingResult';
import { RSEditorControls } from './RSEditControls';
import { StatusBar } from './StatusBar';
import { ToolbarRSExpression } from './ToolbarRSExpression';

interface EditorRSExpressionProps {
  id?: string;
  value: string;
  onChange: (newValue: string) => void;

  activeCst: IConstituenta;

  label: string;
  placeholder?: string;
  disabled?: boolean;
  toggleReset?: boolean;

  onChangeLocalParse: (typification: IExpressionParseDTO) => void;
  onOpenEdit: (cstID: number) => void;
  onShowTypeGraph: (event: React.MouseEvent<Element>) => void;
}

export function EditorRSExpression({
  activeCst,
  disabled,
  value,
  toggleReset,
  onChange,
  onChangeLocalParse,
  onOpenEdit,
  onShowTypeGraph,
  ...restProps
}: EditorRSExpressionProps) {
  const schema = useRSEdit().schema;

  const [isModified, setIsModified] = useState(false);
  const rsInput = useRef<ReactCodeMirrorRef>(null);
  const [parseData, setParseData] = useState<IExpressionParseDTO | null>(null);

  const isProcessing = useMutatingRSForm();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const showAST = useDialogsStore(state => state.showShowAST);

  const { checkConstituenta: checkInternal, isPending } = useCheckConstituenta();

  function checkConstituenta(
    expression: string,
    activeCst: IConstituenta,
    onSuccess?: (data: IExpressionParseDTO) => void
  ) {
    const data: ICheckConstituentaDTO = {
      definition_formal: expression,
      alias: activeCst.alias,
      cst_type: activeCst.cst_type
    };
    void checkInternal({ itemID: schema.id, data }).then(parse => {
      setParseData(parse);
      onSuccess?.(parse);
    });
  }

  useEffect(() => {
    setIsModified(false);
    setParseData(null);
  }, [activeCst, toggleReset]);

  function handleChange(newValue: string) {
    onChange(newValue);
    setIsModified(newValue !== activeCst.definition_formal);
  }

  function handleCheckExpression(callback?: (parse: IExpressionParseDTO) => void) {
    checkConstituenta(value, activeCst, parse => {
      onChangeLocalParse(parse);
      if (parse.errors.length > 0) {
        onShowError(parse.errors[0], parse.prefixLen);
      } else {
        rsInput.current?.view?.focus();
      }
      setIsModified(false);
      callback?.(parse);
    });
  }

  function onShowError(error: IRSErrorDescription, prefixLen: number) {
    if (!rsInput.current) {
      return;
    }
    let errorPosition = error.position - prefixLen;
    if (errorPosition < 0) errorPosition = 0;
    rsInput.current?.view?.dispatch({
      selection: {
        anchor: errorPosition,
        head: errorPosition
      }
    });
    rsInput.current?.view?.focus();
  }

  function handleEdit(id: TokenID, key?: string) {
    if (!rsInput.current?.editor || !rsInput.current.state || !rsInput.current.view) {
      return;
    }
    const text = new RSTextWrapper(rsInput.current as Required<ReactCodeMirrorRef>);
    if (id === TokenID.ID_LOCAL) {
      text.insertChar(key ?? 'unknown_local');
    } else {
      text.insertToken(id);
    }
    rsInput.current?.view?.focus();
    setIsModified(true);
  }

  function handleShowAST(event: React.MouseEvent<Element>) {
    if (event.ctrlKey) {
      const tree = rslangParser.parse(value);
      const ast = transformAST(tree);
      showAST({ syntaxTree: ast, expression: value });
    } else {
      handleCheckExpression(parse => {
        if (!parse.astText) {
          toast.error(errorMsg.astFailed);
        } else {
          showAST({ syntaxTree: parse.ast, expression: getDefinitionPrefix(activeCst) + value });
        }
      });
    }
  }

  return (
    <div className='relative cc-fade-in'>
      <ToolbarRSExpression
        className='absolute -top-2 right-0'
        disabled={disabled}
        showAST={handleShowAST}
        showTypeGraph={onShowTypeGraph}
      />

      <StatusBar
        className='absolute -top-2 right-1/2 translate-x-1/2'
        processing={isPending}
        isModified={isModified}
        activeCst={activeCst}
        parseData={parseData}
        onAnalyze={() => handleCheckExpression()}
      />

      <RSInput
        ref={rsInput}
        value={value}
        minHeight='3.75rem'
        maxHeight='8rem'
        disabled={disabled}
        onChange={handleChange}
        onAnalyze={handleCheckExpression}
        schema={schema}
        onOpenEdit={onOpenEdit}
        {...restProps}
      />

      <RSEditorControls
        isOpen={showControls && (!disabled || (isProcessing && !activeCst.is_inherited))}
        disabled={disabled}
        onEdit={handleEdit}
      />

      <ParsingResult
        isOpen={!!parseData && parseData.errors.length > 0}
        data={parseData}
        disabled={disabled}
        onShowError={error => onShowError(error, parseData?.prefixLen ?? 0)}
      />
    </div>
  );
}
