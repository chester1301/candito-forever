// Befunde aus der iPhone-Prüfliste (22.10.2026): −/+ gedrückt halten wiederholt, ±15 s baut den Gym nicht neu auf
// (kein Aufblitzen), Ton wird bei Berührung freigeschaltet, Wettkampf-Planer auch im Pausen-Modus erreichbar.
const {seed}=require('../lib');
module.exports={name:'iPhone-Befunde – Halten, ±15 s, Ton, Wettkampf in der Pause',async run({page,t}){
  const p=await page({width:390,height:844,fixedTime:'2026-10-20T17:00:00+02:00'});
  await p.evaluate(()=>{switchProg('intro');S.ui.w=0;S.ui.d=2;openGym()});await p.waitForTimeout(400);
  const lp=await p.evaluate(async()=>{const sel='#gym [data-step="kg"]:not([data-v^="-"])';const b=document.querySelector(sel);if(!b)return null;const inc=+b.dataset.v;
    const kg=()=>{const L=log(S.ui.w,S.ui.d,true);const z=L.b[G.b]&&L.b[G.b][G.i];return z&&z.kg!=null?pnum(z.kg):0};const k0=kg();
    b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await new Promise(r=>setTimeout(r,1200));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));
    const k1=kg();return {inc,k0,k1}});
  t.ok(lp&&lp.k1-lp.k0>=lp.inc*4,`Halten auf + wiederholt (${lp&&lp.k0} → ${lp&&lp.k1} kg)`);
  const add=await p.evaluate(()=>{startRest(120);const c=document.querySelector('#gym canvas,#gym .gym-in');const t0=T.total;addTime(15);addTime(-15);addTime(15);
    return {same:!!c&&c.isConnected,tot:T.total-t0}});
  t.ok(add.same&&add.tot===15,'±15 s ändert nur die Zeit, der Gym wird nicht neu aufgebaut');
  const au=await p.evaluate(()=>{S.meta.sound=true;actx=null;unlockAudio.done=0;document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return !!actx});
  t.ok(au,'Ton wird bei einer Berührung vorbereitet');
  await p.evaluate(()=>{stopRest();closeGym(true)});
  await seed(p,2,{pids:['intro']});
  await p.evaluate(()=>{pauseOn();S.ui.tab='home';S.ui.tdet={};render()});await p.waitForTimeout(200);
  const pz=await p.evaluate(()=>({tile:!!document.querySelector('#view [data-tdk="wkp"]'),card:!!document.querySelector('#view .pzcard'),wk:/Fortschritt, Zeit/.test(document.getElementById('view').textContent)}));
  t.ok(pz.tile&&pz.card&&!pz.wk,'Pausen-Modus: Kachel „Wettkampf“ unter den Pausen-Karten');
  await p.click('#view [data-tdk="wkp"]');await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>!!document.querySelector('#view .wkp [data-wkf="date"]')),'Pausen-Modus: Wettkampf-Planer öffnet');
  t.eq(p.errors,[],'keine Skriptfehler');await p.close();
}};
