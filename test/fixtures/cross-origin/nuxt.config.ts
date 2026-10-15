import { withMatrix } from '../../matrix'

export default withMatrix({
  app: {
    cdnURL: 'https://cdn.example.com/',
    crossOrigin: 'use-credentials',
  },
  css: ['~/assets/main.css'],
  routeRules: {
    // cached routes extract their payload, so a real `as="fetch"` preload is rendered
    '/cached': { cache: true },
  },
  experimental: {
    payloadExtraction: true,
    ssrStreaming: true,
  },
})
