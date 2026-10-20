// Verlauf & Zusammenfassung: Liste/Kalender, Karte je Einheit, Zusammenfassung mit Blättern, Belastung nachtragen, Fortsetzen.
module.exports={name:'Verlauf & Zusammenfassung',async run({page,t}){
  const {seed}=require('../lib');
  const p=await page();
  t.eq(await seed(p,4,{pids:['intro']}),4,'4 Einheiten angelegt');
  await p.evaluate(()=>{switchProg('intro');const L=log(0,1);delete L.diff;delete L.diffs;saveLog(key(0,1));S.ui.tab='prog';render()});await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>/4 Einheiten/.test(document.querySelector('.hs-go')?.textContent||'')),'Einstieg „Verlauf & Kalender“ zeigt 4 Einheiten');
  await p.click('.hs-go');await p.waitForTimeout(500);
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
  if(await p.$('.hs-go')){await p.click('.hs-go');await p.waitForTimeout(300)}
  t.ok(await p.evaluate(()=>!!document.querySelector('[data-wkshare]')),'„Wochenbericht teilen“ vorhanden');
}};
