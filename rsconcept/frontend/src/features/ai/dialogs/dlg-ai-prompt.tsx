import { useState } from 'react';

import { ModalForm } from '@/components/modal';

import { type IPromptTemplate } from '../backend/types';

export interface DlgAIPromptDialogProps {
  onPromptSelected?: (prompt: IPromptTemplate) => void;
}

const mockPrompts: IPromptTemplate[] = [
  {
    id: 1,
    owner: null,
    label: 'Greeting',
    is_shared: true,
    description: 'A simple greeting prompt.',
    text: 'Hello, ${name}! How can I assist you today?'
  },
  {
    id: 2,
    owner: null,
    is_shared: true,
    label: 'Summary',
    description: 'Summarize the following text.',
    text: 'Please summarize the following: ${text}'
  }
];

export function DlgAIPromptDialog() {
  const [selectedPrompt, setSelectedPrompt] = useState<IPromptTemplate | null>(mockPrompts[0]);

  return (
    <ModalForm
      header='AI Prompt Generator'
      submitText='Generate Prompt'
      canSubmit={!!selectedPrompt}
      onSubmit={e => {
        e.preventDefault();
        // Placeholder for generate logic
      }}
      className='w-120 px-6 cc-column'
    >
      <div className='mb-4'>
        <label htmlFor='prompt-select' className='block mb-2 font-semibold'>
          Select a prompt:
        </label>
        <select
          id='prompt-select'
          className='w-full border rounded p-2'
          value={selectedPrompt?.id}
          onChange={e => {
            const prompt = mockPrompts.find(p => String(p.id) === e.target.value) || null;
            setSelectedPrompt(prompt);
          }}
        >
          {mockPrompts.map(prompt => (
            <option key={prompt.id} value={prompt.id}>
              {prompt.label}
            </option>
          ))}
        </select>
      </div>
      {selectedPrompt && (
        <div className='mb-4'>
          <div className='font-semibold'>Label:</div>
          <div className='mb-2'>{selectedPrompt.label}</div>
          <div className='font-semibold'>Description:</div>
          <div className='mb-2'>{selectedPrompt.description}</div>
          <div className='font-semibold'>Template Text:</div>
          <pre className='bg-gray-100 p-2 rounded'>{selectedPrompt.text}</pre>
        </div>
      )}
    </ModalForm>
  );
}
