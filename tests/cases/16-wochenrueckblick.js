// Wochenrückblick: Daten je Programmwoche, Bild, Angebot nach der letzten Einheit der Woche und auf „Heute“.
module.exports={name:'Wochenrückblick – Daten, Story-Bild, Angebote',async run({page,t}){
  const {seed}=require('../lib');
  const p=await page();
  await seed(p,4,{pids:['intro'],kg:100});  // ganze Woche 1 (4 Einheiten)
  const D=await p.evaluate(()=>{switchProg('intro');const D=wkData('intro',0);return {done:D.done,nd:D.nd,sets:D.sets,ton:D.ton>0,bars:D.bars.length,prs:Array.isArray(D.prs),complete:wkComplete('intro',0),w2:wkComplete('intro',1)}});
  t.eq([D.done,D.nd,D.bars,D.ton,D.prs],[4,4,4,true,true],'Woche 1: 4/4 Einheiten, Readiness je Einheit, Tonnage');
  t.eq([D.complete,D.w2],[true,false],'Woche 1 komplett, Woche 2 nicht');
  // Bild wird erzeugt (Canvas 1080×1920) und über Teilen gespeichert
  const r=await p.evaluate(async()=>{const c=wkCard(wkData('intro',0));let saved=null;const o=window.claude.use;window.claude.use=async n=>n==='downloads'?{save:async x=>{saved=x.filename}}:o(n);wkShare('intro',0);await new Promise(r=>setTimeout(r,600));window.claude.use=o;return {w:c.width,h:c.height,saved}});
  t.eq([r.w,r.h],[1080,1920],'Story-Format 1080×1920');
  t.ok(/candito-woche-1-/.test(r.saved||''),'Bild wird zum Teilen übergeben ('+r.saved+')');
  // Angebot in der Zusammenfassung direkt nach der letzten Einheit der Woche
  await p.evaluate(()=>{svOpen('intro',0,3,true)});await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>!!document.querySelector('#svw [data-wkpost="intro|0"]')),'Zusammenfassung bietet den Wochenrückblick an');
  await p.evaluate(()=>{svClose();svOpen('intro',0,3,false)});await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>!document.querySelector('#svw [data-wkpost]')),'Beim späteren Ansehen kein erneutes Angebot');
  await p.evaluate(()=>{svClose();S.ui.tab='home';render()});await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>!!document.querySelector('.anad [data-wkpost="intro|0"]')),'„W1 ist fertig“ auf Heute mit Bild-Knopf');
}};
