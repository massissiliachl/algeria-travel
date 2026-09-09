import { Helmet } from 'react-helmet-async';
import { useLang } from '../hooks/useLangHook';

export const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://algeriatravel.com';
export const SITE_LOGO_URL = `${SITE_URL}/logo.png`;
export const SITE_LOGO_ICON_URL = `${SITE_URL}/logo192.png`;

function buildOrganizationSchema(siteName, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: siteName,
    alternateName: 'Algeria Travel Agency',
    url: SITE_URL,
    logo: SITE_LOGO_URL,
    image: SITE_LOGO_URL,
    description,
    telephone: '+213-557-664-089',
    areaServed: {
      '@type': 'Country',
      name: 'Algeria',
    },
  };
}

function buildWebSiteSchema(siteName) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: SITE_URL,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: SITE_LOGO_URL,
      },
    },
  };
}

export default function SeoHead({
  title,
  description,
  path = '/',
  image = '/logo.png',
  noindex = false,
  home = false,
}) {
  const { language, t } = useLang();

  const siteName = t('seo_site_name');
  const fullTitle = title ? `${title} | ${siteName}` : t('seo_default_title');
  const desc = description || t('seo_default_desc');
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const img = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const hrefLang = (lang) => `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;

  const jsonLd = [buildOrganizationSchema(siteName, desc)];
  if (home) jsonLd.push(buildWebSiteSchema(siteName));

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large" />
      )}
      <link rel="canonical" href={url} />

      <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/logo512.png" />
      <link rel="apple-touch-icon" href="/logo192.png" />

      <link rel="alternate" hrefLang="fr" href={hrefLang('fr')} />
      <link rel="alternate" hrefLang="en" href={hrefLang('en')} />
      <link rel="alternate" hrefLang="ar" href={hrefLang('ar')} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : language === 'ar' ? 'ar_DZ' : 'en_US'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={`${siteName} — logo`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      <script type="application/ld+json">{JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd)}</script>
    </Helmet>
  );
}
