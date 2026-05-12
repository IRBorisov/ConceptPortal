import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls, prefixes } from '@/utils/constants';

import { LinkTopic } from '../../../components/link-topic';
import { TopicItem } from '../../../components/topic-item';
import { HelpTopic } from '../../../models/help-topic';

export function HelpMainEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.shell.app')}</h1>
      <p>
        The Portal provides powerful tools for formal analysis and modeling of subject domains, supporting structured
        descriptions and in-depth concept work using <LinkTopic text='Genera of structures' topic={HelpTopic.RSLANG} />.
      </p>
      <p>
        Build <LinkTopic text='Conceptual schemes' topic={HelpTopic.CC_SYSTEM} /> — definition systems made of
        individual <LinkTopic text='Constituents' topic={HelpTopic.CC_CONSTITUENTA} /> with precise formal definitions
        and structure. Visualize and explore definition structure and the concept relation graph.
      </p>
      <p>
        Combine separate schemes into large-scale{' '}
        <LinkTopic text='Operational synthesis schemes' topic={HelpTopic.CC_OSS} /> for complex domains.
      </p>
      <p>
        Integrate formal definitions with data from domain sources by creating{' '}
        <LinkTopic text='Conceptual models' topic={HelpTopic.CC_RSMODEL} />. Experiment with formal definitions and
        derive their values automatically for any subject domain.
      </p>

      <details>
        <summary className='text-center font-semibold font-math'>Help sections</summary>
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
        <summary className='text-center font-semibold'>Licensing and disclosure</summary>
        <ul>
          <li>Portal users retain copyright in the content they create</li>
          <li>
            The data processing policy is available via this <LinkTopic text='link' topic={HelpTopic.INFO_PRIVACY} />
          </li>
          <li>
            The Portal is an open-source project on <TextURL text='GitHub' href={external_urls.git_portal} />
          </li>
          <li>
            This site uses the domain name and server capacity of{' '}
            <TextURL text='Concept Center' href={external_urls.concept} />
          </li>
        </ul>
      </details>

      <h2 className='mt-2'>{tx('tx.general.support')}</h2>
      <p>
        The Portal is developed by <TextURL text='Concept Center' href={external_urls.concept} /> and builds on{' '}
        <LinkTopic text='many years of work' topic={HelpTopic.CONTRIBUTORS} /> on tools for explicating conceptual
        schemes.
      </p>
      <p>Supported browsers include current versions of Chrome, Firefox, and Safari, including on mobile devices.</p>
      <p>
        Send enhancement requests, bug reports, and other suggestions by email to{' '}
        <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </>
  );
}
