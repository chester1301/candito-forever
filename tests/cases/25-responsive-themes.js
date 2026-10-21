// Responsiv & Themen: alle 59 Ansichten bei 320/375/390/430 px (Midnight Blue), Classic Rot/Gold (320/390) und
// Textgröße „Sehr groß“ (320/390). Prüft: kein seitliches Seiten-Scrollen, kein Inhalt rechts außerhalb des Bildschirms
// (außer in waagerecht scrollbaren Bereichen), keine Skriptfehler.
const {seed}=require('../lib');const {VIEWS}=require('../views');
const CHECK=()=>{const W=innerWidth,out=[];if(document.scrollingElement.scrollWidth>W+1)out.push('Seite '+document.scrollingElement.scrollWidth);
  const roots=[document.getElementById('view'),...document.querySelectorAll('#gym:not([hidden]),.jrs:not([hidden]),#sheet:not([hidden]),#xsheet:not([hidden]),#ckin:not([hidden]),#gxi.on,[role="dialog"]:not([hidden])')].filter(Boolean);
  const scrollX=e=>{for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if((o==='auto'||o==='scroll')&&p.scrollWidth>p.clientWidth+1)return true;if(o==='hidden'||o==='clip')return 'clip'}return false};
  roots.forEach(r=>r.querySelectorAll('*').forEach(e=>{const b=e.getBoundingClientRect();if(!b.width||!b.height||b.right<=W+1||b.left>=W)return;if(e.closest('svg')&&e.tagName!=='svg')return;
    const s=scrollX(e);if(s)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.position==='fixed'&&b.width>W)return;
    out.push((e.className&&e.className.baseVal===undefined?e.tagName+'.'+String(e.className).split(' ')[0]:e.tagName)+' →'+Math.round(b.right)+' „'+(e.textContent||'').trim().slice(0,22)+'“')}));
  return [...new Set(out)].slice(0,4)};
module.exports={name:'Responsiv & Themen – 59 Ansichten × Breiten, Classic, große Schrift',async run({page,t}){
  const FIXED='2026-10-22T17:00:00+02:00';
  const CONF=[['blue',320,640,'s'],['blue',375,667,'s'],['blue',390,844,'s'],['blue',430,932,'s'],['classic',320,640,'s'],['classic',390,844,'s'],['blue',320,640,'l'],['blue',390,844,'l']];
  for(const [theme,W,H,fs] of CONF){
    const p=await page({width:W,height:H,fixedTime:FIXED});
    if(theme!=='blue'){await p.evaluate(th=>{localStorage.setItem('cf-theme',th)},theme);await p.reload();await p.waitForTimeout(2500)}
    await p.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition:none!important}#cfbar{display:none!important}'});
    await seed(p,4,{pids:['intro'],kg:100});
    await p.evaluate(fs=>{switchProg('intro');S.meta.bw='82,5';const L=log(0,1);if(L){L.whoop={rec:68,hrv:74,rhr:52,sleepH:7.4,src:'manual',at:Date.now()};saveLog(key(0,1))}
      S.ana[AK(0)]={text:'## Fazit\nText\n\n### Punkt\n- a',at:Date.now()};if(fs!=='s'){S.ui.tab='setup';S.ui.tdet={setup:'design'};render();const b=document.querySelector(`[data-fs="${fs}"]`);b&&b.click()}},fs);
    const bad=[];
    for(const [i,[n,full,go,after]] of VIEWS.entries()){
      await p.clock.setFixedTime(new Date(+new Date(FIXED)+(i+1)*60e3));
      await p.evaluate(`(${go})()`);await p.waitForTimeout(200);
      const r=await p.evaluate(`(${CHECK})()`);if(r.length)bad.push(n+': '+r.join(' · '));
      if(after)await p.evaluate(`(${after})()`).catch(()=>{});
    }
    t.eq(bad,[],`${theme==='blue'?'Midnight Blue':'Classic'} ${W}px${fs==='l'?' · Sehr große Schrift':''}: alle Ansichten ohne Überlauf`);
    t.eq(p.errors,[],`${theme} ${W}px${fs==='l'?' groß':''}: keine Skriptfehler`);
    await p.close();
  }
}};
