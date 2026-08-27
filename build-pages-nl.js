#!/usr/bin/env node
/**
 * HELPCAR Dépannage - Générateur version NL (Brussel + Vlaamse Rand)
 * Génère les pages néerlandaises sous /nl/ à partir de site_content/content/nl/.
 * Règle : une page NL n'existe que si son équivalent FR existe déjà.
 * Le gabarit reproduit les pages FR faites main : photos, avis Google, sections
 * alternées, Waarom HELPCAR, bulle WhatsApp (lien direct NL, sans whatsapp-smart.js FR).
 * Usage : node build-pages-nl.js
 */

const fs = require('fs');
const path = require('path');

const NL_SERVICES_DIR = path.join(__dirname, 'site_content/content/nl/services');
const NL_LOCATIONS_DIR = path.join(__dirname, 'site_content/content/nl/locations');
const IMAGES_DIR = path.join(__dirname, 'images');
const OUT_DIR = path.join(__dirname, 'nl');

const PHONE_DISPLAY = '02 886 04 86';
const PHONE_TEL = 'tel:+3228860486';
const WHATSAPP_LINK_NL = 'https://wa.me/3228860486?text=Hallo%20HELPCAR%2C%20ik%20heb%20autopech%20en%20heb%20hulp%20nodig.';
const GOOGLE_MAPS_LINK = 'https://maps.app.goo.gl/qBtfKXq3Tjg63dE59';
const OG_IMAGE = 'https://helpcar.be/images/og-helpcar.jpg';

const GA_TAG = `<!-- GA4 + GTM différé (charge au premier scroll/click ou après 5s) -->
<script>
function _lg(){
  var s=document.createElement('script');
  s.src='https://www.googletagmanager.com/gtag/js?id=G-TTH5XB3R2E';
  s.async=true;document.head.appendChild(s);
  s.onload=function(){window.dataLayer=window.dataLayer||[];
  function g(){dataLayer.push(arguments)}window.gtag=g;
  g('js',new Date());g('config','G-TTH5XB3R2E')};
  var t=document.createElement('script');
  t.async=true;t.src='https://www.googletagmanager.com/gtm.js?id=GTM-T229C88P';
  document.head.appendChild(t);
}
var _ld=false;function _tl(){if(_ld)return;_ld=true;_lg()}
['scroll','click','touchstart','keydown'].forEach(function(e){
window.addEventListener(e,_tl,{once:true,passive:true})});
setTimeout(_tl,5000);
</script>`;

const GTM_NOSCRIPT = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T229C88P"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

const PHONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const GOOGLE_G_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.06 24.06 0 0 0 0 21.56l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

// ============ IMAGES PAR PAGE (mêmes photos que les pages FR équivalentes) ============
// hero = photo du hero ; terrain = section alternée A ; prijs / nacht = sections alternées B/C
const DEFAULT_IMGS = { prijs: 'dep-poignee-de-main', nacht: 'depannage-de-nuit' };
const PAGE_IMAGES = {
  // Zones
  'takeldienst-brussel-centrum': { hero: 'remorquage-voiture-bruxelles-centre', terrain: 'contacter-helpcar' },
  'takeldienst-etterbeek': { hero: 'depanneuse-cinquantenaire-etterbeek', terrain: 'contacter-helpcar' },
  'takeldienst-evere': { hero: 'evere-hero', terrain: 'contacter-helpcar' },
  'takeldienst-vorst': { hero: 'forest-hero', terrain: 'contacter-helpcar' },
  'takeldienst-elsene': { hero: 'plateau-flagey-ixelles', terrain: 'contacter-helpcar' },
  'takeldienst-schaarbeek': { hero: 'plateau-meiser', terrain: 'contacter-helpcar' },
  'takeldienst-ukkel': { hero: 'depanneuse-helpcar', terrain: 'contacter-helpcar' },
  'takeldienst-sint-lambrechts-woluwe': { hero: 'woluwe-saint-lambert-hero', terrain: 'contacter-helpcar' },
  'takeldienst-sint-pieters-woluwe': { hero: 'wsp-hero', terrain: 'wsp-terrain', prijs: 'wsp-confiance', nacht: 'wsp-nuit' },
  'takeldienst-sint-genesius-rode': { hero: 'rhode-hero', terrain: 'rhode-terrain', prijs: 'rhode-confiance', nacht: 'rhode-nuit' },
  'takeldienst-zaventem': { hero: 'zaventem-hero', terrain: 'contacter-helpcar' },
  'takeldienst-vilvoorde': { hero: 'vilvoorde-hero', terrain: 'vilvoorde-zoning' },
  'takeldienst-machelen': { hero: 'machelen-hero', terrain: 'machelen-brucargo' },
  // Services
  'takeldienst-brussel': { hero: 'depannage-camionette-plateau', terrain: 'remorquage-sangle-autoroute' },
  'pechverhelping-brussel': { hero: 'depannage-voiture', terrain: 'client-satisfait-helpcar' },
  'batterij-depannage-brussel': { hero: 'choc-batterie-avec-client', terrain: 'diagnostic-batterie-multimetre' },
  'bandenpech-brussel': { hero: 'client-pneu-plat', terrain: 'pneu-meche-intervention' },
  'wrakophaling-brussel': { hero: 'enlevement-epave', terrain: 'enlevement-epave-2' },
  'autodeur-openen-brussel': { hero: 'ouverture-de-porte', terrain: 'ouverture-porte-crochetage' },
  'benzinepech-brussel': { hero: 'panne-essence', terrain: 'fourniture-carburant' },
  'brandstoflevering-brussel': { hero: 'fourniture-carburant', terrain: 'panne-essence' },
  'verkeerde-brandstof-brussel': { hero: 'erreur-carburant', terrain: 'erreur-pompe-essence' },
  'reservewiel-monteren-brussel': { hero: 'placement-roue-secours', terrain: 'client-pneu-plat' },
  'autobatterij-vervangen-brussel': { hero: 'remplacement-batterie', terrain: 'booster-batterie-professionnel' },
  'moto-takelen-brussel': { hero: 'remorquage-moto-new', terrain: 'remorquage-moto-2' },
  'takeldienst-bestelwagen-brussel': { hero: 'remorquage-camionnette', terrain: 'depannage-camionnette-intervention' },
  'takeldienst-vrachtwagen-brussel': { hero: 'depannage-poids-lourd-autoroute', terrain: 'remorquage-poids-lourd-levage' },
  'depannage-elektrische-auto-brussel': { hero: 'depannage-voiture-electrique', terrain: 'photo-diagnostique' },
  'takelen-ondergrondse-parking-brussel': { hero: 'depannage-parking-souterrain', terrain: 'depanneuse-cinquantenaire-etterbeek' },
  'auto-vastgereden-brussel': { hero: 'voiture-embourbee-2', terrain: 'voiture-embourbee-3' },
  'takeldepot-brussel': { hero: 'sortie-fourriere', terrain: 'sortie-fourriere-2' },
  'speciale-voertuigen-takelen-brussel': { hero: 'remorquage-vehicules-speciaux', terrain: 'remorquage-vehicule-special-intervention' },
  'voertuigtransport-brussel': { hero: 'transport-local', terrain: 'remorquage-vehicule-special-resultat' },
  'voertuigtransport-lange-afstand': { hero: 'transport-longue-distance', terrain: 'transport-local' },
  'opkoop-accidentwagens-brussel': { hero: 'achat-voiture-accidentee', terrain: 'achat-voiture-accidentee-2' },
};

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, '');
}

// <picture> responsive : source -md.webp si dispo, webp, fallback jpg si dispo
function picture(name, alt, opts = {}) {
  if (!name || !fs.existsSync(path.join(IMAGES_DIR, `${name}.webp`))) return '';
  const md = fs.existsSync(path.join(IMAGES_DIR, `${name}-md.webp`))
    ? `<source srcset="/images/${name}-md.webp" media="(max-width: 767px)" type="image/webp">\n  ` : '';
  const fallback = fs.existsSync(path.join(IMAGES_DIR, `${name}.jpg`)) ? `/images/${name}.jpg` : `/images/${name}.webp`;
  const attrs = opts.eager ? 'fetchpriority="high"' : 'loading="lazy"';
  const style = opts.style ? ` style="${opts.style}"` : '';
  return `<picture>
  ${md}<source srcset="/images/${name}.webp" type="image/webp">
  <img ${attrs} src="${fallback}" alt="${escapeAttr(alt)}"${style} width="662" height="441">
</picture>`;
}

