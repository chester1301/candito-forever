// Readiness: eine Skala überall (Readiness-Karte, Erholung-Karte, Kachel), Zonen, Ruhetag, alte Einträge.
module.exports={name:'Readiness – Skala, Zonen, Karten, Ruhetag',async run({page,t,}){
  const {seed}=require('../lib');
  const p=await page({fixedTime:'2026-10-22T17:00:00+02:00'}); // fester Trainingstag (Do) – an Ruhetagen kommt der Ruhetag-Ring hinzu
  // Skala (Candito-Zonen)
  t.eq(await p.evaluate(()=>[1,3,3.7,4.4,4.8,5].map(v=>Math.round(jrMap(v)))),[0,50,62,74,85,100],'Ø 1/3/3,7/4,4/4,8/5 → 0/50/62/74/85/100');
  t.eq(await p.evaluate(()=>[40,55,65,80,90].map(v=>jrZone(v).n)),['Gefahrenzone','Fokus auf Erholung','Sweet Spot','Bestens bereit','Voll erholt'],'Zonen-Namen');
  // drei Einheiten mit Check-in (neue Kernfragen) + heutiger Check-in für die nächste Einheit
  t.eq(await seed(p,3,{pids:['intro']}),3,'3 Einheiten angelegt');
  await p.evaluate(()=>{switchProg('intro');const n=nextSession();const L=log(n.w,n.d,true);L.feel={sleeph:4,energy:5,food:4,strength:4};L.ckAt=Date.now();saveLog(key(n.w,n.d));S.ui.tab='home';render()});
  await p.waitForTimeout(400);
  const home=await p.evaluate(()=>({jr:document.querySelector('.card.jr .jr-v, .card.jr b')?.textContent,jrTxt:document.querySelector('.card.jr')?.textContent.replace(/\s+/g,' '),erh:[...document.querySelectorAll('.card.jr .erh-ring b')].map(x=>x.textContent),erhL:[...document.querySelectorAll('.card.jr .jr-ml b')].map(x=>x.textContent),heads:[...document.querySelectorAll('#view .hsec .sect')].map(x=>x.textContent),zone:document.querySelector('.card.jr .jr-z')?.textContent}));
  t.ok(/71\/100/.test(home.jrTxt),'Readiness-Karte: Ø 4,25 → 71');
  t.eq(home.erhL,['Recovery','Leistung'],'Zustand-Karte: Recovery und Leistung neben dem Readiness-Wert');
  const rg=await p.evaluate(()=>{const c=document.querySelector('.card.jr').getBoundingClientRect();const ring=document.querySelector('.card.jr .jr-ring');const n=ring.querySelector('.jr-num').getBoundingClientRect(),r=ring.getBoundingClientRect();
    const rows=[...document.querySelectorAll('.card.jr .jr-mr')].map(d=>{const b=d.getBoundingClientRect();return b.left>=c.left&&b.right<=c.right+1&&!!d.querySelector('.jr-mb')});return {inRing:n.left>=r.left&&n.right<=r.right&&n.top>=r.top&&n.bottom<=r.bottom,rows}});
  t.ok(rg.inRing&&rg.rows.length===2&&rg.rows.every(Boolean),'Zustand-Karte: Readiness-Wert im Ring, Recovery/Leistung als Zeilen in der Karte');
  t.eq(home.heads,['Woche'],'Heute-Ansicht: Readiness als Bühne ganz oben (ohne Zustand-Überschrift), dann Woche');
  t.eq(home.zone,'Sweet Spot','Überschrift = Candito-Zone');
  // Alte Einträge (frühere Fragen) werden weiter gerechnet
  const old=await p.evaluate(()=>{const L=log(0,0);L.feel={sleepq:3,energy:3,mood:3,strength:3,stress:3,food:3,hydra:3,push:3,pull:3,lback:3,post:3,quad:3};saveLog(key(0,0));const m=jrDays();const k=Object.keys(m).sort()[0];return m[k].v});
  t.eq(old,50,'Alter Check-in (12 Fragen, alles „mittel“) → 50');
  // Info-Sheet öffnet und schließt
  await p.click('[data-jrinfo]');await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>!document.getElementById('jrsheet').hidden&&/Sweet Spot/.test(document.getElementById('jrsheet').textContent)),'Info-Sheet mit Bereichen');
  await p.click('.jrs-x');await p.waitForTimeout(350);
  t.ok(await p.evaluate(()=>document.getElementById('jrsheet').hidden),'Info-Sheet geschlossen');
  // Ruhetag-Check-in: verkürzte Fragen, Skala identisch
  const rest=await p.evaluate(()=>{CK={rest:'2026-01-05'};const h=ckRestHTML();CK=null;return {hasSleep:/Wie lange hast du letzte Nacht geschlafen|Schlaf/.test(h),noUrine:!/Urinfarbe/.test(h),score:restScore({feel:{sleeph:4,food:4,strength:4,sore:4}})}});
  t.ok(rest.hasSleep&&rest.noUrine,'Ruhetag: Kernfragen, keine Urinfarbe mehr');
  t.eq(rest.score,67,'Ruhetag Ø 4 → 67 (gleiche Skala)');
  // Readiness & Leistung (Verlauf) erscheint ab 3 Einheiten mit Check-in
  await p.evaluate(()=>{S.ui.tab='prog';render()});await p.waitForTimeout(300);
  const hs=await p.$('.hs-go');if(hs){await hs.click();await p.waitForTimeout(400)}
  t.ok(await p.evaluate(()=>!/Ab 3 Einheiten mit Check-in/.test(document.querySelector('main')?.textContent||'')),'„Readiness & Leistung“ mit 3 Einheiten aktiv');
}};
