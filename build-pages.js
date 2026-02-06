#!/usr/bin/env node
/**
 * HELPCAR Dépannage - Page Generator
 * Generates service detail pages and location detail pages from JSON content.
 */

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, 'site_content/content/services');
const LOCATIONS_DIR = path.join(__dirname, 'site_content/content/locations');
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'site_content/config/config.json'), 'utf8'));
const VARIABLES = JSON.parse(fs.readFileSync(path.join(__dirname, 'site_content/config/variables.json'), 'utf8'));

// Map service JSON filenames to URL slugs
const SERVICE_SLUG_MAP = {
  'remorquage-voiture': 'remorquage-voiture-bruxelles',
  'batterie': 'depannage-batterie-bruxelles',
  'reparation-pneu': 'reparation-pneu-bruxelles',
  'fourniture-carburant': 'fourniture-carburant-bruxelles',
  'remorquage-moto': 'remorquage-motos-bruxelles',
  'remorquage-vehicules-speciaux': 'remorquage-vehicules-speciaux-bruxelles',
  'remplacement-batterie': 'remplacement-batterie-bruxelles',
  'transport-local': 'transport-routier-local-bruxelles',
  'transport-longue-distance': 'transport-routier-longue-distance-bruxelles',
  'ouverture-de-porte': 'ouverture-porte-voiture-bruxelles',
  'panne-essence-bruxelles': 'panne-essence-bruxelles',
  'placement-roue-secours-bruxelles': 'placement-roue-secours-bruxelles',
  'depannage-sous-sol': 'depannage-parking-souterrain-bruxelles',
  'embourbe': 'voiture-embourbee-bruxelles',
  'erreur-carburant': 'siphonnage-reservoir-bruxelles',
  'enlevement-epave': 'enlevement-epave-bruxelles',
  'panne-moteur-bruxelles': 'panne-moteur-bruxelles',
  'sortie-de-fourriere': 'sortie-fourriere-bruxelles',
  'depannage-voiture-electrique-bruxelles': 'depannage-voiture-electrique-bruxelles',
  'depannage-voiture-bruxelles': 'depannage-voiture-bruxelles',
  'depannage-camionnette-bruxelles': 'depannage-camionnette-bruxelles',
  'achat-voiture-accidentee': 'achat-voiture-accidentee',
};

const WHATSAPP_LINK = 'https://wa.me/3228445604?text=Bonjour%20HELPCAR%20D%C3%A9pannage%2C%20j%27ai%20besoin%20d%27un%20d%C3%A9pannage.';

function getSharedHeader(activeNav) {
  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Services', href: '/services/' },
    { label: 'Zones', href: '/zones/' },
    { label: 'Tarifs', href: '/tarifs/' },
    { label: 'À propos', href: '/a-propos/' },
    { label: 'Contact', href: '/contact/' },
  ];

  const desktopLinks = navItems.map(n =>
    `<a href="${n.href}"${n.label === activeNav ? ' class="active"' : ''}>${n.label}</a>`
  ).join('\n      ');

  const mobileLinks = navItems.map(n =>
    `<a href="${n.href}"${n.label === activeNav ? ' class="active"' : ''}>${n.label}</a>`
  ).join('\n  ');

  return `<header class="header">
  <div class="header__inner">
    <a href="/" class="header__logo">
      <div class="header__logo-icon">HC</div>
      <div class="header__logo-text">HELP<span>CAR</span></div>
    </a>
    <nav class="nav-desktop">
      ${desktopLinks}
      <a href="tel:+3228445604" class="header__phone-desktop">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        02 844 56 04
      </a>
    </nav>
    <div class="header__actions">
      <a href="tel:+3228445604" class="header__phone-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        Appeler
      </a>
      <button class="header__burger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<nav class="nav-mobile">
  ${mobileLinks}
  <a href="tel:+3228445604" class="nav-mobile__cta">02 844 56 04</a>
</nav>`;
}

