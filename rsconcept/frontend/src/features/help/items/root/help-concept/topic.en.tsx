import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

import { Subtopics } from '../../../components/subtopics';
import { HelpTopic } from '../../../models/help-topic';

export function HelpConceptEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.concept.framework')}</h1>
      <p>
        Complex subject domains call for specialized ways to understand and describe them. The <b>systems approach</b>{' '}
        sets the system boundary, carves out subsystems, and specifies relations among them. Subsystems are described
        separately; their descriptions are then synthesized with respect to those relations. The result is a picture
        of the whole system built from descriptions of its parts.
      </p>
      <p>
        <b>Conceptualization</b> is the deductive construction of conceptual schemes (systems of definitions) that
        capture substantive relations within each subsystem. Schemes can be synthesized into an overall definition
        system for a chosen domain.
      </p>
      <p>
        Conceptualization is carried out under a stated problem inside the domain. The applied problem frames how far
        conceptualization should reach and how effort should be allocated. The outcome is a managed object for which
        decisions can be worked out to meet the stated task.
      </p>
      <p>
        Repeated conceptualization and problem solving with the resulting schemes builds <b>conceptual thinking</b> — a
        disciplined mode of thought where definitions and assumptions used to describe substance are tightly
        controlled.
      </p>

      <p>
        Conceptualization is discussed in more detail in the{' '}
        <TextURL text='lecture compilation by Z. A. Kuchkarov' href={external_urls.zak_lectures} />
        <br />
        Methods of conceptual analysis and synthesis in theoretical research and design of socio-economic systems: a
        textbook / Z. A. Kuchkarov. — Moscow: Kontsept, 2008. — 3rd ed., revised and expanded.
      </p>

      <Subtopics headTopic={HelpTopic.CONCEPTUAL} />
    </>
  );
}
