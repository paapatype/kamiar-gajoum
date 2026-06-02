#!/usr/bin/env node
// Copies curated exhibition photos into public/exhibitions/ and writes
// src/data/exhibitions.json. Exhibitions are grouped BY GALLERY (with the
// years that gallery hosted Kamiar) rather than a flat year-by-year list —
// this surfaces the ongoing relationship with a venue. The exhibition list
// itself comes from kamiargajoum.art/blog; photos are supplementary.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(ROOT, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'Exhibition photographs');
const OUT_DIR = path.join(ROOT, 'public', 'exhibitions');
const OUT_JSON = path.join(ROOT, 'src', 'data', 'exhibitions.json');

// Galleries that have represented / hosted Kamiar. Shown as a logo strip at the
// top of the page (the per-year detail lives in HISTORY below). Logos are
// self-hosted PNGs in public/galleries/; a null logo falls back to a styled
// wordmark. Ordered most-recent-relationship first.
const GALLERIES = [
  {
    gallery: 'Vancouver Fine Art Gallery',
    location: 'Vancouver, BC',
    logo: 'galleries/vancouver-fine-art-gallery.png',
  },
  {
    gallery: 'LeSoleil Fine Art Gallery',
    location: 'Vancouver, BC',
    logo: null,
  },
  {
    gallery: 'Gainsborough Galleries',
    location: 'Calgary, AB',
    logo: 'galleries/gainsborough-galleries.png',
  },
  {
    gallery: 'The Plaza Galleries',
    location: 'Whistler, BC',
    logo: 'galleries/plaza-galleries.png',
  },
];

// Full exhibition history, reverse-chronological. Each year lists the venues /
// locations where the work was shown that year. `venue` is the gallery name (if
// known); `note` flags a titled show. Some early/overseas entries are recorded
// by location only, exactly as documented.
const HISTORY = [
  { year: '2026', items: [
    { venue: 'Vancouver Fine Art Gallery', location: 'Vancouver, BC', note: '“FIFA”' },
  ] },
  { year: '2025', items: [
    { venue: 'Vancouver Fine Art Gallery', location: 'Vancouver, BC' },
    { location: 'Tokyo, Japan' },
  ] },
  { year: '2024', items: [ { venue: 'Vancouver Fine Art Gallery', location: 'Vancouver, BC' } ] },
  { year: '2023', items: [ { venue: 'Vancouver Fine Art Gallery', location: 'Vancouver, BC' } ] },
  { year: '2022', items: [ { venue: 'Vancouver Fine Art Gallery', location: 'Vancouver, BC' } ] },
  { year: '2021', items: [ { venue: 'Vancouver Fine Art Gallery', location: 'Vancouver, BC' } ] },
  { year: '2020', items: [ { location: 'Tokyo, Japan' } ] },
  { year: '2019', items: [ { venue: 'LeSoleil Fine Art Gallery', location: 'Vancouver, BC' } ] },
  { year: '2018', items: [ { venue: 'LeSoleil Fine Art Gallery', location: 'Vancouver, BC' } ] },
  { year: '2017', items: [
    { location: 'Vancouver, BC' },
    { venue: 'Gainsborough Galleries', location: 'Calgary, AB' },
  ] },
  { year: '2016', items: [
    { venue: 'The Plaza Galleries', location: 'Whistler, BC' },
    { venue: 'Gainsborough Galleries', location: 'Calgary, AB' },
    { location: 'St Albans, UK' },
  ] },
  { year: '2015', items: [
    { venue: 'The Plaza Galleries', location: 'Whistler, BC' },
    { venue: 'Gainsborough Galleries', location: 'Calgary, AB' },
    { location: 'Maui, Hawaii, USA' },
  ] },
  { year: '2014', items: [
    { venue: 'The Plaza Galleries', location: 'Whistler, BC' },
    { venue: 'Gainsborough Galleries', location: 'Calgary, AB' },
    { location: 'Maui, Hawaii, USA' },
  ] },
  { year: '2013', items: [ { venue: 'The Plaza Galleries', location: 'Whistler, BC' } ] },
  { year: '2012', items: [ { venue: 'The Plaza Galleries', location: 'Whistler, BC' } ] },
];

// Curated photographs. Captions are only set for photos whose location is
// known from the filename; the rest read as installation views.
const PHOTOS = [
  { file: "Kamiar's Exhibition at Le Soleil Gallery.jpg", caption: 'Le Soleil Gallery' },
  { file: 'Exibition in Calgary.JPEG', caption: 'Calgary, AB' },
  { file: 'Exhibition in Whislter.JPG', caption: 'Whistler, BC' },
  { file: 'Exhibition in BC.JPG', caption: 'British Columbia' },
  { file: 'Window Disply.jpg', caption: 'Gallery window' },
  { file: 'DSC_0231.JPG', caption: '' },
  { file: 'DSC_0241.JPG', caption: '' },
  { file: 'DSC_0248.JPG', caption: '' },
  { file: 'DSC_0291.JPG', caption: '' },
  { file: 'DSC_0375.JPG', caption: '' },
  { file: 'DSC_0377.JPG', caption: '' },
  { file: 'DSC_0385.JPG', caption: '' },
  { file: 'DSC_0413.JPG', caption: '' },
  { file: 'IMG_0383.JPG', caption: '' },
  { file: 'IMG_0452.JPG', caption: '' },
  { file: 'IMG_0465.JPEG', caption: '' },
];

function slugify(s) {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exhibition';
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function clearDir(p) {
  if (!fs.existsSync(p)) return;
  for (const f of fs.readdirSync(p)) { if (!f.startsWith('.')) fs.rmSync(path.join(p, f), { force: true }); }
}

function main() {
  ensureDir(OUT_DIR);
  clearDir(OUT_DIR);
  ensureDir(path.dirname(OUT_JSON));

  const norm = (s) => s.normalize('NFC').trim().toLowerCase();
  const disk = fs.readdirSync(SRC_DIR).filter(f => !f.startsWith('.'));
  const byNorm = new Map(disk.map(f => [norm(f), f]));

  const photos = [];
  const missing = [];
  for (const { file, caption } of PHOTOS) {
    const actual = byNorm.get(norm(file));
    if (!actual) { missing.push(file); continue; }
    const ext = path.extname(actual).toLowerCase();
    const safe = `${slugify(path.basename(actual, path.extname(actual)))}${ext}`;
    fs.copyFileSync(path.join(SRC_DIR, actual), path.join(OUT_DIR, safe));
    photos.push({ src: `exhibitions/${safe}`, caption });
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify({ galleries: GALLERIES, history: HISTORY, photos }, null, 2) + '\n');
  const shows = HISTORY.reduce((n, y) => n + y.items.length, 0);
  console.log(`Exhibitions: ${GALLERIES.length} galleries, ${HISTORY.length} years (${shows} entries), ${photos.length} photos copied`);
  if (missing.length) console.log('Missing source files:', missing);
}

main();