function getSharedFooter() {
  return `<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <div class="header__logo" style="margin-bottom:14px">
          <div class="header__logo-icon">HC</div>
          <div class="header__logo-text">HELP<span>CAR</span></div>
        </div>
        <p style="font-size:0.9rem;margin-bottom:16px;color:var(--gray-400)">Dépannage auto et remorquage à Bruxelles, 24h/24 et 7j/7. Prix annoncé par téléphone.</p>
        <div class="footer__contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          <a href="tel:+3228445604">02 844 56 04</a>
        </div>
        <div class="footer__contact-item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <a href="mailto:contact@helpcar.be">contact@helpcar.be</a>
        </div>
      </div>
      <div>
        <h4 class="footer__title">Services</h4>
        <ul class="footer__links">
          <li><a href="/services/depannage-batterie-bruxelles/">Dépannage Batterie</a></li>
          <li><a href="/services/remorquage-voiture-bruxelles/">Remorquage Voiture</a></li>
          <li><a href="/services/reparation-pneu-bruxelles/">Réparation Pneu</a></li>
          <li><a href="/services/ouverture-porte-voiture-bruxelles/">Ouverture de Porte</a></li>
          <li><a href="/services/">Tous les services</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer__title">Zones</h4>
        <ul class="footer__links">
          <li><a href="/zones/depannage-voiture-bruxelles-centre/">Bruxelles-Centre</a></li>
          <li><a href="/zones/depannage-voiture-etterbeek/">Etterbeek</a></li>
          <li><a href="/zones/depannage-voiture-ixelles/">Ixelles</a></li>
          <li><a href="/zones/depannage-voiture-schaerbeek/">Schaerbeek</a></li>
          <li><a href="/zones/">Toutes les zones</a></li>
        </ul>
      </div>
      <div>
        <h4 class="footer__title">Informations</h4>
        <ul class="footer__links">
          <li><a href="/tarifs/">Tarifs</a></li>
          <li><a href="/a-propos/">À propos</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="/mentions-legales/">Mentions légales</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p>&copy; 2026 HELPCAR Dépannage. Tous droits réservés.</p>
      <p><a href="/mentions-legales/">Mentions légales</a> · <a href="/politique-confidentialite/">Politique de confidentialité</a></p>
    </div>
  </div>
</footer>`;
}

function getFloatingCTA() {
  return `<div class="floating-cta">
  <a href="tel:+3228445604" class="btn btn--primary">Appeler</a>
  <a href="${WHATSAPP_LINK}" class="btn btn--green" target="_blank" rel="noopener">WhatsApp</a>
</div>`;
}

function replaceVars(text) {
  if (!text) return '';
  return text
    .replace(/\{\{YEARS_EXPERIENCE_PLUS\}\}/g, VARIABLES.company.years_experience_plus)
    .replace(/\{\{YEARS_EXPERIENCE\}\}/g, VARIABLES.company.years_experience)
    .replace(/\{\{TELEPHONE\}\}/g, VARIABLES.contact.phone_local_display)
    .replace(/\{\{GOOGLE_RATING\}\}/g, VARIABLES.google.rating)
    .replace(/\{\{GOOGLE_REVIEWS\}\}/g, VARIABLES.google.reviews_count)
    .replace(/\{\{SERVICES_TOTAL\}\}/g, String(VARIABLES.stats.services_total))
    .replace(/\{\{SERVICES_REMORQUAGE\}\}/g, String(VARIABLES.stats.services_remorquage))
    .replace(/\{\{SERVICES_DEPANNAGE\}\}/g, String(VARIABLES.stats.services_depannage))
    .replace(/\{\{WHATSAPP_LINK\}\}/g, WHATSAPP_LINK);
}

// ============ SERVICE PAGES ============

