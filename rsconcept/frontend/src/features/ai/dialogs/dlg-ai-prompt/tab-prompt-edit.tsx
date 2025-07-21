import { TextArea } from '@/components/input';

interface TabPromptEditProps {
  label: string;
  description: string;
  text: string;
  setText: (value: string) => void;
}

export function TabPromptEdit({ label, description, text, setText }: TabPromptEditProps) {
  return (
    <div className='cc-column'>
      <div className='flex flex-col gap-2'>
        <TextArea
          id='prompt-label'
          label='Название' //
          value={label}
          disabled
          noResize
          rows={1}
        />
        <TextArea id='prompt-description' label='Описание' value={description} disabled noResize rows={3} />
        <TextArea
          id='prompt-text' //
          label='Текст шаблона'
          value={text}
          onChange={event => setText(event.target.value)}
          noResize
          rows={8}
        />
      </div>
    </div>
  );
}
