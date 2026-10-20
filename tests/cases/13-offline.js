// Offline: Service Worker legt Seite + ausgelagerte Skripte ab; App startet danach ohne Netz vollständig.
module.exports={name:'Offline – Start ohne Netz nach Installation',async run({browser,port,t}){
  const ctx=await browser.newContext({viewport:{width:390,height:797}});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(`http://localhost:${port}/`);
  const ready=await p.evaluate(()=>navigator.serviceWorker?navigator.serviceWorker.ready.then(()=>true):false);
  t.ok(ready,'Service Worker aktiv');
  await p.waitForTimeout(1500);
  const cached=await p.evaluate(async()=>{const ks=await caches.keys();const k=ks.find(x=>x.startsWith('cf-app-'));if(!k)return null;const c=await caches.open(k);return (await c.keys()).map(r=>new URL(r.url).pathname)});
  const assets=await p.evaluate(()=>[...document.querySelectorAll('script[src]')].map(s=>new URL(s.src).pathname).filter(x=>/\/assets\//.test(x)));
  t.ok(assets.length>=1,'Skript als eigene Datei eingebunden ('+assets.join(', ')+')');
  t.ok(cached&&assets.every(a=>cached.includes(a)),'Ausgelagerte Dateien im Offline-Speicher');
  await ctx.setOffline(true);
  await p.reload();await p.waitForTimeout(2500);
  const ok=await p.evaluate(()=>typeof render==='function'&&document.querySelectorAll('#view > *').length>0&&!!document.querySelector('#nav'));
  t.ok(ok,'App startet offline vollständig');
  t.eq(errs,[],'Keine Fehler beim Offline-Start');
  await ctx.close();
}};
