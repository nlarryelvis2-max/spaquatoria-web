export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dealers"],
      },
    ],
    sitemap: "https://spaquatoria-web.vercel.app/sitemap.xml",
  };
}
