import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { listProfessionals } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/search", "/how-it-works", "/for-professionals", "/login", "/signup"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  const allPros = await listProfessionals();
  const professionalRoutes = allPros
    .filter((p) => p.verificationStatus === "VERIFIED")
    .map((p) => ({
      url: `${SITE_URL}/professionals/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...professionalRoutes];
}
