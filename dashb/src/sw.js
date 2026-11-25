import { setCacheNameDetails, clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

const CACHE_PREFIX = 'music-app'
const CACHE_VERSION = 'v1'

setCacheNameDetails({ prefix: CACHE_PREFIX, suffix: CACHE_VERSION })

const RUNTIME_CACHES = {
    assets: `${CACHE_PREFIX}-assets-${CACHE_VERSION}`,
    api: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
}

function isPrivateRequest(url, request) {
  const host = url.hostname
  return (
    url.pathname.startsWith('/__/') || 
    host.includes('identitytoolkit.googleapis.com') || 
    host.includes('securetoken.googleapis.com') || 
    host.endsWith('firebaseapp.com') ||
    host.endsWith('firebaseio.com') ||
    host === 'apis.google.com' ||
    host === 'accounts.google.com' ||
    host.endsWith('googleusercontent.com') || 
    request.headers.has('Authorization')
  )
}

self.addEventListener('install', () => {
  console.log(`[SW] install: ${CACHE_VERSION}`)
})

precacheAndRoute(self.__WB_MANIFEST)


cleanupOutdatedCaches()


self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      const outdated = names.filter(
        (name) =>
          name.startsWith(CACHE_PREFIX) && !name.endsWith(`-${CACHE_VERSION}`),
      )
      await Promise.all(
        outdated.map((name) => {
          console.log(`[SW] delete old cache: ${name}`)
          return caches.delete(name)
        }),
      )
      console.log(`[SW] activate: ${CACHE_VERSION}`)
    })(),
  )
})


clientsClaim()


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/__\//],
  }),
)
registerRoute(
  ({ request, url }) =>
    (request.destination === 'image' || request.destination === 'font') &&
    !isPrivateRequest(url, request),
  new CacheFirst({
    cacheName: RUNTIME_CACHES.assets,
    plugins: [
      
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true, 
      }),
    ],
  }),
)
const markCachedResponse = {
  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
    if (!cachedResponse) return null
    const headers = new Headers(cachedResponse.headers)
    headers.set('X-From-SW-Cache', '1')
    const body = await cachedResponse.blob()
    return new Response(body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    })
  },
}
registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith('/api/') &&
    !isPrivateRequest(url, request),
  new NetworkFirst({
    cacheName: RUNTIME_CACHES.api,
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      markCachedResponse,
    ],
  }),
)

