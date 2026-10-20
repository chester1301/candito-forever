#!/usr/bin/env node
// Testsuite: startet einen Server auf docs/ und führt alle Fälle in tests/cases aus.
//   node tests/run.js            – alle Fälle
//   node tests/run.js gym swap   – nur Fälle, deren Dateiname eines der Wörter enthält
//   node tests/run.js --update-golden  – Plan-Snapshot neu schreiben (nur nach bewusster Plan-Änderung!)
const {spawn}=require('child_process');
const net=require('net');
const path=require('path');
const fs=require('fs');
const {launch,openPage,T}=require('./lib');

const ROOT=path.resolve(__dirname,'..');
const DOCS=path.join(ROOT,'docs');
const args=process.argv.slice(2);
const UPDATE=args.includes('--update-golden');
const filters=args.filter(a=>!a.startsWith('--'));

function freePort(){return new Promise(res=>{const s=net.createServer();s.listen(0,()=>{const p=s.address().port;s.close(()=>res(p))})})}
function waitPort(port,ms=8000){return new Promise((res,rej)=>{const t0=Date.now();(function tryOnce(){const c=net.connect(port,'127.0.0.1');c.once('connect',()=>{c.end();res()});c.once('error',()=>{if(Date.now()-t0>ms)rej(new Error('Server startet nicht'));else setTimeout(tryOnce,120)})})()})}

(async()=>{
  if(!fs.existsSync(path.join(DOCS,'index.html'))){console.error('docs/index.html fehlt – zuerst python3 build.py');process.exit(2)}
  const port=process.env.PORT?+process.env.PORT:await freePort();
  let srv=null;
  if(!process.env.PORT){srv=spawn('python3',['-m','http.server',String(port)],{cwd:DOCS,stdio:'ignore'});await waitPort(port)}
  const browser=await launch();
  const dir=path.join(__dirname,'cases');
  let files=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort();
  if(filters.length)files=files.filter(f=>filters.some(w=>f.includes(w)));
  const results=[];const t0=Date.now();
  for(const f of files){
    const mod=require(path.join(dir,f));const t=new T();const pages=[];
    const ctx={browser,port,t,update:UPDATE,root:ROOT,page:async(o)=>{const p=await openPage(browser,port,o);pages.push(p);return p}};
    const s=Date.now();let crash=null;
    try{await mod.run(ctx)}catch(e){crash=e}
    for(const p of pages){for(const e of p.errors)t.fail(e);try{await p.close()}catch(e){}}
    if(crash)t.fail('Abbruch: '+(crash.stack||crash.message||String(crash)).split('\n').slice(0,3).join(' | '));
    const ok=!t.fails.length;results.push({f,name:mod.name,ok,checks:t.checks,fails:t.fails,ms:Date.now()-s});
    console.log(`${ok?'✓':'✗'} ${mod.name} (${t.checks} Prüfungen, ${Date.now()-s} ms)`);
    for(const m of t.fails)console.log('    – '+m);
  }
  await browser.close();if(srv)srv.kill();
  const bad=results.filter(r=>!r.ok);
  console.log(`\n${results.length-bad.length}/${results.length} Fälle bestanden · ${results.reduce((a,r)=>a+r.checks,0)} Prüfungen · ${Math.round((Date.now()-t0)/1000)} s`);
  process.exit(bad.length?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
