import { describe, expect, it } from 'vitest'
import type { Link } from '@unhead/vue/types'
import { applyCrossOriginToLinkHeader, normalizeCrossOrigin, renderCrossOriginAttr, withCrossOrigin } from '../../packages/nuxt/src/runtime/server/renderer/cross-origin.ts'

describe('normalizeCrossOrigin', () => {
  it('accepts the valid attribute values', () => {
    expect(normalizeCrossOrigin('')).toBe('')
    expect(normalizeCrossOrigin('anonymous')).toBe('anonymous')
    expect(normalizeCrossOrigin('use-credentials')).toBe('use-credentials')
  })

  it('falls back to the bare attribute for unknown or runtime-overridden values', () => {
    expect(normalizeCrossOrigin(undefined)).toBe('')
    expect(normalizeCrossOrigin('USE-CREDENTIALS')).toBe('')
    expect(normalizeCrossOrigin('null')).toBe('')
    expect(normalizeCrossOrigin(null)).toBe('')
  })
})

describe('renderCrossOriginAttr', () => {
  it('renders a bare attribute by default and the value when set', () => {
    expect(renderCrossOriginAttr('')).toBe(' crossorigin')
    expect(renderCrossOriginAttr('anonymous')).toBe(' crossorigin="anonymous"')
    expect(renderCrossOriginAttr('use-credentials')).toBe(' crossorigin="use-credentials"')
  })
})

describe('withCrossOrigin', () => {
  it('updates links that carry the attribute and leaves other links alone', () => {
    const links = [
      { rel: 'modulepreload', crossorigin: '' },
      { rel: 'preload', as: 'font', crossorigin: '' },
      { rel: 'icon', crossorigin: null },
    ] as Array<Link & { crossorigin: string | null }>

    withCrossOrigin(links, 'use-credentials')

    expect(links[0]!.crossorigin).toBe('use-credentials')
    expect(links[1]!.crossorigin).toBe('use-credentials')
    expect(links[2]!.crossorigin).toBeNull()
  })
})

describe('applyCrossOriginToLinkHeader', () => {
  it('leaves headers untouched in the default mode', () => {
    const header = '</_nuxt/app.js>; rel="modulepreload"; crossorigin, </_nuxt/font.woff2>; rel="preload"; as="font"; crossorigin'

    expect(applyCrossOriginToLinkHeader(header, '')).toBe(header)
  })

  it('rewrites bare crossorigin parameters across multiple link header entries', () => {
    const header = '</_nuxt/app.js>; rel="modulepreload"; crossorigin, </_nuxt/font.woff2>; rel="preload"; as="font"; type="font/woff2"; crossorigin'

    expect(applyCrossOriginToLinkHeader(header, 'use-credentials')).toBe('</_nuxt/app.js>; rel="modulepreload"; crossorigin=use-credentials, </_nuxt/font.woff2>; rel="preload"; as="font"; type="font/woff2"; crossorigin=use-credentials')
  })

  it('does not inject crossorigin where the renderer did not emit it', () => {
    const header = '</_nuxt/app.js>; rel="modulepreload"'

    expect(applyCrossOriginToLinkHeader(header, 'use-credentials')).toBe(header)
  })
})
