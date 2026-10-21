// Datensicherung an einer getrennten Testkopie: Sicherung herunterladen (abgefangen), in einem frischen, leeren Browser
// einspielen, Sätze und Einstellungen identisch; ungültige Datei wird ohne Teilschaden abgelehnt; CSV enthält alle Sätze.
const {seed}=require('../lib');
const CAP=()=>{window.__dl=null;window.claude=window.claude||{};const u=window.claude.use;window.claude.use=async(n)=>n==='downloads'?{save:async x=>{window.__dl=x}}:u&&u.call(window.claude,n)};
const SNAP=()=>{const out={};for(const pid of Object.keys(PROGS))withProg(pid,()=>{for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const L=log(w,d);if(L&&L.b)out[pid+':'+w+'-'+d]=L.b.map(a=>a.map(z=>[z.kg??null,z.r??null,z.rpe??null,!!z.ok]))}});return {sets:out,ok:totalOk(),bw:S.meta.bw,prog:S.meta.prog}};
module.exports={name:'Datensicherung – Herunterladen, Einspielen in Testkopie, ungültige Datei, CSV',async run({page,t}){
  const a=await page({width:390,height:844});
  await seed(a,6,{pids:['intro'],kg:100});await a.evaluate(()=>{S.meta.bw='83';saveMeta()});
  await a.evaluate(`(${CAP})()`);
  const before=await a.evaluate(`(${SNAP})()`);
  await a.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'backup'};render()});await a.click('[data-act="bkdl"]');await a.waitForTimeout(300);
  const file=await a.evaluate(()=>window.__dl);
  t.ok(file&&/sicherung/.test(file.filename)&&JSON.parse(file.data).schema==='intro-zyklus.backup/1','Sicherung erzeugt ('+(file&&file.filename)+')');
  await a.evaluate(()=>{S.ui.tdet={setup:'export'};render()});await a.click('[data-act="csv"]');await a.waitForTimeout(300);
  const csv=await a.evaluate(()=>window.__dl);const lines=csv?csv.data.trim().split('\n').length-1:0;
  const nsets=await a.evaluate(()=>{let n=0;for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const L=log(w,d);if(!L)continue;L.b.forEach(x=>x.forEach(s=>{if(pnum(s.kg)||pnum(s.r))n++}))}return n});
  t.ok(csv&&csv.filename.endsWith('.csv')&&lines===nsets,`CSV-Export: ${lines} Zeilen = ${nsets} eingetragene Sätze`);
  // Frische, getrennte Kopie (neuer Browser-Kontext ohne Daten)
  const b=await page({width:390,height:844});
  t.eq(await b.evaluate(()=>totalOk()),0,'Testkopie startet leer');
  await b.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'backup'};render()});
  // ungültige Datei: nichts ändert sich
  await b.setInputFiles('#bkfile',{name:'kaputt.json',mimeType:'application/json',buffer:Buffer.from('{"foo":1}')});await b.waitForTimeout(400);
  t.eq(await b.evaluate(()=>totalOk()),0,'Ungültige Datei abgelehnt, keine Teilübernahme');
  await b.setInputFiles('#bkfile',{name:file.filename,mimeType:'application/json',buffer:Buffer.from(file.data)});await b.waitForTimeout(600);
  const after=await b.evaluate(`(${SNAP})()`);
  t.eq(JSON.stringify(after.sets),JSON.stringify(before.sets),`Alle Sätze identisch wiederhergestellt (${before.ok} erledigt)`);
  t.ok(after.ok===before.ok&&after.bw===before.bw,'Einstellungen (Körpergewicht) übernommen');
  // nach Neuladen weiterhin vorhanden (dauerhaft gespeichert)
  await b.reload();await b.waitForTimeout(2500);
  t.eq(await b.evaluate(()=>totalOk()),before.ok,'Nach Neuladen weiterhin vorhanden');
  // zweites Einspielen ergänzt nichts doppelt
  await b.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'backup'};render()});
  await b.setInputFiles('#bkfile',{name:file.filename,mimeType:'application/json',buffer:Buffer.from(file.data)});await b.waitForTimeout(600);
  t.eq(await b.evaluate(()=>totalOk()),before.ok,'Erneutes Einspielen erzeugt keine Doppelungen');
  t.eq([...a.errors,...b.errors],[],'Keine Skriptfehler');
}};
