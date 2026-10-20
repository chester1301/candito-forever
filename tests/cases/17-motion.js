// Bewegung: Sheets, Overlays und Ansichten nutzen dieselben Dauern und dieselbe Kurve; Zusammenfassung blendet nur beim Öffnen ein.
module.exports={name:'Bewegung – einheitliche Dauern und Kurve',async run({page,t}){
  const {seed}=require('../lib');
  const p=await page();await seed(p,2,{pids:['intro']});
  const tok=await p.evaluate(()=>{const c=getComputedStyle(document.documentElement);return ['--mo-1','--mo-2','--mo-3','--mo-ease'].map(k=>c.getPropertyValue(k).trim())});
  t.eq(tok,['.16s','.26s','.36s','cubic-bezier(.16,1,.3,1)'],'Bewegungs-Stufen definiert');
  const EASE='cubic-bezier(0.16, 1, 0.3, 1)';
  const an=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const c=getComputedStyle(e);return [c.animationDuration,c.animationTimingFunction]},sel);
  await p.evaluate(()=>openEx('pbb'));await p.waitForTimeout(100);
  t.eq(await an('#xsheet .sheet-in'),['0.26s',EASE],'Übungs-Sheet: mittel + Auslaufkurve');await p.evaluate(()=>closeEx());
  await p.evaluate(()=>{S.ui.w=0;S.ui.d=2;openGym();G.wu=true;renderGym()});await p.waitForTimeout(100);
  t.eq(await an('#gym .gp-in'),['0.26s',EASE],'Gym-Overlay: mittel + Auslaufkurve');await p.evaluate(()=>{G.wu=false;closeGym(true)});
  await p.evaluate(()=>{S.ui.tab='prog';S.ui.pd=null;render();document.getElementById('view').classList.add('enter')});
  t.eq(await an('#view.enter>*'),['0.36s',EASE],'Ansichtswechsel: lang + Auslaufkurve');
  await p.evaluate(()=>svOpen(PROG,0,1,false));await p.waitForTimeout(60);
  const a1=await p.evaluate(()=>[document.getElementById('svw').classList.contains('mo-in'),getComputedStyle(document.querySelector('#svw>.sv-in')).animationName]);
  t.eq(a1,[true,'hoch'],'Zusammenfassung blendet beim Öffnen ein');
  await p.waitForTimeout(600);await p.evaluate(()=>svOpen(PROG,0,0,false));await p.waitForTimeout(60);
  t.eq(await p.evaluate(()=>document.getElementById('svw').classList.contains('mo-in')),false,'Beim Blättern kein erneutes Einblenden');
}};