// ============ AVIS GOOGLE (réels, repris tels quels des pages FR) ============
const REVIEWS = [
  { name: 'Sofiya Zrazhayeva', avatar: 'sofiya-zrazhayeva', date: '1 maand geleden', text: 'Very good and fast service, came in less than 30 minutes. Highly recommend!' },
  { name: 'Michael Verhaeghe', avatar: 'michael-verhaeghe', date: '3 weken geleden', text: "On nous a aidés très rapidement et avec beaucoup de professionnalisme. Nous étions dans le pétrin car la voiture était mal garée et risquait d'être emmenée à la fourrière. Helpcar Dépannage nous a tirés d'affaire. Je les recommande vivement !" },
  { name: 'Josip Ž.', initial: 'J', color: '#4285F4', date: '3 weken geleden', text: 'Fast and quality service towing the car.' },
  { name: 'Manu', avatar: 'manu', date: '3 maanden geleden', text: 'Dani was great. I had a major issue and he solved it in less than one hour.' },
  { name: 'Henri Botermans', initial: 'H', color: '#3F51B5', date: '4 maanden geleden', text: 'Service impeccable, rapide et honnête pour un dépannage sur une remorque. Un grand merci pour votre gentillesse et votre professionnalisme. Vous pouvez les appeler les yeux fermés !' },
  { name: 'Jocelyne Brahy', avatar: 'jocelyne-brahy', date: '3 maanden geleden', text: 'Dépannage après vacances. Batterie complètement plate. Super.' },
];

function reviewAvatar(r, size) {
  if (r.avatar) return `<img src="/images/avis/${r.avatar}.webp" alt="${escapeAttr(r.name)}" width="${size}" height="${size}" loading="lazy" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${r.color || '#607D8B'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">${r.initial}</div>`;
}

function googleReviewsCarousel() {
  const cards = REVIEWS.map(r => `
      <div style="min-width:280px;max-width:300px;flex-shrink:0;scroll-snap-align:start;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          ${reviewAvatar(r, 30)}
          <div><span style="font-weight:600;font-size:0.85rem;">${r.name}</span> <span style="font-size:0.7rem;color:#9CA3AF;">${r.date}</span></div>
        </div>
        <div style="color:#FBBC05;font-size:0.8rem;margin-bottom:4px;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p style="margin:0;font-size:0.85rem;color:#374151;line-height:1.4;">${r.text}</p>
      </div>`).join('\n');

  return `<!-- GOOGLE REVIEWS CAROUSEL -->
<section style="padding:24px 0 0;">
  <div class="container">
    <a href="${GOOGLE_MAPS_LINK}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:inherit;margin-bottom:14px;">
      ${GOOGLE_G_SVG}
      <span style="font-weight:700;font-size:1.1rem;">5.0</span>
      <span style="color:#FBBC05;font-size:1rem;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
      <span style="color:#6B7280;font-size:0.85rem;">194 Google-reviews</span>
    </a>
    <div style="display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:8px;scrollbar-width:thin;">
${cards}
    </div>
    <div style="margin-top:10px;">
      <a href="${GOOGLE_MAPS_LINK}" target="_blank" rel="noopener" style="color:#CF5706;font-weight:600;font-size:0.85rem;text-decoration:none;">Alle reviews op Google bekijken &rarr;</a>
    </div>
  </div>
</section>`;
}

function reviewsDarkSection() {
  const three = [REVIEWS[0], REVIEWS[1], REVIEWS[2]];
  const cards = three.map(r => `
      <div class="review-card">
        <div class="review-card__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p class="review-card__text">${r.text}</p>
        <div class="review-card__author">
          ${r.avatar ? `<img class="review-card__avatar" src="/images/avis/${r.avatar}.webp" alt="${escapeAttr(r.name)}" width="36" height="36" loading="lazy" style="object-fit:cover;">` : `<div class="review-card__avatar">${r.initial}</div>`}
          <div>
            <div class="review-card__name">${r.name}</div>
            <div class="review-card__date">${r.date}</div>
          </div>
        </div>
      </div>`).join('\n');

  return `<section class="section section--dark" id="reviews">
  <div class="container">
    <div style="margin-bottom:24px;">
      <a href="${GOOGLE_MAPS_LINK}" target="_blank" rel="noopener" class="google-badge" style="text-decoration:none;color:inherit;">
        <div class="google-badge__rating">5.0</div>
        <div>
          <div class="google-badge__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <div class="google-badge__count">194 reviews op Google</div>
        </div>
      </a>
      <h2 class="section-title" style="margin-top:16px;">Wat Klanten Na een Depannage Zeggen</h2>
    </div>
    <div class="reviews-carousel">
${cards}
    </div>
  </div>
</section>`;
}

// ============ WAAROM HELPCAR (4 cartes, mêmes icônes que le FR) ============
function waaromSection() {
  return `<section class="section section--dark" id="waarom">
  <div class="container">
    <div class="text-center" style="margin-bottom:32px;">
      <h2 class="section-title">Waarom HELPCAR Bellen?</h2>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h3 class="feature-card__title">Prijs vooraf aan de telefoon</h3>
        <p class="feature-card__desc">U kent het exacte bedrag vóór we vertrekken. Geen slechte verrassingen bij aankomst.</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <h3 class="feature-card__title">Ongeveer 30 minuten</h3>
        <p class="feature-card__desc">Onze depanneurs staan verspreid over Brussel en de Rand – waar u ook bent, we zijn snel bij u.</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </div>
        <h3 class="feature-card__title">24/7 bereikbaar</h3>
        <p class="feature-card__desc">Nacht, weekend, feestdag: we zijn er wanneer u ons nodig hebt.</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3 class="feature-card__title">Ervaren team</h3>
        <p class="feature-card__desc">Meer dan 10 jaar ervaring in autodepannage. Professioneel materieel, verzorgd werk.</p>
      </div>
    </div>
  </div>
</section>`;
}

// ============ SECTIONS ACCUEIL (équipe, 4 étapes + vidéo, expertise, maps — comme le FR) ============
function equipeSectionNL() {
  return `<section class="section" id="team">
    <div class="container">
      <div class="alternating-section">
        <div class="alternating-section__content">
          <span class="section-label">Ons team</span>
          <h2>Eén Telefoontje en Wij Regelen Alles</h2>
          <p>U belt <a href="${PHONE_TEL}" class="phone-link">02 886 04 86</a>, u legt de situatie uit, en wij nemen het over. Geen doorschakelingen, geen wachtrij: een echte <strong>depanneur in Brussel</strong> neemt op en vertrekt meteen.</p>
          <ul class="alternating-section__points">
            <li>&#10003; Eén nummer voor alles</li>
            <li>&#10003; Meer dan 10 jaar ervaring</li>
            <li>&#10003; Professioneel materieel</li>
            <li>&#10003; Snelle interventie in Brussel en de Rand</li>
          </ul>
          <a href="/nl/diensten/" class="btn btn--primary btn--sm">Onze diensten &rarr;</a>
        </div>
        <div class="alternating-section__image">
          ${picture('contacter-helpcar', 'Team HELPCAR Depannage')}
        </div>
      </div>
    </div>
  </section>`;
}

