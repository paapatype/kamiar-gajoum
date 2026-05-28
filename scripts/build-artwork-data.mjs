#!/usr/bin/env node
// Reads the XLSX of paintings, finds the best-matching image file for each row,
// copies that image into public/paintings/ with a safe slugified filename, and
// writes src/data/artwork.json (plus an unmatched report).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(ROOT, '..');

const XLSX_PATH = path.join(
  PROJECT_ROOT,
  'Paintings DataBase with list and all paintings',
  'List of Kamiar paintings',
  'Kamiar_Gajoum_Vancouver_Fine_Art_Gallery.xlsx',
);
const PAINTINGS_DIR = path.join(
  PROJECT_ROOT,
  'Paintings DataBase with list and all paintings',
  'Paintings ',
);
const PUBLIC_DIR = path.join(ROOT, 'public', 'paintings');
const OUT_DATA = path.join(ROOT, 'src', 'data', 'artwork.json');
const OUT_REPORT = path.join(ROOT, 'src', 'data', 'unmatched-report.json');

const ROMAN = { 'Ⅰ':'I','Ⅱ':'II','Ⅲ':'III','Ⅳ':'IV','Ⅴ':'V','Ⅵ':'VI' };
const NOISE = [
  'gouache medium','gouache','pastel','oil','mixed','framed','sold',
];

function baseClean(s) {
  if (!s) return '';
  let out = String(s).normalize('NFKD');
  for (const [k, v] of Object.entries(ROMAN)) out = out.split(k).join(v);
  out = out
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/×/g, 'x');
  // strip diacritics
  out = out.replace(/[̀-ͯ]/g, '');
  return out;
}

function stripDimensions(s) {
  // 41.0 x 31.8 cm,  12.5 x 16 in,  39.4 x 28.6 inches
  s = s.replace(/\s*-?\s*\d+(?:\.\d+)?\s*[xX]\s*\d+(?:\.\d+)?\s*(?:cm|CM|in|inches|Inches|INCHES)?\s*/g, ' ');
  // 8"x10",  8'x10'
  s = s.replace(/\s*\d+(?:\.\d+)?\s*["']\s*[xX]\s*\d+(?:\.\d+)?\s*["']?\s*/g, ' ');
  return s;
}

function stripNoise(s) {
  for (const w of NOISE) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    s = s.replace(re, ' ');
  }
  s = s.replace(/\([^)]*\)/g, ' ');
  s = s.replace(/\s*-\s*$/, '');
  return s;
}

function normKey(s) {
  let out = baseClean(s);
  out = stripDimensions(out);
  out = stripNoise(out);
  out = out.replace(/[^A-Za-z0-9]+/g, '').toLowerCase();
  return out;
}

function slugify(s) {
  let out = baseClean(s).toLowerCase();
  out = out.replace(/&/g, ' and ');
  out = out.replace(/[^a-z0-9]+/g, '-');
  out = out.replace(/^-+|-+$/g, '');
  return out || 'artwork';
}

function categoryFromMedium(medium) {
  const m = (medium || '').toLowerCase();
  if (m.includes('pastel')) return 'pastel';
  return 'oil';
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function clearDir(p) {
  if (!fs.existsSync(p)) return;
  for (const f of fs.readdirSync(p)) {
    if (f.startsWith('.')) continue;
    fs.rmSync(path.join(p, f), { force: true });
  }
}

function readDisk() {
  const files = fs.readdirSync(PAINTINGS_DIR).filter(f => !f.startsWith('.'));
  return files.map(f => {
    const ext = path.extname(f);
    const base = path.basename(f, ext);
    return { file: f, key: normKey(base) };
  }).filter(x => x.key);
}

function findImage(title, fname, disk) {
  const sources = [fname, title].filter(Boolean);
  const keys = sources.map(s => {
    const ext = path.extname(s);
    return normKey(path.basename(s, ext));
  }).filter(Boolean);

  // 1) exact
  for (const k of keys) {
    const hit = disk.find(d => d.key === k);
    if (hit) return hit.file;
  }
  // 2) disk key starts with our key
  for (const k of keys) {
    if (k.length < 4) continue;
    const cands = disk.filter(d => d.key.startsWith(k));
    if (cands.length) {
      cands.sort((a, b) => a.key.length - b.key.length);
      return cands[0].file;
    }
  }
  // 3) our key starts with disk key (rare, but covers cases where xlsx
  //    title is more descriptive than disk file)
  for (const k of keys) {
    const cands = disk.filter(d => d.key.length >= 6 && k.startsWith(d.key));
    if (cands.length) {
      cands.sort((a, b) => b.key.length - a.key.length);
      return cands[0].file;
    }
  }
  return null;
}

function main() {
  ensureDir(path.dirname(OUT_DATA));
  ensureDir(PUBLIC_DIR);
  clearDir(PUBLIC_DIR);

  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

  const disk = readDisk();
  console.log(`XLSX rows: ${rows.length} • images on disk: ${disk.length}`);

  const artworks = [];
  const unmatched = [];
  const slugUsed = new Map();

  for (const row of rows) {
    const title = (row['Title'] || '').toString().trim();
    if (!title) continue;
    const medium = (row['Medium'] || '').toString().trim();
    const year = row['Year'] != null ? String(row['Year']).trim() : '';
    const dimensions = (row['Dimensions'] || '').toString().trim();
    const availability = ((row['Availability'] || '').toString().trim() || 'Available');
    const fname = (row['High-Res File'] || '').toString().trim();
    const url = (row['Artwork URL'] || '').toString().trim();

    const image = findImage(title, fname, disk);
    if (!image) {
      unmatched.push({ title, fname });
      continue;
    }

    // ensure unique slug; titles like "Venetian Carnival" may repeat
    let slug = slugify(title);
    const used = slugUsed.get(slug) || 0;
    if (used > 0) {
      const suffix = year ? `${slug}-${year}-${used}` : `${slug}-${used + 1}`;
      slug = suffix;
    }
    slugUsed.set(slugify(title), used + 1);

    // copy image to /public/paintings/<slug>.<ext>
    const ext = path.extname(image).toLowerCase();
    const safeName = `${slug}${ext}`;
    fs.copyFileSync(path.join(PAINTINGS_DIR, image), path.join(PUBLIC_DIR, safeName));

    artworks.push({
      id: slug,
      slug,
      title,
      year,
      medium: medium || 'Oil on Canvas',
      category: categoryFromMedium(medium),
      availability,
      dimensions,
      // Relative path (no leading slash) so it resolves against whatever base
      // the site is served from — root locally, /kamiar-gajoum/ on GitHub Pages.
      image: `paintings/${safeName}`,
      sourceImage: image,
      url,
    });
  }

  fs.writeFileSync(OUT_DATA, JSON.stringify(artworks, null, 2) + '\n');
  fs.writeFileSync(OUT_REPORT, JSON.stringify({
    matchedCount: artworks.length,
    totalRows: rows.length,
    unmatched,
  }, null, 2) + '\n');

  console.log(`Wrote ${artworks.length} artworks to ${path.relative(ROOT, OUT_DATA)}`);
  console.log(`Unmatched: ${unmatched.length} (see ${path.relative(ROOT, OUT_REPORT)})`);
}

main();
