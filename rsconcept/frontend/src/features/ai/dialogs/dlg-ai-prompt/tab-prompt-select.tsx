import { TextArea } from '@/components/input';

import { usePromptTemplateSuspense } from '../../backend/use-prompt-template';

interface TabPromptSelectProps {
  promptID: number;
}

export function TabPromptSelect({ promptID }: TabPromptSelectProps) {
  const { promptTemplate } = usePromptTemplateSuspense(promptID);

  return (
    <div className='cc-column'>
      {promptTemplate && (
        <div className='flex flex-col gap-2'>
          <TextArea
            id='prompt-label'
            label='Название' //
            value={promptTemplate.label}
            disabled
            noResize
            rows={1}
          />
          <TextArea
            id='prompt-description'
            label='Описание'
            value={promptTemplate.description}
            disabled
            noResize
            rows={3}
          />
          <TextArea
            id='prompt-text' //
            label='Текст шаблона'
            value={promptTemplate.text}
            disabled
            noResize
            rows={6}
          />
        </div>
      )}
    </div>
  );
}
