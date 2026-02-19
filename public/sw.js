const CACHE_NAME = 'finansys-cache-' + new Date().getTime(); // Gera um nome de cache único baseado no tempo para evitar conflitos 
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

self.addEventListener('install', event => {
  // Força o Service Worker recém-instalado a se tornar o ativo
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle das abas abertas imediatamente
  );
});

self.addEventListener('fetch', event => {
  // Estratégia Network-First para o index.html e arquivos JS/TSX para garantir que o usuário sempre pegue a versão mais nova
  if (event.request.mode === 'navigate' || event.request.url.includes('.tsx') || event.request.url.includes('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First para outros recursos (imagens, fontes, CSS externo)
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Listener para forçar a atualização quando solicitado pelo index.tsx
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
