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
        Saisissez le <b>nom de la famille</b> pour fixer le nouveau point de vue. Dans le{' '}
        <LinkTopic text='schéma conceptuel' topic={HelpTopic.CC_SYSTEM} /> résultant, le Portail ajoute ce nom aux
        termes de la cible et des constituants relativisés.
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
          le champ obligatoire « {tx('tx.oss.relativization.context.name')} ».
        </li>
        <li>
          Dans « {tx('tx.oss.relativization.excluded')} », sélectionnez les concepts communs à tous les contextes.
        </li>
        <li>
          Dans « {tx('tx.oss.relativization.result')} », indiquez le titre et une abréviation unique dans le SOS. Vous
          pouvez aussi modifier la description et choisir un bloc parent si le SOS contient des blocs.
        </li>
      </ul>
      <h3>Travailler sur le résultat</h3>
      <p>
        Cliquez sur « {tx('tx.general.save')} » pour appliquer les paramètres. Le Portail recalcule les formules et
        ouvre le schéma résultant. Après la création ou l’enregistrement, vérifiez le sens du résultat et modifiez au
        besoin les termes, les définitions textuelles et les conventions dans le schéma.
      </p>
      <p>
        Lors de la propagation des changements ou de la modification des paramètres, le SOS conserve vos modifications
        sur les constituants qui subsistent. Les autres textes sont recalculés. Pour modifier les expressions formelles
        des constituants hérités ou des artefacts générés, modifiez le schéma source ou les paramètres de
        relativisation. Si la cible est un ensemble de base, la structure des contextes en hérite et la copie de
        l’ensemble est un artefact généré par l’opération.
      </p>
    </>
  );
}
