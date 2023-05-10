export const isHelpCenterUrl = (url) => {
  const helpCenterUrlRegex =
    /^https:\/\/(help|help-staging|canary-help|help-staging-(a|b|c))\.flip\.id/;
  return helpCenterUrlRegex.test(url);
};

/**
 * Convert Zendesk url string to Help Center url
 */
export const getHelpCenterUrl = (url) => {
  if (isZdArticleUrl(url)) {
    const currentUrlOrigin = window.origin || "https://help.flip.id";
    const urlSplit = url.split("/");
    const articleSlug = urlSplit[urlSplit.length - 1];
    const helpCenterUrl = `${currentUrlOrigin}/article/${articleSlug}`;
    return helpCenterUrl;
  }

  return url;
};
