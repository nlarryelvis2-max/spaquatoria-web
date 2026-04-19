import { products, collections } from "@/lib/data";

const BASE = "https://spaquatoria-web.vercel.app";

export default function sitemap() {
  const productUrls = products.map((p) => ({
    url: `${BASE}/catalog/${p.id}`,
    lastModified: new Date(),
    priority: 0.8,
  }));

  const collectionUrls = collections.map((c) => ({
    url: `${BASE}/lines/${c.id}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [
    { url: BASE, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE}/catalog`, lastModified: new Date(), priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), priority: 0.6 },
    { url: `${BASE}/ingredients`, lastModified: new Date(), priority: 0.5 },
    { url: `${BASE}/b2b`, lastModified: new Date(), priority: 0.4 },
    { url: `${BASE}/test`, lastModified: new Date(), priority: 0.7 },
    ...productUrls,
    ...collectionUrls,
  ];
}
