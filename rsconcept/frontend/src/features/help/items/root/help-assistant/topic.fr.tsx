import { useTx } from '@/i18n';

export function HelpAssistantFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.ai')}</h1>
      <p>
        L&apos;assistant IA aide à travailler sur le domaine et les schémas conceptuels au moyen de chatbots LLM
        génératifs. Les utilisateurs peuvent créer des modèles de requêtes avec des variables intégrées{' '}
        {`{{nom-de-variable}}`} ou en choisir dans la liste des modèles disponibles.
      </p>
      <p>
        Lors de l&apos;application d&apos;un modèle, une requête pour le LLM est générée où chaque variable est remplacée
        par la valeur correspondante du contexte actuel du portail.
      </p>
      <p>
        La fonctionnalité est en exploitation pilote. La connexion directe à un chatbot n&apos;est pas prise en charge.
        La requête obtenue doit être copiée manuellement vers un chat LLM externe.
      </p>
    </>
  );
}
