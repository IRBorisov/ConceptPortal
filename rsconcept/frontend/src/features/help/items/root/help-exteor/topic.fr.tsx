import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls, PARAMETER } from '@/utils/constants';

export function HelpExteorFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.shell.app.exteor')}</h1>
      <p>
        Exteor 4.9 est un éditeur de textes des systèmes de concepts explicités dans les genres de structures.
      </p>
      <p>
        Le portail surpasse Exteor pour l&apos;édition des explicitations, mais l&apos;évaluation de l&apos;interprétation
        n&apos;est disponible que dans Exteor. Utilisez également Exteor pour exporter les explicitations vers Word en
        vue de l&apos;impression.
      </p>

      <p>
        Télécharger l&apos;installateur : <TextURL href={external_urls.exteor64} text='64bit' /> |{' '}
        <TextURL href={external_urls.exteor32} text='32bit' /> (Windows 10 et ultérieur)
      </p>
      <p>
        Version actuelle : <b>{PARAMETER.exteorVersion}</b>
      </p>
      <p>
        Exteor ne prend pas en charge les mises à jour automatiques. Si un schéma exporté présente des diagnostics ou
        erreurs inattendus, essayez de télécharger une nouvelle version via les liens ci-dessus.
      </p>

      <h2>Fonctions principales</h2>
      <ul>
        <li>Travail avec la forme RS du système de concepts</li>
        <li>Détermination automatique du typage des expressions</li>
        <li>Vérification de la correction de la forme RS</li>
        <li>Recherche contextuelle avec formes de mots des termes</li>
        <li>Contrôle terminologique des occurrences de termes</li>
        <li>Exécution automatique des opérations de synthèse des formes RS</li>
        <li>Synthèse à l&apos;aide du schéma opérationnel de synthèse (OSS)</li>
        <li>Mise à jour transversale automatique dans l&apos;OSS</li>
        <li>Calcul de l&apos;interprétation objet</li>
        <li>Export des schémas conceptuels vers Word</li>
        <li>Import/export des interprétations via Excel</li>
      </ul>
    </>
  );
}
