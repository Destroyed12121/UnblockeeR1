// Service Worker for Unblockee Offline Mode
const CACHE_NAME = 'unblockee-offline-v1';
const OFFLINE_CACHE = 'unblockee-offline-content-v1';
const GAME_CACHE = 'unblockee-games-v1';
const MAX_GAMES = 30;
const PLAY_THRESHOLD = 5;

// Check if offline mode is enabled
function isOfflineModeEnabled() {
  try {
    const offlineMode = localStorage.getItem('unblockee_offlineMode');
    return offlineMode === 'true';
  } catch (error) {
    console.warn('SW: Failed to check offline mode:', error);
    return false;
  }
}

// Files to cache immediately for offline functionality
const OFFLINE_FILES = [
  '/',
  '/index.html',
  '/all.css',
  '/components/topbar.css',
  '/components/topbar.js',
  '/components/settings.css',
  '/components/settings.js',
  '/components/shortcuts.js',
  '/components/zones.json',
  '/pages/games.html',
  '/pages/movies.html',
  '/pages/music.html',
  '/pages/credits.html',
  '/pages/Coderunner.html',
  '/pages/coderunner.css',
  '/pages/Coderunner.js',
  '/pages/chatbot.html',
  '/components/chatbot.css',
  '/components/chatbot.js',
  '/changelog.json'
];

// Game files to cache
const GAME_FILES = [
  // Add common game files that should be cached
  '/games/',
  // Individual game files will be added dynamically
];

// Install event - cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_FILES))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Service Worker: Failed to cache core files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== GAME_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check if offline mode is enabled
  const offlineModeEnabled = isOfflineModeEnabled();

  // Handle different types of requests
  if (url.pathname.startsWith('/games/') || url.pathname.includes('.html')) {
    // Game files and HTML pages - use cache first only if offline mode enabled
    if (offlineModeEnabled) {
      event.respondWith(handleGameRequest(request));
    } else {
      // Network only when offline mode disabled
      event.respondWith(fetch(request));
    }
  } else if (url.pathname.startsWith('/Staticsj/')) {
    // Proxy requests - network first
    event.respondWith(handleProxyRequest(request));
  } else {
    // Static files - cache first only if offline mode enabled
    if (offlineModeEnabled) {
      event.respondWith(handleStaticRequest(request));
    } else {
      // Network only when offline mode disabled
      event.respondWith(fetch(request));
    }
  }
});

// Handle game file requests
async function handleGameRequest(request) {
  const cache = await caches.open(GAME_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline page for game requests
    return createOfflinePage();
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return cached fallback or offline page
    return cachedResponse || createOfflinePage();
  }
}

// Handle proxy requests (network first)
async function handleProxyRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Create a response indicating proxy is unavailable
    return new Response(
      createProxyOfflineMessage(),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Message handling
self.addEventListener('message', event => {
  if (!event || !event.data || !event.data.type) {
    return;
  }

  const { type, data } = event.data;

  switch (type) {
    case 'CACHE_GAME':
      if (isOfflineModeEnabled() && data && (data.gameId || data.id) && data.url) {
        cacheGame(data.gameId != null ? data.gameId : data.id, data.url);
      } else if (!isOfflineModeEnabled()) {
        // Notify that offline mode is disabled
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            type: 'CACHE_ERROR',
            error: 'Offline mode is disabled'
          });
        }
      }
      break;
    case 'CACHE_GAMES':
      if (isOfflineModeEnabled()) {
        if (data && Array.isArray(data.games)) {
          handleBulkCacheGames(data.games, event);
        } else {
          // Invalid payload: notify caller if possible
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
              type: 'CACHE_ERROR',
              error: 'Invalid games payload'
            });
          }
          // Broadcast error so UIs without a dedicated port can react
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'CACHE_ERROR',
                error: 'Invalid games payload'
              });
            });
          });
        }
      } else {
        // Offline mode disabled
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            type: 'CACHE_ERROR',
            error: 'Offline mode is disabled'
          });
        }
        // Broadcast error
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_ERROR',
              error: 'Offline mode is disabled'
            });
          });
        });
      }
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(status);
        }
      });
      break;
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      });
      break;
    case 'GET_GAMES_LIST':
      getGamesList().then(games => {
        event.ports[0].postMessage({ games });
      });
      break;
    case 'CACHE_ZONES':
      if (data && data.zones) {
        cacheZonesData(data.zones);
      }
      break;
    case 'INCREMENT_GAME_PLAY':
      if (data && data.gameId) {
        incrementPlayCount(data.gameId).then(playCount => {
          // Send acknowledgement via port if provided
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
              type: 'GAME_PLAY_INCREMENTED',
              gameId: data.gameId,
              playCount
            });
          }
          // Broadcast status message to clients
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'GAME_PLAY_STATUS',
                gameId: data.gameId,
                playCount,
                thresholdReached: playCount >= PLAY_THRESHOLD && isOfflineModeEnabled()
              });
            });
          });
        });
      }
      break;
  }
});

