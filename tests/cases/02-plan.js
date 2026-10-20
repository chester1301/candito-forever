// Plan-Daten: Canditos Vorgaben sind unantastbar. Jede Abweichung vom Snapshot (tests/plan.golden.json)
// lässt den Test scheitern – bewusste Änderungen werden mit `node tests/run.js --update-golden` übernommen.
const fs=require('fs');const path=require('path');
const DUMP=`()=>{const pick=b=>({e:b.e0||b.e,sw:b.sw||null,s:b.s,r:String(b.r),rpe:b.rpe??null,cap:b.cap??null,pct:b.pct??null,ref:b.ref||null,h:b.h||null,opt:b.opt?1:0,x:b.x});
 const out={};for(const pid of ['intro','p8','p10','p3','p10w']){const g=PROGS[pid];out[pid]=g.P.map((wk,w)=>wk.map((dy,d)=>({f:dy.f,b:dy.b.map(pick)})))}
 let h=0;const sq=typeof SQV!=='undefined'?SQV:{};const s=JSON.stringify(Object.keys(sq).sort().map(k=>sq[k].P.map(wk=>wk.map(dy=>dy.b.map(b=>[b.e,b.s,b.r,b.rpe??null,b.cap??null,b.pct??null,b.h||null])))));
 for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;out.sideQuests={blocks:(s.match(/\\[\\"/g)||[]).length,hash:h};return out}`;
module.exports={name:'Plan-Daten – Gültigkeit und Snapshot (Canditos Vorgaben)',async run({page,t,update,root}){
  const p=await page();
  // 1) Gültigkeit jedes Blocks
  const bad=await p.evaluate(()=>{const out=[];for(const pid of ['intro','p8','p10','p3','p10w']){PROGS[pid].P.forEach((wk,w)=>wk.forEach((dy,d)=>{if(!dy.b.length)out.push(`${pid} W${w+1}D${d+1}: leerer Tag`);dy.b.forEach((b,i)=>{const id=`${pid} W${w+1}D${d+1}#${i+1}`;
   if(!EX[b.e0||b.e])out.push(id+': Übung fehlt '+(b.e0||b.e));if(b.sw&&!EX[b.sw])out.push(id+': Alternative fehlt '+b.sw);
   if(!(b.s>=1&&b.s<=12))out.push(id+': Sätze '+b.s);if(!String(b.r).length)out.push(id+': Wdh leer');
   if(b.rpe!=null&&!(b.rpe>=4&&b.rpe<=10))out.push(id+': RPE '+b.rpe);if(b.cap!=null&&!(b.cap>=5&&b.cap<=10))out.push(id+': Cap '+b.cap);
   if(b.pct!=null&&!(Array.isArray(b.pct)?b.pct:[b.pct]).every(v=>v>=50&&v<=110))out.push(id+': Prozent '+b.pct);if(b.h&&!['l','m','h'].includes(b.h))out.push(id+': Hype '+b.h);
   if(b.sw&&b.sw===(b.e0||b.e))out.push(id+': Alternative = Original')})}))}return out});
  t.eq(bad,[],'Alle Blöcke gültig');
  // 2) Snapshot
  const cur=await p.evaluate(`(${DUMP})()`);
  const file=path.join(root,'tests','plan.golden.json');
  if(update||!fs.existsSync(file)){fs.writeFileSync(file,JSON.stringify(cur));t.ok(true,'Snapshot geschrieben');return}
  const gold=JSON.parse(fs.readFileSync(file,'utf8'));
  const diffs=[];
  for(const pid of Object.keys(gold)){
    if(pid==='sideQuests'){if(JSON.stringify(gold[pid])!==JSON.stringify(cur[pid]))diffs.push(`Side Quests geändert (${gold[pid].blocks}/${gold[pid].hash} → ${cur[pid].blocks}/${cur[pid].hash})`);continue}
    const G=gold[pid],C=cur[pid]||[];
    if(G.length!==C.length){diffs.push(`${pid}: ${G.length} → ${C.length} Wochen`);continue}
    G.forEach((wk,w)=>wk.forEach((dy,d)=>{const c=(C[w]||[])[d];if(!c){diffs.push(`${pid} W${w+1}D${d+1} fehlt`);return}
      if(dy.f!==c.f)diffs.push(`${pid} W${w+1}D${d+1}: Fokus „${dy.f}“ → „${c.f}“`);
      if(dy.b.length!==c.b.length)diffs.push(`${pid} W${w+1}D${d+1}: ${dy.b.length} → ${c.b.length} Blöcke`);
      dy.b.forEach((b,i)=>{const x=c.b[i];if(!x)return;for(const k of Object.keys(b))if(JSON.stringify(b[k])!==JSON.stringify(x[k]))diffs.push(`${pid} W${w+1}D${d+1}#${i+1} ${k}: ${JSON.stringify(b[k])} → ${JSON.stringify(x[k])}`)})}))
  }
  t.eq(diffs.slice(0,25),[],'Plan entspricht dem Snapshot (bei beabsichtigter Änderung: --update-golden)');
}};
