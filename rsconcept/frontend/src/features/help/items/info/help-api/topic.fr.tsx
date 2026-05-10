import { useTx } from '@/i18n/use-tx';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpAPIFr() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.restApi')}</h1>
      <p>L&apos;interface programmatique du serveur est une API REST implémentée avec Django.</p>
      <p>L&apos;API est encore en développement : les requêtes externes ne sont pas prises en charge.</p>
      <p>
        Consultez la description de l&apos;interface <TextURL text='ici' href={external_urls.restAPI} />.
      </p>
      <p>
        <TextURL text='Participer au développement' href={external_urls.git_portal} />
      </p>
    </>
  );
}
