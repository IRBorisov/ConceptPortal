import { useTx } from '@/i18n';

import { LinkTopic } from '../../../components/link-topic';
import { HelpTopic } from '../../../models/help-topic';

export function HelpRSLangCorrectEn() {
  const tx = useTx();
  return (
    <>
      <h1>
        {tx('tx.concept.system.portability')} & {tx('tx.concept.system.correctness')}
      </h1>
      <p>
        <b>Bijective portability of expressions</b> means the independence of definition values from bijective
        replacement of interpretations of undefined concepts. It is based on the fundamental incomparability of elements
        of basis sets.
      </p>
      <p>
        Checking expressions that contain global identifiers is performed in the given global context (typifications and
        bijective portability are known, as is information about function arguments). All unknown identifiers are
        considered incorrect.
      </p>
      <p>
        The verification rules for set-theoretic expressions follow from the condition of bijective portability of the
        membership predicate — an element must correspond to the set for which membership is being checked. A necessary
        condition for bijective portability is the satisfaction of the{' '}
        <LinkTopic text='typification relation' topic={HelpTopic.RSL_TYPIFICATION} /> for all local and global
        identifiers.
      </p>
      <p>
        Logical correctness (consistency) of expressions cannot in general be checked automatically. However, the
        existence of an interpretation example on objects of the subject domain provides a basis for asserting the
        consistency of the imposed axioms.
      </p>
      <p>
        The expression editor on the Portal is equipped with tools for verifying expressions and computing their
        typification. Found errors are diagnosed and a corresponding error message is displayed.
      </p>
    </>
  );
}
