#!/usr/bin/env python3
"""
Inject OG tags, Twitter cards, canonical URL into service and zone pages.
Add Blog link to nav-desktop, nav-mobile, and footer if missing.
"""

import os
import re
import glob
import html

BASE_DIR = "/Users/macbook/Desktop/site_template"
SITE_URL = "https://helpcar.be"

def strip_html_tags(text):
    """Remove HTML tags from a string."""
    return re.sub(r'<[^>]+>', '', text)

def extract_title(content):
    """Extract content of <title> tag."""
    m = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
    if m:
        return strip_html_tags(m.group(1)).strip()
    return ""

def extract_description(content):
    """Extract content of <meta name='description'> tag."""
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.DOTALL)
    if m:
        return strip_html_tags(m.group(1)).strip()
    return ""

def escape_attr(text):
    """Escape text for use in HTML attributes."""
    return html.escape(text, quote=True)

def inject_meta_tags(content, page_type, slug):
    """Inject canonical, OG, and Twitter meta tags after <meta name='description'...>."""
    if 'og:title' in content:
        return content, False

    title_raw = extract_title(content)
    desc_raw = extract_description(content)

    title = escape_attr(title_raw)
    description = escape_attr(desc_raw)

    canonical_url = f"{SITE_URL}/{page_type}/{slug}/"

    meta_block = f'''  <link rel="canonical" href="{canonical_url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:locale" content="fr_BE">
  <meta property="og:site_name" content="HELPCAR Dépannage">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">'''

    # Insert after the <meta name="description" ...> line
    pattern = r'(<meta\s+name=["\']description["\']\s+content=["\'][^"\']*["\']>)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        insert_pos = match.end()
        content = content[:insert_pos] + "\n" + meta_block + content[insert_pos:]
        return content, True

    return content, False

def add_blog_to_nav_desktop(content):
    """Add Blog link between 'À propos' and 'Contact' in nav-desktop."""
    if 'nav-desktop' not in content:
        return content, False

    # Check if blog already in nav-desktop
    nav_desktop_match = re.search(r'(<nav\s+class="nav-desktop">)(.*?)(</nav>)', content, re.DOTALL)
    if not nav_desktop_match:
        return content, False

    nav_section = nav_desktop_match.group(2)
    if '/blog/' in nav_section:
        return content, False

    # Insert blog link after "À propos" link and before "Contact" link in nav-desktop
    # Pattern: find the À propos link followed by the Contact link
    pattern = r'(<a\s+href="/a-propos/"[^>]*>À propos</a>\s*\n)(\s*<a\s+href="/contact/")'
    replacement = r'\1      <a href="/blog/">Blog</a>\n\2'
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        return new_content, True
    return content, False

def add_blog_to_nav_mobile(content):
    """Add Blog link between 'À propos' and 'Contact' in nav-mobile."""
    nav_mobile_match = re.search(r'(<nav\s+class="nav-mobile">)(.*?)(</nav>)', content, re.DOTALL)
    if not nav_mobile_match:
        return content, False

    nav_section = nav_mobile_match.group(2)
    if '/blog/' in nav_section:
        return content, False

    # Insert blog link after "À propos" link and before "Contact" link in nav-mobile
    pattern = r'(<a\s+href="/a-propos/"[^>]*>À propos</a>\s*\n)(\s*<a\s+href="/contact/")'
    replacement = r'\1  <a href="/blog/">Blog</a>\n\2'
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        return new_content, True
    return content, False

def add_blog_to_footer(content):
    """Add Blog link in footer Informations section if missing."""
    # Check if blog link already in footer
    footer_match = re.search(r'(<footer.*?</footer>)', content, re.DOTALL)
    if not footer_match:
        return content, False

    footer_section = footer_match.group(1)
    if '/blog/' in footer_section:
        return content, False

    # Find the Informations section and add Blog after "À propos" line
    pattern = r'(<h4\s+class="footer__title">Informations</h4>\s*<ul\s+class="footer__links">.*?<li><a href="/a-propos/">À propos</a></li>)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        insert_pos = match.end()
        blog_line = '\n          <li><a href="/blog/">Blog</a></li>'
        content = content[:insert_pos] + blog_line + content[insert_pos:]
        return content, True

    return content, False

def process_file(filepath, page_type, slug):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = []

    # 1. Inject OG/Twitter/canonical meta tags
    content, changed = inject_meta_tags(content, page_type, slug)
    if changed:
        changes.append("OG/Twitter/canonical tags")

    # 2. Add Blog to nav-desktop
    content, changed = add_blog_to_nav_desktop(content)
    if changed:
        changes.append("Blog in nav-desktop")

    # 3. Add Blog to nav-mobile
    content, changed = add_blog_to_nav_mobile(content)
    if changed:
        changes.append("Blog in nav-mobile")

    # 4. Add Blog to footer
    content, changed = add_blog_to_footer(content)
    if changed:
        changes.append("Blog in footer")

    if changes:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes
    return []

def main():
    updated_files = []
    skipped_files = []

    # Collect service pages
    service_dirs = sorted([
        d for d in os.listdir(os.path.join(BASE_DIR, "services"))
        if os.path.isdir(os.path.join(BASE_DIR, "services", d))
    ])

    # Collect zone pages
    zone_dirs = sorted([
        d for d in os.listdir(os.path.join(BASE_DIR, "zones"))
        if os.path.isdir(os.path.join(BASE_DIR, "zones", d))
    ])

    print(f"Found {len(service_dirs)} service directories")
    print(f"Found {len(zone_dirs)} zone directories")
    print("=" * 60)

    # Process service pages
    for slug in service_dirs:
        filepath = os.path.join(BASE_DIR, "services", slug, "index.html")
        if not os.path.exists(filepath):
            print(f"  SKIP (no index.html): services/{slug}/")
            continue
        changes = process_file(filepath, "services", slug)
        if changes:
            print(f"  UPDATED: services/{slug}/index.html -> {', '.join(changes)}")
            updated_files.append(filepath)
        else:
            print(f"  NO CHANGE: services/{slug}/index.html")
            skipped_files.append(filepath)

    # Process zone pages
    for slug in zone_dirs:
        filepath = os.path.join(BASE_DIR, "zones", slug, "index.html")
        if not os.path.exists(filepath):
            print(f"  SKIP (no index.html): zones/{slug}/")
            continue
        changes = process_file(filepath, "zones", slug)
        if changes:
            print(f"  UPDATED: zones/{slug}/index.html -> {', '.join(changes)}")
            updated_files.append(filepath)
        else:
            print(f"  NO CHANGE: zones/{slug}/index.html")
            skipped_files.append(filepath)

    print("=" * 60)
    print(f"Total updated: {len(updated_files)}")
    print(f"Total unchanged: {len(skipped_files)}")

if __name__ == "__main__":
    main()
