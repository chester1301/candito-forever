// Coach (Redesign): Statuskarte, Wochenzeilen mit Fortschrittsring, Cockpit-Karte, Analyse-Karten, Layout 320/375/390.
// Prüft, dass nur die Darstellung neu ist: Werte dynamisch, alle Wochen anwählbar, gleiche Navigationsziele.
const SEED=()=>{switchProg('intro');for(let d=0;d<3;d++){const L=log(0,d,true);P[0][d].b.forEach((bl,b)=>(L.b[b]||[]).forEach(z=>{z.ok=true;z.kg='80';z.r='5';z.rpe='7'}));L.done=true;saveLog(key(0,d))}
  S.ui.tab='coach';S.ui.w=0;S.ui.tdet={coach:null};render();scrollTo(0,0)};
module.exports={name:'Coach-Redesign – Statuskarte, Wochen, Cockpit, Analyse, Layout',async run({page,t}){
  const p=await page({width:390,height:844,fixedTime:'2026-10-21T18:00:00+02:00'});
  await p.evaluate(`(${SEED})()`);await p.waitForTimeout(300);
  const h=await p.evaluate(()=>{const v=document.getElementById('view');const c=v.querySelector('.chb');const rows=[...v.querySelectorAll('.chl .chr')];
    let dn=0,tot=0;for(let d=0;d<ND();d++){if(!P[0][d].b.length)continue;tot++;if(dayStatus(0,d)==='done')dn++}
    return {title:c.querySelector('h2').textContent,exp:'Woche 1 · '+WEEKS[0],p:c.querySelector('.chb-p').textContent.replace(/\s+/g,''),pexp:dn+'/'+tot+'Einheiten',bar:c.querySelector('.chb-bar i').style.width,bexp:(dn/tot*100)+'%',
      next:c.querySelector('.chb-n').textContent,first:!!c.querySelector('.chb-f'),n:rows.length,nw:NW(),names:rows.map(r=>r.querySelector('b').textContent),wn:WEEKS.map((n,w)=>'W'+(w+1)+' · '+n),
      cur:rows.findIndex(r=>r.classList.contains('cur')),ring:rows.map(r=>{const f=r.querySelector('.chr-rf');return f?f.getAttribute('stroke-dasharray').split(' ').map(Number):null}),
      st:rows.map(r=>r.querySelector('small').textContent),ck:(v.querySelector('.chc small')||{}).textContent}});
  t.eq(h.title,h.exp,'Statuskarte: Woche und Name aus dem Programm');
  t.eq(h.p,h.pexp,'Statuskarte: Einheiten-Fortschritt dynamisch');
  t.eq(h.bar,h.bexp,'Fortschrittsbalken = erledigte/geplante Einheiten');
  t.ok(/Nächste Analyse nach Do\. 22\.10\. · noch 1 Einheit/.test(h.next)&&h.first,`Nächste Analyse und Hinweis zur ersten Analyse (${h.next})`);
  t.ok(h.n===h.nw&&JSON.stringify(h.names)===JSON.stringify(h.wn),'Alle Wochen mit Programmnamen');
  t.ok(h.cur===0&&h.ring[0]&&Math.abs(h.ring[0][0]/h.ring[0][1]-0.75)<.01&&h.ring.slice(1).every(r=>r===null),'Ring: aktuelle Woche 3/4, geplante Wochen leer');
  t.eq(h.st,['Läuft · 3/4 Einheiten','Geplant · 4 Einheiten','Geplant · 4 Einheiten','Geplant · 4 Einheiten'],'Statuszeilen unverändert');
  t.eq(h.ck,'Keine Pakete bereit','Cockpit-Karte mit Paketstatus');
  // Jede Woche anwählbar → Claude-Coach mit dieser Woche
  for(let w=0;w<4;w++){await p.evaluate(()=>{S.ui.tdet={coach:null};render()});await p.click(`#view .chl [data-coachw="${w}"]`);await p.waitForTimeout(150);
    t.ok(await p.evaluate(w=>S.ui.aw===w&&S.ui.tdet.coach==='claude'&&document.querySelector(`#view [data-aw="${w}"]`).getAttribute('aria-pressed')==='true',w),`W${w+1} öffnet die Wochenanalyse`)}
  await p.evaluate(()=>{S.ui.tdet={coach:null};render()});await p.click('#view .chc[data-tdk="cockpit"]');await p.waitForTimeout(150);
  t.ok(await p.evaluate(()=>S.ui.tdet.coach==='cockpit'&&/Postausgang/.test(document.getElementById('view').textContent)&&document.querySelectorAll('#view [data-out]').length===3),'Cockpit öffnet den Postausgang mit allen abgeschlossenen Einheiten');
  // Gespeicherte Analyse: Text unverändert, in Karten gegliedert
  const txt='## Fazit\nGute Woche.\n\n### RPE-Treffsicherheit\n- Satz 1 passte\n- **Satz 2** zu leicht';
  const a=await p.evaluate(txt=>{S.ana[AK(0)]={text:txt,at:Date.now()};S.ui.aw=0;S.ui.tdet={coach:'claude'};render();const o=document.getElementById('anaOut');
    return {cards:o.querySelectorAll('.ana-c').length,same:o.textContent===(()=>{const d=document.createElement('div');d.innerHTML=md(txt);return d.textContent})()}},txt);
  t.ok(a.cards===2&&a.same,'Analyse: gleicher Inhalt, je Abschnitt eine Karte');
  await p.evaluate(()=>{S.ui.tdet={coach:null};render()});
  t.ok(await p.evaluate(()=>{const r=document.querySelector('#view .chr');return r.classList.contains('ana')&&/Analysiert/.test(r.textContent)&&!!r.querySelector('.chr-rf')}),'Analysierte Woche: grüner Ring mit Haken');
  await p.close();
  for(const [W,H] of [[390,844],[375,667],[320,640]]){const q=await page({width:W,height:H,fixedTime:'2026-10-21T18:00:00+02:00'});await q.evaluate(`(${SEED})()`);
    const bad=await q.evaluate(()=>{const out=[];const nav=document.getElementById('nav').getBoundingClientRect().top;
      S.ana[AK(0)]={text:'## Fazit\nGute Woche mit einem sehr langen Satz ohne Umbruch',at:Date.now()};WEEKS[1]=WEEKS[1]+' – sehr lange dynamische Wochenbezeichnung';
      for(const d of [null,'claude','cockpit']){S.ui.tdet={coach:d};render();scrollTo(0,0);
        if(document.scrollingElement.scrollWidth>innerWidth+1)out.push((d||'hub')+': Seite '+document.scrollingElement.scrollWidth);
        document.querySelectorAll('#view .chb h2,#view .chb-p,#view .chb-n,#view .chr b,#view .chr small,#view .chc b,#view .chc small,#view .ana-c,#view .prow b').forEach(e=>{const c=e.closest('.chr,.chc,.card,.prow');if(e.scrollWidth>e.clientWidth+1||e.getBoundingClientRect().right>c.getBoundingClientRect().right+1)out.push((d||'hub')+': '+e.textContent.slice(0,24))});
        document.querySelectorAll('#view button').forEach(b=>{const r=b.getBoundingClientRect();if(!r.width||r.top<0||r.bottom>nav-2)return;if(r.height<44)out.push((d||'hub')+': klein '+b.textContent.trim().slice(0,20));const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(!(h&&(h===b||b.contains(h))))out.push((d||'hub')+': verdeckt '+b.textContent.trim().slice(0,20))})}
      WEEKS[1]=WEEKS[1].replace(' – sehr lange dynamische Wochenbezeichnung','');return out});
    t.eq(bad,[],`${W}px: kein Überlaufen, nichts abgeschnitten, Knöpfe antippbar (auch mit langer Wochenbezeichnung)`);await q.close()}
}};