function stappenSectionNL() {
  return `<section class="section" id="stappen">
    <div class="container">
      <div class="text-center" style="margin-bottom:40px;">
        <span class="section-label">Hoe werkt het</span>
        <h2 class="section-title">Uw Depannage in 4 Stappen</h2>
      </div>

      <!-- Stap 1 -->
      <div class="photo-section">
        <div class="photo-section__content">
          <span class="section-label">Stap 1</span>
          <h3>U belt 02 886 04 86</h3>
          <p>Beschrijf uw panne in 30 seconden. U krijgt meteen een vaste prijs, nog vóór de takelwagen start.</p>
          <a href="${PHONE_TEL}" class="btn btn--primary btn--sm">Bel nu</a>
        </div>
        <div class="photo-section__image">
          ${picture('disponible-nuit-24h7', 'Beschikbaar 24/7 – HELPCAR Depannage')}
        </div>
      </div>

      <!-- Stap 2 -->
      <div class="photo-section photo-section--reverse">
        <div class="photo-section__content">
          <span class="section-label">Stap 2</span>
          <h3>Wij vertrekken meteen</h3>
          <p>Een depanneur rijdt naar uw locatie met al het nodige materieel. Brussel en de Rand, dag en nacht. Geschatte aankomst: ongeveer 30 minuten.</p>
        </div>
        <div class="photo-section__image">
          ${picture('deplacement-intervention', 'Takelwagen onderweg in Brussel')}
        </div>
      </div>

      <!-- Stap 3 -->
      <div class="photo-section">
        <div class="photo-section__content">
          <span class="section-label">Stap 3</span>
          <h3>We stellen de diagnose en handelen</h3>
          <p>Herstelling ter plaatse als het kan, takelen naar uw garage als het moet. We leggen alles uit vóór we ingrijpen.</p>
        </div>
        <div class="photo-section__image">
          ${picture('photo-diagnostique', 'Motordiagnose Brussel')}
        </div>
      </div>

      <!-- Stap 4 -->
      <div class="photo-section photo-section--reverse">
        <div class="photo-section__content">
          <span class="section-label">Stap 4</span>
          <h3>U betaalt en rijdt verder</h3>
          <p>De afgesproken prijs, geen euro meer. Bancontact, cash of overschrijving – zoals u wilt. Duidelijke factuur ter plaatse.</p>
        </div>
        <div class="photo-section__image">
          ${picture('poignee-de-main-client', 'Tevreden klant HELPCAR Depannage', { style: 'object-position:center 20%' })}
        </div>
      </div>

      <!-- Video demonstratie — YouTube Short, geladen bij klik (perf) -->
      <div class="video-demo">
        <h3 class="video-demo__title">Bekijk een interventie in beeld</h3>
        <p class="video-demo__sub">Ons depannage- en takelwerk in Brussel, in beelden.</p>
        <div class="video-facade"
             data-video="p3ig1bckaV0"
             data-title="Takelen en Depanneren in Brussel 24/7 — HELPCAR Dépannage"
             role="button" tabindex="0"
             aria-label="Speel de demonstratievideo van HELPCAR Depannage af">
          <img class="video-facade__thumb" src="https://i.ytimg.com/vi/p3ig1bckaV0/hqdefault.jpg" alt="Takelen en depanneren HELPCAR in Brussel" loading="lazy" width="480" height="360">
          <span class="video-facade__play" aria-hidden="true">▶</span>
        </div>
      </div>
    </div>
  </section>`;
}

function expertiseSectionNL() {
  const link = (slug, txt) => `<a href="/nl/${slug}/" style="color:#CF5706;text-decoration:none;font-weight:600;">${txt}</a>`;
  return `<section class="section section--gray" id="expertise">
    <div class="container">
      <div class="service-content" style="max-width:800px;margin:0 auto;">
        <h2 class="section-title" style="text-align:left;margin-bottom:20px;">Depannage in Brussel: Wat We Ter Plaatse Herstellen</h2>
        <p>Wanneer u <strong style="color: #CF5706;">HELPCAR Depannage</strong> belt voor een <strong>depannage in Brussel</strong>, lossen we het probleem in <strong>7 van de 10 gevallen</strong> ter plaatse op, in 20 tot 45 minuten. ${link('batterij-depannage-brussel', 'Lege batterij')} (boost of vervanging), ${link('bandenpech-brussel', 'lekke band')} (herstelling of reservewiel), ${link('benzinepech-brussel', 'lege tank')}, ${link('verkeerde-brandstof-brussel', 'verkeerde brandstof')}, ${link('autodeur-openen-brussel', 'vergrendelde deur')} – u betaalt alleen de interventie, geen transport.</p>

        <h3 class="section-title" style="text-align:left;margin-bottom:20px;margin-top:40px;">Wanneer Takelen Nodig Is</h3>
        <p>Kapotte koppeling, distributieriem, geblokkeerde versnellingsbak, motorschade – sommige pannes herstel je niet langs de weg. Dat zeggen we u eerlijk bij de diagnose. We laden uw wagen op onze ${link('takeldienst-brussel', 'takelplateau')} en brengen hem naar de garage die <strong>u</strong> kiest. Geen partnergarage met commissie: het is uw auto, het is uw beslissing.</p>

        <h3 class="section-title" style="text-align:left;margin-bottom:20px;margin-top:40px;">Onze Uitrusting: Op Alles Voorbereid</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px;">
          <div style="background:#fff;padding:1.25rem;border-radius:12px;border-left:4px solid #CF5706;">
            <strong>Professionele booster 2000A</strong>
            <p style="margin:8px 0 0;font-size:0.95rem;color:#6B7280;">Start zelfs een zware diesel bij vriesweer</p>
          </div>
          <div style="background:#fff;padding:1.25rem;border-radius:12px;border-left:4px solid #CF5706;">
            <strong>Voorraad courante batterijen</strong>
            <p style="margin:8px 0 0;font-size:0.95rem;color:#6B7280;">Formaten 60Ah tot 95Ah aan boord, klaar om te plaatsen</p>
          </div>
          <div style="background:#fff;padding:1.25rem;border-radius:12px;border-left:4px solid #CF5706;">
            <strong>OBD-diagnosekoffer</strong>
            <p style="margin:8px 0 0;font-size:0.95rem;color:#6B7280;">Uitlezen van foutcodes motor, transmissie en ABS bij alle merken</p>
          </div>
          <div style="background:#fff;padding:1.25rem;border-radius:12px;border-left:4px solid #CF5706;">
            <strong>Bandenherstelkit</strong>
            <p style="margin:8px 0 0;font-size:0.95rem;color:#6B7280;">Reparatiestrips, compressor, hydraulische krik, momentsleutel</p>
          </div>
          <div style="background:#fff;padding:1.25rem;border-radius:12px;border-left:4px solid #CF5706;">
            <strong>Niet-destructieve deuropening</strong>
            <p style="margin:8px 0 0;font-size:0.95rem;color:#6B7280;">Ontgrendeling zonder schade aan slot of koetswerk</p>
          </div>
          <div style="background:#fff;padding:1.25rem;border-radius:12px;border-left:4px solid #CF5706;">
            <strong>Gehomologeerde jerrycans</strong>
            <p style="margin:8px 0 0;font-size:0.95rem;color:#6B7280;">Benzine en diesel voor wie droogvalt onderweg</p>
          </div>
        </div>

        <h3 class="section-title" style="text-align:left;margin-bottom:20px;margin-top:40px;">Alle Voertuigen, Alle Situaties</h3>
        <p>We depanneren niet alleen personenwagens. Uw ${link('takeldienst-bestelwagen-brussel', 'bestelwagen')} (Kangoo, Trafic, Sprinter, Transit tot 3,5T) start niet op de werf? Uw ${link('depannage-elektrische-auto-brussel', 'elektrische wagen')} staat zonder stroom? We hebben het materieel en de ervaring voor die speciale gevallen. Het ${link('moto-takelen-brussel', "takelen van moto's en scooters")} gebeurt op de plateau met aangepaste spanbanden – nul risico op krassen.</p>
        <p>Vast in een ${link('takelen-ondergrondse-parking-brussel', 'ondergrondse parking')} met lage doorgang? Ook daarvoor hebben we compact materieel. En staat er een ${link('wrakophaling-brussel', 'autowrak')} in de weg, dan halen we het op met de nodige documenten.</p>
      </div>
    </div>
  </section>`;
}

