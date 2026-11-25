import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptRelativizationFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.oss.relativization')}</h1>
      <p>
        La relativisation transforme un schéma conceptuel pour que les concepts prennent des valeurs et que les
        conditions soient vérifiées dans chaque contexte.
      </p>
      <h2>Contextes et valeurs</h2>
      <ul>
        <li>
          Le <b>constituant à relativiser</b> détermine ce qui constitue un contexte. Pour un ensemble de base{' '}
          <code>X#</code>, un contexte est un sous-ensemble de ses éléments. Pour une structure générique{' '}
          <code>S#</code>, il s’agit d’une valeur entière de cette structure.
        </li>
        <li>
          L’<b>axe des contextes</b> est une structure générique du schéma résultat qui contient les contextes
          admissibles.
        </li>
        <li>
          Un <b>constituant exclu</b> est un concept non défini qui reste commun aux contextes.
        </li>
        <li>
          Une <b>famille de valeurs d’un terme</b> est un ensemble de couples « contexte, valeur du terme dans ce
          contexte ». Si la valeur est un ensemble, celui-ci occupe en entier la seconde composante du couple.
        </li>
        <li>
          Une <b>fonction de dérélativisation</b> est ajoutée au besoin. Elle extrait d’une famille ou d’une relation
          indexée par contexte l’unique valeur correspondant au contexte choisi.
        </li>
      </ul>
      <p>
        Soit <code>X1</code> un ensemble de sommets et <code>D1 := X1</code> le terme qui renvoie tous les sommets. Si
        les contextes admissibles sont <code>{'{a, b}'}</code> et <code>{'{b, d}'}</code>, la famille contient{' '}
        <code>{'({a, b}, {a, b})'}</code> et <code>{'({b, d}, {b, d})'}</code>.
      </p>
      <h2>Comment relativiser un schéma</h2>
      <ol>
        <li>
          Pour un résultat autonome, ouvrez « {tx('tx.general.editing')} » dans le{' '}
          <LinkTopic text='schéma source' topic={HelpTopic.UI_SCHEMA_MENU} />. Pour un résultat lié, ouvrez « Ajouter… »
          dans le <LinkTopic text='graphe du SOS' topic={HelpTopic.UI_OSS_GRAPH} />. Choisissez «{' '}
          {tx('tx.oss.relativization')} ».
        </li>
        <li>
          Dans un SOS, sélectionnez le schéma source. Choisissez le constituant à relativiser, le nom du contexte, le
          titre et l’abréviation du résultat. Ouvrez « Constituants exclus » pour choisir les notions communes aux
          contextes.
        </li>
        <li>
          Cliquez sur « {tx('tx.oss.relativization.review.start')} ». Le Portail détermine la langue des propositions à
          partir des textes du schéma source. Ouvrez chaque proposition du noyau et vérifiez le terme, la définition
          textuelle, la convention et la typification. Apportez les précisions demandées et confirmez la création.
        </li>
      </ol>
      <h2>Que devient le résultat</h2>
      <p>
        Un résultat autonome provient d’un instantané du schéma source. Dans un SOS, les modifications de la source
        mettent à jour le résultat, qui peut servir d’argument à une synthèse. Le Portail rejette une modification qui
        supprime le constituant choisi ou rend une famille non calculable lors de la transformation.
      </p>
      <p>
        Voir le <LinkTopic text='glossaire' topic={HelpTopic.THESAURUS} /> et le{' '}
        <LinkTopic text='schéma opérationnel de synthèse' topic={HelpTopic.CC_OSS} />.
      </p>
    </>
  );
}