// Bulk CACHE_GAMES handler
async function handleBulkCacheGames(games, event) {
  const port = event.ports && event.ports[0] ? event.ports[0] : null;
  const totalRequested = Array.isArray(games) ? games.length : 0;

  // Normalize and filter games: require truthy url, normalize id
  const normalizedGames = [];
  for (let i = 0; i < games.length && normalizedGames.length < MAX_GAMES; i++) {
    const raw = games[i] || {};
    if (!raw.url) continue;

    const id = raw.id != null ? raw.id : raw.gameId;
    const url = raw.url;

    normalizedGames.push({
      id: id != null ? id : url,
      url
    });
  }

  if (!normalizedGames.length) {
    const message = {
      type: 'CACHE_ERROR',
      error: 'No valid games to cache',
      totalRequested
    };

    if (port) {
      port.postMessage(message);
    }

    // Broadcast so listeners without dedicated port can react
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage(message));
    });

    return;
  }

  try {
    let cachedCount = 0;
    let failedCount = 0;

    for (const game of normalizedGames) {
      try {
        await cacheGame(game.id, game.url);
        cachedCount++;
      } catch (error) {
        // cacheGame already logs; just count as failure
        failedCount++;
      }
    }

    // Ensure metadata (cached games list, MAX_GAMES enforcement) is coherent
    try {
      const cachedGames = await getCachedGames();
      if (cachedGames && cachedGames.length > MAX_GAMES) {
        const trimmed = cachedGames.slice(cachedGames.length - MAX_GAMES);
        await storeCachedGames(trimmed);
      }
    } catch (metadataError) {
      console.error('Failed to enforce MAX_GAMES after bulk cache:', metadataError);
    }

    const completeMessage = {
      type: 'CACHE_COMPLETE',
      cachedCount,
      failedCount,
      totalRequested
    };

    // Respond via MessageChannel if provided
    if (port) {
      port.postMessage(completeMessage);
    }

    // Broadcast completion to all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(completeMessage);
      });
    });
  } catch (error) {
    console.error('Failed to complete bulk cache operation:', error);

    const errorMessage = {
      type: 'CACHE_ERROR',
      error: error && error.message ? error.message : 'Bulk cache failed'
    };

    if (port) {
      port.postMessage(errorMessage);
    }

    // Broadcast fatal error to all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(errorMessage);
      });
    });
  }
}

// Cache a specific game
async function cacheGame(gameId, gameUrl) {
  try {
    const cache = await caches.open(GAME_CACHE);
    const response = await fetch(gameUrl);

    if (response.ok) {
      await cache.put(gameUrl, response.clone());

      // Track cached games
      const cachedGames = await getCachedGames();
      if (!cachedGames.find(g => g.id === gameId)) {
        cachedGames.push({
          id: gameId,
          url: gameUrl,
          cachedAt: Date.now()
        });

        // Keep only last 30 games
        if (cachedGames.length > MAX_GAMES) {
          cachedGames.splice(0, cachedGames.length - MAX_GAMES);
        }

        await storeCachedGames(cachedGames);
      }

      // Notify main thread
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'GAME_CACHED',
            data: { gameId, url: gameUrl }
          });
        });
      });
    }
  } catch (error) {
    console.error('Failed to cache game:', error);
  }
}

