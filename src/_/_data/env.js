function isStagingSite() {
  if (process.env.NODE_ENV === "stage") return true;
  if (process.env.CONTEXT === "production") return false;
  if (process.env.NETLIFY !== "true") return false;
  const branch = (process.env.BRANCH || process.env.HEAD || "").toLowerCase();
  if (branch === "stage") return true;
  const urls = `${process.env.DEPLOY_PRIME_URL || ""}${process.env.DEPLOY_URL || ""}`;
  return /\/\/stage--/i.test(urls);
}

export default {
  ELEVENTY_ENV: process.env.ELEVENTY_ENV,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  GTM_ID: process.env.GTM_ID,
  UMAMI_DATA_WEBSITE_ID: process.env.UMAMI_DATA_WEBSITE_ID,
  UMAMI_SRC: process.env.UMAMI_SRC,
  PLAUSIBLE_DATA_DOMAIN: process.env.PLAUSIBLE_DATA_DOMAIN,
  context: process.env.CONTEXT || "branch-deploy",
  /** True for Netlify stage deploys (and local `NODE_ENV=stage`); never production. */
  staging: isStagingSite(),
};
