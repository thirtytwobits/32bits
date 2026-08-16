import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const writing = (await getCollection('writing', ({ data }) => data.status !== 'draft')).sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf(),
  );

  return rss({
    title: '32bits.io writing',
    description: 'Writing and professional work by Scott Dixon.',
    site: context.site,
    items: writing.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: `/writing/${entry.id}/`,
    })),
  });
}
