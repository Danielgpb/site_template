#!/usr/bin/env node
/**
 * Ajoute le lien « NL » dans la navigation (desktop + mobile) de toutes les pages FR.
 * Cible : l'équivalent NL si la page en a un (dérivé des JSON NL), sinon /nl/.
 * Idempotent : ne fait rien si un lien vers /nl est déjà présent dans le header.
 * Usage : node scripts-lang-switch-fr.js (appelé aussi par build-pages.js)
 */
const fs = require('fs');
const path = require('path');

const NL_DIRS = [
  path.join(__dirname, 'site_content/content/nl/services'),
  path.join(__dirname, 'site_content/content/nl/locations'),
];

// Map chemin FR (relatif, ex. "services/remorquage-voiture-bruxelles") → URL NL
const NL_MAP = {
  '': '/nl/',
  'services': '/nl/diensten/',
  'zones': '/nl/zones/',
};
for (const dir of NL_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!data.hreflang_fr) continue;
    const frPath = data.hreflang_fr.replace('https://helpcar.be/', '').replace(/\/$/, '');
    NL_MAP[frPath] = `/nl/${f.replace(/\.json$/, '')}/`;
  }
}

// Toutes les pages FR (on exclut nl/ et build/)
function* walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['nl', 'build', 'node_modules', 'site_content', '.claude', 'images', 'css', 'js', 'fonts'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

let done = 0, skipped = 0, warned = 0;
for (const filePath of [...walkHtml(__dirname)]) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('nav-desktop')) continue; // pas une page avec header standard
  const rel = path.relative(__dirname, path.dirname(filePath)).replace(/\\/g, '/');
  const relKey = rel === '.' ? '' : rel;
  const nlUrl = NL_MAP[relKey] || '/nl/';

  if (/nav-desktop[\s\S]{0,2500}?href="\/nl/.test(html)) { skipped++; continue; }

  // Desktop : insérer avant le lien téléphone du header
  const desktopAnchor = /(<a href="tel:\+3228860486" class="header__phone-desktop">)/;
  // Mobile : insérer avant le CTA téléphone
  const mobileAnchor = /(<a href="tel:\+3228860486" class="nav-mobile__cta">)/;
  if (!desktopAnchor.test(html) || !mobileAnchor.test(html)) {
    console.log(`  ⚠ ancre nav introuvable : ${path.relative(__dirname, filePath)}`);
    warned++;
    continue;
  }
  html = html.replace(desktopAnchor, `<a href="${nlUrl}" title="Nederlandse versie">NL</a>\n        $1`);
  html = html.replace(mobileAnchor, `<a href="${nlUrl}" title="Nederlandse versie">NL</a>\n      $1`);
  fs.writeFileSync(filePath, html);
  done++;
}
console.log(`Lien NL : ${done} pages FR modifiées, ${skipped} déjà faites, ${warned} avertissements.`);
