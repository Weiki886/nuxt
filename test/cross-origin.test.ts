import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isWindows } from 'std-env'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import { runsOnceInMatrix } from './matrix'

const runs = runsOnceInMatrix

if (runs) {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/cross-origin', import.meta.url)),
    dev: false,
    server: true,
    browser: false,
    setupTimeout: (isWindows ? 360 : 120) * 1000,
  })
}

const CDN_ASSET = /https:\/\/cdn\.example\.com\/_nuxt\//

describe.skipIf(!runs)('build asset crossOrigin', () => {
  it('renders crossorigin="use-credentials" on every CDN build asset tag', async () => {
    const html = await $fetch<string>('/')

    // the streaming IIFE is a classic script and must keep its default no-cors request mode
    expect(html).toMatch(/<link rel="preload" as="script" href="[^"]*streaming-iife[^"]*">/)
    expect(html).toMatch(/<script async src="[^"]*streaming-iife[^"]*"><\/script>/)

    const assetTags = [...html.matchAll(/<(?:link|script)[^>]+(?:href|src)="https:\/\/cdn\.example\.com\/_nuxt\/[^"]+"[^>]*>/g)]
      .map(match => match[0]!)
      .filter(tag => !tag.includes('streaming-iife'))

    expect(assetTags.length).toBeGreaterThan(0)
    for (const tag of assetTags) {
      expect(tag).toContain('crossorigin="use-credentials"')
    }

    // order-independent stylesheet check (unhead decides attribute ordering)
    const stylesheetLinks = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)].map(match => match[0]!)
    expect(stylesheetLinks.some(tag => CDN_ASSET.test(tag))).toBe(true)
    for (const tag of stylesheetLinks) {
      expect(tag).not.toContain('crossorigin="anonymous"')
    }
  })

  it('keeps crossorigin="anonymous" on the payload preload of a cached route', async () => {
    const html = await $fetch<string>('/cached')

    const fetchPreloads = [...html.matchAll(/<link[^>]*as="fetch"[^>]*>/g)].map(match => match[0]!)
    expect(fetchPreloads.length).toBeGreaterThan(0)
    for (const tag of fetchPreloads) {
      expect(tag).toContain('crossorigin="anonymous"')
      expect(tag).not.toContain('use-credentials')
    }
  })

  it('sets crossorigin=use-credentials on the resource link header', async () => {
    const response = await fetch('/')
    const linkHeader = response.headers.get('link') || ''

    expect(linkHeader).toContain('https://cdn.example.com/_nuxt/')
    expect(linkHeader).toContain('crossorigin=use-credentials')
    expect(linkHeader).not.toContain('crossorigin,')
  })
})
