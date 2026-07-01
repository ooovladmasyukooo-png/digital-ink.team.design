export const PROJECT_ARTICLE_CATALOG = [
  {
    id: 'art-onboarding',
    title: 'Онбординг клієнта',
    slug: 'onboarding',
  },
  {
    id: 'art-reporting',
    title: 'Звіти та аналітика',
    slug: 'reporting',
  },
  {
    id: 'art-facebook-ads',
    title: 'Facebook Ads: старт',
    slug: 'facebook-ads-start',
  },
  {
    id: 'art-google-ads',
    title: 'Google Ads: старт',
    slug: 'google-ads-start',
  },
  {
    id: 'art-creative-brief',
    title: 'Як читати креативний бриф',
    slug: 'creative-brief',
  },
] as const;

export type ProjectArticleCatalogId = (typeof PROJECT_ARTICLE_CATALOG)[number]['id'];

const ARTICLE_BY_ID = new Map(PROJECT_ARTICLE_CATALOG.map((article) => [article.id, article]));

export function getProjectArticle(articleId: string) {
  return ARTICLE_BY_ID.get(articleId as ProjectArticleCatalogId);
}

export function buildArticleReferralUrl(slug: string, referralCode: string): string {
  const code = referralCode.trim();
  const safeSlug = slug.trim();
  if (!code || !safeSlug) return '';
  const params = new URLSearchParams({ ref: code });
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/articles/${safeSlug}?${params.toString()}`;
  }
  return `/articles/${safeSlug}?${params.toString()}`;
}
