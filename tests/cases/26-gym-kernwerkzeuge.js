// Gym-Kernwerkzeuge (Interaktion, nicht nur Optik): Doppelbuchungsschutz, RPE nie vorbelegt, Warm-up abhaken/schließen/
// wieder öffnen, RPE-Planer beide Modi, Pausentimer (−15/+15, Schnellzeit, Pause, beenden), Übungsinfo-Tabs, Verlauf, Abschluss.
const {seed}=require('../lib');
module.exports={name:'Gym-Kernwerkzeuge – Satz, Warm-up, RPE-Planer, Timer, Info, Verlauf, Abschluss',async run({page,t}){
  const p=await page({width:390,height:844});
  await seed(p,4,{pids:['intro'],kg:100});
  await p.evaluate(()=>{switchProg('intro');S.ui.tab='train';S.ui.w=0;S.ui.d=3;const L=log(0,3,true);L.done=false;L.b.forEach(a=>a.forEach(z=>{z.ok=false;z.rpe=null;z.kg=null;z.r=null}));L.wu=null;saveLog(key(0,3));render();openGym();G.b=0;G.i=0;G.wu=false;renderGym()});
  await p.waitForTimeout(300);
  // 1) RPE leer beim Start eines Satzes
  t.ok(await p.evaluate(()=>{const s=log(0,3).b[0][0];return s.rpe==null&&!document.querySelector('#gym .rpe1 [aria-pressed="true"]')}),'Satz 1: RPE leer, nichts vorausgewählt');
  // 2) Doppeltipp auf „Erledigt“ bucht genau einen Satz
  // Wischabschluss zweimal unmittelbar hintereinander auslösen (wie es der Schieberegler nach dem Wischen tut)
  await p.evaluate(()=>{const b=document.querySelector('#gym [data-g="log"]');b._ok=true;b.click();const b2=document.querySelector('#gym [data-g="log"]');if(b2){b2._ok=true;b2.click()}});await p.waitForTimeout(250);
  const d1=await p.evaluate(()=>({ok:log(0,3).b[0].filter(z=>z.ok).length,i:G.i}));
  t.ok(d1.ok===1&&d1.i===1,`Doppeltipp: genau 1 Satz gebucht, weiter zu Satz 2 (${JSON.stringify(d1)})`);
  try{await p.evaluate(()=>{try{stopRest()}catch(e){}try{closeSheet()}catch(e){}})}catch(e){}
  t.ok(await p.evaluate(()=>{const s=log(0,3).b[0][1];return s.rpe==null&&!document.querySelector('#gym .rpe1 [aria-pressed="true"]')}),'Satz 2: RPE wieder leer (keine Übernahme aus Satz 1)');
  await p.waitForTimeout(700);
  // 3) Warm-up: abhaken, schließen, wieder öffnen
  await p.evaluate(()=>{G.wu=true;renderGym()});await p.waitForTimeout(150);
  const w1=await p.evaluate(()=>({n:document.querySelectorAll('#gym [data-gwu]').length,emp:/Empfehlung/.test(document.querySelector('#gym').textContent)}));
  t.ok(w1.n>=2&&w1.emp,`Warm-up: ${w1.n} Aufwärmsätze, als Empfehlung gekennzeichnet`);
  await p.click('#gym [data-gwu="1"]');await p.waitForTimeout(100);
  const pressed=()=>p.evaluate(()=>{const b=document.querySelector('#gym [data-gwu="1"]');return b&&(b.getAttribute('aria-pressed')==='true'||b.classList.contains('on')||b.classList.contains('done'))});
  const on1=await pressed();
  await p.click('#gym [data-gwuclose]');await p.waitForTimeout(100);
  t.ok(await p.evaluate(()=>!G.wu&&!document.querySelector('#gym [data-gwu]')),'Warm-up schließt');
  await p.evaluate(()=>{G.wu=true;renderGym()});await p.waitForTimeout(100);
  t.ok(on1&&await pressed(),'Abgehakter Aufwärmsatz bleibt nach erneutem Öffnen abgehakt');
  await p.evaluate(()=>{G.wu=false;renderGym()});
  // 4) RPE-Planer: beide Modi
  await p.evaluate(()=>{rpOpenGym();renderGym()});await p.waitForTimeout(150);
  await p.click('#gym [data-rp="mode|max"]');await p.waitForTimeout(80);const m1=await p.evaluate(()=>JSON.stringify(rpState()));
  await p.click('#gym [data-rp="mode|satz"]');await p.waitForTimeout(80);const m2=await p.evaluate(()=>JSON.stringify(rpState()));
  t.ok(m1!==m2&&/max/.test(m1)&&/satz/.test(m2),'RPE-Planer: „Aus dem 1RM“ und „Aus einem Satz“ umschaltbar');
  t.ok(await p.evaluate(()=>/Empfehlung|Schätzung/.test(document.querySelector('#gym .rpo').textContent)),'RPE-Planer: Ergebnis als Empfehlung/Schätzung gekennzeichnet');
  t.ok(await p.evaluate(()=>log(0,3).b[0][1].kg==null||log(0,3).b[0][1].kg===''),'RPE-Planer ändert ohne „Übernehmen“ nichts am Satz');
  await p.evaluate(()=>{G.rpo=false;renderGym()});
  // 5) Pausentimer
  await p.evaluate(()=>{startRest(240,{w:0,d:3,b:0,i:1});openSheet()});await p.waitForTimeout(150);
  const e0=await p.evaluate(()=>T.end);await p.click('#sheet [data-t="add"][data-v="-15"]');const e1=await p.evaluate(()=>T.end);
  await p.click('#sheet [data-t="add"][data-v="15"]');await p.click('#sheet [data-t="add"][data-v="15"]');const e2=await p.evaluate(()=>T.end);
  t.ok(e0-e1===15000&&e2-e1===30000,'Timer: −15 s / +15 s');
  await p.click('#sheet [data-t="preset"][data-v="60"]');t.ok(await p.evaluate(()=>T.total===60),'Timer: Schnellzeit 1:00');
  await p.click('#sheet [data-t="pause"]');t.ok(await p.evaluate(()=>T.paused===true),'Timer: Pause');
  await p.click('#sheet [data-t="pause"]');t.ok(await p.evaluate(()=>T.paused===false),'Timer: Fortsetzen');
  t.ok(await p.evaluate(()=>/Als Nächstes|Nächste/i.test(document.getElementById('sheet').textContent)),'Timer: Vorschau auf den nächsten Satz');
  await p.evaluate(()=>{const b=document.querySelector('#sheet [data-t="skip"]:not([data-sl])')||document.querySelector('#sheet [data-t="skip"]');b.click()});await p.waitForTimeout(150);
  t.ok(await p.evaluate(()=>!T.on),'Timer: Pause beenden');
  try{await p.evaluate(()=>closeSheet())}catch(e){}
  // 6) Übungsinfo: alle Tabs
  await p.evaluate(()=>exInfoOpen('v'));await p.waitForTimeout(150);
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('#gxi [data-gxt],#gxi [role="tab"]')].map(b=>b.textContent.trim()));
  t.ok(['Vorgaben','Ausführung','Hinweise'].every(x=>tabs.some(y=>y.includes(x))),'Übungsinfo: Tabs Vorgaben / Ausführung / Hinweise ('+tabs.join(', ')+')');
  await p.evaluate(()=>exInfoClose());
  // 7) Verlauf
  await p.evaluate(()=>{G.hi=true;renderGym()});await p.waitForTimeout(100);
  t.ok(await p.evaluate(()=>/Verlauf/.test(document.querySelector('#gym').textContent)&&!!document.querySelector('#gym [data-hiclose],#gym .gp-close,#gym [data-gplan="0"]')),'Übungsverlauf öffnet mit Rückweg');
  await p.evaluate(()=>{G.hi=false;renderGym();closeGym(true)});
  // 8) Abschluss: Speichern erst nach Schwierigkeit
  await p.evaluate(()=>endOpen(0,3));await p.waitForTimeout(150);
  const a1=await p.evaluate(()=>{const b=document.querySelector('[data-endsave]');return b.disabled||b.getAttribute('aria-disabled')==='true'||b.classList.contains('off')});
  await p.click('[data-endv="3"]');await p.waitForTimeout(80);
  const a2=await p.evaluate(()=>{const b=document.querySelector('[data-endsave]');return !(b.disabled||b.getAttribute('aria-disabled')==='true'||b.classList.contains('off'))});
  t.ok(a1&&a2,'Abschluss: „Training abschließen“ erst nach Schwierigkeits-Angabe aktiv');
  await p.evaluate(()=>{try{endClose()}catch(e){}});
  t.eq(p.errors,[],'Keine Skriptfehler');
}};
