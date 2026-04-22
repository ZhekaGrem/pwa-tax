import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const isDev = process.env.NODE_ENV !== 'production'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // In dev, the SW would aggressively cache client bundles and serve
  // stale JS across HMR, which made the Calculator look frozen.
  // Disable entirely outside production.
  disable: isDev,
})

const config: NextConfig = {
  // Without this, Next 16 blocks /_next/* requests from non-localhost origins
  // in dev — the page's HTML renders but client chunks 404, so the Calculator
  // ships to the browser with no hydration and looks frozen.
  allowedDevOrigins: ['192.168.0.100', '*.local'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react'],
  },
}

export default withSerwist(config)
