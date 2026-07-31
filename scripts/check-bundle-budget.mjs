import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const workspace = process.cwd();
const nextDirectory = path.join(workspace, '.next');
const manifestPath = path.join(nextDirectory, 'app-build-manifest.json');
const miniAppBudget = 180 * 1024;

function isJavaScript(file) {
  return file.endsWith('.js');
}

function ancestorsFor(routeKey) {
  const segments = routeKey.split('/').filter(Boolean);
  const ancestors = ['/layout'];
  const pageIndex = segments.lastIndexOf('page');
  const routeSegments = pageIndex >= 0 ? segments.slice(0, pageIndex) : segments;

  for (let index = 1; index <= routeSegments.length; index += 1) {
    ancestors.push(`/${routeSegments.slice(0, index).join('/')}/layout`);
  }

  return ancestors;
}

async function gzipSize(file) {
  const contents = await readFile(path.join(nextDirectory, file));
  return gzipSync(contents, { level: 9 }).byteLength;
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const miniAppPages = Object.keys(manifest.pages).filter(
  (key) => key === '/app/page' || (key.startsWith('/app/') && key.endsWith('/page')),
);

if (miniAppPages.length === 0) {
  throw new Error('No Mini App pages were found in .next/app-build-manifest.json');
}

const results = [];

for (const page of miniAppPages) {
  const keys = [...ancestorsFor(page), page];
  const files = new Set(
    keys.flatMap((key) => manifest.pages[key] ?? []).filter(isJavaScript),
  );
  const bytes = (
    await Promise.all([...files].map((file) => gzipSize(file)))
  ).reduce((total, size) => total + size, 0);
  results.push({ page, bytes, files: [...files] });
}

const largest = results.sort((left, right) => right.bytes - left.bytes)[0];
const formatted = (bytes) => `${(bytes / 1024).toFixed(1)} KiB gzip`;

for (const result of results) {
  console.log(`${result.page}: ${formatted(result.bytes)}`);
}

if (largest.bytes > miniAppBudget) {
  throw new Error(
    `Mini App budget exceeded on ${largest.page}: ${formatted(largest.bytes)} > ${formatted(miniAppBudget)}`,
  );
}

const posterPaths = [
  'public/images/v2/avangard-hero-poster-cobalt.webp',
  'public/images/v2/avangard-hero-poster-cobalt-mobile.webp',
];

for (const posterPath of posterPaths) {
  const poster = await stat(path.join(workspace, posterPath));
  if (poster.size > 300 * 1024) {
    throw new Error(`${posterPath} exceeds the 300 KiB poster budget`);
  }
}

console.log(
  `Bundle budget passed. Largest Mini App route: ${largest.page} at ${formatted(largest.bytes)}.`,
);

