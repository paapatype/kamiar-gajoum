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

// Galleries that have represented / hosted Kamiar, grouped with their years.
// (Source: kamiargajoum.art/blog + the labelled exhibition photographs.)
const GALLERIES = [
  {
    gallery: 'Vancouver Fine Art Gallery',
    location: 'Vancouver, BC, Canada',
    logo: 'galleries/vancouver-fine-art-gallery.png',
    years: ['2021', '2022', '2023'],
    note: 'Permanent representation — recurring solo and group exhibitions across three consecutive years.',
  },
  {
    gallery: 'Japan Creative Arts Gallery',
    location: 'Tokyo, Japan',
    logo: null,
    years: ['2020'],
    note: 'A featured exhibition introducing the work to collectors in Japan.',
  },
  {
    gallery: 'Le Soleil Gallery',
    location: 'Canada',
    logo: null,
    years: ['2017'],
    note: 'A solo showing of European and live-painted street scenes.',
  },
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

  fs.writeFileSync(OUT_JSON, JSON.stringify({ galleries: GALLERIES, photos }, null, 2) + '\n');
  console.log(`Exhibitions: ${GALLERIES.length} galleries, ${photos.length} photos copied`);
  if (missing.length) console.log('Missing source files:', missing);
}

main();
