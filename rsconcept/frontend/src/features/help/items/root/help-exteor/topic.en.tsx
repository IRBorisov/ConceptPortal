import { useTx } from '@/i18n';

import { TextURL } from '@/components/control';
import { external_urls, PARAMETER } from '@/utils/constants';

export function HelpExteorEn() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.shell.app.exteor')}</h1>
      <p>Exteor 4.9 is an editor for texts of concept systems explicated in genera of structures.</p>
      <p>
        The Portal surpasses Exteor in editing explications, but interpretation evaluation is available only in Exteor.
        You should also use Exteor to export explications to Word for printing.
      </p>

      <p>
        Download the installer: <TextURL href={external_urls.exteor64} text='64bit' /> |{' '}
        <TextURL href={external_urls.exteor32} text='32bit' /> (Windows 10 and later)
      </p>
      <p>
        Current version: <b>{PARAMETER.exteorVersion}</b>
      </p>
      <p>
        Exteor does not support automatic updates. If an exported scheme shows unexpected diagnostics or errors, try
        downloading a new build using the links above.
      </p>

      <h2>Key features</h2>
      <ul>
        <li>Working with the RS-form of a concept system</li>
        <li>Automatic typing of expressions</li>
        <li>RS-form correctness checks</li>
        <li>Context search with morphological variants of terms</li>
        <li>Terminology control for term occurrences</li>
        <li>Automatic execution of RS-form synthesis operations</li>
        <li>Synthesis using an operational synthesis scheme (OSS)</li>
        <li>Automatic end-to-end updates in the OSS</li>
        <li>Object interpretation evaluation</li>
        <li>Export of conceptual schemes to Word</li>
        <li>Import/export of interpretations via Excel</li>
      </ul>
    </>
  );
}
