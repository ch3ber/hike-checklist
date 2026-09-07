import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const outputDirectory = new URL('../dist/', import.meta.url)
const serviceWorkerPath = new URL('service-worker.js', outputDirectory)
const vercelServiceWorkerPath = new URL('../.vercel/output/static/service-worker.js', import.meta.url)

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? listFiles(path) : [path]
    }),
  )

  return files.flat()
}

const files = (await listFiles(outputDirectory.pathname)).filter(
  (file) => file !== serviceWorkerPath.pathname,
)
const urls = files.map((file) => `/${relative(outputDirectory.pathname, file).split(sep).join('/')}`)
const contentHash = createHash('sha256')

for (const file of files) {
  contentHash.update(await readFile(file))
}

const cacheName = `treksys-${contentHash.digest('hex').slice(0, 12)}`
const source = `const CACHE_NAME = ${JSON.stringify(cacheName)}
const PRECACHE_URLS = ${JSON.stringify(urls, null, 2)}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith('treksys-') && name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')))
    return
  }

  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || fetch(event.request)))
})
`

await Promise.all([writeFile(serviceWorkerPath, source), writeFile(vercelServiceWorkerPath, source)])
console.log(`Service worker generado: ${cacheName} (${urls.length} archivos)`)
