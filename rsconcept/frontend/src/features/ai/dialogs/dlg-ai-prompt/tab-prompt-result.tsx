import { TextArea } from '@/components/input';

interface TabPromptResultProps {
  prompt: string;
}

export function TabPromptResult({ prompt }: TabPromptResultProps) {
  return (
    <TextArea
      aria-label='Сгенерированное сообщение'
      value={prompt}
      placeholder='Текст шаблона пуст'
      disabled
      areaClassName='w-full h-88'
    />
  );
}
