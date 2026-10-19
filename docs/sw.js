/* Candito Forever – Service Worker. Version wird beim Bauen eingesetzt. */
const VERSION='2026.10.19-1816-83bd6c2';
const CACHE='cf-app-'+VERSION, FONTS='cf-fonts';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/favicon-64.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))));
});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('cf-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // Schriften: aus dem Zwischenspeicher, im Hintergrund auffrischen
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);return hit||net})));
    return;
  }
  if(u.origin!==self.location.origin)return;
  // App-Seite: immer die Version dieses Service Workers (Updates kommen über den „Aktualisieren“-Hinweis)
  if(r.mode==='navigate'){
    e.respondWith(caches.open(CACHE).then(c=>c.match('./index.html').then(hit=>hit||fetch(r))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&/\/icons\//.test(u.pathname))c.put(r,res.clone());return res}))));
});
