// Gym-Modus: Satz abhaken (Slider), Pause mit Auto-Timer, Rückgängig, Abschluss-Screen, Zusammenfassung.
module.exports={name:'Gym – Sätze, Pause, Abschluss, Zusammenfassung',async run({page,t}){
  const p=await page({width:390,height:797}); // iPhone 13 als installierte App (844 − Statusleiste)
  // Einheit vorbereiten: gestartet, Ablauf erledigt, alle Sätze bis auf den letzten abgehakt
  // Alle Sätze fertig außer dem ersten Satz der ersten Übung (Hauptübung mit RPE-Vorgabe)
  await p.evaluate(()=>{switchProg('intro');S.ui.w=0;S.ui.d=0;const L=log(0,0,true);L.start=Date.now()-3600e3;L.flow=1;L.ck=1;
    L.b.forEach((ar,b)=>ar.forEach(z=>{z.kg='80';z.r='7';z.rpe='6';z.ok=true}));L.b[0][0]={};saveLog(key(0,0));openGym()});
  await p.waitForTimeout(700);
  t.ok(await p.evaluate(()=>{const e=document.getElementById('ckin');return !e||e.hidden}),'Kein Ablauf mehr (bereits erledigt)');
  // Gym passt ohne Scrollen auf 393×759
  await p.evaluate(()=>{G.b=0;G.i=0;renderGym()});await p.waitForTimeout(600);
  const fit=await p.evaluate(()=>{const g=document.getElementById('gym');return [g.scrollHeight,g.clientHeight]});
  t.ok(fit[0]<=fit[1]+2,`Gym-Satzansicht ohne Scrollen auf iPhone 13 (${fit[0]} ≤ ${fit[1]})`);
  // Tippen auf den Slider löst nichts aus, nur Schieben (im Test: _ok)
  await p.evaluate(()=>{G.b=0;G.i=0;renderGym()});await p.waitForTimeout(300);
  t.ok(await p.$('#gym [data-rpe="7"]'),'RPE-Leiste für die Hauptübung sichtbar');
  await p.fill('#g-kg','80');await p.press('#g-kg','Tab');await p.waitForTimeout(150);
  await p.evaluate(()=>{const r=document.querySelector('#gym [data-rpe="7"]');if(r)r.click()});await p.waitForTimeout(150);
  t.eq(await p.evaluate(()=>{const z=log(0,0).b[0][0];return [pnum(z.kg),pnum(z.rpe)]}),[80,7],'Gewicht und RPE eingetragen');
  const before=await p.evaluate(()=>!!log(0,0).b[0][0].ok);
  await p.evaluate(()=>{const bt=document.querySelector('#gym .bigbtn');bt.click()});await p.waitForTimeout(300);
  const afterTap=await p.evaluate(()=>!!log(0,0).b[0][0].ok);
  t.eq([before,afterTap],[false,false],'Einfaches Tippen hakt nicht ab (Slider)');
  t.ok(await p.$('.slide, .sl-knob'),'Slider vorhanden');
  // Schieben (Test-Schalter) → letzter Satz → Abschluss-Screen nach kurzer Zeit
  await p.evaluate(()=>{const bt=document.querySelector('#gym .bigbtn');bt._ok=true;bt.click()});await p.waitForTimeout(2600);
  t.ok(await p.evaluate(()=>!!document.querySelector('#endq:not([hidden]) .end-len')),'Abschluss-Screen nach dem letzten Satz');
  t.ok(await p.evaluate(()=>document.querySelectorAll('[data-endv]').length===6),'6 Schwierigkeitsstufen');
  await p.click('[data-endv="4"]');await p.click('[data-endsave]');await p.waitForTimeout(600);
  t.eq(await p.evaluate(()=>{const L=log(0,0);return [L.done,L.diff,L.diffs,L.dur>0]}),[true,4,6,true],'Einheit abgeschlossen (done, Schwierigkeit, Dauer)');
  t.ok(await p.evaluate(()=>!!SV),'Zusammenfassung geöffnet');
  t.ok(await p.evaluate(()=>/Übersicht/.test(document.getElementById('svw')?.textContent||'')),'Zusammenfassung zeigt Übersicht');
  await p.evaluate(()=>{try{svClose()}catch(e){}try{endClose()}catch(e){}try{closeGym(true)}catch(e){}});await p.waitForTimeout(300);
  // Zweite Einheit: Pause nach abgehaktem Satz – Auto-Timer nach RPE-Stufe (Unterkörper, RPE 9 → 6:00)
  const exp=await p.evaluate(()=>{S.ui.w=0;S.ui.d=2;const d=P[0][2];const b=d.b.findIndex(x=>EX[x.e].m&&EX[x.e].g!=='bp'&&x.s>1&&!/8\s*[–-]\s*10/.test(x.x+(EX[x.e].t||'')));const L2=log(0,2,true);L2.start=Date.now()-600e3;L2.flow=1;L2.ck=1;d.b.forEach((bl,i)=>(L2.b[i]||[]).forEach(z=>{if(i<b){z.ok=true;z.kg='80';z.r='5';z.rpe='7'}}));L2.b[b][0]={kg:'100',r:'5',rpe:'9'};saveLog(key(0,2));openGym();G.b=b;G.i=0;renderGym();window.__b=b;return {b,sec:rtTiers('lower')[3]}});
  await p.waitForTimeout(500);
  t.ok(await p.evaluate(()=>!document.getElementById('gym').hidden&&G.b===window.__b),'Gym für die zweite Einheit offen');
  await p.evaluate(()=>{const bt=document.querySelector('#gym .bigbtn');bt._ok=true;bt.click()});await p.waitForTimeout(700);
  const rest=await p.evaluate(()=>({on:!!(T&&T.on),src:T&&T.src,sec:T&&Math.round((T.end-Date.now())/1000)}));
  t.ok(rest.on,'Pause läuft nach dem Abhaken');
  t.ok(Math.abs(rest.sec-exp.sec)<=3,`Auto-Timer Unterkörper RPE 9 → ${exp.sec} s (${rest.sec} s)`);
  t.ok(/Auto · Unterkörper · RPE 9/.test(rest.src||''),'Pausen-Quelle „Auto · Unterkörper · RPE 9“');
  // Rückgängig
  const undo=await p.evaluate(()=>{const u=document.querySelector('[data-undo]');if(!u)return null;const r=u.getBoundingClientRect();const v=getComputedStyle(u.closest('.undo,.toast')||u).visibility;u.click();return {h:r.height,v}});
  t.ok(undo&&undo.h>0,'Rückgängig-Hinweis erscheint '+JSON.stringify(undo));await p.waitForTimeout(300);t.ok(await p.evaluate(b=>!log(0,2).b[b][0].ok,exp.b),'Rückgängig nimmt das Abhaken zurück');
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}});
  // Abschluss über den großen Knopf, wenn alle Sätze fertig sind
  await p.evaluate(()=>{S.ui.w=0;S.ui.d=1;const L=log(0,1,true);L.start=Date.now()-600e3;L.flow=1;L.ck=1;P[0][1].b.forEach((bl,b)=>(L.b[b]||[]).forEach(z=>{z.ok=true;z.kg='60';z.r='5';z.rpe='7'}));saveLog(key(0,1));openGym();G.b=P[0][1].b.length-1;renderGym()});
  await p.waitForTimeout(400);
  t.ok(await p.$('[data-g="finish"]'),'„Training abschließen“ erscheint, wenn alles erledigt ist');
  await p.click('[data-g="finish"]');await p.waitForTimeout(500);
  t.ok(await p.evaluate(()=>!!document.querySelector('#endq:not([hidden]) .end-len')),'Abschluss-Screen über den Knopf');
  await p.evaluate(()=>{try{endClose()}catch(e){}try{closeGym(true)}catch(e){}});
}};
