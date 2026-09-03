const CACHE_PREFIX='icar-claw-';
const CACHE='icar-claw-v16-20260903';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/icon.svg'];
const APP_URLS=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!APP_URLS.has(event.request.url))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}
    return response;
  }).catch(async()=>{
    const cache=await caches.open(CACHE),hit=await cache.match(event.request);
    return hit||(event.request.mode==='navigate'?await cache.match('./index.html'):null)||Response.error();
  }));
});
