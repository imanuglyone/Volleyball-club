import type { MetadataRoute } from 'next';
import { club } from '@/components/public/site-content';
import { getPublicTrainings } from '@/lib/dal/trainings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trainings = await getPublicTrainings().catch(() => []);
  return [
    {
      url: club.canonicalUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${club.canonicalUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: .9
    },
    ...trainings.map((training) => ({
      url: `${club.canonicalUrl}/trainings/${training.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: .8
    }))
  ];
}
