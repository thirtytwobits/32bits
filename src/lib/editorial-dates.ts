import type { CollectionEntry } from 'astro:content';

type EditorialEntry = CollectionEntry<'writing'> | CollectionEntry<'making'>;
type PublishedEntry<T extends EditorialEntry = EditorialEntry> = T & {
  data: T['data'] & { published: string };
};

const DATE_ONLY = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;

function dateParts(value: string) {
  const match = DATE_ONLY.exec(value);

  if (!match?.groups) {
    throw new Error(`Expected an editorial date in YYYY-MM-DD format, got "${value}".`);
  }

  return {
    year: Number(match.groups.year),
    month: Number(match.groups.month),
    day: Number(match.groups.day),
  };
}

export function isPublishedEntry<T extends EditorialEntry>(entry: T): entry is PublishedEntry<T> {
  return entry.data.status !== 'draft' && typeof entry.data.published === 'string';
}

const DRAFTS_VISIBLE = import.meta.env.DEV && import.meta.env.SHOW_DRAFTS === 'true';

export function isVisibleEntry<T extends EditorialEntry>(entry: T): boolean {
  return DRAFTS_VISIBLE || isPublishedEntry(entry);
}

export function entryDateLabel(entry: EditorialEntry) {
  return entry.data.published ? formatEditorialDate(entry.data.published, entry.data.lang) : 'Draft';
}

export function comparePublishedNewestFirst(a: EditorialEntry, b: EditorialEntry) {
  if (!a.data.published) {
    return b.data.published ? -1 : 0;
  }

  if (!b.data.published) {
    return 1;
  }

  return b.data.published.localeCompare(a.data.published);
}

export function formatEditorialDate(value: string, lang = 'en') {
  const { year, month, day } = dateParts(value);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function editorialDateToDate(value: string) {
  const { year, month, day } = dateParts(value);

  return new Date(Date.UTC(year, month - 1, day, 12));
}
