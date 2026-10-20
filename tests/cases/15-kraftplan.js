// Progress › Kraft: e1RM über den Jahresplan mit Phasen-Bändern, Testtagen und Bestwerten.
module.exports={name:'Kraft über die Phasen – Bänder, Testtage, Bestwerte',async run({page,t}){
  const p=await page({fixedTime:'2027-03-05T17:00:00+01:00'});
  // Einheiten in Intro, 8 Week und 10RM mit steigender Last
  await p.evaluate(()=>{let n=0;['intro','p8','p10'].forEach(pid=>withProg(pid,()=>{for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const dt=dayDate(w,d);if(!dt||dt>new Date())continue;const L=log(w,d,true);
    P[w][d].b.forEach((bl,b)=>(L.b[b]||[]).forEach(z=>{z.ok=true;z.kg=String(100+n*2.5);z.r='3';z.rpe='8'}));L.done=true;L.date=new Date(+dt+18*36e5).toISOString();saveLog(key(w,d));n++}}));
    S.ui.tab='prog';S.ui.pd='kraft';render()});
  await p.waitForTimeout(400);
  const d=await p.evaluate(()=>{const {pts,ph}=krPlanData();return {n:pts.sq.length,pr:pts.sq.filter(x=>x.pr).length,first:pts.sq[0]&&pts.sq[0].pr,ph:ph.length,
    bands:document.querySelectorAll('.kp-ch rect[height="3"]').length,tests:document.querySelectorAll('.kp-ch .kp-test').length,now:!!document.querySelector('.kp-ch .kp-now'),prDots:document.querySelectorAll('.kp-ch .kp-pr').length}});
  t.ok(d.n>10,`Kniebeuge-Punkte über mehrere Phasen (${d.n})`);
  t.ok(d.first===false&&d.pr===d.n-1,'Steigende Last: jeder Punkt nach dem ersten ist ein neuer Bestwert, der erste nicht');
  t.ok(d.bands>=4&&d.bands<d.ph,`„Bis jetzt“: Bänder bis zur laufenden Phase (${d.bands} von ${d.ph})`);
  t.ok(d.tests>=3,'Testtage als Linien');t.ok(d.now,'„heute“-Markierung');t.ok(d.prDots>=d.pr,'Bestwerte hervorgehoben');
  await p.click('[data-kr="all"]');await p.waitForTimeout(250);
  t.eq(await p.evaluate(()=>[S.ui.krAll,document.querySelectorAll('.kp-ch rect[height="3"]').length]),[true,d.ph],'„Ganzer Plan“ zeigt alle Phasen');
  t.ok(await p.evaluate(()=>/Canditos Vorgaben bleiben unverändert/.test(document.querySelector('.kp').textContent)),'Als reine Auswertung gekennzeichnet');
}};
