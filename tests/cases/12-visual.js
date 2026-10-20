// Optik: Screenshots der wichtigsten Ansichten pixelweise mit Referenzbildern vergleichen.
// Uhrzeit fest (22.10.2026, 17:00 Berlin), Animationen aus, Beispieldaten aus seed() – keine echten Trainingsdaten.
//   node tests/run.js visual                  – vergleichen
//   node tests/run.js visual --update-visual  – Referenzbilder neu schreiben (nur nach bewusster Optik-Änderung)
// Abweichungen landen als *-ist.png / *-diff.png in tests/visual/_out/ (nicht im Repository).
const fs=require('fs'),path=require('path');
const {seed}=require('../lib');
const FIXED='2026-10-22T17:00:00+02:00';
const SIZES=[[390,797],[430,850]];
const TOL_PX=40; // max. abweichende Pixel (≈ 6×6 pt); zwei identische Läufe ergeben 0

const STILL=`*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important;caret-color:transparent!important}
#cfbar,.toast,.undo{display:none!important}
html.vis-full #nav,html.vis-full #edge{display:none!important}`;

// Ansichten: name → Vorbereitung in der Seite; full = ganze Seite statt nur Bildschirm
const VIEWS=[
  {n:'heute-bildschirm',go:()=>{S.ui.tab='home';render();scrollTo(0,0)}},
  {n:'heute',full:true,go:()=>{S.ui.tab='home';render();scrollTo(0,0)}},
  {n:'training',full:true,go:()=>{S.ui.tab='train';S.ui.w=0;S.ui.d=0;render();scrollTo(0,0)}},
  {n:'progress',full:true,go:()=>{S.ui.tab='prog';S.ui.pd=null;render();scrollTo(0,0)}},
  {n:'einstellungen',full:true,go:()=>{S.ui.tab='setup';render();scrollTo(0,0)}},
  {n:'gym-satz',go:()=>{S.ui.w=0;S.ui.d=2;const L=log(0,2,true);L.done=false;L.start=Date.now();L.flow=1;L.ck=1;L.b.forEach(a=>a.forEach(z=>{z.ok=false}));L.b[0][0]={kg:'110',r:'1',rpe:'9'};saveLog(key(0,2));openGym();G.b=0;G.i=0;renderGym()},
   after:()=>{try{closeGym(true)}catch(e){}}},
  {n:'gym-pause',go:()=>{S.ui.w=0;S.ui.d=2;openGym();G.b=0;G.i=1;renderGym();startRest(240,{w:0,d:2,b:0,i:1});openSheet()},
   after:()=>{try{stopRest()}catch(e){}try{closeSheet()}catch(e){}try{closeGym(true)}catch(e){}}},
  {n:'zusammenfassung',go:()=>{svOpen(PROG,0,1,false)},after:()=>{try{svClose()}catch(e){}}},
];

// Zwei PNGs im Browser vergleichen (ohne Zusatzpakete): Anteil abweichender Pixel + Differenzbild
async function compare(page,a,b){
  return page.evaluate(async([a,b])=>{
    const load=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src});
    const [A,B]=await Promise.all([load(a),load(b)]);
    if(A.width!==B.width||A.height!==B.height)return {size:[A.width,A.height,B.width,B.height]};
    const W=A.width,H=A.height;const cv=n=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c};
    const ca=cv(),cb=cv(),cd=cv();const xa=ca.getContext('2d'),xb=cb.getContext('2d'),xd=cd.getContext('2d');
    xa.drawImage(A,0,0);xb.drawImage(B,0,0);const da=xa.getImageData(0,0,W,H).data,db=xb.getImageData(0,0,W,H).data;
    const out=xd.createImageData(W,H);let n=0;
    for(let i=0;i<da.length;i+=4){const d=Math.abs(da[i]-db[i])+Math.abs(da[i+1]-db[i+1])+Math.abs(da[i+2]-db[i+2]);
      if(d>48){n++;out.data[i]=255;out.data[i+1]=0;out.data[i+2]=80;out.data[i+3]=255}else{const g=(da[i]+da[i+1]+da[i+2])/12;out.data[i]=out.data[i+1]=out.data[i+2]=g;out.data[i+3]=255}}
    xd.putImageData(out,0,0);return {ratio:n/(W*H),n,diff:n?cd.toDataURL('image/png'):null}
  },[a,b]);
}

module.exports={name:'Optik – Screenshots gegen Referenzbilder',async run({page,t,updateVisual,root}){
  const dir=path.join(root,'tests','visual'),out=path.join(dir,'_out');
  fs.mkdirSync(dir,{recursive:true});fs.rmSync(out,{recursive:true,force:true});
  for(const [W,H] of SIZES){
    const p=await page({width:W,height:H,scale:1,fixedTime:FIXED});
    await p.addStyleTag({content:STILL});
    await seed(p,4,{pids:['intro'],kg:100});
    await p.evaluate(()=>{switchProg('intro');const L=log(0,1);if(L){L.diff=4;L.diffs=6;saveLog(key(0,1))}});
    for(const v of VIEWS){
      await p.evaluate(`(${v.go})()`);await p.waitForTimeout(700);
      await p.evaluate(()=>document.fonts&&document.fonts.ready);
      if(v.full)await p.evaluate(()=>document.documentElement.classList.add('vis-full'));
      const buf=await p.screenshot({fullPage:!!v.full,animations:'disabled',caret:'hide'});
      await p.evaluate(()=>document.documentElement.classList.remove('vis-full'));
      const name=`${v.n}-${W}x${H}.png`,ref=path.join(dir,name);
      if(updateVisual||!fs.existsSync(ref)){fs.writeFileSync(ref,buf);t.ok(true,name+' neu geschrieben')}
      else{
        const r=await compare(p,'data:image/png;base64,'+fs.readFileSync(ref).toString('base64'),'data:image/png;base64,'+buf.toString('base64'));
        const ok=!r.size&&r.n<=TOL_PX;
        if(!ok){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name.replace('.png','-ist.png')),buf);
          if(r.diff)fs.writeFileSync(path.join(out,name.replace('.png','-diff.png')),Buffer.from(r.diff.split(',')[1],'base64'))}
        t.ok(ok,r.size?`${name}: Größe geändert (${r.size[0]}×${r.size[1]} → ${r.size[2]}×${r.size[3]})`:`${name}: ${r.n} Pixel abweichend (${(r.ratio*100).toFixed(2)} %, erlaubt ${TOL_PX}) – siehe tests/visual/_out/`);
      }
      if(v.after)await p.evaluate(`(${v.after})()`);await p.waitForTimeout(200);
    }
    await p.close();
  }
}};
