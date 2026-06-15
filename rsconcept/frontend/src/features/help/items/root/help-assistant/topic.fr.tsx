import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpAssistantFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.ai')}</h1>
      <p>
        L&apos;assistant IA aide à travailler sur le domaine et les schémas conceptuels au moyen de chatbots LLM
        génératifs.
      </p>

      <h2>Requêtes LLM</h2>
      <p>
        Les utilisateurs peuvent créer des modèles de requêtes avec des variables intégrées {`{{nom-de-variable}}`} ou
        en choisir dans la liste des modèles disponibles.
      </p>
      <p>
        Lors de l&apos;application d&apos;un modèle, une requête pour le LLM est générée où chaque variable est
        remplacée par la valeur correspondante du contexte actuel du portail.
      </p>
      <p>
        La connexion directe à un chatbot n&apos;est pas prise en charge. La requête obtenue doit être copiée
        manuellement vers un chat LLM externe.
      </p>

      <h2>rstool — bibliothèque pour agents IA externes</h2>
      <p>
        Le paquet <TextURL text='@rsconcept/rstool' href={external_urls.git_rstool} /> est une bibliothèque pour les
        agents IA externes qui travaillent avec les schémas conceptuels du Portail. Il permet la construction
        incrémentale de RSForm, l&apos;analyse d&apos;expressions RSLang, le diagnostic, la modélisation et
        l&apos;évaluation. Utilisez-le depuis le code ou via l&apos;enveloppe stdio JSON <code>rstool-wrapper</code>.
      </p>
      <p>
        Les agents peuvent installer la compétence <code>rstool-helper</code> fournie, avec un guide sur le langage RS
        et les scénarios courants. Installation et exemples :{' '}
        <TextURL text='documentation rstool' href={external_urls.git_rstool} />.
      </p>

      <h2>MCP — connexion d&apos;un agent</h2>
      <p>
        <TextURL text='@rsconcept/rstool-mcp' href={external_urls.git_rstool_mcp} /> est un adaptateur du protocole
        Model Context Protocol (MCP) pour rstool. Il expose l&apos;intégralité du contrat rstool (sessions,
        constituantes, analyse, diagnostic, modélisation) sous forme d&apos;outils MCP via stdio, pour connecter rstool
        à Cursor, Claude Desktop et d&apos;autres environnements compatibles MCP.
      </p>
      <p>
        Lancement : <code>npx rstool-mcp</code>. Exemples de configuration pour Cursor et catalogue d&apos;outils :{' '}
        <TextURL text='documentation rstool-mcp' href={external_urls.git_rstool_mcp} />.
      </p>
    </>
  );
}
