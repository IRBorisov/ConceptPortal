import { labelHelpTopic } from '../labels';

import { type HelpSearchDocument, helpSearchDocuments } from './help-registry';
import { type HelpTopic, topicParent } from './help-topic';

export interface HelpSearchResult extends HelpSearchDocument {
  score: number;
}

export function normalizeHelpSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesWholePhrase(haystack: string, needle: string): boolean {
  return haystack.includes(needle);
}

function countTokenMatches(haystack: string, tokens: string[]): number {
  return tokens.filter(token => haystack.includes(token)).length;
}

function scoreDocument(document: HelpSearchDocument, query: string, currentTopic: HelpTopic): number {
  const normalizedQuery = normalizeHelpSearchText(query);
  if (!normalizedQuery) {
    return 0;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  const title = normalizeHelpSearchText(document.title);
  const description = normalizeHelpSearchText(document.description);
  const keywords = normalizeHelpSearchText(document.keywords.join(' '));
  const searchText = normalizeHelpSearchText(document.searchText);
  const sectionTitle = normalizeHelpSearchText(labelHelpTopic(document.section));

  let score = 0;

  if (title === normalizedQuery) score += 120;
  if (title.startsWith(normalizedQuery)) score += 70;
  if (includesWholePhrase(title, normalizedQuery)) score += 40;
  if (includesWholePhrase(keywords, normalizedQuery)) score += 30;
  if (includesWholePhrase(description, normalizedQuery)) score += 20;
  if (includesWholePhrase(searchText, normalizedQuery)) score += 15;
  if (document.topic === currentTopic) score += 8;
  if (topicParent.get(document.topic) === topicParent.get(currentTopic)) score += 6;

  score += countTokenMatches(title, tokens) * 12;
  score += countTokenMatches(keywords, tokens) * 8;
  score += countTokenMatches(description, tokens) * 5;
  score += countTokenMatches(searchText, tokens) * 3;
  score += countTokenMatches(sectionTitle, tokens) * 2;

  return score;
}

export function searchHelpTopics(query: string, currentTopic: HelpTopic, limit = 12): HelpSearchResult[] {
  const normalizedQuery = normalizeHelpSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return helpSearchDocuments
    .map(document => ({ ...document, score: scoreDocument(document, normalizedQuery, currentTopic) }))
    .filter(document => document.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.title.localeCompare(right.title);
    })
    .slice(0, limit);
}
