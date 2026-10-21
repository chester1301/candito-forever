// Verlauf & Zusammenfassung: Liste/Kalender, Karte je Einheit, Zusammenfassung mit Blättern, Belastung nachtragen, Fortsetzen.
module.exports={name:'Verlauf & Zusammenfassung',async run({page,t}){
  const {seed}=require('../lib');
  const p=await page();
  t.eq(await seed(p,4,{pids:['intro']}),4,'4 Einheiten angelegt');
  await p.evaluate(()=>{switchProg('intro');const L=log(0,1);delete L.diff;delete L.diffs;saveLog(key(0,1));S.ui.tab='prog';render()});await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>/4 Einheiten/.test(document.querySelector('[data-go-pd="verlauf"]')?.textContent||'')),'Einstieg „Verlauf & Kalender“ zeigt 4 Einheiten');
  await p.click('[data-go-pd="verlauf"]');await p.waitForTimeout(500);
  const hist=await p.evaluate(()=>({cards:document.querySelectorAll('.hs-c').length,chart:!!document.querySelector('.hs-chart, .hs-ch, svg'),periods:[...document.querySelectorAll('.hs-per button, .hs-range button')].map(b=>b.textContent)}));
  t.eq(hist.cards,4,'4 Karten im Verlauf');
  t.ok(hist.chart,'Volumen-Diagramm vorhanden');
  // Kalenderansicht umschalten
  await p.click('[data-hv="cal"]');await p.waitForTimeout(300);t.ok(await p.evaluate(()=>!!document.querySelector('.hs-cal')),'Kalenderansicht');await p.click('[data-hv="list"]');await p.waitForTimeout(200);
  // Zusammenfassung öffnen
  await p.evaluate(()=>svOpen(PROG,0,2,false));await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>!!SV&&!document.getElementById('svw').hidden),'Zusammenfassung geöffnet');
  const sv=await p.evaluate(()=>({tiles:document.querySelectorAll('#svw .sv-t').length,dur:[...document.querySelectorAll('#svw .sv-t')].map(x=>x.textContent).find(x=>/Trainingsdauer/.test(x))||'',ex:document.querySelectorAll('#svw .sv-x, #svw .sv-ex').length}));
  t.ok(sv.tiles>=4,'Übersicht-Kacheln');
  t.ok(/1:10 h/.test(sv.dur),'Dauer kompakt („1:10 h“)');
  // Teilen erzeugt eine Bildkarte mit Top-Sätzen, Dauer, Readiness, Belastung
  const card=await p.evaluate(()=>{const L=log(0,2);L.diff=4;L.diffs=6;L.feel={sleeph:4,energy:5,food:4,strength:4};saveLog(key(0,2));const o=svCard(svData(PROG,0,2));let n=0;const oc=document.createElement.bind(document);document.createElement=t=>{const el=oc(t);if(t==='canvas'){el.toBlob=()=>{n++}}return el};try{document.querySelector('[data-svshare]').click()}finally{document.createElement=oc}return {o,n}});
  t.eq(card.n,1,'„Teilen“ rendert die Einheit als Bild');
  t.ok(card.o.lines.length>=1&&card.o.lines.every(l=>/kg × \d+/.test(l[1])),'Bildkarte: Top-Satz je Übung (kg × Wdh @ RPE)');
  t.ok(/Dauer 1:10 h/.test(card.o.meta)&&/Belastung/.test(card.o.meta)&&/Sweet Spot/.test(card.o.chip),'Bildkarte: Dauer, Belastung, Readiness-Zone');
  // Blättern
  await p.click('[data-svgo]');await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>SV&&(SV.d!==2||SV.w!==0)),'Blättern zur nächsten Einheit');
  // Belastung nachtragen (Einheit ohne Schwierigkeit)
  await p.evaluate(()=>{svClose();svOpen(PROG,0,1,false)});await p.waitForTimeout(400);
  t.ok(await p.$('[data-svrate]'),'„Belastung nachtragen“ bei fehlender Schwierigkeit');
  await p.click('[data-svrate]');await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>document.querySelectorAll('#svw [data-svdv]').length===6),'Schwierigkeits-Abfrage (6 Stufen) in der Zusammenfassung');
  await p.click('#svw [data-svdv="5"]');await p.waitForTimeout(150);await p.click('#svw [data-svrsave]');await p.waitForTimeout(500);
  t.eq(await p.evaluate(()=>[log(0,1).diff,log(0,1).diffs,log(0,1).done]),[5,6,true],'Schwierigkeit nachgetragen, Einheit bleibt abgeschlossen');
  // Fortsetzen öffnet die Einheit wieder im Gym
  await p.evaluate(()=>{if(!SV)svOpen(PROG,0,1,false)});await p.waitForTimeout(300);
  await p.click('[data-svresume]');await p.waitForTimeout(600);
  t.ok(await p.evaluate(()=>!document.getElementById('gym').hidden&&!log(0,1).done),'Fortsetzen: Gym offen, Einheit wieder offen');
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}});
  // Wochenbericht teilen erzeugt ein Bild
  await p.evaluate(()=>{S.ui.tab='prog';render()});await p.waitForTimeout(300);
  if(await p.$('[data-go-pd="verlauf"]')){await p.click('[data-go-pd="verlauf"]');await p.waitForTimeout(300)}
  t.ok(await p.evaluate(()=>!!document.querySelector('[data-wkshare]')),'„Wochenbericht teilen“ vorhanden');
}};
