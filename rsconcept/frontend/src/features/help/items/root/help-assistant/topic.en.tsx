import { useTx } from '@/i18n';

export function HelpAssistantEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.ai')}</h1>
      <p>
        The AI assistant supports work on the subject domain and conceptual schemes using generative LLM chatbots.
        Users can create prompt templates with built-in placeholders {`{{variable-name}}`} or pick from available
        templates.
      </p>
      <p>
        When a template is applied, an LLM prompt is assembled with every placeholder replaced by the corresponding
        value from the current Portal context.
      </p>
      <p>
        This feature is in pilot operation. Direct chatbot integration is not supported. You are expected to copy the
        generated prompt into an external LLM chat manually.
      </p>
    </>
  );
}
