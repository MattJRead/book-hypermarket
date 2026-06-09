import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'jackets.gardners.com' },
      { protocol: 'https', hostname: 'jackets.dmmserver.com' },
      { protocol: 'https', hostname: 'www.waterstones.com' },
      { protocol: 'https', hostname: 'waterstones.com' },
      { protocol: 'https', hostname: 'blackwells.co.uk' },
      { protocol: 'https', hostname: 'www.blackwells.co.uk' }
    ],
  },
};

export default nextConfig;