import { useTx } from '@/i18n';

import { urls } from '@/app';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpRulesFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.shell.rules.hint')}</h1>

      <p>
        Nous souhaitons permettre au plus grand nombre de participer au portail. Les communautés de contributeurs doivent
        rester ouvertes et accueillantes pour les nouveaux venus, positives, sûres et favorables à tous ceux qui
        rejoignent — ou souhaitent rejoindre — le projet. Nous entendons préserver cet environnement notamment par ces
        règles de conduite. Nous voulons aussi protéger nos projets contre toute atteinte ou dénaturation ; l&apos;administration
        du portail pourra donc sanctionner les personnes qui enfreignent les règles.
      </p>

      <p>
        La conduite sur le portail repose sur le respect, la courtoisie, l&apos;esprit de collégialité, la solidarité et
        la responsabilité sociale. Cela vaut pour tout lecteur, participant ou administrateur, sans discrimination liée
        à l&apos;âge, aux capacités, à l&apos;apparence, à la nationalité, à la religion, à l&apos;origine ethnique ou
        culturelle, à la caste, à la classe sociale, à la maîtrise de la langue, à l&apos;orientation sexuelle, à
        l&apos;identité de genre, au sexe ou au domaine d&apos;activité. Aucune dérogation ne sera faite au nom du statut,
        des compétences ou des réalisations.
      </p>

      <h2>Comportement attendu</h2>
      <ul>
        <li>Respect mutuel et soutien dans les relations avec les autres participants.</li>
        <li>
          Adressez les demandes d&apos;évolution, les anomalies et autres propositions à{' '}
          <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />.
        </li>

        <h2>Comportements inacceptables</h2>
        <li>
          Injures, menaces, harcèlement sexuel, trolling ou traque d&apos;autres participants.
        </li>
        <li>
          Divulgation de données personnelles sur les participants (doxing). Ne s&apos;applique pas aux données que les
          participants choisissent d&apos;afficher ; vous pouvez les modifier dans votre{' '}
          <TextURL text='profil' href={urls.profile} />.
        </li>
        <li>
          Abus de pouvoir, de privilèges ou d&apos;influence, y compris l&apos;usage de rôles ou d&apos;accès accordés par
          le portail à des fins personnelles sans rapport avec la création de contenu ou le développement du portail.
        </li>
        <li>
          Vandale, ajout délibéré de contenu inadéquat, ou entrave à la création ou au maintien du contenu d&apos;autrui.
        </li>
        <li>
          Atteinte au bon fonctionnement du portail, y compris par l&apos;exploitation de failles ou de défauts du code.
        </li>
      </ul>
    </>
  );
}