// Cache zones.json data
async function cacheZonesData(zones) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(zones), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('/components/zones.json', response);
  } catch (error) {
    console.error('Failed to cache zones data:', error);
  }
}

// Get cache status
async function getCacheStatus() {
  try {
    const cache = await caches.open(GAME_CACHE);
    const requests = await cache.keys();

    const cachedGames = await getCachedGames();
    let cacheSize = 0;

    // Calculate approximate cache size
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        cacheSize += blob.size;
      }
    }

    return {
      cachedGamesCount: cachedGames.length,
      cacheSize,
      topGames: cachedGames.slice(0, 10),
      recentGames: cachedGames.slice(-5).reverse()
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {
      cachedGamesCount: 0,
      cacheSize: 0,
      topGames: [],
      recentGames: []
    };
  }
}

// Get cached games list
async function getCachedGames() {
  try {
    const cache = await caches.open(GAME_CACHE);
    const requests = await cache.keys();
    const games = [];

    for (const request of requests) {
      const game = await extractGameInfo(request);
      if (game) {
        games.push(game);
      }
    }

    return games;
  } catch (error) {
    console.error('Failed to get cached games:', error);
    return [];
  }
}

// Extract game info from request
async function extractGameInfo(request) {
  try {
    // Parse game ID from URL
    const url = request.url;
    const gameIdMatch = url.match(/(\d+)\.html/);
    if (gameIdMatch) {
      return {
        id: parseInt(gameIdMatch[1]),
        url: url,
        cachedAt: Date.now()
      };
    }
  } catch (error) {
    console.error('Failed to extract game info:', error);
  }
  return null;
}

// Store cached games metadata
async function storeCachedGames(games) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const metadata = {
      games: games,
      lastUpdated: Date.now()
    };
    const response = new Response(JSON.stringify(metadata), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('/cached-games-metadata.json', response);
  } catch (error) {
    console.error('Failed to store cached games metadata:', error);
  }
}

// Get games list
async function getGamesList() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/components/zones.json');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get games list:', error);
  }
  return [];
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  } catch (error) {
    console.error('Failed to clear caches:', error);
    // Get play counts from cache
    async function getPlayCounts() {
      try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match('/play-counts.json');
        if (response) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to get play counts:', error);
      }
      return {};
    }

    // Store play counts in cache
    async function storePlayCounts(counts) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(counts), {
          headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/play-counts.json', response);
      } catch (error) {
        console.error('Failed to store play counts:', error);
      }
    }

    // Increment play count for a game and trigger prefetch if threshold reached
    async function incrementPlayCount(gameId) {
      const counts = await getPlayCounts();
      counts[gameId] = (counts[gameId] || 0) + 1;
      await storePlayCounts(counts);
    
      const playCount = counts[gameId];
      if (playCount >= PLAY_THRESHOLD && isOfflineModeEnabled()) {
        // Trigger prefetch/caching only if offline mode enabled
        const gameUrl = `/games/${gameId}.html`;
        cacheGame(gameId, gameUrl);
      }
    
      return playCount;
    }
  }
}

// Create offline page
function createOfflinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Unblockee</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                text-align: center;
            }
            .offline-container {
                max-width: 500px;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            .offline-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                margin: 0 0 1rem 0;
                font-size: 2rem;
            }
            p {
                margin: 0 0 2rem 0;
                opacity: 0.9;
            }
            .btn {
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>You're Offline</h1>
            <p>The page you're looking for isn't available offline. Some cached content may still be available.</p>
            <button class="btn" onclick="window.location.reload()">Try Again</button>
        </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Create proxy offline message
function createProxyOfflineMessage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proxy Unavailable - Unblockee</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                text-align: center;
            }
            .proxy-container {
                max-width: 500px;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            .proxy-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                margin: 0 0 1rem 0;
                font-size: 2rem;
            }
            p {
                margin: 0 0 2rem 0;
                opacity: 0.9;
            }
        </style>
    </head>
    <body>
        <div class="proxy-container">
            <div class="proxy-icon">🌐</div>
            <h1>Proxy Unavailable</h1>
            <p>The proxy service is not available in offline mode. Please check your internet connection and try again.</p>
        </div>
    </body>
    </html>
  `;
}

