// Start-Ablauf: Training starten → Aufwärmen → Readiness-Check-in (4 Kernfragen) → Gym.
module.exports={name:'Start-Ablauf – Aufwärmen, Check-in, Gym',async run({page,t}){
  const p=await page();
  await p.evaluate(()=>{switchProg('intro');S.ui.tab='train';S.ui.w=0;S.ui.d=3;const L=log(0,3,true);delete L.start;delete L.flow;delete L.ck;saveLog(key(0,3));render();openGym()});
  await p.waitForTimeout(500);
  t.ok(await p.$('[data-sstart]'),'Start-Knopf im Gym sichtbar');
  await p.click('[data-sstart]');await p.waitForTimeout(500);
  // Übersicht „So läuft es ab“: 1 Aufwärmen → 2 Check-in → 3 Gym, jeder Schritt erst nach dem vorherigen
  t.eq(await p.evaluate(()=>document.querySelector('#ckin .fl-h')?.textContent),'So läuft es ab','Übersicht erscheint zuerst');
  t.eq(await p.evaluate(()=>[...document.querySelectorAll('#ckin .fo-s')].map(b=>b.disabled)),[false,true,true],'Schritt 2 und 3 gesperrt');
  t.ok(await p.evaluate(()=>!document.querySelector('#ckin [data-ckskip]')),'Kein Überspringen im Ablauf');
  await p.click('#ckin [data-ckovgo="1"]');await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>document.querySelector('#ckin .fl-h')?.textContent),'Aufwärmen','Schritt 1: Aufwärmen');
  t.ok(await p.evaluate(()=>document.querySelector('#ckin [data-ckstep="1"]').disabled),'Weiter erst, wenn alles abgehakt ist');
  // Oberkörper-Tag → Oberkörper-Routine automatisch
  const side=await p.evaluate(()=>{const b=document.querySelector('#ckin [data-wuside][aria-pressed="true"]');return b?b.dataset.wuside:null});
  t.eq(side,'up','Oberkörper-Routine automatisch gewählt (Tag 4 = Bank-Tag)');
  const nWu=await p.evaluate(()=>document.querySelectorAll('#ckin [data-wuck]').length);
  t.eq(nWu,6,'6 Aufwärmübungen');
  for(let i=0;i<6;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('#ckin [data-wuck]')].find(x=>x.getAttribute('aria-pressed')!=='true');if(b)b.click()});await p.waitForTimeout(80)}
  t.eq(await p.evaluate(()=>document.querySelector('#ckin .fl-n')?.textContent),'6/6','Alle Aufwärmübungen abgehakt');
  await p.click('[data-ckstep="1"]');await p.waitForTimeout(400);
  t.eq(await p.evaluate(()=>document.querySelector('#ckin .fl-h')?.textContent),'Readiness-Check-in','Check-in folgt');
  t.eq(await p.evaluate(()=>[...document.querySelectorAll('#ckin .ck-sc > .ckqc .ckq')].map(x=>x.textContent)),
    ['Wie lange hast du letzte Nacht geschlafen?','Wie motiviert bist du fürs Training?','Kalorienaufnahme in den letzten 24 Stunden?','Wie ist dein Kraft- & Erholungslevel?'],'Vier Kernfragen');
  t.ok(await p.evaluate(()=>document.querySelector('#ckin [data-ckgo]').disabled),'Training starten erst nach allen 4 Kernfragen');
  for(const v of ['sleeph|3','energy|4','food|3','strength|4']){await p.click(`#ckin [data-ck="${v}"]`);await p.waitForTimeout(80)}
  t.eq(await p.evaluate(()=>document.querySelector('#ckin .fl-n')?.textContent),'4/4','Zähler 4/4');
  t.eq(await p.evaluate(()=>log(0,3).feel),{sleeph:3,energy:4,food:3,strength:4},'Antworten gespeichert');
  // Verletzung Ja → Lift-Fragen; optionale Abschnitte bleiben beim Antworten offen
  await p.click('#ckin [data-ckinj="1"]');await p.waitForTimeout(200);
  t.eq(await p.evaluate(()=>[log(0,3).inj,document.querySelectorAll('#ckin .ck-sub').length]),[1,3],'Verletzung → Bereitschaft je Lift');
  await p.click('#ckin [data-ckinj="0"]');await p.waitForTimeout(200);
  await p.evaluate(()=>{document.querySelector('#ckin details[data-ckopt="sore"]').open=true});await p.waitForTimeout(100);
  await p.click('#ckin [data-ck="push|4"]');await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>document.querySelector('#ckin details[data-ckopt="sore"]').open),'Muskelkater-Abschnitt bleibt offen');
  t.eq(await p.evaluate(()=>log(0,3).feel.push),4,'Muskelkater gespeichert');
  await p.click('[data-ckgo]');await p.waitForTimeout(700);
  t.ok(await p.evaluate(()=>!document.getElementById('gym').hidden&&document.getElementById('ckin').hidden),'Gym geöffnet, Check-in geschlossen');
  t.ok(await p.evaluate(()=>{const L=log(0,3);return !!L.start&&L.flow===1&&L.ck===1}),'Einheit gestartet (start, flow, ck)');
  // Readiness-Wert aus dem Check-in: Ø 3,5 → 59
  t.eq(await p.evaluate(()=>Math.round(jrMap(3.5))),59,'Ø 3,5 → 59 auf der Readiness-Skala');
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}});
  // Erneutes Öffnen überspringt den Ablauf (flow gesetzt)
  await p.evaluate(()=>openGym());await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>document.getElementById('ckin').hidden),'Ablauf erscheint beim erneuten Öffnen nicht noch einmal');
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}});
}};
