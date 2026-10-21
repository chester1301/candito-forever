// Ruhetag-Seite: an trainingsfreien Tagen zeigt „Heute“ Countdown, nächste Einheit, Erholungs-Check (ohne Vorauswahl),
// Canditos Hinweise zur nächsten Einheit und den Wochenstand. An Trainingstagen erscheint sie nicht. Speichert nichts von selbst.
const {seed}=require('../lib');
module.exports={name:'Ruhetag-Seite – Heute an trainingsfreien Tagen',async run({page,t}){
  for(const W of [390,320]){
    const p=await page({width:W,height:844,fixedTime:'2026-10-19T08:30:00+02:00'});
    await seed(p,1,{pids:['intro']});
    await p.evaluate(()=>{switchProg('intro');S.ui.tab='home';S.ui.tdet={};render();scrollTo(0,0)});await p.waitForTimeout(200);
    const r=await p.evaluate(()=>{const c=document.querySelector('#view .rday');if(!c)return null;const n=nextSession();
      return {cd:c.querySelector('.rd-cd b').textContent,nx:c.querySelector('.rd-nx b').textContent,tips:[...c.querySelectorAll('.rd-tips li')].map(l=>l.textContent),
        info:(INFO[n.w+'-'+n.d]||[]).slice(0,2),rest:JSON.stringify(S.meta.rest||{}),btns:[...c.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return q.height>=44}),
        sw:document.scrollingElement.scrollWidth,before:!!(c.compareDocumentPosition(document.querySelector('#view .hero'))&Node.DOCUMENT_POSITION_FOLLOWING)}});
    if(!t.ok(r,`${W}px: Ruhetag-Karte vorhanden`)){await p.close();continue}
    t.eq(r.cd,'Morgen',`${W}px: Countdown bis zur nächsten Einheit`);
    t.ok(/Tag 3/.test(r.nx),`${W}px: nächste Einheit genannt (${r.nx})`);
    t.eq(r.tips,r.info,`${W}px: Hinweise wörtlich aus Canditos Tagesinfo`);
    t.eq(r.rest,'{}',`${W}px: nichts gespeichert, keine Antwort vorausgewählt`);
    t.ok(r.btns.every(Boolean)&&r.sw<=W+1&&r.before,`${W}px: Tippflächen ≥ 44 px, kein Überlauf, Karte über der Einheit`);
    await p.click('.rday [data-rdopen]');await p.waitForTimeout(200);
    t.ok(await p.evaluate(()=>!document.getElementById('ckin').hidden&&CK&&CK.rest===isoD(new Date())),`${W}px: Erholungs-Check öffnet den bestehenden Ruhetag-Check-in`);
    t.eq(p.errors,[],`${W}px: keine Skriptfehler`);await p.close();
  }
  const q=await page({width:390,height:844,fixedTime:'2026-10-20T08:30:00+02:00'});
  await q.evaluate(()=>{switchProg('intro');S.ui.tab='home';render()});await q.waitForTimeout(200);
  t.ok(!(await q.$('#view .rday')),'Trainingstag: keine Ruhetag-Karte');t.eq(q.errors,[],'Trainingstag: keine Skriptfehler');await q.close();
}};
