import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Performance optimizations for development
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion', 'ethers'],
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Speed up development builds
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      
      // Reduce bundle analysis overhead in dev
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      };
    }
    
    return config;
  },
  
  // Disable server-side features for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      // Long-term caching for images and static files in public/
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|gif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            // Adjust connect-src/script-src as needed for your providers
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "img-src 'self' data: blob: https:",
              // Allow embedding auth widgets or provider iframes over HTTPS (e.g., Privy)
              "frame-src 'self' https: https://*.privy.io https://*.hcaptcha.com https://hcaptcha.com https://challenges.cloudflare.com https://www.google.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.privy.io https://hcaptcha.com https://*.hcaptcha.com https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
              // Allow outbound API calls and websockets to any HTTPS/WSS endpoint (dev-friendly). Narrow in prod if desired.
              "connect-src 'self' https: wss: https://*.privy.io wss://*.privy.io https://hcaptcha.com https://*.hcaptcha.com https://www.google.com https://www.gstatic.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
