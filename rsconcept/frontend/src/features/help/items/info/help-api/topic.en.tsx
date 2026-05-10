import { useTx } from '@/i18n/use-tx';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpAPIEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.restApi')}</h1>
      <p>The server programmatic interface is a REST API implemented with Django.</p>
      <p>The API is still under development, so external requests are not supported.</p>
      <p>
        Read the interface description <TextURL text='here' href={external_urls.restAPI} />.
      </p>
      <p>
        <TextURL text='Contribute to development' href={external_urls.git_portal} />
      </p>
    </>
  );
}
