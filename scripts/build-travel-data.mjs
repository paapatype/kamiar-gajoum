#!/usr/bin/env node
// Copies the Travel Studies photos into public/travel/ with safe slugified
// names and writes src/data/travel.json — grouped by region, each photo
// captioned with the place it was made. The curation map below pairs each
// source filename with a region + place label.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(ROOT, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'Travel Studies');
const OUT_DIR = path.join(ROOT, 'public', 'travel');
const OUT_JSON = path.join(ROOT, 'src', 'data', 'travel.json');

// Region order + descriptive copy (shown as section breaks, in Jost).
const REGIONS = [
  {
    region: 'Canada',
    text: 'Based in Vancouver, Kamiar has captured the alpine spirit of Whistler, the historic charm of Victoria, and the rhythmic urban energy of Toronto, Montreal, and Quebec City.',
  },
  {
    region: 'United Kingdom',
    text: 'Observational studies of London and St Albans, alongside the serene, atmospheric landscapes of Carlisle and the Lake District.',
  },
  {
    region: 'France',
    text: 'A mastery of light and color developed through extensive work in Paris, Trouville-sur-Mer, Nice, Cannes, Saint-Paul-de-Vence, and Villefranche-sur-Mer.',
  },
  {
    region: 'United States',
    text: 'Live-sketching the neon pulse of New York City and the soulful, textured streets of Miami and New Orleans.',
  },
  {
    region: 'Europe & The Mediterranean',
    text: 'Translating the timeless elegance of Rome, Venice, Barcelona, Madrid, Monaco, and Malta.',
  },
  {
    region: 'Asia & Africa',
    text: 'Bridging cultures through sketches of the traditional temples of Tokyo and Kyoto, the rich textures of Tunisia and Morocco, and the historic crossroads of Istanbul.',
  },
];

// filename -> { region, place }
const CURATION = {
  'Live painting in Vancouver.JPG':            { region: 'Canada', place: 'Vancouver' },
  'Live Painting Water Street.jpg':            { region: 'Canada', place: 'Water Street, Vancouver' },

  'Sketching in London.jpg':                   { region: 'United Kingdom', place: 'London' },
  'Sketching Piccadilly Cricus London.jpeg':   { region: 'United Kingdom', place: 'Piccadilly Circus, London' },

  'Café de Flore Paris.JPG':                   { region: 'France', place: 'Café de Flore, Paris' },
  'Café de la Paix Paris.JPG':                 { region: 'France', place: 'Café de la Paix, Paris' },
  'Sketching Café de Flore.JPG':               { region: 'France', place: 'Café de Flore, Paris' },
  'Studying Café Treace ambience.JPG':         { region: 'France', place: 'Café Terrace, Paris' },
  'Skeching in Paris.JPG':                     { region: 'France', place: 'Paris' },
  'Sketching Nortre-Dame de Paris.JPG':        { region: 'France', place: 'Notre-Dame, Paris' },
  'Live sketching Nortre-Dame de Paris.JPG':   { region: 'France', place: 'Notre-Dame, Paris' },
  'Live Pastel Work, Nice France.JPG':         { region: 'France', place: 'Nice' },
  'Working from Nice France.JPG':              { region: 'France', place: 'Nice' },
  "Live sketching in Côté d'AUR.JPG":          { region: 'France', place: "Côte d'Azur" },
  'Working Live French Riviera.JPG':           { region: 'France', place: 'French Riviera' },

  'Live sketching NYC.JPG':                    { region: 'United States', place: 'New York City' },

  'Live Painting in Venice.JPG':               { region: 'Europe & The Mediterranean', place: 'Venice' },
  "Live sketching St. Mark's Square.JPG":      { region: 'Europe & The Mediterranean', place: "St Mark's Square, Venice" },
  'Sketching Piazza San Marco Venice.JPG':     { region: 'Europe & The Mediterranean', place: 'Piazza San Marco, Venice' },
  'Sketching Piazza San Marco.JPG':            { region: 'Europe & The Mediterranean', place: 'Piazza San Marco, Venice' },
  'Sketching Carneval di Venezia.JPG':         { region: 'Europe & The Mediterranean', place: 'Carnevale di Venezia' },
  "Sketching Monte-Carlo's architecture.JPG":  { region: 'Europe & The Mediterranean', place: 'Monte-Carlo' },
  'Studying Mdina Malta.JPG':                  { region: 'Europe & The Mediterranean', place: 'Mdina, Malta' },
};

// Intro/hero photo (no specific place caption).
const HERO = 'Kamiar steps into Classice$ Impressionism art.JPG';

function slugify(s) {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'travel';
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

  // Build a normalization-agnostic index of the source folder (macOS stores
  // filenames in NFD; our curation keys may be NFC).
  // Key on NFC-normalized, trimmed, lowercased names so leading spaces and
  // NFD/NFC differences in the source filenames don't break matching.
  const norm = (s) => s.normalize('NFC').trim().toLowerCase();
  const diskFiles = fs.readdirSync(SRC_DIR).filter(f => !f.startsWith('.'));
  const diskByNorm = new Map(diskFiles.map(f => [norm(f), f]));
  const resolve = (name) => diskByNorm.get(norm(name)) || null;

  const copyOne = (file) => {
    const actual = resolve(file);
    if (!actual) return null;
    const ext = path.extname(actual).toLowerCase();
    const base = path.basename(actual, path.extname(actual));
    const safe = `${slugify(base)}${ext}`;
    fs.copyFileSync(path.join(SRC_DIR, actual), path.join(OUT_DIR, safe));
    return `travel/${safe}`;
  };

  // Hero
  const hero = copyOne(HERO);

  // Group images by region
  const grouped = REGIONS.map(r => ({ ...r, images: [] }));
  const byRegion = Object.fromEntries(grouped.map(g => [g.region, g]));

  const missing = [];
  for (const [file, meta] of Object.entries(CURATION)) {
    const src = copyOne(file);
    if (!src) { missing.push(file); continue; }
    byRegion[meta.region].images.push({ src, place: meta.place });
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify({ hero, regions: grouped }, null, 2) + '\n');

  const total = grouped.reduce((n, g) => n + g.images.length, 0);
  console.log(`Travel: copied ${total} photos${hero ? ' + hero' : ''} across ${grouped.length} regions`);
  if (missing.length) console.log('Missing source files:', missing);
}

main();
