import { type RelativizationProjection } from '@rsconcept/domain/library/relativization';

type Proposal = RelativizationProjection['proposals'][number];
export type TextField = keyof Proposal['before'];
export const textFields: TextField[] = ['term_raw', 'definition_raw', 'convention'];

interface ReviewDraft extends Pick<RelativizationProjection, 'items' | 'proposals'> {
  prior?: { id: number; fields: Partial<Proposal['before']>; stillCurrent: boolean }[];
}

export interface ReviewRow {
  proposal: Proposal;
  item: RelativizationProjection['items'][number];
  fields: Proposal['before'];
  confirmed: Partial<Proposal['before']>;
  visited: boolean;
  clarified: boolean;
  conflicts: TextField[];
}

function matchKey(row: Proposal) {
  return [row.origin, row.role].join('/');
}

export function prepareReview(draft: ReviewDraft, previous: ReviewRow[] = []): ReviewRow[] {
  const oldRows = new Map(previous.map(row => [matchKey(row.proposal), row]));
  const items = new Map(draft.items.map(item => [item.id, item]));
  const prior = new Map((draft.prior ?? []).map(row => [row.id, row]));
  return draft.proposals
    .filter(proposal => proposal.changed || proposal.formalInvalid || prior.has(proposal.id))
    .map(proposal => {
      const item = items.get(proposal.id)!;
      const old = oldRows.get(matchKey(proposal));
      const persisted = prior.get(proposal.id);
      const confirmed = persisted?.fields ?? {};
      const conflicts: TextField[] = [];
      const fields = { term_raw: item.term_raw, definition_raw: item.definition_raw, convention: item.convention };
      const sameProposal =
        !!old &&
        JSON.stringify(old.proposal) === JSON.stringify(proposal) &&
        textFields.every(field => old.item[field] === item[field] && old.confirmed[field] === confirmed[field]);
      // Keep local choices for the same proposal. A regenerated proposal is compared with the last saved text.
      for (const field of textFields) {
        const saved = confirmed[field];
        if (sameProposal && !old.conflicts.includes(field)) {
          fields[field] = old.fields[field];
        } else if (
          old &&
          (old.conflicts.includes(field) || old.fields[field] !== (old.confirmed[field] ?? old.item[field]))
        ) {
          const edited = old.fields[field];
          const savedDiffers = saved !== undefined && saved !== edited;
          const proposalDiffers = item[field] !== edited;
          fields[field] = edited;
          if (
            (savedDiffers && saved !== old.confirmed[field]) ||
            (proposalDiffers && item[field] !== old.item[field]) ||
            (old.conflicts.includes(field) && (savedDiffers || proposalDiffers))
          ) {
            conflicts.push(field);
          }
        } else if (saved !== undefined && saved !== item[field]) {
          fields[field] = saved;
          if (!persisted?.stillCurrent) conflicts.push(field);
        }
      }
      return {
        proposal,
        item,
        fields,
        confirmed,
        conflicts,
        visited: old ? sameProposal && old.visited : (persisted?.stillCurrent ?? false),
        clarified: old ? sameProposal && old.clarified : (persisted?.stillCurrent ?? false)
      };
    });
}

export function hasReviewEdits(row: ReviewRow) {
  return row.clarified || textFields.some(field => row.fields[field] !== row.item[field]);
}

export function canConfirmReview(rows: ReviewRow[]) {
  return rows.every(
    row =>
      !row.proposal.formalInvalid &&
      ((!row.proposal.inKernel && row.conflicts.length === 0) || isReviewed(row)) &&
      (!hasReviewEdits(row) || row.proposal.missing.every(field => !!row.fields[field].trim()))
  );
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
