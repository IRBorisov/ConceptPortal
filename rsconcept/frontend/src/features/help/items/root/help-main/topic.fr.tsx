import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls, prefixes } from '@/utils/constants';

import { LinkTopic } from '../../../components/link-topic';
import { TopicItem } from '../../../components/topic-item';
import { HelpTopic } from '../../../models/help-topic';

export function HelpMainFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.shell.app')}</h1>
      <p>
        Le portail fournit des outils puissants pour l&apos;analyse formelle et la modélisation des domaines, avec une
        description structurée et un travail approfondi sur les concepts au moyen des{' '}
        <LinkTopic text='Genres de structures' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Créez des <LinkTopic text='Schémas conceptuels' topic={HelpTopic.CC_SYSTEM} /> — des systèmes de définitions
        composés de <LinkTopic text='Constituants' topic={HelpTopic.CC_CONSTITUENTA} /> aux définitions formelles et à
        la structure explicites. Visualisez et explorez la structure des définitions et le graphe des liens entre
        concepts.
      </p>
      <p>
        Rassemblez des schémas séparés en{' '}
        <LinkTopic text='Schémas opérationnels de synthèse' topic={HelpTopic.CC_OSS} /> de grande envergure pour des
        domaines complexes.
      </p>
      <p>
        Intégrez les définitions formelles aux données des sources du domaine en construisant des{' '}
        <LinkTopic text='Modèles conceptuels' topic={HelpTopic.CC_RSMODEL} />. Expérimentez avec les définitions
        formelles et calculez automatiquement leurs valeurs pour tout domaine d&apos;application.
      </p>

      <details>
        <summary className='text-center font-semibold font-math'>Sections d&apos;aide</summary>
        <ul>
          {[
            HelpTopic.THESAURUS,
            HelpTopic.INTERFACE,
            HelpTopic.CONCEPTUAL,
            HelpTopic.RSLANG,
            HelpTopic.TERM_CONTROL,
            HelpTopic.ACCESS,
            HelpTopic.VERSIONS,
            HelpTopic.INFO,
            HelpTopic.CONTRIBUTORS,
            HelpTopic.EXTEOR
          ].map(topic => (
            <TopicItem key={`${prefixes.topic_item}${topic}`} topic={topic} />
          ))}
        </ul>
      </details>

      <details className='mt-2'>
        <summary className='text-center font-semibold'>Licences et transparence</summary>
        <ul>
          <li>Les utilisateurs du portail conservent les droits d&apos;auteur sur le contenu qu&apos;ils créent</li>
          <li>
            La politique de traitement des données est disponible via ce{' '}
            <LinkTopic text='lien' topic={HelpTopic.INFO_PRIVACY} />
          </li>
          <li>
            Le portail est un projet open source sur <TextURL text='GitHub' href={external_urls.git_portal} />
          </li>
          <li>
            Ce site utilise le nom de domaine et la capacité serveur du{' '}
            <TextURL text='Centre Concept' href={external_urls.concept} />
          </li>
        </ul>
      </details>

      <h2 className='mt-2'>{tx('tx.general.support')}</h2>
      <p>
        Le portail est développé par le <TextURL text='Centre Concept' href={external_urls.concept} /> et s&apos;appuie
        sur une <LinkTopic text='longue tradition de travail' topic={HelpTopic.CONTRIBUTORS} /> sur les moyens
        d&apos;explicitation des schémas conceptuels.
      </p>
      <p>
        Les navigateurs pris en charge incluent les versions récentes de Chrome, Firefox et Safari, y compris sur
        mobile.
      </p>
      <p>
        Pour les demandes d&apos;évolution, les anomalies et autres suggestions, écrivez à{' '}
        <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </>
  );
}
