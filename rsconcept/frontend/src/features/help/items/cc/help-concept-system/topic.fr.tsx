import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptSystemFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.schema.hint')}</h1>
      <p>
        Cette section introduit le <b>système de définitions</b> en tant qu'objet de la conceptualisation des domaines
        d'application. Un système de définitions désigne un ensemble de concepts et d'assertions individuels, ainsi que
        les relations entre eux, établies par les définitions des concepts.
      </p>

      <p>
        Un système de définitions est un outil pour étudier un objet depuis un point de vue sélectionné par le problème
        traité. Un tel outil est soumis à des exigences de <b>capacité expressive</b> — la capacité de distinguer un
        ensemble d'entités du domaine — et à l'absence d'ambiguïté d'interprétation.
      </p>

      <p>
        Un schéma conceptuel est souvent appelé une <b>théorie du domaine d'application</b>, car il permet de fixer le
        système de définitions en tant que théorie axiomatique dans un certain appareil formel. Un modèle conceptuel est
        la combinaison d'un schéma conceptuel et des fonctions d'interprétation de ses concepts dans le domaine
        d'application.
      </p>

      <p>
        Un système de définitions est construit sur des <b>concepts indéfinis</b>, auxquels est donnée une définition
        informelle appelée <b>convention</b> — un accord communément compris entre les participants sur la mise en
        correspondance des concepts indéfinis avec des entités ou objets du domaine d'application. En plus de la
        convention, un ensemble d'assertions reliant les concepts indéfinis, appelées <b>axiomes</b>, est souvent
        spécifié.
      </p>

      <p>
        Les autres concepts reçoivent des définitions formelles selon une méthode d'explication uniformément comprise
        par tous les participants. Le Portail prend en charge l'
        <LinkTopic text='explication en genres de structures' topic={HelpTopic.RSLANG} />. Des assertions
        supplémentaires au-delà des axiomes, appelées <b>théorèmes</b>, peuvent également être énoncées. Les concepts
        qui reçoivent des définitions formelles sont appelés <b>dérivés</b>. Il convient de noter que dans l'explication
        en genres de structures, les axiomes incluent également les relations de{' '}
        <LinkTopic text='typification' topic={HelpTopic.RSL_TYPIFICATION} />, et les concepts dérivés comprennent les
        termes, les fonctions-terme et les fonctions-prédicat.
      </p>

      <p>
        Le Portail prend également en charge la forme d'attribution, où des relations d'attribution sont établies entre
        les entités nommées (nominoïdes). Il est possible de combiner les deux formes d'explication dans un seul schéma
        conceptuel.
      </p>

      <p>
        Le <b>noyau</b> d'un schéma conceptuel est l'ensemble des concepts de base, des axiomes et des concepts dérivés
        intermédiaires nécessaires pour former les expressions des axiomes. Les autres concepts appartiennent au{' '}
        <b>corps</b> du schéma conceptuel.
      </p>

      <p>
        Pour atteindre la capacité expressive requise, un schéma conceptuel identifie des concepts « clés » qui sont
        déductivement dérivés des concepts de base par la dérivation séquentielle de concepts intermédiaires. Cette
        activité est appelée <b>déploiement</b> des termes (le corps de la théorie). L'appareil formel utilisé permet,
        en plus des concepts clés, de former la pleine variété des concepts à partir des bases identifiées lors de la
        construction des termes clés. Ces variétés construites peuvent être utilisées pour formuler des solutions,
        notamment dans un cadre réglementaire.
      </p>

      <p>
        Les diverses relations entre les concepts et les méthodes de construction des systèmes de définitions sont
        explorées en détail dans la section <LinkTopic text='Relations conceptuelles' topic={HelpTopic.CC_RELATIONS} />.
      </p>
    </>
  );
}
