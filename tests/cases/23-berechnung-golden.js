// Berechnungen: Referenzstand aller berechneten Vorgaben (Lasten, Wiederholungen, RPE, Rechenweg) für jedes Programm
// und jede Side-Quest-Version, dazu Aufwärmsätze, Scheiben, e1RM/RPE-Tabelle und Punkteformeln.
// Synthetische Beispielwerte, keine echten Trainingsdaten. Jede Abweichung lässt den Test scheitern;
// bewusste Änderungen nur nach Abgleich mit Canditos Original: `node tests/run.js berechnung --update-golden`.
const fs=require('fs'),path=require('path');
const DUMP=()=>{
  // feste Ausgangslage: W1-Singles im Intro-Zyklus, 1RMs für alle Side Quests
  switchProg('intro');for(let d=0;d<ND();d++){const L=log(0,d,true);P[0][d].b.forEach((bl,b)=>(L.b[b]||[]).forEach((z,i)=>{z.ok=true;z.kg=String(100+b*5+d*2.5);z.r=String(bl.r).split(/[–-]/)[0].replace('AMRAP','8');z.rpe=bl.rpe!=null?String(bl.rpe):'8'}));L.done=true;saveLog(key(0,d))}
  S.meta.sq1rm={};Object.keys(SQF).forEach(f=>S.meta.sq1rm[f]={SQ:150,BP:110,DL:190});S.meta.round=2.5;S.meta.bar=20;
  const out={},hs=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
  for(const pid of Object.keys(PROGS)){const rows=[];withProg(pid,()=>{SG.clear();for(let w=0;w<NW();w++)for(let d=0;d<ND();d++)P[w][d].b.forEach((bl,b)=>{for(let i=0;i<(bl.s||1);i++){const v=sugg(w,d,b,i)||{};rows.push([w,d,b,i,v.kg??null,v.r??null,v.rdisp??null,v.rpe??null,v.t??null,hs(v.why||'')])}
      const wu=warmups(w,d,b);if(wu)rows.push(['wu',w,d,b,JSON.stringify(wu).length,hs(JSON.stringify(wu))])})});SG.clear();out[pid]={n:rows.length,hash:hs(JSON.stringify(rows)),first:rows.slice(0,12)}}
  const e=[],k=[];for(const kg of [60,100,142.5,200])for(let r=1;r<=12;r++)for(const rpe of [6,6.5,7,7.5,8,8.5,9,9.5,10]){e.push(e1rm(kg,r,rpe));k.push(kgFor(kg,r,rpe))}
  out.rpe={e1:hs(JSON.stringify(e)),kg:hs(JSON.stringify(k)),probe:[e1rm(100,5,8),kgFor(150,3,8),e1rm(142.5,1,9)]};
  out.punkte=[[500,82.5,false],[400,63,true],[650,105,false]].map(([t,bw,f])=>[dots(t,bw,f),ipfgl(t,bw,f),wilks(t,bw,f)]);
  out.scheiben=[20,22.5,60,102.5,141.25,200,257.5].map(x=>JSON.stringify(plates(x)));out.rundung=[61.2,99.9,101.26,143.74].map(x=>rnd(x));
  return out};
module.exports={name:'Berechnungen – Referenzstand aller Vorgaben, Aufwärmen, RPE, Punkte',async run({page,t,update,root}){
  const p=await page({fixedTime:'2026-10-21T18:00:00+02:00'});
  const cur=await p.evaluate(`(${DUMP})()`);
  const file=path.join(root,'tests','calc.golden.json');
  if(update||!fs.existsSync(file)){fs.writeFileSync(file,JSON.stringify(cur,null,0));t.ok(true,'Referenzstand geschrieben ('+Object.keys(cur).length+' Bereiche)');return}
  const gold=JSON.parse(fs.readFileSync(file,'utf8'));
  const diff=Object.keys({...gold,...cur}).filter(k=>JSON.stringify(gold[k])!==JSON.stringify(cur[k]));
  t.eq(diff,[],`Alle berechneten Vorgaben identisch zum Referenzstand (${Object.keys(gold).length} Bereiche, ${Object.values(gold).reduce((a,v)=>a+(v&&v.n||0),0)} Sätze)`);
  t.ok(Object.keys(cur).filter(k=>cur[k]&&cur[k].n).length===Object.keys(gold).filter(k=>gold[k]&&gold[k].n).length,'Gleiche Anzahl Programme und Side-Quest-Versionen');
}};