function mapsSectionNL() {
  return `<section class="section">
    <div class="container">
      <div class="text-center" style="margin-bottom:24px;">
        <h2 class="section-title">Vind Ons op Google Maps</h2>
        <p class="section-subtitle">HELPCAR Dépannage — Brussel en de hele Rand, 24/7.</p>
      </div>
      <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20157.792354884856!2d4.371251200000001!3d50.83627519999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c58d65a9eccf%3A0xc2dd3355a7606998!2sHELPCAR%20D%C3%A9pannage!5e0!3m2!1snl!2sbe!4v1772125783583!5m2!1snl!2sbe" width="100%" height="400" style="border:0;display:block;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="HELPCAR Dépannage op Google Maps"></iframe>
      </div>
    </div>
  </section>`;
}

// ============ SECTIONS ALTERNÉES (tarieven + beschikbaarheid, comme le FR) ============
function alternatingPrijs(imgName, commune) {
  const img = picture(imgName, `Transparante prijzen depannage ${commune}`);
  if (!img) return '';
  return `<section class="section section--gray" id="tarieven">
  <div class="container">
    <div class="alternating-section alternating-section--reverse">
      <div class="alternating-section__content">
        <span class="section-label">Prijzen</span>
        <h2>De Prijs Ligt Vast Vóór We de Motor Starten</h2>
        <p>U hoort het exacte bedrag aan de telefoon. Of het nu om een batterij-boost of een takeling gaat: de prijs is duidelijk, en hij verandert niet meer.</p>
        <ul class="alternating-section__points">
          <li>&#10003; Prijs meegedeeld aan de telefoon</li>
          <li>&#10003; Geen verborgen kosten</li>
          <li>&#10003; Duidelijke factuur na de interventie</li>
          <li>&#10003; Bancontact, cash of overschrijving</li>
        </ul>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <a href="${PHONE_TEL}" class="btn btn--primary btn--sm">Bel ons</a>
          <a href="${WHATSAPP_LINK_NL}" class="btn btn--green btn--sm" target="_blank" rel="noopener">Offerte via WhatsApp</a>
        </div>
      </div>
      <div class="alternating-section__image">
        ${img}
      </div>
    </div>
  </div>
</section>`;
}

function alternatingNacht(imgName, commune) {
  const img = picture(imgName, `Nachtdepannage ${commune} 24/7`);
  if (!img) return '';
  return `<section class="section" id="beschikbaarheid">
  <div class="container">
    <div class="alternating-section">
      <div class="alternating-section__content">
        <span class="section-label">Beschikbaarheid</span>
        <h2>Dag en Nacht, Ook in het Weekend</h2>
        <p>Pech kiest zijn moment niet: 3 uur 's nachts, zondagochtend, een feestdag. Wij zijn er 24/7 – u belt, wij komen.</p>
        <ul class="alternating-section__points">
          <li>&#10003; Nachtinterventies</li>
          <li>&#10003; Weekends en feestdagen</li>
          <li>&#10003; Geen abonnement of lidmaatschap</li>
          <li>&#10003; Ter plaatse in ongeveer 30 minuten</li>
        </ul>
        <a href="${PHONE_TEL}" class="btn btn--primary btn--sm">Bel nu</a>
      </div>
      <div class="alternating-section__image">
        ${img}
      </div>
    </div>
  </div>
</section>`;
}

