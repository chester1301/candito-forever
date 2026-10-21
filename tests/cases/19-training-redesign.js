// Trainingsbereich (Redesign): Übersicht, Übungskarten, Tageshinweise, kompakte Kopfleiste, Tagesinfo, Tagesform, Notizen.
// Prüft, dass nur die Darstellung neu ist: getrennte Planeinträge, vollständige Candito-Texte, gleiche Speicherwege.
module.exports={name:'Training-Redesign – Übersicht, Kopfleiste, Tagesinfo, Tagesform, Notizen',async run({page,t}){
  for(const [W,H] of [[390,844],[320,640]]){
    const p=await page({width:W,height:H,fixedTime:'2026-10-21T18:00:00+02:00'});
    await p.evaluate(()=>{switchProg('intro');S.ui.tab='train';S.ui.w=0;S.ui.d=3;if(S.ui.tdet)S.ui.tdet.train=null;render();scrollTo(0,0)});await p.waitForTimeout(500);
    const r=await p.evaluate(()=>{const {w,d}=S.ui;const day=P[w][d];const cards=[...document.querySelectorAll('#view .exlist .blk')];
      const vis=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'};
      const nav=document.getElementById('nav').getBoundingClientRect().top;
      const blocked=[];document.querySelectorAll('#view button').forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;if(cy<0||cy>nav-2||cx<0||cx>innerWidth)return;const h=document.elementFromPoint(cx,cy);if(!(h&&(h===e||e.contains(h))))blocked.push((e.textContent||e.className).trim().slice(0,24))});
      return {sw:document.scrollingElement.scrollWidth,blocked,n:cards.length,nb:day.b.length,
        names:cards.map(c=>c.querySelector('.mn b,h3')?.textContent.trim()),
        x:day.b.every((bl,b)=>!bl.x||(cards[b]&&cards[b].textContent.includes(bl.x))),
        hype:day.b.every((bl,b)=>!bl.h||!!(cards[b]&&cards[b].querySelector('.hype'))),
        ring:cards.filter(c=>c.classList.contains('mini')).every(c=>!!c.querySelector('.mprog')),
        cut:[...document.querySelectorAll('#view .blk.mini2 .mx')].filter(e=>e.scrollHeight>e.clientHeight+1).length,
        hint:!!document.querySelector('#view .thint[data-tdk="info"]'),hintN:(document.querySelector('#view .thint b')||{}).textContent||'',infoN:(INFO[w+'-'+d]||[]).length,
        tiles:[...document.querySelectorAll('#view .tgrid [data-tdk]')].map(x=>x.dataset.tdk),
        actions:['gostart','gym'].every(a=>!!document.querySelector(`#view .trh [data-act="${a}"]`))}});
    const tag=`${W}px`;
    t.ok(r.sw<=W+1,`${tag}: kein seitliches Überlaufen (${r.sw})`);
    t.eq(r.blocked,[],`${tag}: alle sichtbaren Knöpfe antippbar`);
    t.eq(r.n,r.nb,`${tag}: jede Übung des Plans als eigene Karte (${r.names.join(' | ')})`);
    t.ok(r.x,`${tag}: Canditos Anweisung auf jeder Karte vollständig`);
    t.ok(r.hype&&r.ring,`${tag}: Hype-Stufe und Satzfortschritt auf den Karten`);
    t.eq(r.cut,0,`${tag}: Anweisungen nicht abgeschnitten (z. B. Feet-Up: gleiche Last ODER 5 kg weniger)`);
    t.ok(r.hint&&(r.infoN?r.hintN.includes(String(r.infoN)):true),`${tag}: Tageshinweise-Karte (${r.hintN})`);
    t.eq(r.tiles,['whoop','notiz'],`${tag}: Kacheln Tagesform und Notizen, Tagesinfo nicht doppelt`);
    t.ok(r.actions,`${tag}: Training starten und Nur ansehen vorhanden`);
    // Kompakte Kopfleiste beim Scrollen, „Programm“ führt zurück zur vollen Ansicht
    await p.evaluate(()=>scrollTo(0,900));await p.waitForTimeout(450);
    const c1=await p.evaluate(()=>({on:document.body.classList.contains('tcb-on'),txt:document.getElementById('tcb').textContent,y:document.querySelector('#tcb .tcb-in').getBoundingClientRect().top}));
    t.ok(c1.on&&/W1/.test(c1.txt)&&/22\.10/.test(c1.txt)&&/Programm|/.test(c1.txt),`${tag}: schmale Kopfleiste mit Woche und Datum (${c1.txt.replace(/\s+/g,' ').slice(0,60)})`);
    await p.evaluate(()=>document.querySelector('#tcb [data-tcbtop]').click());await p.waitForTimeout(1200);
    t.ok(await p.evaluate(()=>scrollY<5&&!document.body.classList.contains('tcb-on')&&!!document.querySelector('header.top #tl')),`${tag}: „Programm“ zeigt wieder den vollen Kopf mit Wochen und Tagen`);
    await p.close();
  }
  const p=await page({width:390,height:844,fixedTime:'2026-10-21T18:00:00+02:00'});
  await p.evaluate(()=>{switchProg('intro');S.ui.tab='train';S.ui.w=0;S.ui.d=3;render()});await p.waitForTimeout(300);
  // iPhone mit Dynamic Island simulieren (Sicherheitsbereich 59 px): Kopf darf nicht verrutschen und nichts überdecken
  await p.addStyleTag({content:'html body header.top{top:59px}'});
  await p.evaluate(()=>{S.ui.tab='train';S.ui.tdet={train:null};render();scrollTo(0,0)});await p.waitForTimeout(300);
  const sa=await p.evaluate(()=>{const h=document.querySelector('header.top').getBoundingClientRect();scrollTo(0,250);const h2=document.querySelector('header.top').getBoundingClientRect();const card=document.querySelector('#view .trh').getBoundingClientRect();return {y0:Math.round(h.top),moved:Math.round(h2.top),over:h2.bottom>card.top+1}});
  t.ok(sa.y0===0&&sa.moved===-250&&!sa.over,`Mit Sicherheitsbereich: Kopf scrollt sauber mit, überdeckt nichts (${JSON.stringify(sa)})`);
  // Detailseite: Zurück-Zeile bleibt unter der schmalen Leiste sichtbar
  await p.evaluate(()=>{S.ui.tdet={train:'info'};render();scrollTo(0,0)});await p.waitForTimeout(200);await p.evaluate(()=>scrollTo(0,1200));await p.waitForTimeout(500);
  const pd=await p.evaluate(()=>{const b=document.querySelector('#view .pdh').getBoundingClientRect(),c=document.querySelector('#tcb').getBoundingClientRect();const back=document.querySelector('#view [data-tdback]');const r=back.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {on:document.body.classList.contains('tcb-on'),below:b.top>=c.bottom-1,hit:!!hit&&(hit===back||back.contains(hit))}});
  t.ok(pd.on&&pd.below&&pd.hit,`Tagesinfo gescrollt: Zurück-Knopf unter der Kopfleiste erreichbar (${JSON.stringify(pd)})`);
  await p.evaluate(()=>{S.ui.tdet={train:null};render();scrollTo(0,0)});await p.waitForTimeout(300);
  // In anderen Reitern keine Kopfleiste
  await p.evaluate(()=>{scrollTo(0,900)});await p.waitForTimeout(400);await p.evaluate(()=>{S.ui.tab='home';render();scrollTo(0,900)});await p.waitForTimeout(400);
  t.ok(await p.evaluate(()=>!document.body.classList.contains('tcb-on')),'Kopfleiste nur im Training-Reiter');
  // Tagesinfo vollständig
  await p.evaluate(()=>{S.ui.tab='train';S.ui.tdet={train:'info'};render();scrollTo(0,0)});await p.waitForTimeout(400);
  const ti=await p.evaluate(()=>{const {w,d}=S.ui;const day=P[w][d];const el=document.querySelector('#view details.info');const tx=el.textContent;return {lead:tx.includes(day.d),tips:(INFO[w+'-'+d]||[]).every(x=>{const m=x.match(/^(.{12,90}?[.:!])\s(.*)$/);return m?tx.includes(m[1])&&tx.includes(m[2]):tx.includes(x)}),rows:el.querySelectorAll('.tiflow .prow').length,nb:day.b.length,x:day.b.every(bl=>tx.includes(bl.x)),pause:(tx.match(/Pause/g)||[]).length}});
  t.ok(ti.lead&&ti.tips,'Tagesinfo: „Darauf kommt es heute an“ und alle Coach-Hinweise');
  t.ok(ti.rows===ti.nb&&ti.x&&ti.pause>=ti.nb,`Tagesinfo: Ablauf mit allen ${ti.nb} Übungen, Anweisung und Pause`);
  // Tagesform: Leerzustand, danach nur vorhandene Werte
  await p.evaluate(()=>{S.ui.tdet={train:'whoop'};render()});await p.waitForTimeout(250);
  t.ok(await p.evaluate(()=>!!document.querySelector('#whoop.empty [data-act="wpick"]')&&!!document.querySelector('#whoop.empty [data-act="wedit"]')),'Tagesform leer: Screenshot laden und Eintragen');
  await p.evaluate(()=>{const L=log(0,3,true);L.whoop={rec:78,hrv:72,src:'manual',at:Date.now()};saveLog(key(0,3));render()});await p.waitForTimeout(250);
  t.eq(await p.evaluate(()=>[...document.querySelectorAll('#whoop .wtile .wl')].map(x=>x.textContent.trim())),['HRV'],'Tagesform: nur vorhandene Werte (HRV), keine leeren Kacheln');
  await p.evaluate(()=>{const L=log(0,3,true);delete L.whoop;saveLog(key(0,3))});
  // Notizen: −/+ und Schnellnotizen schreiben in die bestehenden Felder
  await p.evaluate(()=>{S.ui.tdet={train:'notiz'};render()});await p.waitForTimeout(250);
  const before=await p.evaluate(()=>JSON.stringify(Object.keys(log(0,3,true)).sort()));
  await p.evaluate(()=>{const i=document.querySelector('[data-bw]');i.value='80';i.dispatchEvent(new Event('input',{bubbles:true}))});
  await p.click('[data-bwstep="0.5"]');await p.waitForTimeout(100);
  t.eq(await p.evaluate(()=>log(0,3).bw),'80,5','Körpergewicht + 0,5 kg gespeichert');
  await p.click('[data-tnq="Gute Einheit"]');await p.click('[data-tnq="Motiviert"]');await p.waitForTimeout(100);
  t.eq(await p.evaluate(()=>log(0,3).note),'Gute Einheit\nMotiviert','Schnellnotizen landen in der Notiz');
  await p.click('[data-tnq="Gute Einheit"]');await p.waitForTimeout(100);
  t.eq(await p.evaluate(()=>[log(0,3).note,document.querySelector('[data-tnq="Gute Einheit"]').getAttribute('aria-pressed')]),['Motiviert','false'],'Erneut tippen entfernt die Schnellnotiz');
  t.ok(await p.evaluate(b=>{const k=Object.keys(log(0,3)).sort();return JSON.parse(b).every(x=>k.includes(x))&&k.every(x=>['b','note','bw','u','m','date','flow','ck','wu','sw','feel','ckAt'].includes(x)||JSON.parse(b).includes(x))},before),'Keine neuen Datenfelder');
  // Zurücksetzen bleibt zweistufig
  await p.evaluate(()=>{S.ui.tdet={train:null};const L=log(0,3,true);L.b[0][0]={kg:'85',r:'5',ok:true};saveLog(key(0,3));render()});await p.waitForTimeout(250);
  await p.evaluate(()=>document.querySelector('#view [data-act="reset"]').click());await p.waitForTimeout(250);
  t.ok(await p.evaluate(()=>!!(log(0,3)&&log(0,3).b[0][0].ok)&&/Sicher/.test(document.querySelector('#view [data-act="reset"]').textContent)),'Zurücksetzen fragt erst nach („Sicher löschen?“), nichts gelöscht');
}};
