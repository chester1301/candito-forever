// Rauchtest: node tests/smoke.js  (vorher: cd docs && python3 -m http.server 8765)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8765/');await p.waitForTimeout(3000);
for(const t of ['home','train','gym','prog','coach','sq'])await p.evaluate(t=>document.querySelector(`nav [data-tab="${t}"]`)?.click(),t);
await p.evaluate(()=>{for(const id of Object.keys(PROGS)){switchProg(id);for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){S.ui.w=w;S.ui.d=d;S.ui.tab='train';render();openGym();G.plan=true;renderGym();G.plan=false;closeGym(true)}}});
console.log(errs.length?'FEHLER\n'+errs.join('\n'):'OK – keine Fehler, Version '+await p.evaluate(()=>CF_VERSION));await b.close();process.exit(errs.length?1:0)})();
