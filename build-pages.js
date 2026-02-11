#!/usr/bin/env node
/**
 * HELPCAR Dépannage - Page Generator
 * Generates service detail pages, location detail pages, and blog pages from JSON content.
 */

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, 'site_content/content/services');
const LOCATIONS_DIR = path.join(__dirname, 'site_content/content/locations');
const BLOG_DIR = path.join(__dirname, 'site_content/content/blog');
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
    { label: 'Blog', href: '/blog/' },
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
      <img src="/images/logo-helpcar.png" alt="HELPCAR Dépannage" class="header__logo-img">
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
          <img src="/images/logo-helpcar.png" alt="HELPCAR Dépannage" class="header__logo-img">
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
          <li><a href="/blog/">Blog</a></li>
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

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/<[^>]*>/g, '');
}

// ============ IMAGE PLACEHOLDER HELPER ============

const IMG_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

function imgPlaceholder(label, suggestion, size = '800 x 600 px', modifier = '--landscape') {
  return `<div class="img-placeholder img-placeholder${modifier}">
    <div class="img-placeholder__icon">${IMG_ICON}</div>
    <div class="img-placeholder__label">${label}</div>
    <div class="img-placeholder__suggestion">${suggestion}</div>
    <div class="img-placeholder__dimensions">${size}</div>
  </div>`;
}

// Photo suggestions per service type
const SERVICE_PHOTO_SUGGESTIONS = {
  'batterie': [
    { label: 'Photo : Diagnostic batterie', suggestion: 'Technicien avec multimètre sur une batterie, capot ouvert, gros plan sur les bornes' },
    { label: 'Photo : Remplacement batterie', suggestion: 'Dépanneur qui installe une batterie neuve, vue sur le compartiment moteur' },
  ],
  'remorquage-voiture': [
    { label: 'Photo : Chargement plateau', suggestion: 'Voiture qui monte sur le plateau de la dépanneuse, rampe visible, vue latérale' },
    { label: 'Photo : Transport', suggestion: 'Camion plateau avec voiture chargée, en déplacement dans Bruxelles' },
  ],
  'reparation-pneu': [
    { label: 'Photo : Changement de roue', suggestion: 'Technicien accroupi qui change un pneu, cric et outils visibles' },
    { label: 'Photo : Pneu crevé', suggestion: 'Gros plan sur un pneu à plat, ou dépanneur qui pose une mèche' },
  ],
  'ouverture-de-porte': [
    { label: 'Photo : Ouverture véhicule', suggestion: 'Dépanneur avec outils de crochetage auto, portière, travail méticuleux' },
    { label: 'Photo : Porte déverrouillée', suggestion: 'Main sur la poignée de porte ouverte, client soulagé' },
  ],
  '_default': [
    { label: 'Photo : Intervention en cours', suggestion: 'Dépanneur en uniforme en train de travailler sur un véhicule, ambiance professionnelle' },
    { label: 'Photo : Résultat', suggestion: 'Véhicule réparé/chargé, client satisfait, dépanneur souriant' },
  ],
};

function getServicePhotos(baseName) {
  return SERVICE_PHOTO_SUGGESTIONS[baseName] || SERVICE_PHOTO_SUGGESTIONS['_default'];
}

// ============ SERVICE PAGES ============

