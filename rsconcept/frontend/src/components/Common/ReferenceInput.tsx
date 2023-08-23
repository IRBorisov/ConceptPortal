import { useState } from 'react';

import { useRSForm } from '../../context/RSFormContext';
import useResolveText from '../../hooks/useResolveText';
import Modal from './Modal';
import PrettyJson from './PrettyJSON';
import TextArea, { TextAreaProps } from './TextArea';

interface ReferenceInputProps
extends TextAreaProps {
  initialValue?: string
  value?: string
  resolved?: string
}

function ReferenceInput({ 
  initialValue, resolved, value,
  onKeyDown, onChange, onFocus, onBlur, ... props
}: ReferenceInputProps) {
  const { schema } = useRSForm();
  const { resolveText, refsData } = useResolveText({schema: schema});

  const [showResolve, setShowResolve] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  function handleKeyboard(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.altKey) {
      if (event.key === 'r' && value) {
        event.preventDefault();
        resolveText(value, () => {
          setShowResolve(true);
        });
        return;
      }
    }
    if (onKeyDown) onKeyDown(event);
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (onChange) onChange(event);
  }

  function handleFocusIn(event: React.FocusEvent<HTMLTextAreaElement>) {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  }

  function handleFocusOut(event: React.FocusEvent<HTMLTextAreaElement>) {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  }

  return (
    <>
      { showResolve &&
      <Modal
        readonly
        hideWindow={() => setShowResolve(false)}
      >
        <div className='max-h-[60vh] max-w-[80vw] overflow-auto'>
          <PrettyJson data={refsData} />
        </div>
      </Modal>}
      <TextArea
        value={isFocused ? value : (value !== initialValue ? value : resolved)}
        onKeyDown={handleKeyboard}
        onChange={handleChange}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        {...props}
      />
    </>
  );
}

export default ReferenceInput;