function alternatingTerrain(imgName, commune, points) {
  const img = picture(imgName, `Takeldienst ${commune} – HELPCAR kent het terrein`);
  if (!img || !points?.length) return '';
  return `<section class="section" id="terrein">
  <div class="container">
    <div class="alternating-section">
      <div class="alternating-section__content">
        <span class="section-label">Ons terrein</span>
        <h2>Wij Rijden Hier Elke Dag</h2>
        <p>Onze depanneurs doorkruisen ${commune} dagelijks. Elke invalsweg, elke wijk, elke parking – we kennen ze. Daarom zijn we sneller ter plaatse.</p>
        <ul class="alternating-section__points">
          ${points.map(p => `<li>&#10003; ${p}</li>`).join('\n          ')}
        </ul>
        <a href="/nl/diensten/" class="btn btn--primary btn--sm">Onze diensten &rarr;</a>
      </div>
      <div class="alternating-section__image">
        ${img}
      </div>
    </div>
  </div>
</section>`;
}

// ============ BULLE WHATSAPP FLOTTANTE (NL, lien direct) ============
function waFloatNL() {
  return `  <!-- WhatsApp Floating Bubble -->
  <div class="wa-float" id="waFloat">
    <div class="wa-float__tooltip">Hulp nodig?</div>
    <a href="${WHATSAPP_LINK_NL}" class="wa-float__btn" target="_blank" rel="noopener" aria-label="Contacteer ons via WhatsApp">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
    </a>
  </div>
  <script>
  (function(){var f=document.getElementById('waFloat');if(!f)return;var s=false;function show(){if(!s){s=true;f.classList.add('is-visible');setTimeout(function(){var t=f.querySelector('.wa-float__tooltip');if(t){t.classList.add('is-shown');setTimeout(function(){t.classList.remove('is-shown')},5000)}},1000)}}window.addEventListener('scroll',function(){if(window.scrollY>300)show()},{passive:true});setTimeout(show,4000)})();
  </script>`;
}

function breadcrumbNL(pageName) {
  return `<nav class="breadcrumb" aria-label="Kruimelpad" style="padding:12px 0;font-size:0.85rem;color:#6B7280;"><div class="container"><a href="/nl/">Home</a> <span style="margin:0 6px;">›</span> <span>${pageName}</span></div></nav>`;
}

function heroStats() {
  return `<div class="hero__stats">
          <div class="hero__stat">
            <div class="hero__stat-number">24/7</div>
            <div class="hero__stat-label">Dag en nacht</div>
          </div>
          <div class="hero__stat">
            <div class="hero__stat-number">~30min</div>
            <div class="hero__stat-label">Ter plaatse</div>
          </div>
          <a href="${GOOGLE_MAPS_LINK}" target="_blank" rel="noopener" class="hero__stat" style="text-decoration:none;color:inherit;">
            <div class="hero__stat-number">5.0&#9733;</div>
            <div class="hero__stat-label">Google</div>
          </a>
        </div>`;
}

function getHeaderNL(frUrl, active) {
  const navItems = [
    { label: 'Home', href: '/nl/' },
    { label: 'Diensten', href: '/nl/diensten/' },
    { label: 'Zones', href: '/nl/zones/' },
    { label: 'Tarieven', href: '/tarifs/' },
    { label: 'Over ons', href: '/a-propos/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'FR', href: frUrl || '/', title: 'Version française' },
  ];
  const link = n => `<a href="${n.href}"${n.label === active ? ' class="active"' : ''}${n.title ? ` title="${n.title}"` : ''}>${n.label}</a>`;
  const desktopLinks = navItems.map(link).join('\n        ');
  const mobileLinks = navItems.map(link).join('\n      ');

  return `<header class="header">
    <div class="header__inner">
      <a href="/nl/" class="header__logo">
        <picture>
  <source srcset="/images/logo-helpcar.webp" type="image/webp">
  <img src="/images/logo-helpcar.webp" alt="HELPCAR Depannage" class="header__logo-img" width="400" height="166">
</picture>
      </a>

      <!-- Desktop Navigation -->
      <nav class="nav-desktop">
        ${desktopLinks}
        <a href="${PHONE_TEL}" class="header__phone-desktop">
          ${PHONE_SVG}
          ${PHONE_DISPLAY}
        </a>
      </nav>

      <!-- Mobile Actions -->
      <div class="header__actions">
        <a href="${PHONE_TEL}" class="header__phone-btn">
          ${PHONE_SVG}
          Bellen
        </a>
        <button class="header__burger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
<nav class="nav-mobile">
      ${mobileLinks}
      <a href="${PHONE_TEL}" class="nav-mobile__cta">
        Bel ${PHONE_DISPLAY}
      </a>
    </nav>`;
}

const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;

function getFooterNL() {
  return `<footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <!-- Colonne 1 : société -->
        <div>
          <div class="footer__title">HELPCAR Dépannage</div>
          <p style="font-size:0.9rem;line-height:1.6;margin-bottom:16px;">
            Pechverhelping en takeldienst in Brussel en de Vlaamse Rand, 24/7. Snelle interventie, transparante prijs, ervaren team.
          </p>
          <div class="footer__contact-item">
            ${PHONE_SVG}
            <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>
          </div>
          <div class="footer__contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:contact@helpcar.be">contact@helpcar.be</a>
          </div>
          <div style="display:flex;gap:12px;margin-top:16px;">
            <a href="https://www.facebook.com/people/Helpcar-D%C3%A9pannage/61586340715742/" target="_blank" rel="noopener" aria-label="Facebook" style="color:#9CA3AF;transition:color .2s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.youtube.com/channel/UCZ5f2o-vD6sGGxR0UNpQkJw" target="_blank" rel="noopener" aria-label="YouTube" style="color:#9CA3AF;transition:color .2s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="${GOOGLE_MAPS_LINK}" target="_blank" rel="noopener" aria-label="Google Maps" style="color:#9CA3AF;transition:color .2s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C7.31 0 3.07 3.11 1.64 7.64l3.9 3.04C6.63 7.41 9.1 5.09 12 5.09c1.62 0 3.09.59 4.23 1.56l3.15-3.15C17.45 1.63 14.97.55 12 0z" fill="#EA4335"/><path d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.86 3c2.24-2.07 3.56-5.14 3.56-8.82z" fill="#4285F4"/><path d="M5.54 14.32a6.88 6.88 0 0 1 0-4.64l-3.9-3.04a11.96 11.96 0 0 0 0 10.72l3.9-3.04z" fill="#FBBC05"/><path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-2.9 0-5.37-2.32-6.46-5.59l-3.9 3.04C3.07 20.89 7.31 24 12 24z" fill="#34A853"/></svg>
            </a>
          </div>
        </div>

        <!-- Colonne 2 : diensten -->
        <div>
          <div class="footer__title">Diensten</div>
          <ul class="footer__links">
            <li><a href="/nl/batterij-depannage-brussel/">Lege Batterij</a></li>
            <li><a href="/nl/autobatterij-vervangen-brussel/">Batterij Vervangen</a></li>
            <li><a href="/nl/takeldienst-brussel/">Takeldienst</a></li>
            <li><a href="/nl/bandenpech-brussel/">Lekke Band</a></li>
            <li><a href="/nl/reservewiel-monteren-brussel/">Reservewiel</a></li>
            <li><a href="/nl/autodeur-openen-brussel/">Autodeur Openen</a></li>
            <li><a href="/nl/moto-takelen-brussel/">Moto Takelen</a></li>
            <li><a href="/nl/benzinepech-brussel/">Zonder Brandstof</a></li>
            <li><a href="/nl/brandstoflevering-brussel/">Brandstoflevering</a></li>
            <li><a href="/nl/verkeerde-brandstof-brussel/">Verkeerde Brandstof</a></li>
            <li><a href="/nl/depannage-elektrische-auto-brussel/">Elektrische Auto</a></li>
            <li><a href="/nl/takeldienst-bestelwagen-brussel/">Bestelwagen</a></li>
            <li><a href="/nl/takelen-ondergrondse-parking-brussel/">Ondergrondse Parking</a></li>
            <li><a href="/nl/auto-vastgereden-brussel/">Auto Vastgereden</a></li>
            <li><a href="/nl/wrakophaling-brussel/">Wrakophaling</a></li>
            <li><a href="/nl/takeldepot-brussel/">Takeldepot</a></li>
            <li><a href="/nl/opkoop-accidentwagens-brussel/">Opkoop Accidentwagens</a></li>
            <li><a href="/nl/diensten/">Alle diensten &rarr;</a></li>
          </ul>
        </div>

        <!-- Colonne 3 : zones -->
        <div>
          <div class="footer__title">Zones</div>
          <ul class="footer__links">
            <li><a href="/nl/">Brussel</a></li>
            <li><a href="/nl/takeldienst-brussel-centrum/">Brussel-Centrum</a></li>
            <li><a href="/nl/takeldienst-etterbeek/">Etterbeek</a></li>
            <li><a href="/nl/takeldienst-elsene/">Elsene</a></li>
            <li><a href="/nl/takeldienst-schaarbeek/">Schaarbeek</a></li>
            <li><a href="/nl/takeldienst-vorst/">Vorst</a></li>
            <li><a href="/nl/takeldienst-ukkel/">Ukkel</a></li>
            <li><a href="/nl/takeldienst-sint-lambrechts-woluwe/">Sint-Lambrechts-Woluwe</a></li>
            <li><a href="/nl/takeldienst-sint-pieters-woluwe/">Sint-Pieters-Woluwe</a></li>
            <li><a href="/nl/takeldienst-evere/">Evere</a></li>
            <li><a href="/nl/takeldienst-zaventem/">Zaventem</a></li>
            <li><a href="/nl/takeldienst-machelen/">Machelen & Diegem</a></li>
            <li><a href="/nl/takeldienst-vilvoorde/">Vilvoorde</a></li>
            <li><a href="/nl/takeldienst-sint-genesius-rode/">Sint-Genesius-Rode</a></li>
            <li><a href="/nl/zones/">Alle zones</a></li>
            <li style="margin-top:12px"><a href="/blog/" style="font-weight:500">Blog (FR)</a></li>
          </ul>
        </div>

        <!-- Colonne 4 : contact -->
        <div>
          <div class="footer__title">Contact</div>
          <div class="footer__contact-item">
            ${PIN_SVG}
            <span>Rue Charles Martel 55,<br>1000 Brussel</span>
          </div>
          <div class="footer__contact-item">
            ${PHONE_SVG}
            <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>
          </div>
          <div class="footer__contact-item">
            ${WA_SVG}
            <a href="${WHATSAPP_LINK_NL}" target="_blank" rel="noopener">WhatsApp</a>
          </div>
          <div class="footer__contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:contact@helpcar.be">contact@helpcar.be</a>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer__bottom">
        <span>&copy; 2026 HELPCAR Dépannage. Alle rechten voorbehouden.</span>
        <div>
          <a href="/mentions-legales/">Wettelijke vermeldingen</a> &middot;
          <a href="/politique-confidentialite/">Privacybeleid</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function getFloatingCTANL() {
  return `<div class="floating-cta">
  <a href="${PHONE_TEL}" class="btn btn--primary">Bellen</a>
  <a href="${WHATSAPP_LINK_NL}" class="btn btn--green" target="_blank" rel="noopener">WhatsApp</a>
</div>`;
}

function hreflangTags(nlUrl, frUrl) {
  if (!frUrl) return '';
  return `  <link rel="alternate" hreflang="fr-BE" href="${frUrl}">
  <link rel="alternate" hreflang="nl-BE" href="${nlUrl}">
  <link rel="alternate" hreflang="x-default" href="${frUrl}">`;
}

function headMeta(title, description, canonicalUrl, frUrl) {
  const titleAttr = escapeAttr(title);
  const descAttr = escapeAttr(description);
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${GA_TAG}
  <title>${titleAttr}</title>
  <meta name="description" content="${descAttr}">
  <link rel="canonical" href="${canonicalUrl}">
${hreflangTags(canonicalUrl, frUrl)}
  <!-- Open Graph -->
  <meta property="og:title" content="${titleAttr}">
  <meta property="og:description" content="${descAttr}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="nl_BE">
  <meta property="og:site_name" content="HELPCAR Dépannage">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titleAttr}">
  <meta name="twitter:description" content="${descAttr}">
  <meta name="twitter:image" content="${OG_IMAGE}">
  <link rel="stylesheet" href="/css/style.css">`;
}

function buildPageNL(jsonFile, slug, isZone) {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  const c = data.content;

  const title = data.seo.meta_title;
  const description = data.seo.meta_description;
  const canonicalUrl = `https://helpcar.be/nl/${slug}/`;
  const frUrl = data.hreflang_fr || null;
  const imgs = { ...DEFAULT_IMGS, ...(PAGE_IMAGES[slug] || {}) };

  const quartiersHtml = (c.section_on_connait?.quartiers || []).map(q => `
    <div class="service-card">
      <div class="service-card__body">
        <div class="service-card__icon">
          ${PIN_SVG}
        </div>
        <div class="service-card__content">
          <h3 class="service-card__title">${q.nom}</h3>
          <p class="service-card__desc">${q.description}</p>
        </div>
      </div>
    </div>
  `).join('\n');

  const servicesHtml = (c.section_services?.categories || []).map(cat => `
    <div class="feature-card">
      <h3 class="feature-card__title">${cat.titre}</h3>
      <ul style="list-style:none;padding:0">
        ${cat.services.map(s => `<li style="padding:4px 0;color:var(--gray-300)">${s.nom}</li>`).join('\n        ')}
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
        <div class="faq-item__answer-inner">${f.reponse}</div>
      </div>
    </div>
  `).join('\n');

  const voisinesHtml = (c.section_zones_voisines?.communes_voisines || []).map(cv => `
    <a href="${cv.url || `/nl/${cv.slug}/`}" class="zone-card">
      <div class="zone-card__info">
        <div class="zone-card__icon">
          ${PIN_SVG}
        </div>
        <div><span class="zone-card__name">${cv.nom}</span></div>
      </div>
      <svg class="zone-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  `).join('\n');

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://helpcar.be/#business",
    "name": "HELPCAR Dépannage",
    "description": stripHtml(description),
    "url": canonicalUrl,
    "telephone": "+3228860486",
    "email": "contact@helpcar.be",
    "image": OG_IMAGE,
    "openingHours": "Mo-Su 00:00-24:00",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "194" },
    "areaServed": { "@type": "Place", "name": data.commune || slug },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bruxelles",
      "postalCode": "1000",
      "addressCountry": "BE"
    }
  };

  const faqSchema = (c.faq_locale?.questions || []).length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": c.faq_locale.questions.map(f => ({
      "@type": "Question",
      "name": stripHtml(f.question),
      "acceptedAnswer": { "@type": "Answer", "text": stripHtml(f.reponse) }
    }))
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://helpcar.be/nl/" },
      { "@type": "ListItem", "position": 2, "name": stripHtml(data.hero.h1) }
    ]
  };

  const geoTags = data.geo ? `  <meta name="geo.region" content="${data.geo.region}">
  <meta name="geo.placename" content="${escapeAttr(data.commune)}">
  <meta name="geo.position" content="${data.geo.lat};${data.geo.lng}">
  <meta name="ICBM" content="${data.geo.lat}, ${data.geo.lng}">` : '';

  const heroImg = picture(imgs.hero, stripHtml(data.hero.h1) + ' – HELPCAR', { eager: true, style: 'max-height:480px' });
  const terrainPoints = isZone ? (c.section_on_connait?.quartiers || []).map(q => q.nom) : null;

  return `<!DOCTYPE html>
<html lang="nl-BE">
<head>
${headMeta(title, description, canonicalUrl, frUrl)}
${geoTags}
  <script type="application/ld+json">
  ${JSON.stringify(businessSchema, null, 2)}
  </script>
${faqSchema ? `  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>` : ''}
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
</head>
<body>
${GTM_NOSCRIPT}
${getHeaderNL(frUrl ? frUrl.replace('https://helpcar.be', '') : '/')}
${breadcrumbNL(stripHtml(data.hero.h1))}
<section class="hero">
  <div class="container">
    <div class="photo-section" style="padding:0;gap:32px">
      <div class="hero__content">
        <div class="hero__badge"><span class="hero__badge-dot"></span> Nu beschikbaar</div>
        <h1>${data.hero.h1}</h1>
        <p class="hero__subtitle">${data.hero.accroche}</p>
        <div class="hero__cta">
          <a href="${PHONE_TEL}" class="btn btn--primary btn--full">
            ${PHONE_SVG}
            Bel nu
          </a>
          <a href="${WHATSAPP_LINK_NL}" class="btn btn--green btn--full" target="_blank" rel="noopener">Offerte via WhatsApp</a>
          <a href="/nl/diensten/" class="btn btn--outline btn--full">Onze diensten</a>
        </div>
        ${heroStats()}
      </div>
      ${heroImg ? `<div class="photo-section__image">
        ${heroImg}
      </div>` : ''}
    </div>
  </div>
</section>

<section class="section" style="padding-bottom:0" id="intro">
  <div class="container">
    <div class="service-content" style="padding:0">
      <p>${c.intro_autorite.paragraphe_0}</p>
      <p>${c.intro_autorite.paragraphe_1}</p>
      <p>${c.intro_autorite.paragraphe_2}</p>
    </div>
  </div>
</section>

${googleReviewsCarousel()}

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

${isZone ? alternatingTerrain(imgs.terrain, data.commune, terrainPoints) : alternatingTerrainService(imgs.terrain, data)}

${alternatingPrijs(imgs.prijs, data.commune)}

${alternatingNacht(imgs.nacht, data.commune)}

<section class="section section--dark">
  <div class="container">
    <h2 class="section-title" style="color:white;margin-bottom:8px">${c.section_services.h2}</h2>
    <p class="section-subtitle" style="color:var(--gray-400);margin-bottom:24px">${c.section_services.intro}</p>
    <div class="features-grid">
      ${servicesHtml}
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="${PHONE_TEL}" class="btn btn--primary">${c.section_services.cta_text}</a>
    </div>
  </div>
</section>

${waaromSection()}

${reviewsDarkSection()}

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
    <h2>${c.cta_final.titre}</h2>
    <p>${c.cta_final.texte}</p>
    <a href="${PHONE_TEL}" class="btn btn--primary">${PHONE_DISPLAY}</a>
  </div>
</section>

${getFooterNL()}
${getFloatingCTANL()}
${waFloatNL()}

<script src="/js/main.js" defer></script>
</body>
</html>`;
}

