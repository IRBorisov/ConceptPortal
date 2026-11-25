import { type RelativizationDraftDTO } from '../../backend/types';

type Proposal = RelativizationDraftDTO['proposals'][number];
export type TextField = keyof Proposal['before'];
export const textFields: TextField[] = ['term_raw', 'definition_raw', 'convention'];

export interface ReviewRow {
  proposal: Proposal;
  item: RelativizationDraftDTO['items'][number];
  fields: Proposal['before'];
  visited: boolean;
  clarified: boolean;
  conflicts: TextField[];
}

function matchKey(row: Proposal) {
  return [row.origin, row.role].join('/');
}

export function prepareReview(draft: RelativizationDraftDTO, previous: ReviewRow[]): ReviewRow[] {
  const oldRows = new Map(previous.map(row => [matchKey(row.proposal), row]));
  const items = new Map(draft.items.map(item => [item.id, item]));
  const prior = new Map(draft.prior.map(row => [row.id, row]));
  return draft.proposals
    .filter(proposal => proposal.changed || prior.has(proposal.id))
    .map(proposal => {
      const item = items.get(proposal.id)!;
      const old = oldRows.get(matchKey(proposal));
      const persisted = prior.get(proposal.id);
      const conflicts: TextField[] = [];
      const fields = { term_raw: item.term_raw, definition_raw: item.definition_raw, convention: item.convention };
      const sameProposal =
        !!old &&
        JSON.stringify(old.proposal) === JSON.stringify(proposal) &&
        textFields.every(field => old.item[field] === item[field]);
      for (const field of textFields) {
        const confirmed = persisted?.fields[field];
        if (!old && confirmed !== undefined && confirmed !== item[field]) {
          fields[field] = confirmed;
          if (!persisted?.stillCurrent) conflicts.push(field);
        }
        if (old && old.fields[field] !== old.item[field]) {
          fields[field] = old.fields[field];
          if (old.conflicts.includes(field) || (!sameProposal && item[field] !== old.item[field]))
            conflicts.push(field);
        }
      }
      return {
        proposal,
        item,
        fields,
        conflicts,
        visited: old ? sameProposal && old.visited : (persisted?.stillCurrent ?? false),
        clarified: old ? sameProposal && old.clarified : (persisted?.stillCurrent ?? false)
      };
    });
}

export function isReviewed(row: ReviewRow) {
  const { proposal } = row;
  return (
    row.visited &&
    row.conflicts.length === 0 &&
    (!(proposal.ambiguous.length || proposal.missing.length) || row.clarified) &&
    proposal.missing.every(field => !!row.fields[field].trim())
  );
}
