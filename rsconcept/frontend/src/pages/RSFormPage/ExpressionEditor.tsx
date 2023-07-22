import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../components/Common/Button';
import Label from '../../components/Common/Label';
import { useRSForm } from '../../context/RSFormContext';
import { toast } from 'react-toastify';
import RSTokenButton from './RSTokenButton';
import { CstType, TokenID } from '../../utils/models';
import useCheckExpression from '../../hooks/useCheckExpression';
import ParsingResult from './ParsingResult';
import { Loader } from '../../components/Common/Loader';
import StatusBar from './StatusBar';
import { AxiosResponse } from 'axios';
import { TextWrapper, getSymbolSubstitute } from './textEditing';
import RSLocalButton from './RSLocalButton';

interface ExpressionEditorProps {
  id: string
  label: string
  isActive: boolean
  disabled?: boolean
  placeholder?: string
  value: any
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  toggleEditMode: () => void
  setTypification: (typificaiton: string) => void
  setValue: (expression: string) => void
}

function ExpressionEditor({
  id, label, disabled, isActive, placeholder, value, setValue,
  toggleEditMode, setTypification, onChange
}: ExpressionEditorProps) {
  const { schema, active } = useRSForm();
  const [isModified, setIsModified] = useState(false);
  const { parseData, checkExpression, resetParse, loading } = useCheckExpression({schema: schema});
  const expressionCtrl = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsModified(false);
    resetParse();
  }, [active, resetParse]);

  const handleCheckExpression = useCallback(() => {
    const prefix = active?.alias + (active?.cstType === CstType.STRUCTURED ? '::=' : ':==');
    const expression = prefix + value;
    checkExpression(expression, (response: AxiosResponse) => {
      // TODO: update cursor position
      setIsModified(false);
      setTypification(response.data['typification']);
      toast.success('проверка завершена');
    });
  }, [value, checkExpression, active, setTypification]);

  const handleEdit = useCallback((id: TokenID, key?: string) => {
    if (!expressionCtrl.current) {
      toast.error('Нет доступа к полю редактирования формального выражения');
      return;
    }
    let text = new TextWrapper(expressionCtrl.current);
    if (id === TokenID.ID_LOCAL) {
      text.insertChar(key!);
    } else {
      text.insertToken(id);
    }
    text.finalize();
    text.focus();
    setValue(text.value);
    setIsModified(true);
  }, [setValue]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event);
    setIsModified(true);
  }, [setIsModified, onChange]);

  const handleInput = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.altKey) {
      let text = new TextWrapper(expressionCtrl.current!);
      if (text.processAltKey(event.key)) {
        event.preventDefault();
        text.finalize();
        setValue(text.value);
        setIsModified(true);
      }
    } else if (!event.ctrlKey) {
      const newSymbol = getSymbolSubstitute(event.key);
      if (newSymbol) {
        event.preventDefault();
        let text = new TextWrapper(expressionCtrl.current!);
        text.replaceWith(newSymbol);
        text.finalize();
        setValue(text.value);
        setIsModified(true);
      }
    }
  }, [expressionCtrl, setValue]);

  const handleFocusIn = useCallback(() => {
    toggleEditMode()
  }, [toggleEditMode]);

  const EditButtons = useMemo( () => {
    return (<div className='flex items-center justify-between w-full'>
    <div className='text-sm w-fit'>
      <div className='flex justify-start'>
        <RSTokenButton id={TokenID.NT_DECLARATIVE_EXPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NT_IMPERATIVE_EXPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NT_RECURSIVE_FULL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.BIGPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SMALLPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.FILTER} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.REDUCE} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.CARD} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.BOOL} onInsert={handleEdit}/>
        
      </div>
      <div className='flex justify-start'>
        <RSTokenButton id={TokenID.BOOLEAN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_PL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.INTERSECTION} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.LIT_EMPTYSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.FORALL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOT} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.IN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SUBSET_OR_EQ} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.AND} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.IMPLICATION} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SET_MINUS} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_ITERATE} onInsert={handleEdit}/>      
        <RSTokenButton id={TokenID.SUBSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.DEBOOL} onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSTokenButton id={TokenID.DECART} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_SL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.UNION} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.LIT_INTSET} onInsert={handleEdit}/>  
        <RSTokenButton id={TokenID.EXISTS} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOTEQUAL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOTIN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOTSUBSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.OR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.EQUIVALENT} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SYMMINUS} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_ASSIGN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.EQUAL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.GREATER_OR_EQ} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.LESSER_OR_EQ} onInsert={handleEdit}/>
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
  }, [handleEdit])
  
  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3 w-full'>
      <Label 
        text={label}
        required={false}
        htmlFor={id}
      />
      <textarea id={id} ref={expressionCtrl}
          className='w-full px-3 py-2 mt-2 leading-tight border shadow dark:bg-gray-800'
          rows={6}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocusIn}
          onKeyDown={handleInput}
          disabled={disabled}
      />
      <div className='flex w-full gap-4 py-1 mt-1 justify-stretch'>
        <div className='flex flex-col gap-2'>
          {isActive && <StatusBar
            isModified={isModified}
            constituenta={active}
            parseData={parseData}
          />}
          <Button
            tooltip='Проверить формальное выражение'
            text='Проверить'
            onClick={handleCheckExpression}
          />
        </div>
        {isActive && EditButtons}
        {!isActive && <StatusBar
            isModified={isModified}
            constituenta={active}
            parseData={parseData}
        />}
      </div>
      { loading && <Loader />}
      { parseData && <ParsingResult data={parseData} />}
    </div>
  );
}

export default ExpressionEditor;