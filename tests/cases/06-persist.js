// Speicherung: Sätze und Einstellungen überleben sofortiges Neuladen; Wiederherstellung aus IndexedDB.
module.exports={name:'Speicherung – Neuladen, Einstellungen, IndexedDB-Wiederherstellung',async run({page,t}){
  const p=await page();
  // 1) Satz abhaken, Log sofort neu laden (IndexedDB-Puffer 700 ms noch nicht geschrieben)
  await p.evaluate(()=>{switchProg('intro');const L=log(0,0,true);L.b[0][0]={ok:true,kg:'100',r:'5',rpe:'8'};saveLog(key(0,0))});await p.waitForTimeout(1200);
  await p.evaluate(()=>{const L=log(0,0);L.b[0][0].kg='102.5';L.b[0][1]={ok:true,kg:'102.5',r:'5',rpe:'8.5'};L.note='Testnotiz';saveLog(key(0,0))});await p.waitForTimeout(120);
  await p.reload();await p.waitForTimeout(3000);
  t.eq(await p.evaluate(()=>{const L=log(0,0);return [L.b[0][0].kg,L.b[0][1].kg,L.note]}),['102.5','102.5','Testnotiz'],'Sätze und Notiz nach sofortigem Neuladen erhalten');
  // 2) Einstellungen ändern und sofort neu laden (mit vorhandenen Logs – Regression vom 20.10.)
  await p.evaluate(()=>{S.meta.inv={20:4,10:2};S.meta.autoT=false;S.meta.restTiers={lower:[240,240,300,360],upper:[180,180,240,300]};saveMeta()});await p.waitForTimeout(120);
  await p.reload();await p.waitForTimeout(3000);
  t.eq(await p.evaluate(()=>[JSON.stringify(S.meta.inv),S.meta.autoT,JSON.stringify(S.meta.restTiers.upper)]),['{"10":2,"20":4}',false,'[180,180,240,300]'],'Einstellungen nach sofortigem Neuladen erhalten');
  // 3) localStorage weg (z. B. von iOS geräumt) → alles aus IndexedDB zurück
  await p.waitForTimeout(1200);
  await p.evaluate(()=>localStorage.removeItem('intro-zyklus-v1'));
  await p.reload();await p.waitForTimeout(3000);
  t.eq(await p.evaluate(()=>{const L=log(0,0);return [L&&L.b[0][0].kg,JSON.stringify(S.meta.inv),S.meta.autoT]}),['102.5','{"10":2,"20":4}',false],'Wiederherstellung aus IndexedDB');
  // 4) Timer überlebt Neuladen (absolute Endzeit)
  await p.evaluate(()=>{startRest(240,'Test')});await p.waitForTimeout(300);
  const end1=await p.evaluate(()=>T.end);
  await p.reload();await p.waitForTimeout(3000);
  t.eq(await p.evaluate(()=>[!!T.on,T.end]),[true,end1],'Pausen-Timer läuft nach Neuladen weiter');
  await p.evaluate(()=>{try{stopRest()}catch(e){}});
}};