// Section alternée « terrain » pour les services : photo secondaire + arguments génériques
function alternatingTerrainService(imgName, data) {
  const img = picture(imgName, stripHtml(data.hero.h1) + ' – HELPCAR in actie');
  if (!img) return '';
  return `<section class="section" id="aanpak">
  <div class="container">
    <div class="alternating-section">
      <div class="alternating-section__content">
        <span class="section-label">Onze aanpak</span>
        <h2>Vakwerk, Ook Als Het Snel Moet Gaan</h2>
        <p>Snel zijn is één ding, het goed doen is een ander. Onze depanneurs werken met professioneel materieel en behandelen elk voertuig alsof het het hunne was.</p>
        <ul class="alternating-section__points">
          <li>&#10003; Professioneel materieel</li>
          <li>&#10003; Meer dan 10 jaar ervaring</li>
          <li>&#10003; Zorg voor uw voertuig, zonder schade</li>
          <li>&#10003; Duidelijke uitleg bij elke stap</li>
        </ul>
        <a href="${PHONE_TEL}" class="btn btn--primary btn--sm">Bel ${PHONE_DISPLAY}</a>
      </div>
      <div class="alternating-section__image">
        ${img}
      </div>
    </div>
  </div>
</section>`;
}

function buildHomeNL() {
  const canonicalUrl = 'https://helpcar.be/nl/';
  const frUrl = 'https://helpcar.be/';
  const title = 'Takeldienst & Pechverhelping Brussel en Vlaamse Rand 24/7 – HELPCAR';
  const description = 'Autopech in Brussel, Zaventem of de Rand? Takeldienst en pechverhelping 24/7, prijs vooraf aan de telefoon. ☎ 02 886 04 86';

  // Mêmes 6 services que l'accueil FR, mêmes photos, mêmes icônes
  const services = [
    { slug: 'batterij-depannage-brussel', nom: 'Lege Batterij', desc: 'Opstarten, testen en vervangen van uw batterij ter plaatse.', img: 'choc-batterie-avec-client',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="11" y1="9" x2="11" y2="15"/><line x1="8" y1="12" x2="14" y2="12"/></svg>' },
    { slug: 'takeldienst-brussel', nom: 'Takeldienst', desc: 'Uw auto veilig getakeld naar de garage van uw keuze.', img: 'depannage-camionette-plateau',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' },
    { slug: 'bandenpech-brussel', nom: 'Lekke Band', desc: 'Band hersteld of reservewiel gemonteerd, waar u ook staat.', img: 'pneu-meche',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
    { slug: 'autodeur-openen-brussel', nom: 'Autodeur Openen', desc: 'Sleutels in de auto? Deuropening zonder schade.', img: 'ouverture-de-porte',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' },
    { slug: 'moto-takelen-brussel', nom: 'Moto Takelen', desc: 'Uw moto of scooter veilig vervoerd, zonder kras.', img: 'remorquage-moto',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>' },
    { slug: 'benzinepech-brussel', nom: 'Zonder Brandstof', desc: 'Benzine of diesel geleverd tot bij uw wagen.', img: 'fourniture-carburant',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 4"/><line x1="3" y1="22" x2="15" y2="22"/><line x1="6" y1="9" x2="12" y2="9"/></svg>' },
  ];

  const zones = fs.readdirSync(NL_LOCATIONS_DIR).filter(f => f.endsWith('.json')).map(f => {
    const d = JSON.parse(fs.readFileSync(path.join(NL_LOCATIONS_DIR, f), 'utf8'));
    return { slug: f.replace(/\.json$/, ''), nom: d.commune, desc: `Postcode ${d.code_postal}` };
  }).sort((a, b) => a.nom.localeCompare(b.nom, 'nl'));

  const faq = [
    { question: 'Hoe snel zijn jullie ter plaatse?', reponse: 'In Brussel en de nabije Rand meestal binnen de 30 minuten. U krijgt altijd een realistisch tijdstip aan de telefoon.' },
    { question: 'Wat kost een depannage of takeling?', reponse: 'U krijgt de exacte prijs aan de telefoon, vóór we vertrekken. Geen abonnement, geen verrassingen: u betaalt alleen de interventie.' },
    { question: 'Werken jullie ook ’s nachts en in het weekend?', reponse: 'Ja, 24 uur op 24, 7 dagen op 7, ook op zon- en feestdagen.' },
    { question: 'Kan ik jullie in het Nederlands bereiken?', reponse: 'Ja, in het Nederlands, Frans of Engels – telefonisch op 02 886 04 86 of via WhatsApp.' },
  ];

  const servicesHtml = services.map(s => `
        <a href="/nl/${s.slug}/" class="service-card">
          <div class="service-card__photo">
            ${picture(s.img, `${s.nom} Brussel – HELPCAR`)}
          </div>
          <div class="service-card__body">
            <div class="service-card__icon">
              ${s.icon}
            </div>
            <div class="service-card__content">
              <div class="service-card__title">${s.nom}</div>
              <div class="service-card__desc">${s.desc}</div>
            </div>
            <svg class="service-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
  `).join('\n');

  const zonesHtml = zones.map(z => `
    <a href="/nl/${z.slug}/" class="zone-card">
      <div class="zone-card__info">
        <div class="zone-card__icon">${PIN_SVG}</div>
        <div>
          <span class="zone-card__name">${z.nom}</span>
          <span style="display:block;font-size:0.85rem;color:var(--gray-600)">${z.desc}</span>
        </div>
      </div>
      <svg class="zone-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  `).join('\n');

  const faqHtml = faq.map(f => `
    <div class="faq-item">
      <button class="faq-item__question">
        <span>${f.question}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-item__answer">
        <div class="faq-item__answer-inner">${f.reponse}</div>
      </div>
    </div>
  `).join('\n');

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://helpcar.be/#business",
    "name": "HELPCAR Dépannage",
    "description": description,
    "url": canonicalUrl,
    "telephone": "+3228860486",
    "email": "contact@helpcar.be",
    "image": OG_IMAGE,
    "openingHours": "Mo-Su 00:00-24:00",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "194" },
    "areaServed": [
      { "@type": "Place", "name": "Brussel" },
      { "@type": "Place", "name": "Vlaamse Rand" }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bruxelles",
      "postalCode": "1000",
      "addressCountry": "BE"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.reponse }
    }))
  };

  const heroImg = picture('depannage-voiture', 'Takeldienst en pechverhelping Brussel – HELPCAR', { eager: true, style: 'max-height:480px' });

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Takelen en Depanneren in Brussel 24/7 — HELPCAR Dépannage",
    "description": "Demonstratie van een depannage-interventie van HELPCAR in Brussel: takelen en pechverhelping in beeld.",
    "thumbnailUrl": "https://i.ytimg.com/vi/p3ig1bckaV0/hqdefault.jpg",
    "uploadDate": "2026-06-05T12:00:00+02:00",
    "contentUrl": "https://www.youtube.com/shorts/p3ig1bckaV0",
    "embedUrl": "https://www.youtube.com/embed/p3ig1bckaV0",
    "publisher": { "@id": "https://helpcar.be/#business" }
  };

  return `<!DOCTYPE html>
<html lang="nl-BE">
<head>
${headMeta(title, description, canonicalUrl, frUrl)}
  <script type="application/ld+json">
  ${JSON.stringify(businessSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(videoSchema, null, 2)}
  </script>
</head>
<body>
${GTM_NOSCRIPT}
${getHeaderNL('/')}

<section class="hero">
  <div class="container">
    <div class="photo-section" style="padding:0;gap:32px">
      <div class="hero__content">
        <div class="hero__badge"><span class="hero__badge-dot"></span> Nu beschikbaar</div>
        <h1>Takeldienst & Pechverhelping <span class="highlight">Brussel en de Rand</span> – 24/7</h1>
        <p class="hero__subtitle">Autopech in Brussel, Zaventem of de Vlaamse Rand? Wij komen in ±30 minuten en u kent de prijs vóór we vertrekken.</p>
        <div class="hero__cta">
          <a href="${PHONE_TEL}" class="btn btn--primary btn--full">
            ${PHONE_SVG}
            Bel ${PHONE_DISPLAY}
          </a>
          <a href="${WHATSAPP_LINK_NL}" class="btn btn--green btn--full" target="_blank" rel="noopener">Offerte via WhatsApp</a>
          <a href="/nl/diensten/" class="btn btn--outline btn--full">Onze diensten</a>
        </div>
        ${heroStats()}
      </div>
      ${heroImg ? `<div class="photo-section__image">
        ${heroImg}
      </div>` : ''}
    </div>
  </div>
</section>

<section class="section" style="padding-bottom:0" id="intro">
  <div class="container">
    <div class="service-content" style="padding:0">
      <p>Een <strong>depannage nodig in Brussel of de Vlaamse Rand</strong>? Lege batterij aan het Zuidstation, lekke band op de Ring, motorpech op weg naar de luchthaven? Bel <strong><a href="${PHONE_TEL}" style="color: #CF5706; text-decoration: none;">02 886 04 86</a></strong> — <strong style="color: #CF5706;">HELPCAR Depannage</strong> komt in <strong>ongeveer 30 minuten</strong> en u kent de prijs vóór we vertrekken. Geen verrassingen, geen teller.</p>
      <p><a href="/nl/batterij-depannage-brussel/" style="color:#CF5706;text-decoration:none;font-weight:600;">Batterij plat</a>, <a href="/nl/bandenpech-brussel/" style="color:#CF5706;text-decoration:none;font-weight:600;">lekke band</a>, <a href="/nl/autodeur-openen-brussel/" style="color:#CF5706;text-decoration:none;font-weight:600;">sleutels in de auto</a>, <a href="/nl/benzinepech-brussel/" style="color:#CF5706;text-decoration:none;font-weight:600;">zonder brandstof</a>, <a href="/nl/verkeerde-brandstof-brussel/" style="color:#CF5706;text-decoration:none;font-weight:600;">verkeerd getankt</a>, <a href="/nl/takeldienst-brussel/" style="color:#CF5706;text-decoration:none;font-weight:600;">takelen</a> – wij regelen het allemaal. Eén telefoontje naar <strong><a href="${PHONE_TEL}" style="color: #CF5706; text-decoration: none;">02 886 04 86</a></strong> volstaat.</p>
      <p>Al <strong>meer dan 10 jaar</strong> depanneren we in Brussel en de Rand – ook in het Nederlands, dag en nacht, zonder abonnement.</p>
    </div>
  </div>
</section>

${googleReviewsCarousel()}

<section class="section section--gray" id="diensten">
  <div class="container">
    <div class="text-center" style="margin-bottom:32px;">
      <h2 class="section-title">Onze Diensten in Brussel en de Rand</h2>
      <p class="section-subtitle">Ter plaatse opgelost waar het kan, getakeld waar het moet.</p>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
    <p style="margin-top:20px;color:var(--gray-600);text-align:center"><a href="/nl/diensten/" style="color:var(--primary);font-weight:600">Alle diensten bekijken (wrakophaling, vrachtwagens, ondergrondse parkings…) →</a></p>
  </div>
</section>

${equipeSectionNL()}

${alternatingPrijs('dep-poignee-de-main', 'Brussel')}

${alternatingNacht('depannage-de-nuit', 'Brussel')}

${waaromSection()}

${stappenSectionNL()}

${expertiseSectionNL()}

${reviewsDarkSection()}

<section class="section section--gray" id="zones">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:8px">Wij Dekken Heel Brussel en de Rand</h2>
    <p class="section-subtitle" style="margin-bottom:20px">Alle 19 Brusselse gemeenten plus de Vlaamse Rand:</p>
    <div class="zones-grid">
      ${zonesHtml}
    </div>
    <p style="margin-top:20px;color:var(--gray-600)"><a href="/nl/zones/" style="color:var(--primary);font-weight:600">Alle interventiezones bekijken →</a></p>
  </div>
</section>

<section class="section" id="faq">
  <div class="container">
    <h2 class="section-title" style="margin-bottom:20px">Veelgestelde Vragen</h2>
    <div class="faq-list">
      ${faqHtml}
    </div>
  </div>
</section>

${mapsSectionNL()}

<section class="cta-final">
  <div class="container">
    <h2>Pech onderweg?</h2>
    <p>Zeg ons waar u staat, wij zeggen wanneer we er zijn.</p>
    <a href="${PHONE_TEL}" class="btn btn--primary">${PHONE_DISPLAY}</a>
  </div>
</section>

${getFooterNL()}
${getFloatingCTANL()}
${waFloatNL()}

<script src="/js/main.js" defer></script>
</body>
</html>`;
}

