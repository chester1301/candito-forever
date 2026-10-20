// Übungs-Info (i): scrollbar, 1RM/10RM automatisch, Einstellungen speichern · Scheiben-Inventar und Hinweis.
module.exports={name:'Übungs-Info, Maxima, Scheiben',async run({page,t}){
  const {seed}=require('../lib');
  const p=await page();
  await seed(p,3,{pids:['intro'],kg:90});
  await p.evaluate(()=>{switchProg('intro');openEx('pbb')});await p.waitForTimeout(500);
  const sh=await p.evaluate(()=>{const s=document.querySelector('#xsheet .sheet-in');const c=getComputedStyle(s);return {open:!document.getElementById('xsheet').hidden,scroll:c.overflowY,tall:s.scrollHeight>s.clientHeight,noPhotos:!/Technik-Fotos|Technikfotos/.test(s.textContent)}});
  t.ok(sh.open,'Info-Sheet offen');
  t.ok(sh.scroll==='auto'||sh.scroll==='scroll','Info-Sheet scrollbar');
  t.ok(sh.noPhotos,'Keine Technik-Fotos mehr');
  const auto=await p.evaluate(()=>exAuto('pbb'));
  t.ok(auto&&auto.rm1&&auto.rm1.kg>0&&/e1RM|1RM/.test(auto.rm1.src||''),'1RM automatisch aus dem Programm');
  t.ok(auto&&auto.rm10&&auto.rm10.kg>0,'10RM automatisch abgeleitet');
  // 1RM von Hand eintragen
  await p.click('[data-xedit="1rm"]');await p.waitForTimeout(300);await p.fill('[data-xein]','120');await p.click('#xedit [data-xesave]');await p.waitForTimeout(400);
  t.eq(await p.evaluate(()=>(S.meta.exMax.pbb||[]).slice(-1)[0].kg),120,'1RM gespeichert');
  // Gewichtsschritt
  await p.click('[data-xedit="inc"]');await p.waitForTimeout(300);await p.click('[data-xeo="1"]');await p.click('#xedit [data-xesave]');await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>exInc('pbb')),1,'Gewichtsschritt 1 kg');
  // Notiz
  await p.click('[data-xnote]');await p.waitForTimeout(300);await p.fill('[data-xenote]','Griff weit, Füße flach');await p.click('#xedit [data-xesave]');await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>S.meta.exNote.pbb),'Griff weit, Füße flach','Notiz gespeichert');
  await p.evaluate(()=>closeEx());
  // Scheiben: ohne Inventar klassisch, mit Inventar Hinweis „nicht steckbar“
  t.eq(await p.evaluate(()=>plates(100)),[25,15],'100 kg = 25 + 15 je Seite (Standard-Satz mit 25ern)');
  t.eq(await p.evaluate(()=>{S.meta.inv={20:4,10:2,5:2,2.5:2,1.25:2};const r=plates(100);delete S.meta.inv;return r}),[20,20],'100 kg mit Inventar ohne 25er = 2×20');
  const miss=await p.evaluate(()=>{S.meta.inv={20:2,10:2,5:2,2.5:0,1.25:0};const pl=plates(105);const h=plMissHTML(105,pl);delete S.meta.inv;return {miss:pl.miss!=null,txt:h}});
  t.ok(miss.miss,'105 kg ohne 2,5er nicht steckbar erkannt');
  t.ok(/nicht steckbar/.test(miss.txt)&&/Canditos Vorgabe bleibt unverändert/.test(miss.txt),'Hinweis neutral formuliert, Vorgabe bleibt');
  t.eq(await p.evaluate(()=>plates(47.5)),[10,2.5,1.25],'47,5 kg = 10 + 2,5 + 1,25 je Seite');
}};
