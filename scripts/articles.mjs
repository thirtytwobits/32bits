#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const COLLECTIONS = {
  writing: {
    contentDir: 'src/content/writing',
    defaultKind: 'essay',
  },
  making: {
    contentDir: 'src/content/making',
    defaultKind: 'dispatch',
  },
};
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const usage = () => {
  console.error(`Usage:
  npm run writing:new -- "Article Title" [--slug slug] [--kind essay|paper|case-study|note|talk] [--dry-run]
  npm run making:new -- "Article Title" [--slug slug] [--kind dispatch|project|note] [--dry-run]
  npm run writing:publish -- article-slug [--date YYYY-MM-DD] [--no-check] [--dry-run]
  npm run making:publish -- article-slug [--date YYYY-MM-DD] [--no-check] [--dry-run]
  npm run article:check`);
};

const parseArgs = (args) => {
  const options = {};
  const positionals = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }

    const [name, inlineValue] = arg.slice(2).split('=', 2);
    const next = args[index + 1];

    if (inlineValue !== undefined) {
      options[name] = inlineValue;
    } else if (!next || next.startsWith('--')) {
      options[name] = true;
    } else {
      options[name] = next;
      index += 1;
    }
  }

  return { options, positionals };
};

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const yamlString = (value) => JSON.stringify(value);

const currentLocalDate = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${lookup.year}-${lookup.month}-${lookup.day}`;
};

const isCalendarDate = (value) => {
  if (!DATE_ONLY.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseFrontmatter = (source, filePath) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);

  if (!match) {
    throw new Error(`${filePath} does not start with YAML frontmatter.`);
  }

  const frontmatter = match[1];
  const body = source.slice(match[0].length);
  const lines = frontmatter.split(/\r?\n/);

  return { body, frontmatter, lines, prefix: match[0] };
};

const readScalar = (lines, key) => {
  const line = lines.find((candidate) => candidate.startsWith(`${key}:`));

  if (!line) {
    return undefined;
  }

  const raw = line.slice(key.length + 1).trim();

  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }

  return raw;
};

const upsertScalar = (lines, key, value, { after, before } = {}) => {
  const rendered = `${key}: ${value}`;
  const existing = lines.findIndex((line) => line.startsWith(`${key}:`));

  if (existing !== -1) {
    lines[existing] = rendered;
    return;
  }

  if (before) {
    const beforeIndex = lines.findIndex((line) => line.startsWith(`${before}:`));

    if (beforeIndex !== -1) {
      lines.splice(beforeIndex, 0, rendered);
      return;
    }
  }

  if (after) {
    const afterIndex = lines.findIndex((line) => line.startsWith(`${after}:`));

    if (afterIndex !== -1) {
      lines.splice(afterIndex + 1, 0, rendered);
      return;
    }
  }

  lines.push(rendered);
};

const removeScalar = (lines, key) => {
  const index = lines.findIndex((line) => line.startsWith(`${key}:`));

  if (index !== -1) {
    lines.splice(index, 1);
  }
};

const serializeArticle = (lines, body) => `---\n${lines.join('\n')}\n---\n\n${body.trimStart()}`;

const articlePath = (collectionName, slug) => {
  const collection = COLLECTIONS[collectionName];

  if (!collection) {
    throw new Error(`Unknown collection "${collectionName}". Use writing or making.`);
  }

  return resolve(ROOT, collection.contentDir, `${slug}.mdx`);
};

const checkArticle = ({ body, filePath, lines, publishing = false }) => {
  const status = readScalar(lines, 'status') ?? 'draft';
  const published = readScalar(lines, 'published');
  const title = readScalar(lines, 'title');
  const description = readScalar(lines, 'description');
  const errors = [];

  if (status !== 'draft' && !published) {
    errors.push('published is required when status is published or revised.');
  }

  if (published && !isCalendarDate(published)) {
    errors.push('published must be a real YYYY-MM-DD calendar date.');
  }

  if (publishing || status !== 'draft') {
    if (!title || title === 'TODO') {
      errors.push('title must be set before publishing.');
    }

    if (!description || description === 'TODO') {
      errors.push('description must be set before publishing.');
    }

    if (body.includes('VIDEO_ID')) {
      errors.push('replace placeholder YouTube VIDEO_ID before publishing.');
    }

    if (body.trim() === '' || body.includes('Start here.')) {
      errors.push('article body still looks like a scaffold.');
    }
  }

  if (errors.length > 0) {
    throw new Error(`${filePath}\n- ${errors.join('\n- ')}`);
  }
};

const runSiteCheck = () => {
  const result = spawnSync('npm', ['run', 'check'], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error('npm run check failed.');
  }
};

const newArticle = (collectionName, args) => {
  const collection = COLLECTIONS[collectionName];

  if (!collection) {
    throw new Error(`Unknown collection "${collectionName}". Use writing or making.`);
  }

  const { options, positionals } = parseArgs(args);
  const title = positionals.join(' ').trim();
  const slug = String(options.slug ?? slugify(title));
  const kind = String(options.kind ?? collection.defaultKind);
  const filePath = articlePath(collectionName, slug);
  const body = `---
