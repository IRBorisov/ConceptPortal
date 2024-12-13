'use client';

import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import BadgeHelp from '@/components/info/BadgeHelp';
import { CProps } from '@/components/props';
import RSInput from '@/components/RSInput';
import { parser as rslangParser } from '@/components/RSInput/rslang/parserAST';
import { RSTextWrapper } from '@/components/RSInput/textEditing';
import Overlay from '@/components/ui/Overlay';
import { useRSForm } from '@/context/RSFormContext';
import DlgShowAST from '@/dialogs/DlgShowAST';
import useCheckConstituenta from '@/hooks/useCheckConstituenta';
import useLocalStorage from '@/hooks/useLocalStorage';
import { HelpTopic } from '@/models/miscellaneous';
import { ConstituentaID, IConstituenta } from '@/models/rsform';
import { getDefinitionPrefix } from '@/models/rsformAPI';
import { IExpressionParse, IRSErrorDescription, SyntaxTree } from '@/models/rslang';
import { TokenID } from '@/models/rslang';
import { transformAST } from '@/utils/codemirror';
import { storage } from '@/utils/constants';
import { errors, labelTypification } from '@/utils/labels';

import ParsingResult from './ParsingResult';
import RSEditorControls from './RSEditControls';
import StatusBar from './StatusBar';
import ToolbarRSExpression from './ToolbarRSExpression';

interface EditorRSExpressionProps {
  id?: string;
  activeCst: IConstituenta;
  value: string;
  label: string;
  placeholder?: string;

  disabled?: boolean;
  toggleReset?: boolean;

  onChangeTypification: (typification: string) => void;
  onChangeLocalParse: (typification: IExpressionParse | undefined) => void;
  onChangeExpression: (newValue: string) => void;
  onOpenEdit?: (cstID: ConstituentaID) => void;
  onShowTypeGraph: (event: CProps.EventMouse) => void;
}

function EditorRSExpression({
  activeCst,
  disabled,
  value,
  toggleReset,
  onChangeTypification,
  onChangeLocalParse,
  onChangeExpression,
  onOpenEdit,
  onShowTypeGraph,
  ...restProps
}: EditorRSExpressionProps) {
  const model = useRSForm();

  const [isModified, setIsModified] = useState(false);
  const parser = useCheckConstituenta({ schema: model.schema });
  const { resetParse } = parser;
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  const [syntaxTree, setSyntaxTree] = useState<SyntaxTree>([]);
  const [expression, setExpression] = useState('');
  const [showAST, setShowAST] = useState(false);
  const [showControls, setShowControls] = useLocalStorage(storage.rseditShowControls, true);

  useEffect(() => {
    setIsModified(false);
    resetParse();
  }, [activeCst, resetParse, toggleReset]);

  function handleChange(newValue: string) {
    onChangeExpression(newValue);
    setIsModified(newValue !== activeCst.definition_formal);
  }

  function handleCheckExpression(callback?: (parse: IExpressionParse) => void) {
    parser.checkConstituenta(value, activeCst, parse => {
      onChangeLocalParse(parse);
      if (parse.errors.length > 0) {
        onShowError(parse.errors[0], parse.prefixLen);
      } else {
        rsInput.current?.view?.focus();
      }
      setIsModified(false);
      onChangeTypification(
        labelTypification({
          isValid: parse.parseResult,
          resultType: parse.typification,
          args: parse.args
        })
      );
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

  function handleShowAST(event: CProps.EventMouse) {
    if (event.ctrlKey) {
      const tree = rslangParser.parse(value);
      const ast = transformAST(tree);
      setSyntaxTree(ast);
      setExpression(value);
      setShowAST(true);
    } else {
      handleCheckExpression(parse => {
        if (!parse.astText) {
          toast.error(errors.astFailed);
        } else {
          setSyntaxTree(parse.ast);
          setExpression(getDefinitionPrefix(activeCst) + value);
          setShowAST(true);
        }
      });
    }
  }

  return (
    <div className='cc-fade-in'>
      {showAST ? (
        <DlgShowAST expression={expression} syntaxTree={syntaxTree} hideWindow={() => setShowAST(false)} />
      ) : null}

      <ToolbarRSExpression
        disabled={disabled}
        showControls={showControls}
        showAST={handleShowAST}
        toggleControls={() => setShowControls(prev => !prev)}
        showTypeGraph={onShowTypeGraph}
      />

      <Overlay
        position='top-[-0.5rem] right-1/2 translate-x-1/2'
        layer='z-pop'
        className='w-fit pl-[8.5rem] xs:pl-[2rem] flex gap-1'
      >
        <StatusBar
          processing={parser.processing}
          isModified={isModified}
          activeCst={activeCst}
          parseData={parser.parseData}
          onAnalyze={() => handleCheckExpression()}
        />
        <BadgeHelp topic={HelpTopic.UI_CST_STATUS} offset={4} />
      </Overlay>

      <RSInput
        ref={rsInput}
        value={value}
        minHeight='3.75rem'
        maxHeight='8rem'
        disabled={disabled}
        onChange={handleChange}
        onAnalyze={handleCheckExpression}
        schema={model.schema}
        onOpenEdit={onOpenEdit}
        {...restProps}
      />

      <RSEditorControls
        isOpen={showControls && (!disabled || (model.processing && !activeCst.is_inherited))}
        disabled={disabled}
        onEdit={handleEdit}
      />

      <ParsingResult
        isOpen={!!parser.parseData && parser.parseData.errors.length > 0}
        data={parser.parseData}
        disabled={disabled}
        onShowError={error => onShowError(error, parser.parseData?.prefixLen ?? 0)}
      />
    </div>
  );
}

export default EditorRSExpression;
