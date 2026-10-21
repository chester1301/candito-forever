// Side Quests (Redesign): einspaltige Bibliothek, Glas-Icons, Detailansicht, Versionskarten, kompakter Kopf.
// Prüft, dass nur die Darstellung neu ist: alle Programme/Versionen, gleiche Start-/Ende-Logik, Rückkehr zum Jahresplan.
module.exports={name:'Side-Quest-Redesign – Bibliothek, Details, Versionen, Start/Ende, Kopf, Layout',async run({page,t}){
  const p=await page({width:390,height:844,fixedTime:'2026-10-21T18:00:00+02:00'});
  await p.evaluate(()=>{S.ui.tab='sq';S.ui.sqd=null;render();scrollTo(0,0)});await p.waitForTimeout(300);
  const L=await p.evaluate(()=>{const c=[...document.querySelectorAll('#view .sqlib .sqc')];const r=c.map(x=>x.getBoundingClientRect());
    return {ids:c.map(x=>x.dataset.sqd),ord:SQORD,names:c.map(x=>x.querySelector('.sqc-n').textContent),exp:SQORD.map(f=>SQF[f].t),
      vers:c.map(x=>x.querySelector('.sqchip').textContent.trim()),vexp:SQORD.map(f=>{const n=Object.keys(SQV).filter(k=>SQV[k].fam===f).length;return n>1?n+' Versionen':'1 Version'}),
      col:r.every(q=>Math.abs(q.left-r[0].left)<1&&Math.abs(q.width-r[0].width)<1)&&r.every((q,i)=>!i||q.top>=r[i-1].bottom),icons:c.every(x=>!!x.querySelector('.sqg svg')),
      blurb:c.every((x,i)=>x.querySelector('.sqc-d').textContent===SQF[SQORD[i]].blurb),emp:/Empfohlen/i.test(document.getElementById('view').textContent)}});
  t.eq(L.ids,L.ord,'Bibliothek: alle fünf Programme in der bisherigen Reihenfolge');
  t.eq(L.names,L.exp,'Original-Programmnamen');
  t.eq(L.vers,L.vexp,'Anzahl Versionen je Programm wie in den Daten (1/4/4/3/1)');
  t.ok(L.col&&L.icons&&L.blurb,'Einspaltig, je Karte Glas-Icon und unveränderte Kurzbeschreibung');
  t.ok(!L.emp,'Keine erfundene „Empfohlen“-Kennzeichnung');
  // Details je Programm
  for(const f of ['w6','pk8','rm5','pv','rm20']){
    await p.click(`#view [data-sqd="${f}"]`);await p.waitForTimeout(250);
    const d=await p.evaluate(f=>{const F=SQF[f],vs=Object.keys(SQV).filter(k=>SQV[k].fam===f);const v=document.getElementById('view');const tx=v.textContent;const strip=h=>h.replace(/<[^>]+>/g,'');
      return {n:vs.length,cards:v.querySelectorAll('.sqvc').length,btn:v.querySelectorAll('[data-sqv]').length,full:F.sec.every(s=>(s.items==='SQ6INFO'?SQ6INFO:s.items).every(x=>tx.includes(strip(x).replace(/&amp;/g,'&'))))&&tx.includes(F.blurb)&&tx.includes(F.sub),
        start:!!v.querySelector('[data-sqstartgo],[data-sqgo]'),weeks:v.querySelectorAll('.sqwk').length,wexp:SQV[S.ui.sqv].P.length,back:!!v.querySelector('[data-sqback]'),ind:/unabhängig von deinem Jahresplan/.test(tx)}},f);
    t.ok(d.full&&d.ind,`${f}: vollständige Originaltexte und Hinweis „Unabhängig vom Jahresplan“`);
    t.ok(d.cards===d.n&&(d.n>1?d.btn===d.n:d.btn===0),`${f}: ${d.n} Versionskarte(n)${d.n===1?', keine künstliche Auswahl':''}`);
    t.ok(d.start&&d.back&&d.weeks===d.wexp,`${f}: Start, Zurück und ${d.wexp} Wochen Trainingsstruktur`);
    await p.click('#view [data-sqback]');await p.waitForTimeout(200);
  }
  // Versionswahl
  await p.click('#view [data-sqd="pk8"]');await p.waitForTimeout(200);
  await p.click('#view [data-sqv="sqpk84"]');await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>S.ui.sqv==='sqpk84'&&document.querySelector('#view .sqvc.sel').dataset.sqv==='sqpk84'&&document.querySelector('#view [data-sqstartgo]').dataset.sqstartgo==='sqpk84'),'Versionswahl markiert die Karte und startet genau diese Version');
  // Start & Ende: bestehende Logik, Rückkehr zum Jahresplan
  const before=await p.evaluate(()=>PROG);
  await p.click('#view [data-sqstartgo="sqpk84"]');await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>S.meta.sqActive==='sqpk84'&&PROG==='sqpk84'&&S.ui.tab==='train'),'Side Quest starten aktiviert die Version und öffnet das Training');
  await p.evaluate(()=>{S.ui.tab='sq';S.ui.sqd=null;render()});await p.waitForTimeout(200);
  t.ok(await p.evaluate(()=>!!document.querySelector('#view .sqact2 [data-sqend]')&&document.querySelector('#view [data-sqd="pk8"]').classList.contains('on')),'Aktive Side Quest oben, Karte als aktiv markiert');
  await p.click('#view .sqact2 [data-sqend]');await p.waitForTimeout(300);
  t.ok(await p.evaluate(b=>!S.meta.sqActive&&PROG===b,before),`Beenden: zurück im Jahresplan (${before})`);
  // Kompakter Kopf beim Scrollen
  await p.evaluate(()=>{S.ui.sqd='pk8';render();scrollTo(0,0)});await p.waitForTimeout(200);
  await p.evaluate(()=>scrollTo(0,1400));await p.waitForTimeout(450);
  const h=await p.evaluate(()=>{const c=document.getElementById('tcb').getBoundingClientRect(),d=document.querySelector('#view .pdh').getBoundingClientRect();const g=document.querySelector('#tcb [data-tcbgear]').getBoundingClientRect();const back=document.querySelector('#view [data-sqback]');const r=back.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return {on:document.body.classList.contains('tcb-on'),txt:document.getElementById('tcb').textContent,below:d.top>=c.bottom-1,gear:g.width>=44&&g.height>=44,hit:!!hit&&(hit===back||back.contains(hit))}});
  t.ok(h.on&&/8 Week Peak/.test(h.txt)&&h.below&&h.gear&&h.hit,`Kompakter Kopf beim Scrollen, Zurück erreichbar (${JSON.stringify(h)})`);
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(450);
  t.ok(await p.evaluate(()=>!document.body.classList.contains('tcb-on')&&document.querySelector('header.top').getBoundingClientRect().top===0),'Am Seitenanfang wieder voller Kopf');
  await p.close();
  // Mit Render-Optimierung (content-visibility): Abschnitte weit unten werden beim Hinscrollen vollständig gezeichnet
  {const q=await page({width:390,height:844,cv:true});await q.evaluate(()=>{S.ui.tab='sq';S.ui.sqd='w6';S.ui.sqv=null;render();scrollTo(0,0)});
   const far=await q.evaluate(async()=>{const ws=[...document.querySelectorAll('#view .sqwk')];const last=ws[ws.length-1];last.scrollIntoView();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const r=last.getBoundingClientRect();return {h:Math.round(r.height),txt:last.textContent.length,top:Math.round(r.top)}});
   t.ok(far.h>30&&far.txt>5&&far.top<844,`Letzte Trainingswoche wird nach dem Scrollen gezeichnet (${JSON.stringify(far)})`);await q.close()}
  // Layout 390/320: kein Überlaufen, alle Knöpfe antippbar, nichts abgeschnitten
  for(const W of [390,320]){const q=await page({width:W,height:W===320?640:844,fixedTime:'2026-10-21T18:00:00+02:00'});
    const bad=await q.evaluate(()=>{const out=[];const nav=document.getElementById('nav').getBoundingClientRect().top;
      for(const f of [null,'w6','pk8','rm5','pv','rm20']){S.ui.tab='sq';S.ui.sqd=f;S.ui.sqv=null;render();scrollTo(0,0);
        if(document.scrollingElement.scrollWidth>innerWidth+1)out.push((f||'liste')+': Seite '+document.scrollingElement.scrollWidth);
        document.querySelectorAll('#view .sqc-n,#view .sqc-d,#view .sqc-e,#view .sqh-t h2,#view .sqf b,#view .sqvc-n,#view .sqvc-m,#view .pdt').forEach(e=>{const c=e.closest('.sqc,.card,.sqf,.sqvc,.pdh');if(e.scrollWidth>e.clientWidth+1||e.getBoundingClientRect().right>c.getBoundingClientRect().right+1)out.push((f||'liste')+': '+e.textContent.slice(0,24))});
        document.querySelectorAll('#view button').forEach(b=>{const r=b.getBoundingClientRect();if(!r.width||r.top<0||r.bottom>nav-2)return;if(r.height<44)out.push((f||'liste')+': klein '+b.textContent.trim().slice(0,20));const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(!(h&&(h===b||b.contains(h))))out.push((f||'liste')+': verdeckt '+b.textContent.trim().slice(0,20))})}
      return out});
    t.eq(bad,[],`${W}px: kein Überlaufen, nichts abgeschnitten, Knöpfe ≥ 44 px und antippbar`);await q.close()}
}};
