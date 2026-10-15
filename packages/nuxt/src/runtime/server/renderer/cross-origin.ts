import type { Link } from '@unhead/vue/types'

export type AssetCrossOrigin = '' | 'anonymous' | 'use-credentials'

/** Coerce runtime/config values to the three valid `crossorigin` attribute modes. */
export function normalizeCrossOrigin (value: unknown): AssetCrossOrigin {
  return value === 'anonymous' || value === 'use-credentials' ? value : ''
}

/**
 * Overwrite the `crossorigin` value of unhead link objects that already set one.
 * Links without the attribute (e.g. non-CORS resources) are left untouched.
 */
export function withCrossOrigin<T extends Link> (links: T[], crossOrigin: AssetCrossOrigin): T[] {
  for (const link of links as Array<T & { crossorigin?: AssetCrossOrigin | null }>) {
    if (link.crossorigin != null) {
      link.crossorigin = crossOrigin
    }
  }
  return links
}

/** Render the attribute for tags built as raw HTML strings. */
export function renderCrossOriginAttr (crossOrigin: AssetCrossOrigin): string {
  return crossOrigin ? ` crossorigin="${crossOrigin}"` : ' crossorigin'
}

/** Rewrite every `crossorigin` parameter of an HTTP `Link` header, preserving its other parameters. */
export function applyCrossOriginToLinkHeader (header: string, crossOrigin: AssetCrossOrigin): string {
  if (!crossOrigin) {
    return header
  }
  // vue-bundle-renderer only ever emits a bare `; crossorigin` as the final parameter.
  return header.replace(/;\s*crossorigin(?=\s*(?:,|$))/gi, `; crossorigin=${crossOrigin}`)
}
