// Progress (Redesign): Ebenen der Hauptseite, alle Analysebereiche erreichbar und ohne Dopplung, gleiche Werte,
// Kraft je Lift (ehrlicher Hinweis bei wenig Daten), Volumen-Umschaltung, Roadmap, voller Kalender, Layout 320/390.
const SEED=()=>{switchProg('intro');S.meta.bw='80';let n=0;for(let w=0;w<3;w++)for(let d=0;d<ND();d++){if(w===2&&d>1)continue;const dt=dayDate(w,d);const L=log(w,d,true);
  P[w][d].b.forEach((bl,b)=>(L.b[b]||[]).forEach(z=>{z.ok=true;z.kg=String(80+w*5);z.r=String(bl.r).split(/[–-]/)[0].replace('AMRAP','10');z.rpe=bl.rpe!=null?String(bl.rpe):'7.5'}));
  L.done=true;L.date=new Date(+dt+2*36e5).toISOString();if(n%2===0)L.whoop={rec:60,hrv:72,src:'manual',at:+dt};saveLog(key(w,d));n++}S.ui.tab='prog';S.ui.pd=null;render()};
module.exports={name:'Progress-Redesign – Ebenen, Vollständigkeit, Werte, Kraft, Volumen, Roadmap, Layout',async run({page,t}){
  const p=await page({width:390,height:844,fixedTime:'2026-11-08T18:00:00+01:00'});
  await p.evaluate(`(${SEED})()`);await p.waitForTimeout(400);
  const m=await p.evaluate(()=>{const v=document.getElementById('view');const D=progData();
    const pds=[...v.querySelectorAll('[data-pd]')].map(x=>x.dataset.pd);const ver=v.querySelectorAll('[data-go-pd="verlauf"]').length;
    const first=v.querySelector('.card');const pg2=[...v.querySelectorAll('.pg2 [data-pd]')].map(x=>x.dataset.pd);
    const tot=Math.round(D.best.sq)+Math.round(D.best.bp)+Math.round(D.best.dl);
    return {first:first&&first.classList.contains('pgs'),est:/Schätzung/.test(first.textContent)&&/kein gehobenes Wettkampf-Total/.test(first.textContent),
      tot:+first.querySelector('.pgs-t>b').textContent.replace(/\./g,''),totExp:tot,pg2,pds,ver,
      cells:v.querySelectorAll('.pcal-g i').length,need:Object.keys(PDT).filter(k=>k!=='rpeplan'&&k!=='verlauf')}});
  t.ok(m.first&&m.est,'Ebene 1: geschätztes Total oben, klar als Schätzung gekennzeichnet');
  t.eq(m.tot,m.totExp,'Total identisch zur bisherigen Berechnung (Rundung je Lift)');
  t.eq(m.pg2,['treue','volumen','whoop','year'],'Ebene 2: Plan-Treue, Volumen, Erholung, Programmfortschritt');
  t.ok(m.need.every(k=>m.pds.includes(k))&&m.ver===1,`Alle Analysebereiche erreichbar (${m.need.join(', ')} + Verlauf)`);
  t.eq(m.pds.length,new Set(m.pds).size,'Kein Bereich doppelt auf der Hauptseite');
  t.eq(m.cells,42,'Kompakter Kalender: 6 Wochen × 7 Tage');
  // Kraft je Lift: Zeitraumwahl, Hinweis statt Tendenz bei wenig Daten
  await p.evaluate(()=>{S.ui.pd='kraft';S.ui.kper='all';render()});await p.waitForTimeout(250);
  const k1=await p.evaluate(()=>({cards:document.querySelectorAll('#view .pgk').length,per:document.querySelectorAll('#view [data-kper]').length,est:[...document.querySelectorAll('#view .pgk .pgs-est')].length,
    rows:[...document.querySelectorAll('#view .pgk')].map(c=>({pts:c.querySelectorAll('circle').length,line:!!c.querySelector('polyline'),few:!!c.querySelector('.pgk-few')}))}));
  t.ok(k1.cards===3&&k1.per===4&&k1.est===3,'Kraft: drei Wettkampf-Lifts getrennt, Zeitraumwahl, als Schätzung gekennzeichnet');
  t.ok(k1.rows.every(r=>r.pts<3?(!r.line&&r.few):r.line&&!r.few),`Kraft: Linie nur ab 3 echten Punkten, sonst Hinweis (${JSON.stringify(k1.rows)})`);
  await p.evaluate(()=>{const L=log(0,0);S.ui.kper='4w';render()});await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>[...document.querySelectorAll('#view .pgk')].every(c=>c.querySelector('.pgk-few')||c.querySelector('polyline'))),'Kraft: Zeitraum 4 W zeigt nur vorhandene Punkte');
  // Volumen: Umschaltung, Summe identisch
  await p.evaluate(()=>{S.ui.pd='volumen';S.ui.vmode='ton';render()});await p.waitForTimeout(200);
  const v1=await p.evaluate(()=>{const D=progData();return {txt:document.querySelector('#view .pgv-b').textContent,exp:nf(D.tonnage/1000,1)}});
  t.ok(v1.txt.startsWith(v1.exp),`Volumen: Gesamttonnage wie bisher (${v1.exp} t)`);
  await p.click('#view [data-vmode="sets"]');await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>S.ui.vmode==='sets'&&/Sätze je Woche/.test(document.querySelector('#view .pgvc').getAttribute('aria-label'))),'Volumen: Umschaltung auf Sätze je Woche');
  // Roadmap & Testwoche
  await p.evaluate(()=>{S.ui.pd='year';render()});await p.waitForTimeout(200);
  const y=await p.evaluate(()=>({dots:document.querySelectorAll('#view .prd-p').length,n:ORD().length,cur:!!document.querySelector('#view .prd-p.cur')&&/Intro/.test(document.querySelector('#view .prm.cur').textContent),
    test:(document.querySelector('#view .prt')||{}).textContent||'',td:dayDate(TW(),TD()).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}),list:!!document.querySelector('#view .yl')}));
  t.ok(y.dots===y.n&&y.cur&&y.list,'Jahresplan: Roadmap mit allen Phasen, aktuelle hervorgehoben, Phasenliste bleibt');
  t.ok(y.test.includes(y.td),`Testwoche-Termin unverändert (${y.td})`);
  await p.evaluate(()=>{S.ui.pd='verlauf';render()});await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>!!document.querySelector('#view .card.cal')&&!!document.querySelector('#view .hs-c')),'Verlauf: voller Kalender (6 Monate) und alle Einheiten');
  await p.close();
  // Layout: kein Überlaufen auf allen Progress-Seiten
  for(const W of [390,320]){const q=await page({width:W,height:844,fixedTime:'2026-11-08T18:00:00+01:00'});await q.evaluate(`(${SEED})()`);
    const bad=await q.evaluate(()=>{const out=[];for(const pd of [null,'year','kraft','treue','volumen','rpe','whoop','backoff','punkte','rekorde','zyklen','test','verlauf']){S.ui.pd=pd;render();
      if(document.scrollingElement.scrollWidth>innerWidth+1)out.push((pd||'main')+': Seite '+document.scrollingElement.scrollWidth);
      document.querySelectorAll('#view .card table').forEach(tb=>{const c=tb.closest('.card');const cr=c.getBoundingClientRect(),tr=tb.getBoundingClientRect();if(tb.scrollWidth>(tb.parentElement.clientWidth||c.clientWidth)+1||tr.right>cr.right+1||tr.left<cr.left-1)out.push((pd||'main')+': Tabelle '+tb.scrollWidth+'>'+c.clientWidth)});
      document.querySelectorAll('#view .ptile .ptl, #view .pgl b, #view .pgs-t b').forEach(e=>{const c=e.closest('.ptile,.pgl,.card');if(e.getBoundingClientRect().right>c.getBoundingClientRect().right+1)out.push((pd||'main')+': '+e.textContent.trim().slice(0,20))})}return out});
    t.eq(bad,[],`${W}px: keine abgeschnittenen Kennzahlen, Titel oder Tabellen`);await q.close()}
}};
