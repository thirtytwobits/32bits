import { getCollection } from 'astro:content';
import {
  comparePublishedNewestFirst,
  editorialDateToDate,
  isPublishedEntry,
} from '../lib/editorial-dates';

export async function GET(context) {
  const writing = (await getCollection('writing')).filter(isPublishedEntry).sort(comparePublishedNewestFirst);
  const site = context.site.toString().replace(/\/$/, '');
  const escapeXml = (value) =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const items = writing
    .map((entry) => {
      const link = `${site}/writing/${entry.id}/`;

      return `<item>
        <title>${escapeXml(entry.data.title)}</title>
        <description>${escapeXml(entry.data.description)}</description>
        <pubDate>${editorialDateToDate(entry.data.published).toUTCString()}</pubDate>
        <link>${escapeXml(link)}</link>
        <guid>${escapeXml(link)}</guid>
      </item>`;
    })
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>32bits.io writing</title>
    <description>Writing and professional work by Scott Dixon.</description>
    <link>${escapeXml(site)}</link>
    ${items}
  </channel>
</rss>
`, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