function buildServicePage(jsonFile, slug) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const cssPath = '../../css/style.css';
  const jsPath = '../../js/main.js';

  const badges = (data.hero.badges || []).map(b => {
    const labels = {
      'intervention_rapide': '~30 min',
      'disponible_24_7': '24h/24 7j/7',
      'expertise_10_ans': '10+ ans',
    };
    return `<span class="hero__badge">${labels[b] || b}</span>`;
  }).join(' ');

  const sectionsHtml = (data.sections || []).map(s => `
    <h2>${replaceVars(s.h2)}</h2>
    <div>${replaceVars(s.content)}</div>
  `).join('\n');

  const faqHtml = (data.faq || []).map(f => `
    <div class="faq-item">
      <button class="faq-item__question">
        <span>${replaceVars(f.question)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-item__answer">
        <div class="faq-item__answer-inner">${replaceVars(f.answer)}</div>
      </div>
    </div>
  `).join('\n');

  const ctaTitle = data.cta ? replaceVars(data.cta.title) : 'En Panne Maintenant ?';
  const ctaSub = data.cta ? replaceVars(data.cta.subtitle) : 'Un appel, un prix, une intervention.';

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceVars(data.hero.h1)}</title>
  <meta name="description" content="${replaceVars(data.hero.subtitle)}">
  <link rel="stylesheet" href="${cssPath}">
</head>
<body>
${getSharedHeader('Services')}

<section class="hero">
  <div class="container">
    <div class="hero__content">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${badges}</div>
      <h1>${replaceVars(data.hero.h1)}</h1>
      <p class="hero__subtitle">${replaceVars(data.hero.subtitle)}</p>
      <div class="hero__cta">
        <a href="tel:+3228445604" class="btn btn--primary btn--full">Appeler le 02 844 56 04</a>
        <a href="${WHATSAPP_LINK}" class="btn btn--green btn--full" target="_blank" rel="noopener">Devis WhatsApp</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="service-content">
      ${sectionsHtml}
    </div>
  </div>
</section>

${faqHtml ? `
<section class="section section--gray">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:20px">Questions fréquentes</h2>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

<section class="cta-final">
  <div class="container">
    <h2>${ctaTitle}</h2>
    <p>${ctaSub}</p>
    <a href="tel:+3228445604" class="btn btn--primary">02 844 56 04</a>
  </div>
</section>

${getSharedFooter()}
${getFloatingCTA()}

<script src="${jsPath}"></script>
</body>
</html>`;
}

// ============ LOCATION PAGES ============

