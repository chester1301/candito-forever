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
    // Glanz-Effekt beim Scrollen abschaltbar (Einstellungen › Design)
    const sh=await p.evaluate(async()=>{S.ui.tab='setup';S.ui.tdet={setup:'design'};render();const out={};const off=document.querySelector('[data-anim="0"]');out.btn=!!off;if(!off)return out;off.click();
      out.meta=S.meta.shine;out.cls=document.documentElement.classList.contains('noshine');S.ui.tab='home';render();scrollTo(0,300);dispatchEvent(new Event('scroll'));await new Promise(r=>setTimeout(r,200));
      out.vis=[...document.querySelectorAll('.cgl')].filter(g=>getComputedStyle(g).display!=='none'&&+getComputedStyle(g).opacity>0).length;
      S.ui.tab='setup';S.ui.tdet={setup:'design'};render();document.querySelector('[data-anim="1"]').click();out.on=S.meta.shine===true&&!document.documentElement.classList.contains('noshine');return out});
    t.ok(sh.btn&&sh.meta===false&&sh.cls&&sh.vis===0&&sh.on,`${W}px: Glanz-Effekt in den Einstellungen aus- und wieder einschaltbar`);
    // Design-Einstellungen
    const ds=await p.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'design'};render();const out={rows:document.querySelectorAll('[data-ds]').length,ord:document.querySelectorAll('[data-dsord]').length};
      ['glow|off','cards|schwarz','font|kompakt','dens|kompakt','gnum|gross','navl|aus','dayc|1','gymhy|1','jr|ring'].forEach(x=>document.querySelector(`[data-ds="${x}"]`).click());
      document.querySelector('[data-dsord="max|-1"]').click();out.cls=document.documentElement.className;out.ord=(S.meta.ds||{}).ord;
      S.ui.tab='home';S.ui.tdet={};render();const v=document.getElementById('view');out.ring=!v.querySelector('.jx-jr')&&!!v.querySelector('.card.jr');
      const k=[...v.children].map(c=>c.className);out.seq=['jx-grid','jx-max','jx-two'].map(c=>k.findIndex(x=>x.includes(c)));
      out.sw=document.documentElement.scrollWidth;
      S.ui.w=0;S.ui.d=2;const L=log(0,2,true);L.flow=1;L.ck=1;openGym();renderGym();out.hy=document.getElementById('gym').dataset.hy;closeGym(true);
      S.meta.ds={};saveMeta();applyView();out.reset=document.documentElement.className;return out});
    t.ok(ds.rows>=25&&/glow-off/.test(ds.cls)&&/cards-schwarz/.test(ds.cls)&&/font-kompakt/.test(ds.cls)&&/dens-kompakt/.test(ds.cls)&&/gnum-gross/.test(ds.cls)&&/navl-aus/.test(ds.cls)&&/dayc/.test(ds.cls)&&/gymhy/.test(ds.cls),`${W}px: Design-Einstellungen setzen Leuchten, Karten, Schrift, Ansicht, Gym-Zahlen, Navigation, Tagesname, Hype-Hintergrund`);
    t.ok(ds.ring&&ds.seq[0]<ds.seq[1]&&ds.seq[1]<ds.seq[2]&&JSON.stringify(ds.ord)===JSON.stringify(['jr','hero','grid','max','tiles'])&&ds.sw<=W+1,`${W}px: Readiness als Ring und eigene Reihenfolge der Heute-Bereiche`);
    t.ok(['h','m','l'].includes(ds.hy)&&!/glow-|cards-|font-|gymhy/.test(ds.reset),`${W}px: Gym-Hintergrund nach Hype; Zurücksetzen entfernt alle Stile`);
    // Vorschau, fertige Stile, Gruppen, Zurücksetzen, Hervorhebung, Streifenfarbe
    const pv=await p.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'design'};render();const o={pv:!!document.querySelector('.ds-pv'),grp:document.querySelectorAll('details.ds-grp').length,pre:document.querySelectorAll('[data-dspre]').length};
      document.querySelector('[data-dspre="minimal"]').click();o.min=[S.meta.ds.glow,S.meta.ds.cards,S.meta.motion,S.meta.shine,document.documentElement.classList.contains('glow-off')];
      document.querySelector('[data-dspre="nacht"]').click();o.nacht=[S.meta.oled,S.meta.ds.gnum,S.meta.ds.gymhy];
      document.querySelector('[data-ds="stripe|hype"]').click();o.stripe=document.documentElement.classList.contains('stripe-hype');
      S.ui.w=0;S.ui.d=2;const L=log(0,2,true);L.flow=1;L.ck=1;openGym();renderGym();const ex=document.querySelector('#gym .gl-ex');o.sth=ex.dataset.sth;o.col=getComputedStyle(ex,'::before').backgroundColor;closeGym(true);
      S.ui.tab='home';render();o.cur=!!document.querySelector('#view .card.hero.jx-cur')&&document.documentElement.classList.contains('hl-on');
      S.ui.tab='setup';S.ui.tdet={setup:'design'};render();document.querySelector('[data-dsreset]').click();o.armed=!!document.querySelector('.ds-reset.armed');document.querySelector('[data-dsreset]').click();
      o.reset=[JSON.stringify(S.meta.ds),S.meta.oled,S.meta.motion,S.meta.shine,/glow-|stripe-|cards-/.test(document.documentElement.className)];return o});
    t.ok(pv.pv&&pv.grp===5&&pv.pre===4,`${W}px: Design mit Vorschau, 5 aufklappbaren Gruppen und 4 fertigen Stilen`);
    t.eq([pv.min,pv.nacht],[['off','schwarz',false,false,true],[true,'gross',true]],`${W}px: Stile „Minimal“ und „Gym-Nacht“ setzen ihre Werte`);
    t.ok(pv.stripe&&pv.sth&&pv.col!=='rgb(63, 100, 246)'&&pv.cur,`${W}px: Streifen nach Hype, aktuelles Training hervorgehoben`);
    t.eq(pv.reset,['{}',false,true,true,false],`${W}px: Zurücksetzen (mit Nachfrage) stellt den Standard wieder her`);t.ok(pv.armed,`${W}px: Zurücksetzen fragt erst nach`);
    // Hype-Lichtkegel folgt beim Scrollen der Übung, Streifen in Hype-Farbe; Gelb als Akzent wählbar; Kopfknöpfe überlappen nicht
    const hf=await p.evaluate(async()=>{S.meta.ds={gymhy:true};applyView();S.ui.w=0;S.ui.d=2;const L=log(0,2,true);L.flow=1;L.ck=1;openGym();const g=document.getElementById('gym');const o={a:g.dataset.hy};
      const ex=document.querySelectorAll('#gym .gl-ex')[1];g.scrollTop+=ex.getBoundingClientRect().top-120;g.dispatchEvent(new Event('scroll'));await new Promise(r=>setTimeout(r,50));o.b=g.dataset.hy;o.want=[P[0][2].b[0].h,P[0][2].b[1].h];
      o.stripe=getComputedStyle(ex,'::before').backgroundColor;const tb=[...document.querySelectorAll('#gym .gl-top > button')].map(b=>b.getBoundingClientRect());o.ovl=tb.some((r,i)=>tb.some((q,j)=>j>i&&r.right>q.left+1&&q.right>r.left+1));closeGym(true);
      S.ui.tab='setup';S.ui.tdet={setup:'design'};S.ui.dsOpen={farbe:true};render();o.gelb=!!document.querySelector('[data-ds="acc|gelb"]');S.meta.ds={};applyView();return o});
    t.eq([hf.a,hf.b],hf.want,`${W}px: Lichtkegel folgt beim Scrollen dem Hype der Übung`);
    t.ok(hf.stripe!=='rgb(63, 100, 246)'&&!hf.ovl&&hf.gelb,`${W}px: Streifen in Hype-Farbe, Kopfknöpfe ohne Überlappung, Gelb als Akzentfarbe`);
    t.eq(p.errors,[],`${W}px: keine Fehler`);await p.close()}
}};
