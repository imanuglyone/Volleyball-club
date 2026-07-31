import type { MetadataRoute } from 'next';
import { club } from '@/components/public/site-content';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/schedule', '/trainings/'],
      disallow: ['/app/', '/admin/', '/api/', '/booking/', '/bookings', '/profile']
    },
    sitemap: `${club.canonicalUrl}/sitemap.xml`,
    host: club.canonicalUrl
  };
}
