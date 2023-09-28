import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Button from '../../components/Common/Button';
import { ConceptLoader } from '../../components/Common/ConceptLoader';
import RSInput from '../../components/RSInput';
import { RSTextWrapper } from '../../components/RSInput/textEditing';
import { useRSForm } from '../../context/RSFormContext';
import useCheckExpression from '../../hooks/useCheckExpression';
import { IConstituenta } from '../../models/rsform';
import { IRSErrorDescription, SyntaxTree } from '../../models/rslang';
import { TokenID } from '../../models/rslang';
import { labelTypification } from '../../utils/labels';
import { getCstExpressionPrefix } from '../../utils/misc';
import ParsingResult from './elements/ParsingResult';
import RSLocalButton from './elements/RSLocalButton';
import RSTokenButton from './elements/RSTokenButton';
import StatusBar from './elements/StatusBar';

interface EditorRSExpressionProps {
  id: string
  activeCst?: IConstituenta
  label: string
  isActive: boolean
  disabled?: boolean
  placeholder?: string
  onShowAST: (expression: string, ast: SyntaxTree) => void
  toggleEditMode: () => void
  setTypification: (typificaiton: string) => void
  value: string
  onChange: (newValue: string) => void
}

function EditorRSExpression({
  activeCst, disabled, isActive, value, onShowAST, 
  toggleEditMode, setTypification, onChange, ...props
}: EditorRSExpressionProps) {
  const { schema } = useRSForm();

  const [isModified, setIsModified] = useState(false);
  const { parseData, checkExpression, resetParse, loading } = useCheckExpression({ schema });
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  useLayoutEffect(() => {
    setIsModified(false);
    resetParse();
  }, [activeCst, resetParse]);

  function handleFocusIn() {
    toggleEditMode()
  }

  function handleChange(newvalue: string) {
    onChange(newvalue);
    setIsModified(true);
  }
  
  function handleCheckExpression() {
    if (!activeCst) {
      return;
    }
    const prefix = getCstExpressionPrefix(activeCst);
    const expression = prefix + value;
    checkExpression(expression, activeCst, parse => {
      if (parse.errors.length > 0) {
        onShowError(parse.errors[0]);
      } else {
        rsInput.current?.view?.focus();
      }
      setIsModified(false);
      setTypification(labelTypification({
        isValid: parse.parseResult,
        resultType: parse.typification,
        args: parse.args
      }));
    });
  }

  const onShowError = useCallback(
  (error: IRSErrorDescription) => {
    if (!activeCst || !rsInput.current) {
      return;
    }
    const prefix = getCstExpressionPrefix(activeCst);
    let errorPosition = error.position - prefix.length;
    if (errorPosition < 0) errorPosition = 0;
    rsInput.current?.view?.dispatch({
      selection: {
        anchor: errorPosition,
        head: errorPosition
      }
    });
    rsInput.current?.view?.focus();
  }, [activeCst]);

  const handleEdit = useCallback((id: TokenID, key?: string) => {
    if (!rsInput.current || !rsInput.current.editor || !rsInput.current.state || !rsInput.current.view) {
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
  }, []);

  const EditButtons = useMemo(() => {
    return (
    <div className='flex items-center justify-between w-full'>
    <div className='text-sm w-fit'>
      <div className='flex justify-start'>
        <RSTokenButton token={TokenID.NT_DECLARATIVE_EXPR} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.NT_IMPERATIVE_EXPR} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.NT_RECURSIVE_FULL} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.BIGPR} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.SMALLPR} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.FILTER} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.REDUCE} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.CARD} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.BOOL} onInsert={handleEdit}/>

      </div>
      <div className='flex justify-start'>
        <RSTokenButton token={TokenID.BOOLEAN} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.PUNC_PL} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.INTERSECTION} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.LIT_EMPTYSET} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.FORALL} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.NOT} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.IN} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.SUBSET_OR_EQ} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.AND} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.IMPLICATION} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.SET_MINUS} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.PUNC_ITERATE} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.SUBSET} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.DEBOOL} onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSTokenButton token={TokenID.DECART} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.PUNC_SL} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.UNION} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.LIT_INTSET} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.EXISTS} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.NOTEQUAL} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.NOTIN} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.NOTSUBSET} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.OR} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.EQUIVALENT} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.SYMMINUS} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.PUNC_ASSIGN} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.EQUAL} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.GREATER_OR_EQ} onInsert={handleEdit}/>
        <RSTokenButton token={TokenID.LESSER_OR_EQ} onInsert={handleEdit}/>
      </div>
    </div>
    <div className='text-xs w-fit'>
      <div className='flex justify-start'>
        <RSLocalButton text='μ' tooltip='q' onInsert={handleEdit}/>
        <RSLocalButton text='ω' tooltip='w' onInsert={handleEdit}/>
        <RSLocalButton text='ε' tooltip='e' onInsert={handleEdit}/>
        <RSLocalButton text='ρ' tooltip='r' onInsert={handleEdit}/>
        <RSLocalButton text='τ' tooltip='t' onInsert={handleEdit}/>
        <RSLocalButton text='π' tooltip='y' onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSLocalButton text='α' tooltip='a' onInsert={handleEdit}/>
        <RSLocalButton text='σ' tooltip='s' onInsert={handleEdit}/>
        <RSLocalButton text='δ' tooltip='d' onInsert={handleEdit}/>
        <RSLocalButton text='φ' tooltip='f' onInsert={handleEdit}/>
        <RSLocalButton text='γ' tooltip='g' onInsert={handleEdit}/>
        <RSLocalButton text='λ' tooltip='h' onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSLocalButton text='ζ' tooltip='z' onInsert={handleEdit}/>
        <RSLocalButton text='ξ' tooltip='x' onInsert={handleEdit}/>
        <RSLocalButton text='ψ' tooltip='c' onInsert={handleEdit}/>
        <RSLocalButton text='θ' tooltip='v' onInsert={handleEdit}/>
        <RSLocalButton text='β' tooltip='b' onInsert={handleEdit}/>
        <RSLocalButton text='η' tooltip='n' onInsert={handleEdit}/>
      </div>
    </div>
    </div>);
  }, [handleEdit]);

  return (
  <div className='flex flex-col items-start w-full min-h-[15.75rem]'>
    <div className='relative w-full'>
    <div className='absolute top-[-0.3rem] right-0'>
    <StatusBar
      isModified={isModified}
      constituenta={activeCst}
      parseData={parseData}
    />
    </div>
    </div>
    <RSInput innerref={rsInput}
      className='text-lg'
      height='10.1rem'
      value={value}
      editable={!disabled}
      onChange={handleChange}
      onFocus={handleFocusIn}
      {...props}
    />
    <div className='flex items-stretch w-full gap-4 py-1 mt-1 justify-stretch'>
      <div>
        <Button
          tooltip='Проверить формальное выражение'
          text='Проверить'
          dimensions='h-full w-fit'
          colorClass='clr-btn-default'
          onClick={handleCheckExpression}
        />
      </div>
      {isActive && !disabled && EditButtons}
    </div>
    { (isActive || loading || parseData) && 
    <div className='w-full overflow-y-auto border mt-1 max-h-[14rem] min-h-[4.2rem]'>
      { loading && <ConceptLoader size={6} />}
      { !loading && parseData && 
      <ParsingResult
        data={parseData} 
        onShowAST={ast => onShowAST(getCstExpressionPrefix(activeCst!) + value, ast)}
        onShowError={onShowError}
      />}
      { !loading && !parseData &&
      <input
        disabled={true}
        className='w-full h-full px-2 align-middle select-none clr-app'
        placeholder='Результаты проверки выражения'
      />}
    </div>}
  </div>);
}

export default EditorRSExpression;
