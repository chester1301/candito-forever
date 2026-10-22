// Gemeinsame Hilfen für die Testsuite (Playwright, Chromium).
// Jeder Testfall exportiert {name, run(ctx)}; ctx = {browser, port, page(opts), t}.
const {chromium}=require('playwright');

class T{
  constructor(){this.fails=[];this.checks=0}
  ok(c,msg){this.checks++;if(!c)this.fails.push(msg||'Bedingung verletzt');return !!c}
  eq(a,b,msg){this.checks++;const same=JSON.stringify(a)===JSON.stringify(b);if(!same)this.fails.push(`${msg||'Vergleich'}: erwartet ${JSON.stringify(b)}, erhalten ${JSON.stringify(a)}`);return same}
  fail(msg){this.checks++;this.fails.push(msg)}
}

const IGN=/ERR_TUNNEL_CONNECTION_FAILED|ERR_FAILED|ERR_NAME_NOT_RESOLVED|fonts\.g|net::ERR_/;

// Seite mit Fehlersammlung öffnen. App ist nach ~3 s komplett (autoProg läuft bei 2,6 s).
async function openPage(browser,port,{width=390,height=844,scale=2,wait=3000,fixedTime=null,cv=false,gymList=false}={}){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:scale,locale:'de-DE',timezoneId:'Europe/Berlin',...(fixedTime?{reducedMotion:'reduce'}:{})});
  if(fixedTime)await page.clock.setFixedTime(new Date(fixedTime));
  // Tests messen Layout auch außerhalb des Bildschirms: content-visibility dort abschalten (reine Render-Optimierung der App)
  if(!cv)await page.addInitScript(()=>{document.addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent='#view *{content-visibility:visible!important}';document.head.appendChild(st)})});
  page.errors=[];
  page.on('pageerror',e=>page.errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!IGN.test(m.text()))page.errors.push('console: '+m.text())});
  await page.goto(`http://localhost:${port}/`);
  await page.waitForTimeout(wait);
  await page.evaluate(()=>{try{localStorage.setItem('cf-installhint','1')}catch(e){}const el=document.getElementById('cfbar');if(el){el.hidden=true}});
  // Bestehende Gym-Tests prüfen den bisherigen Gym-Modus (weiter wählbar); die Liste (Standard) prüfen eigene Tests mit {gymList:true}
  if(!gymList)await page.evaluate(()=>{try{if(S.meta.gymView!=='classic'){S.meta.gymView='classic';saveMeta()}}catch(e){}});
  return page;
}

// Beispiel-Einheiten anlegen (abgeschlossen, mit Check-in). Läuft in der Seite.
const SEED=`(n,opts)=>{opts=opts||{};let k=0;const pids=opts.pids||['intro','p8','p10'];
 pids.forEach(pid=>withProg(pid,()=>{for(let w=0;w<NW()&&k<n;w++)for(let d=0;d<ND()&&k<n;d++){const L=log(w,d,true);
  P[w][d].b.forEach((bl,b)=>{(L.b[b]||[]).forEach((z,i)=>{z.ok=true;z.kg=String((opts.kg||80)+b*5);z.r=String(bl.r).split(/[–-]/)[0].replace('AMRAP','8');z.rpe=bl.rpe!=null?String(bl.rpe):'7.5'})});
  L.done=true;const ago=(opts.span||2)*(n-k);const dt=new Date();dt.setDate(dt.getDate()-ago);dt.setHours(18,0,0,0);
  L.date=dt.toISOString();L.start=+dt-70*60e3;L.end=+dt;L.dur=70*60e3;L.diff=3;L.diffs=6;
  L.feel={sleeph:4,energy:4,food:3,strength:4};L.ckAt=L.start-5*60e3;saveLog(key(w,d));k++}}));return k}`;

async function seed(page,n,opts){return page.evaluate(`(${SEED})(${n},${JSON.stringify(opts||{})})`)}

async function launch(){return chromium.launch()}

module.exports={T,openPage,seed,launch};
