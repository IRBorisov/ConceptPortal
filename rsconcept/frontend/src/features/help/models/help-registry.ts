import type { AppLocale } from '@/i18n/locales';

import { removeTags } from '@/utils/format';

import { describeHelpTopic, labelHelpTopic } from '../labels';

import { topicSearchOverridesEn } from './topic-search-overrides/topic-search-overrides.en';
import { topicSearchOverridesFr } from './topic-search-overrides/topic-search-overrides.fr';
import { topicSearchOverridesRu } from './topic-search-overrides/topic-search-overrides.ru';
import type { HelpSearchOverride } from './topic-search-overrides/types';
import { HelpTopic, type HelpTopic as HelpTopicValue, topicParent } from './help-topic';

export interface HelpSearchDocument {
  topic: HelpTopicValue;
  section: HelpTopicValue;
  title: string;
  description: string;
  keywords: string[];
  searchText: string;
}

function topicSearchOverridesForLocale(locale: AppLocale): Record<HelpTopicValue, HelpSearchOverride> {
  if (locale === 'en') {
    return topicSearchOverridesEn;
  }
  if (locale === 'fr') {
    return topicSearchOverridesFr;
  }
  return topicSearchOverridesRu;
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function splitTopicTokens(topic: HelpTopicValue): string[] {
  return topic
    .split('-')
    .map(part => part.trim())
    .filter(Boolean);
}

function buildSearchText(topic: HelpTopicValue, overrides: Record<HelpTopicValue, HelpSearchOverride>): string {
  const override = overrides[topic];
  const title = removeTags(labelHelpTopic(topic));
  const description = describeHelpTopic(topic);
  return [title, description, override.searchText].filter(Boolean).join(' ');
}

function buildKeywords(topic: HelpTopicValue, overrides: Record<HelpTopicValue, HelpSearchOverride>): string[] {
  const override = overrides[topic];
  const title = removeTags(labelHelpTopic(topic));
  const description = describeHelpTopic(topic);
  return uniqueValues([
    ...splitTopicTokens(topic),
    ...title.split(/\s+/),
    ...description.split(/\s+/),
    ...override.keywords
  ]);
}

/** Builds help search rows for the active UI locale (titles use current {@link globalTx} locale). */
export function getHelpSearchDocuments(locale: AppLocale): HelpSearchDocument[] {
  const overrides = topicSearchOverridesForLocale(locale);
  return Object.values(HelpTopic).map(topic => ({
    topic,
    section: topicParent.get(topic) ?? topic,
    title: removeTags(labelHelpTopic(topic)),
    description: describeHelpTopic(topic),
    keywords: buildKeywords(topic, overrides),
    searchText: buildSearchText(topic, overrides)
  }));
}
