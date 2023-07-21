import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../../components/Common/Button';
import Label from '../../components/Common/Label';
import { useRSForm } from '../../context/RSFormContext';
import { toast } from 'react-toastify';
import RSEditButton from './RSEditButton';
import { CstType, TokenID } from '../../utils/models';
import useCheckExpression from '../../hooks/useCheckExpression';
import ParsingResult from './ParsingResult';
import { Loader } from '../../components/Common/Loader';
import StatusBar from './StatusBar';
import { AxiosResponse } from 'axios';
import { TextWrapper } from '../../utils/textEditing';

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

  const handleEdit = useCallback((id: TokenID) => {
    if (!expressionCtrl.current) {
      toast.error('Нет доступа к полю редактирования формального выражения');
      return;
    }
    let text = new TextWrapper(expressionCtrl.current);
    text.insertToken(id);
    text.finalize();
    text.focus();
    setValue(text.value);
  }, [setValue]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event);
    setIsModified(true);
  }, [setIsModified, onChange]);


  const handleFocusIn = useCallback(() => {
    toggleEditMode()
  }, [toggleEditMode]);

  const EditButtons = useMemo( () => {
    return (<div className='w-full text-sm'>
    <div className='flex justify-start'>
      <RSEditButton id={TokenID.NT_DECLARATIVE_EXPR} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.NT_IMPERATIVE_EXPR} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.NT_RECURSIVE_FULL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.BIGPR} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.SMALLPR} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.FILTER} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.REDUCE} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.CARD} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.BOOL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.DEBOOL} onInsert={handleEdit}/>
    </div>
    <div className='flex justify-start'>
      <RSEditButton id={TokenID.BOOLEAN} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.PUNC_PL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.FORALL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.IN} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.OR} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.SUBSET_OR_EQ} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.INTERSECTION} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.MINUS} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.LIT_EMPTYSET} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.SUBSET} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.EQUAL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.NOT} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.GREATER_OR_EQ} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.LESSER_OR_EQ} onInsert={handleEdit}/>
      
    </div>
    <div className='flex justify-start'>
      <RSEditButton id={TokenID.DECART} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.PUNC_SL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.EXISTS} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.NOTIN} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.AND} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.IMPLICATION} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.UNION} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.SYMMINUS} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.LIT_INTSET} onInsert={handleEdit}/>      
      <RSEditButton id={TokenID.NOTSUBSET} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.NOTEQUAL} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.EQUIVALENT} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.PUNC_ASSIGN} onInsert={handleEdit}/>
      <RSEditButton id={TokenID.PUNC_ITERATE} onInsert={handleEdit}/>
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
          disabled={disabled}
      />
      <div className='flex gap-4 py-1 mt-1 justify-stretch items-stre'>
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