function buildServicePage(jsonFile, slug) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const cssPath = '../../css/style.css';
  const jsPath = '../../js/main.js';

  const title = replaceVars(data.hero.h1);
  const description = replaceVars(data.hero.subtitle);
  const titleAttr = escapeAttr(title);
  const descAttr = escapeAttr(description);
  const canonicalUrl = `https://helpcar.be/services/${slug}/`;

  const badges = (data.hero.badges || []).map(b => {
    const labels = {
      'intervention_rapide': '~30 min',
      'disponible_24_7': '24h/24 7j/7',
      'expertise_10_ans': '10+ ans',
    };
    return `<span class="hero__badge">${labels[b] || b}</span>`;
  }).join(' ');

  const photos = getServicePhotos(path.basename(jsonFile, '.json'));

  const sectionsHtml = (data.sections || []).map((s, i) => {
    let html = '';
    // Insert photo placeholder after every 2nd section, alternating layout
    if (i > 0 && i % 2 === 0 && photos.length > 0) {
      const photoIdx = Math.floor(i / 2) - 1;
      const photo = photos[photoIdx % photos.length];
      const reverse = (photoIdx % 2 === 1) ? ' photo-section--reverse' : '';
      html += `
    </div>
  </div>
</section>
<section class="section${i % 4 === 0 ? ' section--gray' : ''}">
  <div class="container">
    <div class="photo-section${reverse}">
      <div class="photo-section__content">
        <h2>${replaceVars(s.h2)}</h2>
        <div>${replaceVars(s.content)}</div>
      </div>
      <div class="photo-section__image">
        ${imgPlaceholder(photo.label, photo.suggestion)}
      </div>
    </div>
    <div class="service-content">`;
      return html;
    }
    html += `
    <h2>${replaceVars(s.h2)}</h2>
    <div>${replaceVars(s.content)}</div>`;
    return html;
  }).join('\n');

  // Add a hero-level photo placeholder after the first section
  const heroPhoto = photos[0] || { label: 'Photo service', suggestion: 'Photo en rapport avec ce service' };

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

  // Schema: Service + FAQPage
  const faqSchema = (data.faq && data.faq.length > 0) ? `,
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [${data.faq.map(f => `
      {
        "@type": "Question",
        "name": ${JSON.stringify(escapeAttr(replaceVars(f.question)))},
        "acceptedAnswer": {
          "@type": "Answer",
          "text": ${JSON.stringify(escapeAttr(replaceVars(f.answer)))}
        }
      }`).join(',')}
    ]
  }` : '';

  const schemaJson = `[
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": ${JSON.stringify(titleAttr)},
    "description": ${JSON.stringify(descAttr)},
    "url": "${canonicalUrl}",
    "provider": {
      "@type": "LocalBusiness",
      "@id": "https://helpcar.be/#business",
      "name": "HELPCAR Dépannage",
      "telephone": "+3228445604"
    },
    "areaServed": {
      "@type": "City",
      "name": "Bruxelles"
    }
  }${faqSchema}
]`;

  const ctaTitle = data.cta ? replaceVars(data.cta.title) : 'En Panne Maintenant ?';
  const ctaSub = data.cta ? replaceVars(data.cta.subtitle) : 'Un appel, un prix, une intervention.';

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleAttr}</title>
  <meta name="description" content="${descAttr}">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:title" content="${titleAttr}">
  <meta property="og:description" content="${descAttr}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="fr_BE">
  <meta property="og:site_name" content="HELPCAR Dépannage">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${titleAttr}">
  <meta name="twitter:description" content="${descAttr}">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">
  ${schemaJson}
  </script>
</head>
<body>
${getSharedHeader('Services')}

<section class="hero">
  <div class="container">
    <div class="hero__content">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${badges}</div>
      <h1>${title}</h1>
      <p class="hero__subtitle">${description}</p>
      <div class="hero__cta">
        <a href="tel:+3228445604" class="btn btn--primary btn--full">Appeler le 02 844 56 04</a>
        <a href="${WHATSAPP_LINK}" class="btn btn--green btn--full" target="_blank" rel="noopener">Devis WhatsApp</a>
      </div>
    </div>
  </div>
</section>

${data.intro_autorite ? `<section class="section" style="padding-bottom:0">
  <div class="container">
    <div class="service-content" style="padding:0">
      <p>${replaceVars(data.intro_autorite)}</p>
    </div>
  </div>
</section>` : ''}

