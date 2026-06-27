import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'], // Keeps bots out of your private command center
      },
      {
        // Explicitly whitelist major AI Search Crawlers
        userAgent: ['OAI-SearchBot', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
        allow: '/',
      }
    ],
    sitemap: 'https://bookhypermarket.com/sitemap.xml',
  };
}