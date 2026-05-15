import { useTx } from '@/i18n';

import { IconCalculateAll, IconDatabaseOff, IconStatusOK, IconText, IconTree, IconTypeGraph } from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSModelEvaluatorFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.evaluation')}</h1>
      <p>
        Cet onglet permet de vérifier et de calculer des expressions arbitraires dans le contexte du modèle actuel, sans
        modifier les constituants ni leurs interprétations. Cela est utile pour déboguer des formules, vérifier les
        typifications et inspecter des résultats intermédiaires
      </p>

      <h2>{tx('tx.general.controls')}</h2>
      <ul>
        <li>entrer une expression en genres de structures dans le champ supérieur</li>
        <li>la typification, les erreurs d'analyse et la valeur calculée s'affichent en dessous</li>
        <li>
          pour lancer le calcul, cliquez sur le bouton de <LinkTopic text='statut' topic={HelpTopic.UI_EVAL_STATUS} />{' '}
          au centre
        </li>
        <li>
          après le calcul, les nombres d'itérations et de hits de cache s'affichent en dessous (information pour le
          débogage)
        </li>
        <li>
          <IconStatusOK className='inline-icon' /> le résultat peut être ouvert dans le dialogue de visualisation de
          valeur
        </li>
        <li>
          <IconCalculateAll className='inline-icon icon-green' /> le bouton du panneau recalcule le modèle entier
        </li>
        <li>
          <IconDatabaseOff className='inline-icon' /> le bouton du panneau désactive le cache de calcul
        </li>
        <li>
          <IconTypeGraph className='inline-icon' /> afficher le{' '}
          <LinkTopic text='graphe de types' topic={HelpTopic.UI_TYPE_GRAPH} />
        </li>
        <li>
          <IconTree className='inline-icon' /> afficher l'{' '}
          <LinkTopic text='arbre syntaxique' topic={HelpTopic.UI_FORMULA_TREE} />
        </li>
        <li>
          <IconText className='inline-icon' /> afficher texte ou identifiants
        </li>
      </ul>
    </>
  );
}
