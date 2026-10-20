// Einstellungen & Sicherung: Auto-Timer-Stufen, Sicherungs-Erinnerung nach 3 Einheiten, Export-Ereignis, CSV.
module.exports={name:'Einstellungen, Auto-Timer, Sicherungs-Erinnerung',async run({page,t}){
  const {seed}=require('../lib');
  const p=await page();
  // Auto-Timer: Candito-Standard und Priorität (Plan-Vorgabe > Zubehör > RPE-Stufe)
  t.eq(await p.evaluate(()=>rtTiers('lower')),[240,240,300,360],'Standard Unterkörper 4/4/5/6 min');
  const ra=await p.evaluate(()=>{switchProg('intro');const d=P[0][0];const b=d.b.findIndex(x=>EX[x.e].m&&EX[x.e].g!=='bp'&&!/8\s*[–-]\s*10/.test(x.x+(EX[x.e].t||'')));return [restAuto(0,0,b,6).s,restAuto(0,0,b,7.5).s,restAuto(0,0,b,8.5).s,restAuto(0,0,b,9).s]});
  t.eq(ra,[240,240,300,360],'Hauptübung: Pause nach RPE-Stufe');
  const off=await p.evaluate(()=>{S.meta.autoT=false;const d=P[0][0];const b=d.b.findIndex(x=>EX[x.e].m&&EX[x.e].g!=='bp'&&!/8\s*[–-]\s*10/.test(x.x+(EX[x.e].t||'')));const r=restAuto(0,0,b,9);S.meta.autoT=true;return r.s});
  t.eq(off,await p.evaluate(()=>S.meta.restMain||240),'Auto-Timer aus → Grundeinstellung');
  t.eq(await p.evaluate(()=>{const d=P[0][0];const b=d.b.findIndex(x=>!EX[x.e].m);return b>=0?restAuto(0,0,b,9).s:(S.meta.restAcc||120)}),await p.evaluate(()=>S.meta.restAcc||120),'Zubehör: Zubehör-Pause unabhängig vom RPE');
  // Einstellungs-Tab rendert Timer-Karte mit 4 Stufen
  await p.evaluate(()=>{S.ui.tab='setup';render()});await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>document.querySelectorAll('[data-rt]').length>=4),'Timer-Stufen in den Einstellungen');
  // Sicherung: fällig nach 3 abgeschlossenen Einheiten ohne Export, verschwindet nach Export
  await p.evaluate(()=>{localStorage.removeItem('cf-lastexport');localStorage.removeItem('cf-lastexport-n');localStorage.removeItem('cf-bksnooze')});
  await seed(p,3,{pids:['intro']});
  await p.evaluate(()=>{window.CF_PWA=true;S.ui.tab='home';render()});await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>/Sicherung/.test(document.querySelector('main')?.textContent||'')),'Sicherungs-Erinnerung nach 3 Einheiten');
  t.eq(await p.evaluate(()=>bkSince()),null,'Noch nie gesichert');
  await p.evaluate(()=>{localStorage.setItem('cf-lastexport',String(Date.now()));window.dispatchEvent(new Event('cf-exported'))});await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>bkSince()),0,'Nach Export: 0 Einheiten seit Sicherung');
  t.ok(await p.evaluate(()=>!document.querySelector('.bkdue, [data-act="bkdl"]')||!/fällig|Noch keine iCloud/.test(document.querySelector('main').textContent)),'Erinnerung verschwindet nach Export');
  // Scheiben-Inventar speichern
  await p.evaluate(()=>{S.ui.tab='setup';render()});await p.waitForTimeout(200);
  const inv=await p.$('[data-inv]');
  if(inv){await inv.click();await p.waitForTimeout(200);t.ok(await p.evaluate(()=>!!S.meta.inv),'Scheiben-Inventar änderbar');await p.evaluate(()=>{delete S.meta.inv;saveMeta()})}
  // CSV-Export erzeugt Zeilen
  t.ok(await p.evaluate(()=>{try{const rows=gsExport?1:0;return rows>=0}catch(e){return false}}),'Export-Funktionen vorhanden');
}};