<section class="section">
  <div class="container">
    <div class="photo-section">
      <div class="photo-section__image">
        ${imgPlaceholder(heroPhoto.label, heroPhoto.suggestion, '1200 x 800 px', '--wide')}
      </div>
      <div class="photo-section__content" style="display:none"></div>
    </div>
    <style>@media(max-width:767px){.photo-section__content[style]{display:none!important}}</style>
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

  const title = data.seo.meta_title;
  const description = data.seo.meta_description;
  const titleAttr = escapeAttr(title);
  const descAttr = escapeAttr(description);
  const canonicalUrl = `https://helpcar.be/zones/${slug}/`;

  const quartiersHtml = (c.section_on_connait?.quartiers || []).map(q => `
    <div class="service-card">
      <div class="service-card__photo">
        <div class="service-card__photo-icon">${IMG_ICON}</div>
        <div class="service-card__photo-hint">Photo : Rue ou place connue de ${q.nom}</div>
      </div>
      <div class="service-card__body">
        <div class="service-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="service-card__content">
          <h3 class="service-card__title">${q.nom}</h3>
          <p class="service-card__desc">${q.description}</p>
        </div>
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

  // Schema: LocalBusiness for location
  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://helpcar.be/#business",
    "name": "HELPCAR Dépannage",
    "description": descAttr,
    "url": canonicalUrl,
    "telephone": "+3228445604",
    "email": "contact@helpcar.be",
    "areaServed": {
      "@type": "Place",
      "name": data.commune || slug
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bruxelles",
      "postalCode": "1000",
      "addressCountry": "BE"
    }
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleAttr}</title>
  <meta name="description" content="${descAttr}">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:title" content="${titleAttr}">
  <meta property="og:description" content="${descAttr}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="fr_BE">
  <meta property="og:site_name" content="HELPCAR Dépannage">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${titleAttr}">
  <meta name="twitter:description" content="${descAttr}">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">
  ${schemaJson}
  </script>
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
    <div class="photo-section">
      <div class="photo-section__content">
        <div class="service-content" style="padding:0">
          <p>${replaceVars(c.intro_autorite.paragraphe_0)}</p>
          <p>${replaceVars(c.intro_autorite.paragraphe_1)}</p>
          <p>${replaceVars(c.intro_autorite.paragraphe_2)}</p>
        </div>
      </div>
      <div class="photo-section__image">
        ${imgPlaceholder('Photo : ' + data.commune, 'Vue de ' + data.commune + ' avec dépanneuse HELPCAR, ou point de repère connu de la commune avec camion en arrière-plan')}
      </div>
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

// ============ BLOG PAGES ============

function buildBlogPost(jsonFile, slug) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const cssPath = '../../css/style.css';
  const jsPath = '../../js/main.js';

  const titleAttr = escapeAttr(data.title);
  const descAttr = escapeAttr(data.meta_description);
  const canonicalUrl = `https://helpcar.be/blog/${slug}/`;

  const sectionsHtml = (data.sections || []).map(s => `
    <h2>${s.h2}</h2>
    <div>${s.content}</div>
  `).join('\n');

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": titleAttr,
    "description": descAttr,
    "url": canonicalUrl,
    "datePublished": data.date,
    "dateModified": data.date,
    "author": {
      "@type": "Organization",
      "name": "HELPCAR Dépannage",
      "url": "https://helpcar.be/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HELPCAR Dépannage",
      "url": "https://helpcar.be/"
    },
    "mainEntityOfPage": canonicalUrl
  }, null, 2);

  const serviceLie = data.service_lie || {};

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleAttr} | HELPCAR Dépannage</title>
  <meta name="description" content="${descAttr}">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:title" content="${titleAttr}">
  <meta property="og:description" content="${descAttr}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="fr_BE">
  <meta property="og:site_name" content="HELPCAR Dépannage">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${titleAttr}">
  <meta name="twitter:description" content="${descAttr}">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">
  ${schemaJson}
  </script>
</head>
<body>
${getSharedHeader('Blog')}

<section class="hero" style="padding:48px 0 32px">
  <div class="container">
    <div class="hero__content" style="max-width:800px">
      <nav style="margin-bottom:16px;font-size:0.9rem;color:var(--gray-500)">
        <a href="/" style="color:var(--primary)">Accueil</a> &rsaquo;
        <a href="/blog/" style="color:var(--primary)">Blog</a> &rsaquo;
        <span>${data.category || 'Article'}</span>
      </nav>
      <h1>${data.title}</h1>
      <p class="hero__subtitle">${data.intro}</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:0.85rem;color:var(--gray-500)">
        <span>${data.date}</span>
        <span>${data.category || ''}</span>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="service-content" style="max-width:800px;margin:0 auto">
      ${sectionsHtml}
    </div>
  </div>
</section>

${serviceLie.slug ? `
<section class="cta-final">
  <div class="container">
    <h2>Besoin d'aide maintenant ?</h2>
    <p>HELPCAR Dépannage intervient 24h/24 à Bruxelles. Appelez-nous pour un dépannage rapide.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="tel:+3228445604" class="btn btn--primary">Appeler le 02 844 56 04</a>
      <a href="/services/${serviceLie.slug}/" class="btn btn--outline" style="border-color:white;color:white">${serviceLie.label || 'Voir le service'} &rarr;</a>
    </div>
  </div>
</section>` : `
<section class="cta-final">
  <div class="container">
    <h2>En Panne Maintenant ?</h2>
    <p>Un appel, un prix, une intervention.</p>
    <a href="tel:+3228445604" class="btn btn--primary">02 844 56 04</a>
  </div>
</section>`}

