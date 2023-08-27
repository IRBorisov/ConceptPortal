import { useState } from 'react';
import { unstable_usePrompt } from 'react-router-dom';

function usePromptUnsaved() {
  const [isModified, setIsModified] = useState(false);
  unstable_usePrompt({
    when: isModified,
    message: 'Изменения не сохранены. Вы уверены что хотите совершить переход?'
  });

  return {isModified, setIsModified};
}

export default usePromptUnsaved;