title: ${yamlString(title)}
description: TODO
status: draft
kind: ${kind}
topics:
  - ${collectionName}
lang: en
---

Start here.
`;

  if (!title) {
    throw new Error('New articles need a title.');
  }

  if (!slug) {
    throw new Error('Could not derive a slug. Pass --slug explicitly.');
  }

  if (existsSync(filePath)) {
    throw new Error(`${filePath} already exists.`);
  }

  if (options['dry-run']) {
    console.log(body);
    return;
  }

  mkdirSync(dirname(filePath), { recursive: true });
  mkdirSync(resolve(ROOT, 'public/media', slug), { recursive: true });
  writeFileSync(filePath, body, 'utf8');
  console.log(`Created ${filePath}`);
};

const publishArticle = (collectionName, args) => {
  const collection = COLLECTIONS[collectionName];

  if (!collection) {
    throw new Error(`Unknown collection "${collectionName}". Use writing or making.`);
  }

  const { options, positionals } = parseArgs(args);
  const slug = positionals[0];

  if (!slug) {
    throw new Error('Publish needs an article slug, for example article-slug.');
  }

  const filePath = articlePath(collectionName, slug);

  if (!existsSync(filePath)) {
    throw new Error(`Could not find ${filePath}.`);
  }

  const source = readFileSync(filePath, 'utf8');
  const { body, lines } = parseFrontmatter(source, filePath);
  const status = readScalar(lines, 'status') ?? 'draft';
  const date = String(options.date ?? currentLocalDate());

  if (status !== 'draft') {
    throw new Error(`${filePath} is already ${status}. Publish only moves drafts into the public archive.`);
  }

  if (!isCalendarDate(date)) {
    throw new Error(`"${date}" is not a real YYYY-MM-DD calendar date.`);
  }

  removeScalar(lines, 'published');
  upsertScalar(lines, 'published', date, { before: 'status', after: 'description' });
  upsertScalar(lines, 'status', 'published', { after: 'published' });
  checkArticle({ body, filePath, lines, publishing: true });

  const next = serializeArticle(lines, body);

  if (options['dry-run']) {
    console.log(next);
    return;
  }

  writeFileSync(filePath, next, 'utf8');
  console.log(`Published ${filePath} on ${date}`);

  if (!options['no-check']) {
    checkPublishedArticles();
    runSiteCheck();
  }
};

const checkPublishedArticles = () => {
  for (const [collectionName, collection] of Object.entries(COLLECTIONS)) {
    const dir = resolve(ROOT, collection.contentDir);

    if (!existsSync(dir)) {
      continue;
    }

    const result = spawnSync('find', [dir, '-name', '*.mdx', '-type', 'f'], {
      cwd: ROOT,
      encoding: 'utf8',
    });

    if (result.status !== 0) {
      throw new Error(`Could not scan ${collectionName} articles.`);
    }

    for (const filePath of result.stdout.split('\n').filter(Boolean)) {
      const source = readFileSync(filePath, 'utf8');
      const { body, lines } = parseFrontmatter(source, filePath);

      checkArticle({ body, filePath, lines });
    }
  }

  console.log('Article checks passed.');
};

try {
  const [command, collectionOrTarget, ...rest] = process.argv.slice(2);

  if (command === 'new') {
    newArticle(collectionOrTarget, rest);
  } else if (command === 'publish') {
    publishArticle(collectionOrTarget, rest);
  } else if (command === 'check') {
    checkPublishedArticles();
  } else {
    usage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
