// Wettkampf-Planer (Kachel „Wettkampf“ auf Heute): Datum/Name speichern, Countdown, Versuche als Empfehlung (≈90/95/100 % e1RM),
// nichts automatisch übernommen, eigener Plan + Scheiben, Aufwärmen mit Uhrzeit, Warnung bei sinkender Last, Layout 390/320.
const {seed}=require('../lib');
module.exports={name:'Wettkampf-Planer – Datum, Versuche, Aufwärmen',async run({page,t}){
  for(const W of [390,320]){
    const p=await page({width:W,height:844,fixedTime:'2026-10-21T17:00:00+02:00'});
    await seed(p,6,{pids:['intro'],kg:110});
    await p.evaluate(()=>{switchProg('intro');S.ui.tab='home';S.ui.tdet={};render();scrollTo(0,0)});await p.waitForTimeout(200);
    t.ok(/Datum eintragen/.test(await p.textContent('[data-tdk="wkp"]')),`${W}px: Kachel „Wettkampf“ ohne Datum`);
    await p.click('[data-tdk="wkp"]');await p.waitForTimeout(200);
    const r0=await p.evaluate(()=>({own:[...document.querySelectorAll('[data-wka]')].map(i=>i.value),rec:document.querySelectorAll('.wkp .wk-al .et').length,comp:S.meta.comp||null,base:wkBase('sq')}));
    t.eq(r0.own,['','',''],`${W}px: eigene Versuche leer – nichts vorbelegt`);
    t.ok(r0.rec===3&&r0.comp===null,`${W}px: drei Empfehlungen, nichts gespeichert`);
    for(const [sel,v] of [['[data-wkf="date"]','2026-11-14'],['[data-wkf="name"]','Testmeisterschaft'],['[data-wkt="sq"]','10:40']]){await p.fill(sel,v);await p.dispatchEvent(sel,'change');await p.waitForTimeout(150)}
    await p.click('[data-wkadopt="sq"]');await p.waitForTimeout(150);
    const r1=await p.evaluate(()=>{const b=wkBase('sq');return {c:S.meta.comp,exp:[.9,.95,1].map(x=>Math.round(b*x/2.5)*2.5),cd:document.querySelector('.wkp .wk-cd b').textContent,
      wu:[...document.querySelectorAll('.wkp .wk-wu .wk-mn')].map(x=>x.textContent),pl:document.querySelectorAll('.wkp .wk-pl').length,sw:document.scrollingElement.scrollWidth,
      small:[...document.querySelectorAll('.wkp button,.wkp input')].filter(x=>x.getBoundingClientRect().height<44).length,
      fs:[...document.querySelectorAll('.wkp input')].filter(x=>parseFloat(getComputedStyle(x).fontSize)<16).length,wide:[...document.querySelectorAll('.wkp input')].filter(x=>x.getBoundingClientRect().right>innerWidth).length}});
    t.eq(r1.c.att.sq,r1.exp,`${W}px: Übernehmen setzt genau die Empfehlungen (auf 2,5 kg gerundet)`);
    t.ok(r1.c.date==='2026-11-14'&&r1.c.name==='Testmeisterschaft'&&r1.c.t.sq==='10:40'&&r1.cd==='Noch 24 Tage',`${W}px: Datum, Name, Uhrzeit gespeichert; Countdown`);
    t.ok(r1.wu.length>=4&&r1.wu[r1.wu.length-1]==='10:40'&&r1.pl===3,`${W}px: Aufwärmplan bis zur Uhrzeit, Scheiben je Versuch`);
    t.ok(r1.sw<=W+1&&r1.small===0&&r1.wide===0,`${W}px: kein Überlauf, Tippflächen ≥ 44 px`);
    t.eq(r1.fs,0,`${W}px: alle Eingabefelder ≥ 16 px (kein Auto-Zoom auf dem iPhone)`);
    await p.fill('[data-wka="sq:2"]','100');await p.dispatchEvent('[data-wka="sq:2"]','change');await p.waitForTimeout(150);
    t.ok(!!(await p.$('.wkp .wk-warn')),`${W}px: Hinweis bei sinkender Last`);
    await p.click('[data-wkl="bp"]');await p.waitForTimeout(150);
    t.ok(await p.evaluate(()=>S.ui.wkl==='bp'&&[...document.querySelectorAll('[data-wka]')].every(i=>i.value==='')),`${W}px: Bankdrücken eigenständig, leer`);
    await p.reload();await p.waitForTimeout(3000);
    t.ok(await p.evaluate(()=>S.meta.comp&&S.meta.comp.att.sq[2]===100&&S.meta.comp.date==='2026-11-14'),`${W}px: Plan bleibt nach Neuladen erhalten`);
    await p.evaluate(()=>{S.ui.tab='home';S.ui.tdet={};render()});await p.waitForTimeout(200);
    t.ok(/24 T/.test(await p.textContent('[data-tdk="wkp"]')),`${W}px: Kachel zählt die Tage`);
    t.eq(p.errors,[],`${W}px: keine Skriptfehler`);await p.close();
  }
}};
