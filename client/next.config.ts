import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables React's Strict Mode, which helps identify potential problems in your app.
  // It's recommended for development.
  reactStrictMode: true,

  // Configuration for Next.js's built-in Image Optimization.
  images: {
    // Defines a list of allowed hostnames for external images.
    // This is a security measure to prevent aribtrary image sources.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com', // Example for another image CDN
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Environment variables that are exposed to the browser.
  // Note: Only variables prefixed with NEXT_PUBLIC_ are available client-side.
  // This 'env' key is for variables available only at build time.
  // Be careful not to expose sensitive keys here!
  env: {
    CUSTOM_KEY: 'my-value',
  },

  // TypeScript configuration
  typescript: {
    // !! DANGER ZONE !!
    // This will allow your project to build even if there are TypeScript errors.
    // As discussed, this is NOT recommended for production as it hides potential bugs.
    // Use it only as a temporary measure if you absolutely must deploy.
    // ignoreBuildErrors: true,
  },

  // Allows you to create redirects for your pages.
  async redirects() {
    return [
      {
        source: '/about-us',
        destination: '/about',
        permanent: true, // `true` for 308 permanent redirect, `false` for 307 temporary
      },
    ];
  },
};

export default nextConfig;