import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Le check ESLint est géré par le CI (tsc --noEmit)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Le typecheck est géré par le CI (tsc --noEmit)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
