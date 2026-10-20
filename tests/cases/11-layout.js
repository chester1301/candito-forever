// Layout: kein seitliches Überlaufen, Gym passt auf kleine Geräte, keine Dauer-Animationen (Akku), Wortmarke.
module.exports={name:'Layout – iPhone 13 (390×797), 393×759, 430×850, Gym-Höhe, Akku',async run({page,t}){
  const {seed}=require('../lib');
  for(const [W,H] of [[390,797],[393,759],[430,850]]){
    const p=await page({width:W,height:H});
    await seed(p,2,{pids:['intro']});
    for(const tab of ['home','train','prog','setup']){
      await p.evaluate(tab=>{S.ui.tab=tab;render()},tab);await p.waitForTimeout(150);
      const sw=await p.evaluate(()=>[document.scrollingElement.scrollWidth,innerWidth]);
      t.ok(sw[0]<=sw[1]+1,`${W}px ${tab}: kein seitliches Überlaufen (${sw[0]})`);
    }
    // Gym-Satzansicht ohne vertikales Scrollen
    await p.evaluate(()=>{S.ui.w=0;S.ui.d=2;const L=log(0,2,true);L.start=Date.now();L.flow=1;L.ck=1;L.b[0][0]={kg:'110',r:'1',rpe:'9'};saveLog(key(0,2));openGym();G.b=0;G.i=0;renderGym()});
    await p.waitForTimeout(1200);
    const g=await p.evaluate(()=>{const g=document.getElementById('gym');return [g.scrollHeight,g.clientHeight,document.querySelector('#gym .gym-in').className]});
    t.ok(g[0]<=g[1]+2,`${W}×${H}: Gym ohne Scrollen (${g[0]} ≤ ${g[1]}, ${g[2]})`);
    // Pausen-Screen passt ebenfalls
    await p.evaluate(()=>{startRest(240,{w:0,d:2,b:0,i:1})});await p.waitForTimeout(500);
    const r=await p.evaluate(()=>{const s=document.querySelector('#sheet:not([hidden]) .sheet-in, #gym .rest');return s?[s.scrollHeight,s.clientHeight]:[0,0]});
    t.ok(r[0]<=r[1]+40||r[0]===0,`${W}×${H}: Pausen-Screen passt (${r[0]} ≤ ${r[1]})`);
    await p.evaluate(()=>{try{stopRest()}catch(e){}try{closeGym(true)}catch(e){}});
    await p.close();
  }
  // Mindestschrift 11 px in allen Hauptansichten, Gym und Zusammenfassung (auch skalierte Diagramm-Beschriftungen)
  {const p=await page({width:390,height:797});await seed(p,4,{pids:['intro']});
   const scan=()=>p.evaluate(()=>{const bad=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let t;while(t=w.nextNode()){if(!t.textContent.trim())continue;const e=t.parentElement;if(!e||e.closest('[hidden],script,style,noscript,canvas,[aria-hidden="true"]'))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)continue;let fs=parseFloat(cs.fontSize);if(!fs)continue;if(e instanceof SVGElement){const m=e.getScreenCTM();if(m)fs*=Math.hypot(m.a,m.b)}if(fs<10.9)bad.push(`${(e.getAttribute('class')||e.tagName).slice(0,30)} ${fs.toFixed(1)}px „${t.textContent.trim().slice(0,16)}“`)}return [...new Set(bad)].slice(0,6)});
   const views={home:()=>{S.ui.tab='home';render()},train:()=>{S.ui.tab='train';render()},prog:()=>{S.ui.tab='prog';S.ui.pd=null;render()},kraft:()=>{S.ui.pd='kraft';render()},volumen:()=>{S.ui.pd='volumen';render()},setup:()=>{S.ui.pd=null;S.ui.tab='setup';render()},
     summary:()=>svOpen(PROG,0,1,false),gym:()=>{svClose();S.ui.w=0;S.ui.d=2;const L=log(0,2,true);L.done=false;L.start=Date.now();L.flow=1;L.ck=1;openGym();G.b=0;G.i=0;renderGym()}};
   for(const [n,f] of Object.entries(views)){await p.evaluate(`(${f})()`);await p.waitForTimeout(400);const b=await scan();t.eq(b,[],`Mindestschrift 11 px: ${n}`)}
   await p.evaluate(()=>{try{closeGym(true)}catch(e){}});await p.close()}
  const p=await page();
  // Akku: keine endlosen CSS-Animationen auf der Startseite, Rand-Timer deaktiviert
  const anim=await p.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>{const a=getComputedStyle(e);return a.animationIterationCount==='infinite'&&a.animationName!=='none'}).map(e=>e.className).slice(0,5));
  t.eq(anim,[],'Keine Endlos-Animationen auf „Heute“');
  t.ok(await p.evaluate(()=>{const e=document.getElementById('edge');return !e||getComputedStyle(e).display==='none'}),'Rand-Timer aus');
  // Wortmarke
  t.ok(await p.evaluate(()=>{const b=document.querySelector('.mt .mtred');return !!b&&/canditoforever/i.test(b.textContent.replace(/\s+/g,''))&&getComputedStyle(b).textTransform==='uppercase'}),'Wortmarke CANDITOFOREVER');
  // Timer-Takt: ohne laufenden Timer höchstens 1 Hz
  const ticks=await p.evaluate(()=>new Promise(res=>{let n=0;const o=window.tick;window.tick=function(){n++;return o.apply(this,arguments)};setTimeout(()=>{window.tick=o;res(n)},2100)}));
  t.ok(ticks<=4,`Takt ohne Timer sparsam (${ticks} Aufrufe in 2 s)`);
}};