${getSharedFooter()}
${getFloatingCTA()}

<script src="${jsPath}"></script>
</body>
</html>`;
}

function buildBlogListing(blogArticles) {
  const cssPath = '../css/style.css';
  const jsPath = '../js/main.js';

  const cardsHtml = blogArticles.map(a => `
    <a href="/blog/${a.slug}/" class="service-card">
      <div class="service-card__body">
        <div class="service-card__content" style="width:100%">
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <span class="hero__badge" style="font-size:0.75rem;padding:2px 10px">${a.category || 'Article'}</span>
            <span style="font-size:0.8rem;color:var(--gray-500)">${a.date}</span>
          </div>
          <div class="service-card__title">${a.title}</div>
          <div class="service-card__desc">${a.intro}</div>
        </div>
        <svg class="service-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </a>
  `).join('\n');

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog HELPCAR Dépannage",
    "description": "Conseils dépannage auto, astuces prévention pannes et informations remorquage à Bruxelles.",
    "url": "https://helpcar.be/blog/",
    "publisher": {
      "@type": "Organization",
      "name": "HELPCAR Dépannage",
      "url": "https://helpcar.be/"
    }
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="fr-BE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Dépannage Auto Bruxelles | Conseils &amp; Astuces | HELPCAR</title>
  <meta name="description" content="Conseils dépannage auto, astuces prévention pannes et informations remorquage à Bruxelles. Le blog HELPCAR Dépannage.">
  <link rel="canonical" href="https://helpcar.be/blog/">
  <!-- Open Graph -->
  <meta property="og:title" content="Blog Dépannage Auto Bruxelles | Conseils &amp; Astuces | HELPCAR">
  <meta property="og:description" content="Conseils dépannage auto, astuces prévention pannes et informations remorquage à Bruxelles.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://helpcar.be/blog/">
  <meta property="og:locale" content="fr_BE">
  <meta property="og:site_name" content="HELPCAR Dépannage">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Blog Dépannage Auto Bruxelles | HELPCAR">
  <meta name="twitter:description" content="Conseils dépannage auto, astuces prévention pannes et informations remorquage à Bruxelles.">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">
  ${schemaJson}
  </script>
</head>
<body>
${getSharedHeader('Blog')}

<section class="hero" style="padding:48px 0 32px">
  <div class="container">
    <div class="hero__content">
      <h1>Blog Dépannage Auto <span class="highlight">Bruxelles</span></h1>
      <p class="hero__subtitle">Conseils pratiques, astuces prévention et tout ce qu'il faut savoir sur le dépannage auto à Bruxelles.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="services-grid">
      ${cardsHtml}
    </div>
  </div>
</section>

<section class="cta-final">
  <div class="container">
    <h2>En Panne Maintenant ?</h2>
    <p>Un appel, un prix, une intervention. On est disponible 24h/24.</p>
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

console.log(`\nGenerating blog pages...`);
let blogCount = 0;
const blogArticles = [];

if (fs.existsSync(BLOG_DIR)) {
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json'));

  for (const file of blogFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, file), 'utf8'));
    blogArticles.push(data);
  }

  // Sort by date descending
  blogArticles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  for (const article of blogArticles) {
    const slug = article.slug;
    const outDir = path.join(__dirname, 'blog', slug);

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const html = buildBlogPost(path.join(BLOG_DIR, slug + '.json'), slug);
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    blogCount++;
    console.log(`  ✓ blog/${slug}/index.html`);
  }

  // Generate blog listing
  const blogListDir = path.join(__dirname, 'blog');
  if (!fs.existsSync(blogListDir)) fs.mkdirSync(blogListDir, { recursive: true });
  const listingHtml = buildBlogListing(blogArticles);
  fs.writeFileSync(path.join(blogListDir, 'index.html'), listingHtml, 'utf8');
  console.log(`  ✓ blog/index.html (listing)`);
}

console.log(`\nDone! Generated ${serviceCount} service pages, ${locationCount} location pages, and ${blogCount} blog posts.`);
