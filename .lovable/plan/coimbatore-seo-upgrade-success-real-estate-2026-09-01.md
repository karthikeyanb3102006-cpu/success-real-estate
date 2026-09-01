# Coimbatore SEO Upgrade — Success Real Estate

Goal: turn the current site into a professional, SEO-solid Coimbatore real estate platform without breaking existing features (properties, admin, maps, collection, auth, MCP).

## What stays untouched
Branding, black/gold design system, property CRUD + image manager, Google Maps, favorites/collection, auth and MCP routes.

## 1. Data layer (foundation)
Extend the `properties` table with the fields real listings need and SEO controls:
`parking`, `locality` (area, e.g. Saravanampatti), `seo_title`, `seo_description`, `noindex`, `is_demo`, `status` (available/sold/rented), plus existing created/updated timestamps. Image rows get `alt_text`.
New tables: `locations` (slug, name, description, seo fields, published), `blog_posts` (slug, title, excerpt, body markdown, cover image + alt, author, published_at, updated_at, categories, tags, seo fields, published), `site_settings` (single row: site title, default description, social image, contact phone/WhatsApp/email/address).
Demo rows get `is_demo = true` and are labelled in the admin list so you can swap them for real listings.

## 2. New public pages
- Category pages: `/properties-for-sale-coimbatore`, `/properties-for-rent-coimbatore`, `/houses-…`, `/villas-…`, `/flats-…`, `/plots-…`, `/land-for-sale-coimbatore`. Each: own title/description/canonical, one H1, short intro, filtered listings, filters, breadcrumbs, FAQ, internal links.
- Location pages: `/real-estate/$area`, generated only for published locations that actually have listings; otherwise 404 (no doorway pages).
- Blog: `/blog` index + `/blog/$slug` with Article + BreadcrumbList schema, author, dates, related posts, links into matching category/location.
- Property detail moves to `/property/$slug` (SEO slug like `3-bhk-villa-saravanampatti-coimbatore`), with the old `/properties/$id` kept as a permanent redirect so nothing breaks.
- `/locations` hub listing covered areas.

## 3. Metadata & schema
Every route gets unique title, description, canonical, OG + Twitter tags. Root keeps sitewide defaults + Organization/WebSite JSON-LD. RealEstateAgent schema on contact/home from `site_settings` (no invented data). Property pages emit offer/Residence schema only when the listing is complete; incomplete or demo listings get `noindex`. FAQPage JSON-LD only on pages with real visible FAQs.

## 4. Homepage
Keeps the current hero and featured grid; adds the Coimbatore-focused H1, a natural supporting section (who we are, property types, areas covered, buy/rent services) and internal links to every category, location hub, about and contact.

## 5. Sitemap / robots / 404
Dynamic sitemap covering home, categories, published locations with listings, indexable properties, blog posts and static pages — excluding noindex/demo/admin/auth. Robots stays permissive, disallows `/admin`, `/auth`, `/collection`. Branded 404 page reusing site chrome with helpful links.

## 6. Search & filters
Adds bedrooms, bathrooms, area and amenities filters to `/properties`. Filter combinations stay in search params and are marked `noindex, follow` so they don't create thousands of indexable duplicates; only the curated category/location URLs are indexable.

## 7. Admin panel additions
- Property form: SEO title, meta description, slug, per-image alt text, index/noindex, demo flag, parking, locality, status.
- New sections: Locations, Blog posts, Site settings (business info + social image).
- Google-result preview snippet on each SEO editor.
- New `/admin/seo` dashboard: counts of indexable pages, properties, locations, posts; lists of pages missing titles/descriptions, images missing alt text, properties missing SEO data; sitemap/robots/canonical status.

## 8. Performance, images, mobile
Explicit width/height everywhere, lazy-load below the fold, preload the hero only, `loading`/`decoding` hints, route-level code splitting for the map and admin, font-display swap, and a mobile pass on nav, filters, galleries and the contact/WhatsApp buttons. Sticky mobile call/WhatsApp action on property pages.

## 9. Final audit
After building, crawl the site locally and fix missing/duplicate titles and descriptions, H1 issues, broken links, missing alt text and canonical gaps; then run the SEO scanner.

## Notes
- No fabricated claims, awards, reviews, addresses or phone numbers — business info comes from admin site settings; existing address/phone you supplied are kept.
- No Search Console submission is performed; the site is only made technically ready.
- Delivered in stages (data layer → pages → admin → audit) so the site stays working throughout.
