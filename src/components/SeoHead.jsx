import { Helmet } from 'react-helmet-async';
import { useLang } from '../hooks/useLangHook';

export const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://algeriatravel.com';

export default function SeoHead({
  title,
  description,
  path = '/',
  image = '/images/hero.jpeg',
  noindex = false,
}) {
  const { language, t } = useLang();

  const siteName = t('seo_site_name');
  const fullTitle = title ? `${title} | ${siteName}` : t('seo_default_title');
  const desc = description || t('seo_default_desc');
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const img = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const hrefLang = (lang) => `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}
      <link rel="canonical" href={url} />

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

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