function buildLocationPage(jsonFile, slug) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const cssPath = '../../css/style.css';
  const jsPath = '../../js/main.js';
  const c = data.content;

  const quartiersHtml = (c.section_on_connait?.quartiers || []).map(q => `
    <div class="service-card">
      <div class="service-card__icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="service-card__content">
        <h3 class="service-card__title">${q.nom}</h3>
        <p class="service-card__desc">${q.description}</p>
      </div>
    </div>
  `).join('\n');

  const parkingsHtml = c.section_parkings?.afficher ? (c.section_parkings.parkings || []).map(p => `
    <div class="axe-item">
      <span class="axe-item__emoji">🅿️</span>
      <div><span class="axe-item__name">${p.nom}</span></div>
    </div>
  `).join('\n') : '';

  const servicesHtml = (c.section_services?.categories || []).map(cat => `
    <div class="feature-card">
      <h3 class="feature-card__title">${cat.titre}</h3>
      <ul style="list-style:none;padding:0">
        ${cat.services.map(s => `<li style="padding:4px 0"><a href="/services/" style="color:var(--primary);font-weight:500">${s.nom}</a></li>`).join('\n        ')}
      </ul>
    </div>
  `).join('\n');

  const faqHtml = (c.faq_locale?.questions || []).map(f => `
    <div class="faq-item">
      <button class="faq-item__question">
        <span>${f.question}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-item__answer">
        <div class="faq-item__answer-inner">${replaceVars(f.reponse)}</div>
      </div>
    </div>
  `).join('\n');

  const voisinesHtml = (c.section_zones_voisines?.communes_voisines || []).map(cv => `
    <a href="/zones/${cv.slug}/" class="zone-card">
      <div class="zone-card__info">
        <div class="zone-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div><span class="zone-card__name">${cv.nom}</span></div>
      </div>
      <svg class="zone-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.seo.meta_title}</title>
  <meta name="description" content="${data.seo.meta_description}">
  <link rel="stylesheet" href="${cssPath}">
</head>
<body>
${getSharedHeader('Zones')}

<section class="hero">
  <div class="container">
    <div class="hero__content">
      <div class="hero__badge"><span class="hero__badge-dot"></span> Disponible maintenant</div>
      <h1>${data.hero.h1}</h1>
      <p class="hero__subtitle">${data.hero.accroche}</p>
      <div class="hero__cta">
        <a href="tel:+3228445604" class="btn btn--primary btn--full">Appeler le 02 844 56 04</a>
        <a href="${WHATSAPP_LINK}" class="btn btn--green btn--full" target="_blank" rel="noopener">Devis WhatsApp</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="service-content">
      <p>${replaceVars(c.intro_autorite.paragraphe_0)}</p>
      <p>${replaceVars(c.intro_autorite.paragraphe_1)}</p>
      <p>${replaceVars(c.intro_autorite.paragraphe_2)}</p>
    </div>
  </div>
</section>

${quartiersHtml ? `
<section class="section section--gray">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:8px">${c.section_on_connait.h2}</h2>
    <p class="section-subtitle" style="margin-bottom:24px">${c.section_on_connait.intro}</p>
    <div class="services-grid">
      ${quartiersHtml}
    </div>
    ${c.section_on_connait.conclusion ? `<p style="margin-top:20px;color:var(--gray-600)">${c.section_on_connait.conclusion}</p>` : ''}
  </div>
</section>` : ''}

${parkingsHtml ? `
<section class="section">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:8px">${c.section_parkings.h3}</h2>
    <p class="section-subtitle" style="margin-bottom:20px">${c.section_parkings.intro}</p>
    <div class="axes-grid">
      ${parkingsHtml}
    </div>
    <p style="margin-top:16px;color:var(--gray-600);font-size:0.9rem">${c.section_parkings.conclusion}</p>
  </div>
</section>` : ''}

<section class="section section--dark">
  <div class="container">
    <h2 class="section-title" style="color:white;margin-bottom:8px">${c.section_services.h2}</h2>
    <p class="section-subtitle" style="color:var(--gray-400);margin-bottom:24px">${c.section_services.intro}</p>
    <div class="features-grid">
      ${servicesHtml}
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="/services/" class="btn btn--primary">${c.section_services.cta_text}</a>
    </div>
  </div>
</section>

${faqHtml ? `
<section class="section section--gray">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:20px">${c.faq_locale.h2}</h2>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>` : ''}

${voisinesHtml ? `
<section class="section">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:8px">${c.section_zones_voisines.h2}</h2>
    <p class="section-subtitle" style="margin-bottom:20px">${c.section_zones_voisines.content}</p>
    <div class="zones-grid">
      ${voisinesHtml}
    </div>
  </div>
</section>` : ''}

<section class="cta-final">
  <div class="container">
    <h2>En Panne à ${data.commune} ?</h2>
    <p>Dites-nous où vous êtes, on vous dit quand on arrive.</p>
    <a href="tel:+3228445604" class="btn btn--primary">02 844 56 04</a>
  </div>
</section>

${getSharedFooter()}
${getFloatingCTA()}

<script src="${jsPath}"></script>
</body>
</html>`;
}

// ============ MAIN ============

console.log('Generating service pages...');
const serviceFiles = fs.readdirSync(SERVICES_DIR).filter(f => f.endsWith('.json'));
let serviceCount = 0;

for (const file of serviceFiles) {
  const baseName = file.replace('.json', '');
  const slug = SERVICE_SLUG_MAP[baseName] || baseName;
  const outDir = path.join(__dirname, 'services', slug);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const html = buildServicePage(path.join(SERVICES_DIR, file), slug);
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  serviceCount++;
  console.log(`  ✓ services/${slug}/index.html`);
}

console.log(`\nGenerating location pages...`);
const locationFiles = fs.readdirSync(LOCATIONS_DIR).filter(f => f.endsWith('.json'));
let locationCount = 0;

for (const file of locationFiles) {
  const slug = file.replace('.json', '');
  const outDir = path.join(__dirname, 'zones', slug);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const html = buildLocationPage(path.join(LOCATIONS_DIR, file), slug);
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  locationCount++;
  console.log(`  ✓ zones/${slug}/index.html`);
}

console.log(`\nDone! Generated ${serviceCount} service pages and ${locationCount} location pages.`);
