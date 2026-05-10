import { useTx } from '@/i18n';

import {
  IconAxiomFalse,
  IconChild,
  IconConceptBlock,
  IconConsolidation,
  IconCrucial,
  IconCstAxiom,
  IconCstBaseSet,
  IconCstConstSet,
  IconCstFunction,
  IconCstNominal,
  IconCstPredicate,
  IconCstStructured,
  IconCstTerm,
  IconCstTheorem,
  IconDownload,
  IconEmptyTerm,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconNotCalculated,
  IconOSS,
  IconPredecessor,
  IconReference,
  IconRSForm,
  IconRSFormImported,
  IconRSFormOwned,
  IconRSModel,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusProperty,
  IconStatusUnknown,
  IconSynthesis
} from '@/components/icons';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpThesaurusFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.lang.thesaurus')}</h1>
      <p>
        Cette rubrique recense les principaux termes et définitions utilisés sur le portail. Ils sont regroupés par
        entités clés. Les liens entre termes sont détaillés dans d&apos;autres sections d&apos;aide via des hyperliens.
        Des repères graphiques (icônes, couleurs) pour l&apos;identification visuelle sont également indiqués.
      </p>

      <h2>{tx('tx.schema')}</h2>
      <p>
        <IconRSForm className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Schéma conceptuel' topic={HelpTopic.CC_SYSTEM} /> (<i>système de définitions, SD</i>) —
        l&apos;ensemble des concepts et assertions et des liens entre eux fixés par les définitions.
      </p>
      <p>
        L&apos;explicitation d&apos;un SD est la présentation du schéma conceptuel dans un langage de description choisi
        (constructions syntaxiques et règles de formation des définitions).
      </p>
      <p>
        L&apos;explicitation RS d&apos;un SD est son explicitation au moyen de l&apos;
        <LinkTopic text='appareil des genres de structures' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Graphe des termes — graphe orienté dont les nœuds sont les constituants du SD ; les arcs reflètent la présence
        du nom d&apos;un constituant dans la définition d&apos;un autre.
      </p>

      <p>
        Noyau du SD — concepts de base, axiomes et concepts dérivés nécessaires pour énoncer les axiomes. Les autres
        constituants forment le corps du SD.
      </p>

      <ul>
        Types de SD par rapport aux opérations OSS :
        <li>
          <IconRSForm className='inline-icon' />
          {'\u2009'}SD libre — non rattaché à une opération OSS.
        </li>
        <li>
          <IconRSFormOwned className='inline-icon' />
          {'\u2009'}SD propre à cet OSS — rattaché à une opération de même propriétaire et emplacement que cet OSS.
        </li>
        <li>
          <IconRSFormImported className='inline-icon' />
          {'\u2009'}SD externe à cet OSS — rattaché à une opération dont le propriétaire ou l&apos;emplacement diffère des
          attributs de l&apos;OSS.
        </li>
      </ul>

      <h2>{tx('tx.cst')}</h2>
      <p>
        Constituant — partie du SD qui est soit un concept distinct, soit un schéma de construction de concept, soit une
        assertion liant des concepts introduits. Les{' '}
        <LinkTopic text='Attributs du constituant' topic={HelpTopic.CC_CONSTITUENTA} /> en explicitation RS sont Terme,
        Convention, Typage (Structure), Définition formelle, Définition textuelle, Commentaire.
      </p>
      <p>
        <IconCrucial className='inline-icon' /> Un constituant clé sert de repère pour les constituants importants sur le
        fond. Ils sont mis en évidence visuellement et servent au filtrage.
      </p>

      <br />

      <ul>
        <b>Classification selon la nature de la définition formelle</b>
        <li>
          Concept de base (<i>concept non défini</i>) sans définition, fixé par convention et axiomes.
        </li>
        <li>
          Concept dérivé (<i>concept définissable</i>) muni d&apos;une définition formelle.
        </li>
        <li>Une assertion est donnée par une expression logique.</li>
        <li>Un modèle contient un paramètre libre dans la définition.</li>
      </ul>

      <br />

      <ul>
        <b>Types de constituants</b>
        <li>
          <IconCstNominal className='inline-icon' />
          {'\u2009'}Nominal (N#) — entité de domaine sans définition nette, sert au regroupement associatif des
          constituants et à la fixation préliminaire de relations de fond.
        </li>
        <li>
          <IconCstBaseSet className='inline-icon' />
          {'\u2009'}Ensemble de base (X#) — concept non défini représenté comme ensemble d&apos;éléments discernables.
        </li>
        <li>
          <IconCstConstSet className='inline-icon' />
          {'\u2009'}Ensemble constant (C#) — concept non défini modélisé par un terme en théorie des ensembles autorisant
          des opérations formelles sur ses éléments.
        </li>
        <li>
          <IconCstStructured className='inline-icon' />
          {'\u2009'}Structure de genre (S#) — concept non défini structuré sur ensembles de base et constants. Le
          contenu est formé par la <LinkTopic text='relation de typage' topic={HelpTopic.RSL_TYPIFICATION} />, les axiomes
          et la convention.
        </li>
        <li>
          <IconCstAxiom className='inline-icon' />
          {'\u2009'}Axiome (A#) — assertion limitant concepts non définis et termes dérivés. Chaque axiome doit valoir
          vrai pour que le SD soit une théorie du domaine.
        </li>
        <li>
          <IconCstTerm className='inline-icon' />
          {'\u2009'}Terme (D#) — concept dérivé.
        </li>
        <li>
          <IconCstFunction className='inline-icon' />
          {'\u2009'}Fonction-terme (F#) — concept dérivé paramétré avec relation fonctionnelle entre arguments et résultat.
        </li>
        <li>
          <IconCstPredicate className='inline-icon' />
          {'\u2009'}Fonction-prédicat (P#) — concept dérivé agissant comme expression logique testant les arguments.
        </li>
        <li>
          <IconCstTheorem className='inline-icon' />
          {'\u2009'}Théorème (T#) — assertion matériellement significative, vraie ou fausse.
        </li>
      </ul>

      <br />

      <ul>
        <b>Relations par occurrence dans les définitions</b>
        <li>
          <IconGraphOutputs className='inline-icon' />
          {'\u2009'}Consommateurs — emploient le constituant dans leurs définitions.
        </li>
        <li>
          <IconGraphInputs className='inline-icon' />
          {'\u2009'}Fournisseurs — cités dans la définition de ce constituant.
        </li>
        <li>
          <IconGraphExpand className='inline-icon' />
          {'\u2009'}Dépendants — consommateurs directs ou indirects.
        </li>
        <li>
          <IconGraphCollapse className='inline-icon' />
          {'\u2009'}Influents — fournisseurs directs ou indirects.
        </li>
      </ul>

      <br />

      <ul>
        <b>Notions étroitement liées</b>
        <li>
          Expression génératrice — définition formelle fondée sur un seul constituant externe sans contenu nouveau.
        </li>
        <li>Base de ce concept — concept sur lequel repose l&apos;expression génératrice.</li>
        <li>Concept généré — défini par une expression génératrice fondée sur un autre concept.</li>
      </ul>

      <br />

      <ul>
        <b>Statuts de correction de la définition</b>
        <li>
          <IconStatusUnknown className='inline-icon' />
          {'\u2009'}non vérifié — la définition doit encore être contrôlée.
        </li>
        <li>
          <IconStatusOK className='inline-icon' />
          {'\u2009'}correct — la définition est valide.
        </li>
        <li>
          <IconStatusError className='inline-icon' />
          {'\u2009'}erroné — erreur détectée.
        </li>
        <li>
          <IconStatusProperty className='inline-icon' />
          {'\u2009'}non mesurable — spécifie un ensemble non calculable pour lequel l&apos;appartenance peut être testée ;
        </li>
        <li>
          <IconStatusIncalculable className='inline-icon' />
          {'\u2009'}incalculable — la définition ne peut être interprétée directement ;
        </li>
      </ul>

      <br />

      <ul>
        <b>Identification des constituants</b>
        <li>Constituants identifiés — liés par une relation d&apos;identification.</li>
        <li>À retirer — constituant destiné à être supprimé.</li>
        <li>Remplaçant — constituant dont la désignation remplace celle supprimée.</li>
      </ul>

      <br />

      <ul>
        <b>Héritage des constituants (dans un OSS)</b>
        <li>
          <IconChild className='inline-icon' />
          {'\u2009'}Constituant hérité — obtenu depuis un autre SD.
        </li>
        <li>
          <IconPredecessor className='inline-icon' />
          {'\u2009'}Propre — non hérité.
        </li>
        <li>
          <IconPredecessor className='inline-icon' />
          {'\u2009'}Source — constituant propre dont le présent est un descendant direct ou indirect.
        </li>
      </ul>

      <h2>{tx('tx.oss')}</h2>
      <p>
        <IconOSS className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Schéma opérationnel de synthèse' topic={HelpTopic.CC_OSS} /> (OSS) — système d&apos;opérations
        sur les schémas conceptuels.
      </p>
      <p>
        Graphe de synthèse — graphe orienté dont les sommets sont des opérations et les arêtes des dépendances sur les
        résultats.
      </p>
      <p>
        <IconConceptBlock className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Bloc conceptuel' topic={HelpTopic.CC_STRUCTURING} /> — partie nominalement délimitée du domaine
        qui cadre l&apos;affectation des schémas conceptuels de l&apos;OSS aux aspects du domaine.
      </p>

      <p>
        Opération — partie distinguée de l&apos;OSS qui définit comment obtenir un SD dans l&apos;OSS.
      </p>
      <p>
        <IconReference className='inline-icon' />
        {'\u2009'}Réplique — duplique la vue graphique du résultat d&apos;une opération pour raccourcir les liaisons
        entre sommets.
      </p>
      <p>
        <IconConsolidation className='inline-icon' />
        {'\u2009'}Synthèse en losange — opération utilisant des SD ayant des ancêtres communs.
      </p>

      <ul>
        <b>Types d&apos;opérations dans l&apos;OSS</b>
        <li>
          <IconReference className='inline-icon' />
          {'\u2009'}réplication du résultat d&apos;une autre opération.
        </li>
        <li>
          <IconDownload className='inline-icon' />
          {'\u2009'}chargement d&apos;un SD depuis la bibliothèque.
        </li>
        <li>
          <IconSynthesis className='inline-icon' />
          {'\u2009'}synthèse de schémas conceptuels.
        </li>
      </ul>

      <h2>{tx('tx.model')}</h2>
      <p>
        <IconRSModel className='inline-icon' />
        {'\u2009'}
        <LinkTopic text='Modèle conceptuel' topic={HelpTopic.CC_RSMODEL} /> est une interprétation d&apos;un{' '}
        <LinkTopic text='schéma conceptuel' topic={HelpTopic.CC_SYSTEM} /> où des valeurs concrètes sont attribuées aux
        constituants interprétables. Il montre comment les ensembles de base sont remplis, comment les valeurs
        structurelles se construisent et si les axiomes sont satisfaits.
      </p>
      <p>
        L&apos;interprétation associe une valeur à un constituant dans le modèle. Pour ensembles de base et constants et
        structures de genre, elle est saisie par l&apos;utilisateur ; pour axiomes, termes et théorèmes elle peut être
        calculée à partir de la définition formelle et des valeurs déjà fixées.
      </p>
      <p>
        <IconAxiomFalse className='inline-icon' />
        {'\u2009'}Axiome violé — axiome dont l&apos;interprétation dans ce modèle est FAUX. Un tel modèle ne satisfait pas
        pleinement le système axiomatique.
      </p>
      <p>
        <IconNotCalculated className='inline-icon' />
        {'\u2009'}Constituants incalculables — expressions dont l&apos;évaluation entraîne une croissance exponentielle
        des ressources.
      </p>
      <p>
        <IconEmptyTerm className='inline-icon' />
        {'\u2009'}Termes vides — termes dont la valeur courante est l&apos;ensemble vide. Les termes pour le pilotage et la
        décision ne doivent pas être vides.
      </p>
    </>
  );
}