function buildListingNL(opts) {
  const items = fs.readdirSync(opts.dir).filter(f => f.endsWith('.json')).map(f => {
    const d = JSON.parse(fs.readFileSync(path.join(opts.dir, f), 'utf8'));
    return { slug: f.replace(/\.json$/, ''), nom: d.hero.h1, desc: d.hero.accroche, commune: d.commune, cp: d.code_postal };
  }).sort((a, b) => (opts.sortByCommune ? a.commune.localeCompare(b.commune, 'nl') : a.nom.localeCompare(b.nom, 'nl')));

  const cardsHtml = opts.sortByCommune
    ? items.map(i => `
    <a href="/nl/${i.slug}/" class="zone-card">
      <div class="zone-card__info">
        <div class="zone-card__icon">${PIN_SVG}</div>
        <div>
          <span class="zone-card__name">${i.commune} (${i.cp})</span>
          <span style="display:block;font-size:0.85rem;color:var(--gray-600)">${i.desc}</span>
        </div>
      </div>
      <svg class="zone-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  `).join('\n')
    : items.map(i => {
      const heroImg = (PAGE_IMAGES[i.slug] || {}).hero;
      const title = i.nom.replace(/ – .*$/, '').replace(/ - .*$/, '');
      return `
        <a href="/nl/${i.slug}/" class="service-card">
          ${heroImg ? `<div class="service-card__photo">
            ${picture(heroImg, `${stripHtml(title)} – HELPCAR`)}
          </div>` : ''}
          <div class="service-card__body">
            <div class="service-card__icon">
              ${PIN_SVG}
            </div>
            <div class="service-card__content">
              <div class="service-card__title">${title}</div>
              <div class="service-card__desc">${i.desc}</div>
            </div>
            <svg class="service-card__arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
  `;
    }).join('\n');

  const canonicalUrl = `https://helpcar.be/nl/${opts.slug}/`;

  return `<!DOCTYPE html>
<html lang="nl-BE">
<head>
${headMeta(opts.title, opts.description, canonicalUrl, opts.frUrl)}
</head>
<body>
${GTM_NOSCRIPT}
${getHeaderNL(opts.frUrl.replace('https://helpcar.be', ''))}
${breadcrumbNL(opts.h1)}
<section class="hero">
  <div class="container">
    <div class="hero__content">
      <div class="hero__badge"><span class="hero__badge-dot"></span> Nu beschikbaar</div>
      <h1>${opts.h1}</h1>
      <p class="hero__subtitle">${opts.subtitle}</p>
      <div class="hero__cta">
        <a href="${PHONE_TEL}" class="btn btn--primary btn--full">Bel ${PHONE_DISPLAY}</a>
        <a href="${WHATSAPP_LINK_NL}" class="btn btn--green btn--full" target="_blank" rel="noopener">Offerte via WhatsApp</a>
      </div>
      ${heroStats()}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="${opts.sortByCommune ? 'zones-grid' : 'services-grid'}">
      ${cardsHtml}
    </div>
  </div>
</section>

${waaromSection()}

<section class="cta-final">
  <div class="container">
    <h2>Pech onderweg?</h2>
    <p>Zeg ons waar u staat, wij zeggen wanneer we er zijn.</p>
    <a href="${PHONE_TEL}" class="btn btn--primary">${PHONE_DISPLAY}</a>
  </div>
</section>

${getFooterNL()}
${getFloatingCTANL()}
${waFloatNL()}

<script src="/js/main.js" defer></script>
</body>
</html>`;
}

