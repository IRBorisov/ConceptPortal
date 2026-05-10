import { useTx } from '@/i18n';

import { urls } from '@/app';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpRulesEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.shell.rules.hint')}</h1>

      <p>
        We want as many people as possible to take part in the Portal. Participant communities should stay diverse and
        welcoming to newcomers. We want those communities to stay positive, safe, and healthy for everyone who joins—or
        wants to join—and we will uphold that in part through these Rules of Conduct. We also want to protect our
        projects from anyone who damages or distorts them, so the Portal administration may sanction members who break
        the Rules.
      </p>

      <p>
        Behavior on the Portal is grounded in respect, courtesy, collegiality, solidarity, and social responsibility.
        This applies to every reader, participant, and administrator without exception based on age, ability, appearance,
        nationality, religion, ethnic or cultural background, caste, social class, language skill, sexual orientation,
        gender identity, sex, or field of work. We will not grant exceptions based on status, skills, or achievements
        either.
      </p>

      <h2>Expected behavior</h2>
      <ul>
        <li>Mutual respect and support in dealings with other Portal participants.</li>
        <li>
          Send enhancement requests, bug reports, and other suggestions by email to{' '}
          <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />.
        </li>

        <h2>Unacceptable behavior</h2>
        <li>Insults, threats, sexual harassment, trolling, or stalking of other participants.</li>
        <li>
          Publishing personal data about Portal participants (doxing). Does not apply to data participants choose to
          show on the Portal; you can change that in your <TextURL text='profile' href={urls.profile} />.
        </li>
        <li>
          Abusing power, privileges, or influence, including using Portal-granted roles or access for private ends
          unrelated to building content or advancing the Portal.
        </li>
        <li>
          Vandalism, deliberately adding inappropriate content, or obstructing or hindering others from creating or
          maintaining their content.
        </li>
        <li>Harming Portal availability, including by exploiting vulnerabilities or defects in the software.</li>
      </ul>
    </>
  );
}
