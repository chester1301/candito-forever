// Programmbibliothek – kompletter Ablauf bis zur gespeicherten Einheit: Import → Auswahl → alle Sätze im Gym → Einheit abschließen
// → Neustart → Verlauf/Fortschritt; Zusammenspiel mit der Candito-Planung (Heute, Kalender-Automatik, Ende des Programms);
// Speichergrenze von localStorage (Bibliothek bleibt über IndexedDB erhalten). Testdaten frei erfunden.
const fs=require('fs'),path=require('path');const {seed}=require('../lib');
module.exports={name:'Programmbibliothek – Ablauf bis zur gespeicherten Einheit, Neustart, Candito-Planung, Speichergrenze',async run({page,t,root}){
  const fx=n=>fs.readFileSync(path.join(root,'tests','fixtures','bib',n));
  const p=await page({width:390,height:844});await seed(p,4,{pids:['intro'],kg:100});
  const ord0=await p.evaluate(()=>JSON.stringify([ORD(),PROGS.intro.P.map(w=>w.map(d=>d.b.map(b=>[b.e,b.s,b.r,b.rpe,b.pct])))]));
  await p.evaluate(()=>bibOpen());await p.setInputFiles('#bbfile',{name:'gym-programm.json',mimeType:'application/json',buffer:fx('gym-programm.json')});
  await p.waitForFunction(()=>{const h=document.querySelector('#bibv .bb-ph h2');return h&&h.textContent!=='Import läuft'},null,{timeout:20000});
  await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
  await p.fill('#bibv [data-bbrm$="|BP"]','100');await p.evaluate(()=>{document.querySelector('#bibv [data-bbrm$="|BP"]').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#bibv [data-bbstartgo]').click()});await p.waitForTimeout(200);
  const cid=await p.evaluate(()=>PROG);
  // alle Sätze von Woche 1 · Tag 1 im Gym buchen (Gewichte eingetragen, RPE wie ein Nutzer im letzten Satz)
  const sets=await p.evaluate(async()=>{S.ui.w=0;S.ui.d=0;render();openGym();const tot=P[0][0].b.reduce((a,b)=>a+b.s,0);let n=0;
    for(let b=0;b<P[0][0].b.length;b++)for(let i=0;i<P[0][0].b[b].s;i++){const L=log(0,0,true);L.b[b][i].kg=b===0?100:75;L.b[b][i].r=b===0?5:6;if(i===P[0][0].b[b].s-1)L.b[b][i].rpe=b===0?7:8;saveLog(key(0,0));G.b=b;G.i=i;renderGym();
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));try{stopRest();closeSheet()}catch(e){}const btn=document.querySelector('#gym [data-g="log"]');if(btn){btn._ok=true;btn.click();n++}await new Promise(r=>setTimeout(r,60));try{stopRest();closeSheet()}catch(e){}}
    const L=log(0,0);return {tot,n,ok:L.b.flat().filter(z=>z.ok).length,rpe:L.b.map(a=>a.map(z=>z.rpe??null))}});
  t.ok(sets.ok===sets.tot&&sets.tot===6,`Alle ${sets.tot} Sätze gebucht (${sets.ok})`);
  t.eq(sets.rpe,[[null,null,7],[null,null,8]],'RPE nur dort, wo der Nutzer ihn eingetragen hat (nicht vorbelegt)');
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}endOpen(0,0)});await p.waitForTimeout(150);await p.click('[data-endv="3"]');await p.waitForTimeout(80);
  await p.evaluate(()=>document.querySelector('[data-endsave]').click());await p.waitForTimeout(500);
  const done=await p.evaluate(c=>{const L=S.logs[c+'-w1d1'];return {done:!!(L&&L.done),st:withProg(c,()=>dayStatus(0,0)),pd:phaseDone(c)}},cid);
  t.ok(done.done&&done.st==='done'&&done.pd.n===1&&done.pd.t===3,`Einheit abgeschlossen und gespeichert (Fortschritt ${done.pd.n}/${done.pd.t})`);
  // Neustart: alles noch da, nächste Einheit gewählt, Verlauf
  await p.reload();await p.waitForTimeout(2800);
  const rs=await p.evaluate(c=>{const L=S.logs[c+'-w1d1'];const H=withProg(c,()=>{S.ui.w=2;return exHistory('csq').filter(h=>h.pid===c)});
    return {prog:PROG,done:!!(L&&L.done),kg:L&&L.b[0].map(z=>+z.kg),act:S.meta.lib.act,head:!!document.querySelector(`#progsw [data-prog="${c}"]`),hist:H.length&&H[0].top.kg}},cid);
  t.ok(rs.prog===cid&&rs.done&&rs.act===cid&&rs.head&&JSON.stringify(rs.kg)==='[100,100,100]'&&rs.hist===100,'Nach Neustart: Programm aktiv, abgeschlossene Einheit mit Gewichten gespeichert, Verlauf vorhanden');
  // Candito-Planung: Heute/Training/Progress zeigen ohne Fehler, Kalender-Automatik bleibt beim aktiven Zusatzprogramm, nach dem Ende zurück zur Phase
  const cp=await p.evaluate(()=>{const r={};['home','train','prog','coach','setup'].forEach(tb=>{S.ui.tab=tb;try{render();r[tb]=true}catch(e){r[tb]=String(e)}});r.auto=autoProg();BIB.end();r.after=PROG;r.autoAfter=autoProg();r.inOrd=ORD().includes(r.auto);return r});
  t.ok(cp.home===true&&cp.train===true&&cp.prog===true&&cp.coach===true&&cp.setup===true,'Heute, Training, Progress, Coach und Einstellungen funktionieren mit aktivem Bibliotheksprogramm');
  t.ok(cp.auto===cid&&!cp.inOrd&&cp.after!==cid&&ORD_OK(cp.autoAfter),`Kalender-Automatik: aktiv → ${cp.auto===cid?'Bibliothek':cp.auto}, nach „Beenden“ → ${cp.autoAfter}`);
  function ORD_OK(x){return ['intro','p8','p10','p8b','p10b','p8c','p10c','p3','p10w','p10d'].includes(x)}
  t.ok(await p.evaluate(o=>JSON.stringify([ORD(),PROGS.intro.P.map(w=>w.map(d=>d.b.map(b=>[b.e,b.s,b.r,b.rpe,b.pct])))])===o,ord0),'Jahresplan und Candito-Vorgaben unverändert');
  // Speichergrenze: localStorage voll → Bibliothek bleibt (Arbeitsspeicher + IndexedDB) und kommt nach Neustart zurück
  const q=await p.evaluate(async()=>{const fill=[];try{for(let i=0;i<400;i++){localStorage.setItem('__fill'+i,'x'.repeat(250000));fill.push(i)}}catch(e){}
    const L=BIB.load();L.progs.push(Object.assign(JSON.parse(JSON.stringify(L.progs[0])),{id:'bquota',name:'Speichertest',notes:'y'.repeat(400000)}));const ok=BIB.save(L);
    const n=BIB.load().progs.length;await new Promise(r=>setTimeout(r,500));const m=await db.doc('bib/lib').get();return {ok,n,idb:m.exists&&m.data().data.progs.length,fill:fill.length}});
  t.ok(q.ok&&q.n===2&&q.idb===2,`Speichergrenze erreicht: Bibliothek bleibt verfügbar (${q.n} Programme, IndexedDB ${q.idb})`);
  await p.evaluate(()=>{Object.keys(localStorage).filter(k=>k.startsWith('__fill')).forEach(k=>localStorage.removeItem(k))});
  await p.reload();await p.waitForTimeout(3200);
  t.eq(await p.evaluate(()=>BIB.load().progs.map(x=>x.name).sort()),['Speichertest','Testprogramm Gym'],'Nach Neustart aus IndexedDB wiederhergestellt');
  t.eq(p.errors,[],'Keine Skriptfehler');
}};
