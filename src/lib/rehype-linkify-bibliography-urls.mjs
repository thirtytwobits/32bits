import { visit } from 'unist-util-visit';

// rehype-citation's CSL renderer (citeproc-js) emits bibliography URLs as
// plain text — it only supports linking in-text citations to their entry via
// `linkCitations`, not wrapping the URL/DOI variable in an `<a>` itself. Walk
// each rendered `.csl-entry` after rehype-citation runs and linkify bare URLs.
const URL_PATTERN = /\bhttps?:\/\/[^\s<>"')]+/g;

export default function rehypeLinkifyBibliographyUrls() {
  return (tree) => {
    visit(tree, 'element', (entryNode) => {
      const className = entryNode.properties && entryNode.properties.className;
      if (!Array.isArray(className) || !className.includes('csl-entry')) return;

      visit(entryNode, 'text', (textNode, index, parent) => {
        if (!parent || index === null) return;
        URL_PATTERN.lastIndex = 0;
        if (!URL_PATTERN.test(textNode.value)) return;
        URL_PATTERN.lastIndex = 0;

        const parts = [];
        let lastIndex = 0;
        let match;
        while ((match = URL_PATTERN.exec(textNode.value))) {
          if (match.index > lastIndex) {
            parts.push({ type: 'text', value: textNode.value.slice(lastIndex, match.index) });
          }
          parts.push({
            type: 'element',
            tagName: 'a',
            properties: { href: match[0] },
            children: [{ type: 'text', value: match[0] }],
          });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < textNode.value.length) {
          parts.push({ type: 'text', value: textNode.value.slice(lastIndex) });
        }

        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      });
    });
  };
}
