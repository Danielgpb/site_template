#!/usr/bin/env node
/**
 * Injecte les balises hreflang FR<->NL dans les pages FR concernées.
 * Les paires sont dérivées automatiquement des JSON NL (champ hreflang_fr)
 * + quelques paires statiques (accueil, index services/zones).
 * Idempotent : ne fait rien si les balises hreflang sont déjà présentes.
 * Usage : node scripts-hreflang-fr.js (appelé aussi par build-pages.js)
 */
const fs = require('fs');
const path = require('path');

const NL_DIRS = [
  path.join(__dirname, 'site_content/content/nl/services'),
  path.join(__dirname, 'site_content/content/nl/locations'),
];

const PAIRS = [
  { file: 'index.html', fr: 'https://helpcar.be/', nl: 'https://helpcar.be/nl/' },
  { file: 'services/index.html', fr: 'https://helpcar.be/services/', nl: 'https://helpcar.be/nl/diensten/' },
  { file: 'zones/index.html', fr: 'https://helpcar.be/zones/', nl: 'https://helpcar.be/nl/zones/' },
];

for (const dir of NL_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!data.hreflang_fr) continue;
    const frPath = data.hreflang_fr.replace('https://helpcar.be/', '').replace(/\/$/, '');
    PAIRS.push({
      file: frPath + '/index.html',
      fr: data.hreflang_fr,
      nl: `https://helpcar.be/nl/${f.replace(/\.json$/, '')}/`,
    });
  }
}

for (const p of PAIRS) {
  const filePath = path.join(__dirname, p.file);
  if (!fs.existsSync(filePath)) { console.log(`  ⚠ absent : ${p.file}`); continue; }
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('hreflang=')) { console.log(`  = déjà fait : ${p.file}`); continue; }
  const canonical = `<link rel="canonical" href="${p.fr}">`;
  if (!html.includes(canonical)) { console.log(`  ⚠ canonical introuvable : ${p.file}`); continue; }
  const tags = `${canonical}\n  <link rel="alternate" hreflang="fr-BE" href="${p.fr}">\n  <link rel="alternate" hreflang="nl-BE" href="${p.nl}">\n  <link rel="alternate" hreflang="x-default" href="${p.fr}">`;
  html = html.replace(canonical, tags);
  fs.writeFileSync(filePath, html);
  console.log(`  ✓ hreflang ajouté : ${p.file}`);
}
console.log(`hreflang FR<->NL : ${PAIRS.length} paires traitées.`);