// ============ MAIN ============

let count = 0;

// Homepage NL
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildHomeNL());
console.log('  ✓ nl/index.html');
count++;

// Pages index diensten / zones
fs.mkdirSync(path.join(OUT_DIR, 'diensten'), { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'diensten/index.html'), buildListingNL({
  dir: NL_SERVICES_DIR, slug: 'diensten', sortByCommune: false,
  title: 'Alle Diensten | Depannage & Takelen Brussel 24/7 – HELPCAR',
  description: 'Alle depannage- en takeldiensten van HELPCAR in Brussel en de Rand: batterij, banden, takelen, transport en meer. ☎ 02 886 04 86',
  h1: 'Onze Diensten',
  subtitle: 'Van een platte batterij tot een vrachtwagen takelen: één nummer volstaat.',
  frUrl: 'https://helpcar.be/services/'
}));
console.log('  ✓ nl/diensten/index.html');
count++;

fs.mkdirSync(path.join(OUT_DIR, 'zones'), { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'zones/index.html'), buildListingNL({
  dir: NL_LOCATIONS_DIR, slug: 'zones', sortByCommune: true,
  title: 'Interventiezones | Takeldienst Brussel & Rand – HELPCAR',
  description: 'HELPCAR takelt en depanneert in alle Brusselse gemeenten en de Vlaamse Rand. Vind uw gemeente. ☎ 02 886 04 86',
  h1: 'Onze Interventiezones',
  subtitle: 'Brussel en de Vlaamse Rand – ter plaatse in ongeveer 30 minuten.',
  frUrl: 'https://helpcar.be/zones/'
}));
console.log('  ✓ nl/zones/index.html');
count++;

// Services + locations NL
const missingImgs = [];
for (const [dir, isZone] of [[NL_SERVICES_DIR, false], [NL_LOCATIONS_DIR, true]]) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const slug = file.replace(/\.json$/, '');
    const imgs = { ...DEFAULT_IMGS, ...(PAGE_IMAGES[slug] || {}) };
    for (const key of ['hero', 'terrain', 'prijs', 'nacht']) {
      if (imgs[key] && !fs.existsSync(path.join(IMAGES_DIR, imgs[key] + '.webp'))) missingImgs.push(`${slug}:${key}=${imgs[key]}`);
    }
    const outDir = path.join(OUT_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildPageNL(path.join(dir, file), slug, isZone));
    console.log(`  ✓ nl/${slug}/index.html`);
    count++;
  }
}

if (missingImgs.length) console.log('\n⚠ Images manquantes (sections omises) :\n  ' + missingImgs.join('\n  '));
console.log(`\n✅ ${count} pages NL générées dans nl/`);
console.log('Rappel : lancer ensuite "node build-pages.js" pour reconstruire build/ (le dossier nl/ est dans DEPLOY_DIRS).');
