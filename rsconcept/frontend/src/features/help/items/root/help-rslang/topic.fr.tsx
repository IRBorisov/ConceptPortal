import { useTx } from '@/i18n';

import { external_urls, videos } from '@/utils/constants';

import { BadgeVideo } from '../../../components/badge-video';
import { LinkTopic } from '../../../components/link-topic';
import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.rslang.short')}</h1>
      <p>
        L&apos;écriture formelle (<i>explicitation</i>) des schémas conceptuels s&apos;appuie sur le langage des genres de
        structures (ci-après, le Langage). Cette rubrique présente les notions principales et les constructions formelles.
        Le Langage est, dans son fond, une logique du premier ordre ; les notations supplémentaires s&apos;appuient sur le
        prédicat d&apos;appartenance <code>x∈y</code>.
      </p>
      <p>
        Des règles strictes régissent l&apos;écriture des identifiants pour les concepts, variables locales et littéraux.
      </p>
      <p>
        Les éléments du Langage se classent en expressions ensemblistes et expressions logiques. En première approximation,
        une expression ensembliste renvoie un élément d&apos;un <LinkTopic topic={HelpTopic.RSL_TYPIFICATION} text='étage' /> donné,
        tandis qu&apos;une expression logique renvoie VRAI ou FAUX.
      </p>
      <p>
        Des expressions paramétrées et des modèles sont également admis ; leurs valeurs et leur typage dépendent des
        paramètres. On les utilise dans les définitions de{' '}
        <LinkTopic topic={HelpTopic.CC_CONSTITUENTA} text='fonctions-terme et fonctions-prédicat' />
        .
      </p>
      <p>Les expressions qui manipulent les étages des opérandes sont dites structurelles.</p>
      <p>
        Des constructions plus complexes, qui définissent un ensemble par sélection d&apos;éléments — de façon impérative
        ou récursive — sont traitées à part.
      </p>

      <Subtopics headTopic={HelpTopic.RSLANG} />

      <div className='dense'>
        <p>Ressources d&apos;introduction au langage des genres de structures :</p>
        <p>
          1. <BadgeVideo className='inline-icon' video={videos.explication} /> Vidéo : brève introduction à l&apos;appareil
          formel
        </p>
        <p>
          2.{' '}
          <a className='underline' href={external_urls.ponomarev}>
            Texte : manuel d&apos;I. N. Ponomarev
          </a>
        </p>
        <p>
          3.{' '}
          <a className='underline' href={external_urls.full_course}>
            Vidéo : cours de quatrième année (2e semestre 2022-23)
          </a>
        </p>
      </div>
    </>
  );
}
