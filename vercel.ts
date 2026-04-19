import { routes, type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  buildCommand: 'npm run build',
  framework: 'nextjs',
  headers: [
    routes.header('/sw.js', [
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      { key: 'Service-Worker-Allowed', value: '/' },
    ]),
    routes.cacheControl('/icons/(.*)', { public: true, maxAge: '1week', immutable: true }),
  ],
}
