// Funktionsinventur: In allen 59 Ansichten werden sämtliche Bedienelemente erfasst (Knöpfe, Eingaben, Auswahl, Aufklapper
// samt data-*-Aktion). Der Referenzstand (tests/inventory.golden.json) darf nach Optik-Änderungen nur wachsen, nie schrumpfen –
// so kann keine Funktion stillschweigend verloren gehen. Neu schreiben nur bewusst: `node tests/run.js inventur --update-golden`.
const fs=require('fs'),path=require('path');const {seed}=require('../lib');const {VIEWS}=require('../views');
const SIG=()=>{const out=new Set();const vol=/^(data-(count|dec|t0|dur|i|k|at|ts|n|tdk-n))$/;
  document.querySelectorAll('button,a[href],input,select,textarea,summary,[role="button"],[data-act]').forEach(e=>{
    if(e.closest('[hidden]')||e.closest('#nav,#edge,#cfbar'))return;const cs=getComputedStyle(e);if(cs.display==='none')return;
    const da=[...e.attributes].filter(a=>a.name.startsWith('data-')&&!vol.test(a.name)).map(a=>a.name+(a.value&&a.value.length<40?'='+a.value:'')).sort().join(' ');
    const typ=e.tagName.toLowerCase()+(e.type&&e.tagName!=='BUTTON'?':'+e.type:'');
    const key=da||(e.id?'#'+e.id:'')||(e.getAttribute('aria-label')?'aria:'+e.getAttribute('aria-label'):'')||('text:'+(e.textContent||e.placeholder||'').replace(/\s+/g,' ').trim().slice(0,28));
    out.add(typ+' '+key)});return [...out].sort()};
module.exports={name:'Funktionsinventur – alle Bedienelemente aller Ansichten bleiben erhalten',async run({page,t,update,root}){
  const FIXED='2026-10-22T17:00:00+02:00';
  const p=await page({width:390,height:844,fixedTime:FIXED});
  await p.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition:none!important}'});
  await seed(p,4,{pids:['intro'],kg:100});
  await p.evaluate(()=>{switchProg('intro');S.meta.bw='82,5';const L=log(0,1);if(L){L.diff=4;L.diffs=6;L.whoop={rec:68,hrv:74,rhr:52,sleepH:7.4,src:'manual',at:Date.now()};saveLog(key(0,1))}
    S.ana[AK(0)]={text:'## Fazit\nText\n\n### Punkt\n- a',at:Date.now()}});
  const cur={};
  for(const [i,[n,full,go,after]] of VIEWS.entries()){
    await p.clock.setFixedTime(new Date(+new Date(FIXED)+(i+1)*60e3));
    await p.evaluate(`(${go})()`);await p.waitForTimeout(350);
    cur[n]=await p.evaluate(`(${SIG})()`);
    if(after)await p.evaluate(`(${after})()`).catch(()=>{});
  }
  const file=path.join(root,'tests','inventory.golden.json');
  const total=Object.values(cur).reduce((a,v)=>a+v.length,0);
  if(update||!fs.existsSync(file)){fs.writeFileSync(file,JSON.stringify(cur,null,1));t.ok(true,`Referenz geschrieben: ${Object.keys(cur).length} Ansichten, ${total} Bedienelemente`);return}
  const gold=JSON.parse(fs.readFileSync(file,'utf8'));const miss=[];
  for(const [n,list] of Object.entries(gold)){const have=new Set(cur[n]||[]);list.forEach(s=>{if(!have.has(s))miss.push(n+': '+s)})}
  t.eq(Object.keys(gold).filter(n=>!cur[n]),[],'Alle Ansichten vorhanden');
  t.eq(miss.slice(0,40),[],`Kein Bedienelement verloren (${Object.values(gold).reduce((a,v)=>a+v.length,0)} im Referenzstand, jetzt ${total})`);
}};
