// Gym-Modus (Redesign): alle Übungstypen bei 320/390 px – kein Überlaufen, jeder Knopf antippbar, Pflichtangaben sichtbar,
// Schnellzugriffe öffnen ihre Funktion, Info-Sheet zeigt Programmdaten und ändert nichts, Wischen schließt.
const SCENES=[ // [Programm, Woche, Tag, Block, Beschreibung]
  ['intro',0,0,0,'Langhantel · RPE-Pflicht'],['intro',0,3,0,'Langhantel · feste Last'],['intro',0,1,4,'Kabel (Seil)'],['intro',0,2,3,'Kurzhantel'],
  ['intro',0,3,6,'Kurzhantel · AMRAP'],['p8',0,2,5,'Maschine'],['p8',0,0,4,'Beinstrecker'],['p8',7,3,0,'Test-Single'],['p10w',9,2,0,'Test · RPE']];
module.exports={name:'Gym-Redesign – Übungstypen, Antippbarkeit, Schnellzugriffe, Info-Sheet',async run({page,t}){
  for(const [W,H] of [[390,797],[320,568]]){
    const p=await page({width:W,height:H});
    for(const [pid,w,d,b,lbl] of SCENES){
      const r=await p.evaluate(([pid,w,d,b])=>{switchProg(pid);S.ui.w=w;S.ui.d=d;const L=log(w,d,true);L.flow=1;L.ck=1;saveLog(key(w,d));openGym();G.b=b;G.i=0;renderGym();
        return new Promise(res=>setTimeout(()=>{const g=document.getElementById('gym');const bl=P[w][d].b[b];
          const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height||e.closest('[hidden]'))return false;const c=getComputedStyle(e);return c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity>0};
          // jeder sichtbare Knopf im sichtbaren Bereich muss an seiner Mitte selbst getroffen werden (keine Überlagerung)
          // Bereich oberhalb der festen Bedienleiste: dort darf nichts verdeckt sein (darunter wird gescrollt)
          const dock=g.querySelector('.gdock');const dTop=dock?dock.getBoundingClientRect().top:innerHeight;
          const blocked=[];g.querySelectorAll('.gym-in button').forEach(e=>{if(!vis(e)||e.closest('.gplan'))return;const r=e.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const inDock=dock&&dock.contains(e);const sc=e.parentElement&&e.parentElement.closest('.rpechips,.hp,.tw');if(sc){const q=sc.getBoundingClientRect();if(cx<q.left||cx>q.right)return}if(cy<0||cy>innerHeight||cx<0||cx>innerWidth||(!inDock&&cy>dTop-2))return;
            const hit=document.elementFromPoint(cx,cy);if(!(hit&&(hit===e||e.contains(hit))))blocked.push((e.getAttribute('aria-label')||e.textContent||e.className).trim().slice(0,30)+' ← '+((hit&&(hit.className||hit.tagName))||'').toString().slice(0,24))});
          const clipped=e=>{for(let a=e.parentElement;a&&a!==g;a=a.parentElement){const c=getComputedStyle(a);if(/auto|scroll|hidden|clip/.test(c.overflowX)&&a.getBoundingClientRect().right<=innerWidth+1)return true}return false};
          const over=[...g.querySelectorAll('.gym-in *')].filter(e=>vis(e)&&!e.closest('.gplan')&&e.getBoundingClientRect().right>innerWidth+1&&!clipped(e)).map(e=>String(e.getAttribute('class')||e.tagName).slice(0,24)).slice(0,3);
          // alles muss sich über die Bedienleiste scrollen lassen
          const last=[...g.querySelectorAll('.gsw > *')].filter(vis).pop();const reach=!last||(g.scrollHeight-g.clientHeight)+dTop+2>=last.getBoundingClientRect().bottom+g.scrollTop;
          const txt=g.querySelector('.gym-in').textContent;
          res({blocked:[...new Set(blocked)],over,reach,sw:document.scrollingElement.scrollWidth,x:txt.includes(bl.x),name:txt.includes(EX[bl.e].n),
            q:[...g.querySelectorAll('.gq .gq-b small')].map(x=>x.textContent),info:!!g.querySelector('.g2ex .ginfo[data-exinfo]'),oldIcon:!!g.querySelector('.gex .lico'),
            hype:!bl.h||!!g.querySelector('.g2b .hype'),rpeChips:!rpeNeed(bl,0)||!!g.querySelector('.grpe.req .rpechips'),timer:!!g.querySelector('.gdk-b .gtq, .gdk-b [data-gt], .gdk-b .gtimer, .gdk-b button'),log:!!g.querySelector('[data-g="log"]')})},350))},[pid,w,d,b]);
      const tag=`${W}px · ${lbl}`;
      t.eq(r.blocked,[],`${tag}: alle Knöpfe antippbar`);
      t.ok(r.over.length===0&&r.sw<=W+1,`${tag}: kein seitliches Überlaufen ${r.over.join(',')}`);
      t.ok(r.reach,`${tag}: aller Inhalt lässt sich über die Bedienleiste scrollen`);
      t.ok(r.x&&r.name,`${tag}: Übungsname und Candito-Vorgabe sichtbar`);
      t.ok(r.info&&!r.oldIcon,`${tag}: gläsernes Info-Icon statt Übungssymbol`);
      t.ok(r.hype&&r.rpeChips&&r.log&&r.timer,`${tag}: Belastung, Pflicht-RPE, Satz abhaken und Timer vorhanden`);
      t.ok(['Info','Analyse','Verlauf','RPE'].every(k=>r.q.includes(k)),`${tag}: Schnellzugriffe ${r.q.join('/')}`);
    }
    await p.close();
  }
  // Schnellzugriffe öffnen ihre Funktion, Info-Sheet zeigt Daten und ändert nichts
  const p=await page({width:390,height:797});
  await p.evaluate(()=>{switchProg('intro');S.ui.w=0;S.ui.d=0;const L=log(0,0,true);L.flow=1;L.ck=1;saveLog(key(0,0));openGym();G.b=0;G.i=0;renderGym()});await p.waitForTimeout(400);
  const q=async(sel,chk)=>{await p.evaluate(sel=>document.querySelector('#gym .gq '+sel).click(),sel);await p.waitForTimeout(350);const ok=await p.evaluate(chk);await p.evaluate(()=>{G.wu=false;G.hi=false;G.rpo=false;try{closeEx()}catch(e){}try{exInfoClose()}catch(e){}renderGym()});await p.waitForTimeout(300);return ok};
  await p.evaluate(()=>{gWrite('kg',100);renderGym()});await p.waitForTimeout(200);
  t.ok(await q('[data-gwuopen]',()=>G.wu&&!!document.querySelector('#gym .gwus .g2wu')),'Warmup öffnet die Aufwärmsätze (mit Gewicht: nummerierte Sätze)');
  await p.evaluate(()=>{const L=log(0,0,true);L.b[0][0]={};saveLog(key(0,0));renderGym()});
  t.ok(await q('[data-ex]',()=>!document.getElementById('xsheet').hidden),'Analyse öffnet die Übungsstatistik');
  t.ok(await q('[data-hiopen]',()=>G.hi&&!!document.querySelector('#gym .his')),'Verlauf öffnet den Trainingsverlauf');
  t.ok(await q('[data-rcopen]',()=>G.rpo&&!!document.querySelector('#gym .rpo')),'RPE öffnet den RPE-Planer');
  await p.waitForTimeout(300);const before=await p.evaluate(()=>JSON.stringify([log(0,0),G.b,G.i,S.ui.w,S.ui.d]));
  await p.evaluate(()=>document.querySelector('#gym .ginfo[data-exinfo]').click());await p.waitForTimeout(400);
  const s1=await p.evaluate(()=>{const el=document.getElementById('gxi');const bl=P[0][0].b[0];const tx=el.textContent;const pn=el.querySelector('.gxi-p0').getBoundingClientRect();
    return {open:!el.hidden,tabs:[...el.querySelectorAll('[data-gxitab]')].map(x=>x.textContent),x:tx.includes(bl.x),rule:tx.includes(setRule(bl).title),h:Math.round(pn.height/innerHeight*100),scroll:getComputedStyle(el.querySelector('.gxi-sc')).overflowY}});
  t.ok(s1.open&&s1.x&&s1.rule,'Info-Sheet zeigt Candito-Vorgabe und RPE-Regel');
  t.ok(s1.h>=84&&s1.h<=92&&/auto|scroll/.test(s1.scroll),`Info-Sheet ${s1.h} % hoch und scrollbar`);
  t.ok(s1.tabs[0]==='Vorgaben',`Reiter: ${s1.tabs.join(' · ')}`);
  for(const tb of ['a','h'])if(await p.$(`#gxi [data-gxitab="${tb}"]`)){await p.click(`#gxi [data-gxitab="${tb}"]`);await p.waitForTimeout(150)}
  const s2=await p.evaluate(()=>{const bl=P[0][0].b[0];const el=document.getElementById('gxi');GXI.tab='a';exInfoRefresh();const a=el.textContent;GXI.tab='h';exInfoRefresh();const h=el.textContent;
    return {tech:!EX[bl.e].t||a.includes(EX[bl.e].t),info:(INFO['0-0']||[]).every(x=>h.includes(x))}});
  t.ok(s2.tech,'Ausführung zeigt die vorhandene Technikbeschreibung');t.ok(s2.info,'Hinweise zeigen Canditos Tagesinfos vollständig');
  // Wischen nach unten schließt
  await p.evaluate(()=>{const pn=document.querySelector('#gxi .gxi-hd');const T=(y)=>new Touch({identifier:1,target:pn,clientX:200,clientY:y});
    pn.dispatchEvent(new TouchEvent('touchstart',{touches:[T(120)],bubbles:true,cancelable:true}));pn.dispatchEvent(new TouchEvent('touchmove',{touches:[T(320)],bubbles:true,cancelable:true}));pn.dispatchEvent(new TouchEvent('touchend',{touches:[],bubbles:true}))});
  await p.waitForTimeout(450);
  t.ok(await p.evaluate(()=>document.getElementById('gxi').hidden),'Nach unten wischen schließt das Info-Sheet');
  t.eq(await p.evaluate(()=>JSON.stringify([log(0,0),G.b,G.i,S.ui.w,S.ui.d])),before,'Trainingszustand und Daten unverändert');
  // Pausentimer läuft weiter, während das Info-Sheet offen ist
  await p.evaluate(()=>{startRest(90,{w:0,d:0,b:0,i:0});try{closeSheet()}catch(e){}exInfoOpen('v')});
  const t1=await p.evaluate(()=>T&&T.on?T.end-Date.now():null);await p.waitForTimeout(1300);
  const t2=await p.evaluate(()=>({on:!!(T&&T.on),left:T?T.end-Date.now():null,info:!document.getElementById('gxi').hidden}));
  t.ok(t1!=null&&t2.on&&t2.info&&t2.left<t1-900,'Pausentimer läuft bei offenem Info-Sheet weiter');
  await p.evaluate(()=>{exInfoClose();try{stopRest()}catch(e){}});await p.waitForTimeout(300);
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}});
}};
