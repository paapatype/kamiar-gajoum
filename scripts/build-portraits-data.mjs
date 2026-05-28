#!/usr/bin/env node
// Scans public/portraits/ for images and writes src/data/portraits.json — the
// ordered list of photos for the About-page slideshow. The files already live
// in public/ (served as-is), so we don't copy them; we only list them, with
// names URL-encoded so spaces/special characters resolve correctly as `src`s.
// Drop new photos into public/portraits/ and re-run `npm run data`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'public', 'portraits');
const OUT_JSON = path.join(ROOT, 'src', 'data', 'portraits.json');

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;
// If present, lead the slideshow with this photo (the established portrait).
const LEAD = '_B3R4947.jpg';

function main() {
  let files = [];
  if (fs.existsSync(DIR)) {
    files = fs.readdirSync(DIR).filter((f) => !f.startsWith('.') && IMAGE_RE.test(f));
  }
  // Alphabetical, then float the lead photo to the front (stable sort keeps the
  // rest in alphabetical order).
  files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  files.sort((a, b) => (a === LEAD ? -1 : b === LEAD ? 1 : 0));

  const list = files.map((f) => `portraits/${encodeURIComponent(f)}`);

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(list, null, 2) + '\n');
  console.log(`Portraits: ${list.length} photos -> src/data/portraits.json`);
}

main();
