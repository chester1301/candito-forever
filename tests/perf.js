// Performance-Messung (nicht Teil der Suite): node tests/perf.js [port] [läufe]
// Misst Startzeit, Renderzeit je Ansicht (Median aus N Läufen) und Gym-Satzabschluss mit Beispieldaten.
const {launch,openPage,seed}=require('./lib');const {VIEWS}=require('./views');
const port=+(process.argv[2]||8766),N=+(process.argv[3]||7),THR=+(process.argv[4]||1); // THR: CPU-Drosselung (4 ≈ älteres iPhone)
(async()=>{const b=await launch();const res={};
 // Start: Zeit bis erste gerenderte Ansicht (3 Läufe, kalt ohne Cache)
 const st=[];for(let k=0;k<3;k++){const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();await p.goto(`http://localhost:${port}/`);
  await p.waitForFunction(()=>document.getElementById('view')&&document.getElementById('view').children.length>0);
  st.push(await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];const fcp=performance.getEntriesByName('first-contentful-paint')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),fcp:fcp?Math.round(fcp.startTime):null}}));await c.close()}
 res.start=st;
 const p=await openPage(b,port,{width:390,height:844,scale:2,fixedTime:'2026-10-22T17:00:00+02:00',cv:true});
 if(THR>1){const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR})}
 await seed(p,12,{pids:['intro','p8'],kg:100});
 const med=a=>{a=[...a].sort((x,y)=>x-y);return +a[Math.floor(a.length/2)].toFixed(1)};
 res.render={};
 for(const [n,full,go,after] of VIEWS){const t=[];for(let k=0;k<N;k++){const ms=await p.evaluate(`(()=>{const t0=performance.now();(${go})();const el=document.body.offsetHeight;return performance.now()-t0})()`);t.push(ms);if(after)await p.evaluate(`(${after})()`).catch(()=>{})}res.render[n]=med(t)}
 // Satzabschluss im Gym: Zeit für Abhaken + Neuaufbau
 const g=[];for(let k=0;k<N;k++){g.push(await p.evaluate(()=>{S.ui.w=0;S.ui.d=3;const L=log(0,3,true);L.done=false;L.b.forEach(a=>a.forEach(z=>{z.ok=false}));saveLog(key(0,3));openGym();G.b=0;G.i=0;renderGym();const t0=performance.now();const z=L.b[0][0];z.kg='100';z.r='5';z.ok=true;saveLog(key(0,3));renderGym();const el=document.body.offsetHeight;const dt=performance.now()-t0;closeGym(true);return dt}))}
 res.gymSatz=med(g);
 const vals=Object.values(res.render);res.summe=+vals.reduce((a,b)=>a+b,0).toFixed(1);res.max=Object.entries(res.render).sort((a,b)=>b[1]-a[1]).slice(0,8);
 console.log(JSON.stringify(res,null,1));await b.close()})();
