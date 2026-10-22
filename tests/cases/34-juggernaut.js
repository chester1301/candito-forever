// Juggernaut-Design (22.10.2026): Readiness-Bühne oben, Einheiten-Raster, Schlaf & Gewicht, Kraft-Kacheln,
// Fortsetzen-Pille, Gym-Liste mit Satzgruppe, Notiz je Übung (L.xn, freigegeben) und Titel-Pille, Monatskalender im Verlauf.
// Farben: kein Grün für „erledigt“ (Hellblau), Readiness-Grün bleibt. Alles nur Anzeige – Vorgaben und Lasten unverändert.
const {seed}=require('../lib');
module.exports={name:'Juggernaut-Design – Heute, Gym-Liste, Notiz je Übung, Kalender, Farben',async run({page,t}){
  for(const W of [390,320]){
    const p=await page({width:W,height:844,fixedTime:'2026-10-22T17:00:00+02:00',gymList:true});
    await seed(p,4,{pids:['intro'],kg:100});
    const h=await p.evaluate(()=>{switchProg('intro');S.ui.tab='home';render();const v=document.getElementById('view');const k=[...v.children].map(c=>c.className);
      const i=s=>k.findIndex(c=>c.includes(s));
      return {jr:i('card jr'),greet:i('greet'),hero:i('card hero'),grid:i('jx-grid'),two:i('jx-two'),max:i('jx-max'),big:!!v.querySelector('.card.jr.jx-jr'),
        sw:document.documentElement.scrollWidth,cells:v.querySelectorAll('.jx-gg i').length,ok:v.querySelectorAll('.jx-gg i.ok').length,n:NW()*ND(),
        kraft:[...v.querySelectorAll('.jx-m')].map(b=>b.dataset.goPd)}});
    t.ok(h.greet===0&&h.jr===1&&h.big&&h.hero>h.jr&&h.grid===h.hero+1&&h.two===h.grid+1&&h.max===h.two+1,`${W}px: Heute – Readiness oben groß, dann Training, Raster, Schlaf/Gewicht, Kraft`);
    t.ok(h.cells===h.n&&h.ok===4&&h.kraft.length===3&&h.kraft.every(x=>x==='kraft')&&h.sw<=W+1,`${W}px: Raster zeigt alle Einheiten (4 erledigt), Kraft-Kacheln öffnen Kraft, kein Überlauf`);
    // Fortsetzen-Pille nur bei laufendem Training
    const res=await p.evaluate(()=>{const before=!!document.getElementById('jx-res')&&!document.getElementById('jx-res').hidden;startSession(1,0);render();const el=document.getElementById('jx-res');const on=!!el&&!el.hidden;el.click();const g=!document.getElementById('gym').hidden;return {before,on,g}});
    t.ok(!res.before&&res.on&&res.g,`${W}px: Fortsetzen-Pille erscheint bei laufendem Training und öffnet den Gym-Modus`);
    // Gym-Liste: Satzgruppe, Notiz je Übung, Titel-Pille
    await p.evaluate(()=>{const L=log(1,0,true);L.flow=1;L.ck=1;renderGym()});await p.waitForTimeout(300);
    const gl=await p.evaluate(()=>({sg:document.querySelectorAll('#gym .jx-sg').length,notes:document.querySelectorAll('#gym [data-jxnote]').length,ex:document.querySelectorAll('#gym .gl-ex').length,tp:(document.querySelector('#gym .jx-tp')||{}).textContent,h1:(document.querySelector('#gym .gl-hd h1')||{}).textContent,sw:document.querySelector('#gym .gym-in').scrollWidth}));
    t.ok(gl.notes===gl.ex&&gl.sg>0&&gl.tp===gl.h1&&gl.sw<=W+1,`${W}px: Gym-Liste mit Satzgruppen, Notiz-Karte je Übung und Titel-Pille`);
    await p.evaluate(()=>document.querySelector('#gym [data-jxnote="1"]').click());await p.fill('#jxnt','Hüfte früher öffnen');
    await p.evaluate(()=>document.querySelector('[data-jxns]').click());await p.waitForTimeout(200);
    const n1=await p.evaluate(()=>({xn:log(1,0).xn,shown:document.querySelector('#gym [data-jxnote="1"] .jx-nt').textContent,b:log(1,0).b.map(a=>a.filter(z=>z.ok).length)}));
    t.eq([n1.xn,n1.shown],[{1:'Hüfte früher öffnen'},'Hüfte früher öffnen'],`${W}px: Notiz je Übung wird gespeichert (L.xn) und angezeigt`);
    t.ok(n1.b.every(x=>x===0),`${W}px: Notiz ändert keine Sätze`);
    await p.evaluate(()=>{document.querySelector('#gym [data-jxnote="1"]').click();document.getElementById('jxnt').value='';document.querySelector('[data-jxns]').click()});
    t.eq(await p.evaluate(()=>log(1,0).xn),undefined,`${W}px: leere Notiz entfernt das Feld wieder`);
    await p.evaluate(()=>{const L=log(1,0,true);L.xn={0:'Tiefe gut'};L.b[0][0]={kg:'100',r:'5',rpe:'8',ok:true};saveLog(key(1,0));try{closeGym(true)}catch(e){}svOpen(PROG,1,0,false)});await p.waitForTimeout(300);
    t.eq(await p.evaluate(()=>(document.querySelector('.sv-xn')||{}).textContent),'NotizTiefe gut',`${W}px: Notiz erscheint in der Zusammenfassung`);
    await p.evaluate(()=>{try{svClose()}catch(e){}});
    // Monatskalender
    const c=await p.evaluate(()=>{S.ui.tab='prog';S.ui.pd='verlauf';render();const cal=document.querySelector('.jx-cal');const out={has:!!cal,tr:cal.querySelectorAll('.jx-days .tr').length,td:cal.querySelectorAll('.jx-days .td').length,m:cal.querySelector('.jx-mh b').textContent};
      cal.querySelector('[data-jxv="list"]').click();out.off=document.querySelector('.jx-days').classList.contains('off');document.querySelector('[data-jxv="cal"]').click();document.querySelector('[data-jxm="-1"]').click();out.m2=document.querySelector('.jx-mh b').textContent;out.sw=document.documentElement.scrollWidth;return out});
    t.ok(c.has&&c.tr>=3&&c.td===1&&c.m==='Oktober 2026'&&c.off&&c.m2==='September 2026'&&c.sw<=W+1,`${W}px: Monatskalender mit trainierten Tagen, heute, Liste/Kalender und Blättern`);
    // Farben: kein Grün mehr bei „erledigt“, Readiness-Grün bleibt
    const col=await p.evaluate(()=>{S.ui.tab='train';S.ui.w=0;S.ui.d=0;S.ui.pd=null;render();const ok=getComputedStyle(document.documentElement).getPropertyValue('--ok').trim();
      S.ui.tab='home';render();const jr=document.querySelector('.card.jr');return {ok,zc:jr?jr.style.getPropertyValue('--zc'):null,theme:document.documentElement.dataset.theme}});
    t.ok(col.theme!=='blue'||(col.ok.toLowerCase()==='#5aaee8'&&/3cc46a/i.test(col.zc||'')),`${W}px: „erledigt“ in Hellblau, Readiness bleibt grün`);
    t.eq(p.errors,[],`${W}px: keine Fehler`);await p.close()}
}};
