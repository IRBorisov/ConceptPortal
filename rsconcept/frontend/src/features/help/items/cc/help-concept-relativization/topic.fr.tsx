import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelativizationFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        La relativisation change le point de vue sur une entité individuelle, appelée <b>cible de relativisation</b>. On
        considère cette entité comme une collection d’entités de même nature. Chacune de ces entités donne un contexte
        aux concepts et aux énoncés dépendants.
      </p>
      <p>
        Saisissez le <b>nom de la famille</b> pour fixer le nouveau point de vue. Le Portail le propose comme terme pour
        l’ensemble des contextes dans le <LinkTopic text='schéma conceptuel' topic={HelpTopic.CC_SYSTEM} /> résultant.
      </p>
      <p>
        Pour obtenir l’<b>ensemble des contextes</b>, le Portail applique l’
        <LinkTopic text='opérateur d’ensemble des parties' topic={HelpTopic.RSL_TYPIFICATION} /> au domaine de
        définition de la cible. Les autres <LinkTopic text='concepts non définis' topic={HelpTopic.CC_CONSTITUENTA} />{' '}
        du schéma source peuvent être associés à cet ensemble ou être exclus de la relativisation.
      </p>
      <p>
        Le Portail réécrit les formules des énoncés et des concepts dérivés qui dépendent de la cible ou de concepts non
        définis relativisés. Ces formules utilisent les valeurs des concepts dans le contexte courant. Les termes
        dépendants deviennent des familles de couples « contexte, valeur ». Les fonctions et les prédicats reçoivent le
        contexte en premier argument. Les axiomes et les énoncés sont vérifiés dans tous les contextes admissibles.
      </p>
      <p>
        Dans les <LinkTopic text='définitions formelles' topic={HelpTopic.CC_CONSTITUENTA} />, le Portail utilise une{' '}
        <b>fonction de dérélativisation</b>. Elle extrait d’un constituant relativisé l’unique valeur pour un contexte
        donné.
      </p>
      <h2>Modifier une opération dans un SOS</h2>
      <p>
        Dans le <LinkTopic text='graphe du SOS' topic={HelpTopic.UI_OSS_GRAPH} />, faites un clic droit sur le nœud de
        relativisation et choisissez « {tx('tx.general.edit')} ». La boîte de dialogue affiche le schéma source et les
        paramètres enregistrés de l’opération.
      </p>
      <ul>
        <li>
          Dans « {tx('tx.oss.relativization.target.focus')} », vous pouvez choisir un{' '}
          <LinkTopic text='ensemble de base ou une structure générique' topic={HelpTopic.CC_CONSTITUENTA} />. Renseignez
          le champ obligatoire « {tx('tx.oss.relativization.review.context.name')} ».
        </li>
        <li>
          Dans « {tx('tx.oss.relativization.excluded')} », sélectionnez les concepts communs à tous les contextes.
        </li>
        <li>
          Dans « {tx('tx.oss.relativization.result')} », indiquez le titre et une abréviation unique dans le SOS. Vous
          pouvez aussi modifier la description et choisir un bloc parent si le SOS contient des blocs.
        </li>
      </ul>
      <h3>Enregistrer le résultat</h3>
      <ul>
        <li>
          « {tx('tx.oss.relativization.quick.update')} » applique les paramètres directement. Le Portail reprend les
          textes déjà confirmés pour les constituants correspondants et génère les autres textes.
        </li>
        <li>
          « {tx('tx.oss.relativization.review.start')} » ouvre un brouillon. Ouvrez les lignes marquées «{' '}
          {tx('tx.oss.relativization.review.required')} » et comparez les textes avant et après la transformation.
          Modifiez au besoin les{' '}
          <LinkTopic text='termes, définitions textuelles et conventions' topic={HelpTopic.CC_CONSTITUENTA} />.
          Renseignez les champs signalés et confirmez les précisions. Cliquez sur «{' '}
          {tx('tx.oss.relativization.review.update')} » pour enregistrer les textes et les paramètres.
        </li>
      </ul>
      <p>
        Le Portail peut afficher « {tx('tx.oss.relativization.review.conflict')} » au recalcul du brouillon, par exemple
        après un changement du nom de la famille. Cela arrive si le nouveau texte proposé diffère d’une version déjà
        confirmée ou de votre modification en cours. Le choix est aussi nécessaire si le texte enregistré a changé
        pendant votre travail et diffère de votre modification. Sélectionnez la version à utiliser.
      </p>
      <p>
        Si le schéma source change pendant la vérification, choisissez « {tx('tx.oss.relativization.review.back')} » et
        relancez la vérification des textes.
      </p>
      <p>
        Quand vous sélectionnez « {tx('tx.oss.relativization.quick.update')} » ou «{' '}
        {tx('tx.oss.relativization.review.update')} », le Portail recalcule le schéma résultant et vérifie les formules
        transformées. Il ouvre le schéma une fois l’enregistrement réussi.
      </p>
    </>
  );
}
