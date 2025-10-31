'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';

import { useResetOnChange } from '@/hooks/use-reset-on-change';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { errorMsg } from '@/utils/labels';
import { type RO } from '@/utils/meta';

import {
  type ICheckConstituentaDTO,
  type IExpressionParseDTO,
  type IRSErrorDescription,
  TokenID
} from '../../../backend/types';
import { useCheckConstituenta } from '../../../backend/use-check-constituenta';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { RSInput } from '../../../components/rs-input';
import { parser as rslangParser } from '../../../components/rs-input/rslang/parser-ast';
import { RSTextWrapper } from '../../../components/rs-input/text-editing';
import { type IConstituenta } from '../../../models/rsform';
import { getDefinitionPrefix } from '../../../models/rsform-api';
import { transformAST } from '../../../models/rslang-api';
import { useRSEdit } from '../rsedit-context';

import { ParsingResult } from './parsing-result';
import { RSEditorControls } from './rs-edit-controls';
import { StatusBar } from './status-bar';
import { ToolbarRSExpression } from './toolbar-rsexpression';

interface EditorRSExpressionProps {
  id?: string;
  value: string;
  onChange: (newValue: string) => void;

  activeCst: IConstituenta;

  label: string;
  placeholder?: string;
  disabled?: boolean;
  toggleReset?: boolean;

  onChangeLocalParse: (typification: RO<IExpressionParseDTO>) => void;
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
  const [parseData, setParseData] = useState<RO<IExpressionParseDTO> | null>(null);

  const isProcessing = useMutatingRSForm();
  const showControls = usePreferencesStore(state => state.showExpressionControls);
  const showAST = useDialogsStore(state => state.showShowAST);

  const { checkConstituenta: checkInternal, isPending } = useCheckConstituenta();

  const resetHandler = useCallback(() => {
    setIsModified(false);
    setParseData(null);
  }, []);

  useResetOnChange([activeCst, toggleReset], resetHandler);

  function checkConstituenta(
    expression: string,
    activeCst: IConstituenta,
    onSuccess?: (data: RO<IExpressionParseDTO>) => void
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

  function handleChange(newValue: string) {
    onChange(newValue);
    setIsModified(newValue !== activeCst.definition_formal);
  }

  function handleCheckExpression(callback?: (parse: RO<IExpressionParseDTO>) => void) {
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

  function onShowError(error: RO<IRSErrorDescription>, prefixLen: number) {
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

  if (!activeCst.parse) {
    return (
      <RSInput
        value={value}
        schema={schema}
        minHeight='3.75rem'
        maxHeight='8rem'
        onChange={handleChange}
        onOpenEdit={onOpenEdit}
        disabled={disabled}
        {...restProps}
      />
    );
  }

  return (
    <div className='relative'>
      <ToolbarRSExpression
        className='absolute -top-2 right-0'
        showAST={handleShowAST}
        showTypeGraph={onShowTypeGraph}
        disabled={disabled}
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
        schema={schema}
        minHeight='3.75rem'
        maxHeight='8rem'
        onChange={handleChange}
        onAnalyze={() => handleCheckExpression()}
        onOpenEdit={onOpenEdit}
        disabled={disabled}
        {...restProps}
      />

      <RSEditorControls
        isOpen={showControls && (!disabled || (isProcessing && !activeCst.is_inherited))}
        onEdit={handleEdit}
        disabled={disabled}
      />

      <ParsingResult
        isOpen={!!parseData && parseData.errors.length > 0}
        data={parseData}
        onShowError={error => onShowError(error, parseData?.prefixLen ?? 0)}
        disabled={disabled}
      />
    </div>
  );
}
