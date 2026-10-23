/* ===================== Programmbibliothek =====================
   Zentrale Übersicht aller Programme: Programm › Variante › Block › Woche › Tag › Übung.
   - Eingebaute Candito-Programme werden NUR gelesen (aus PROGS/P) – keine Änderung an Plan oder Regeln.
   - Importierte Programme (PDF mit Text, JSON, CSV, eingefügter Text) liegen nur auf diesem Gerät (localStorage „cf-bib“),
     getrennt von Trainingsdaten (S.logs) und Einstellungen (S.meta). Nichts wird erfunden: fehlende Angaben bleiben leer und werden markiert.
   - Gym-Schnittstelle: kontrolliert. bibToGymDay() prüft und wandelt einen Tag in das Gym-Format; die App zeigt ihn nur als
     Vorschau (nichts wird gespeichert). Die Übernahme in echte Einheiten ist gesperrt (BIB_GYM_LIVE=false). */
const BIB_KEY='cf-bib',BIB_GYM_LIVE=false;
const BIB=(function(){
const esc3=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9%., ]+/g,' ').replace(/\s+/g,' ').trim();
const num=v=>{if(v==null||v==='')return null;const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n};
const uid=()=>'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

/* ---------- Speicher (nur Gerät, getrennt von Trainingsdaten) ---------- */
function load(){try{const o=JSON.parse(localStorage.getItem(BIB_KEY)||'null');return o&&o.v===1&&Array.isArray(o.progs)?o:{v:1,progs:[]}}catch(e){return {v:1,progs:[]}}}
function save(o){try{localStorage.setItem(BIB_KEY,JSON.stringify(o));return true}catch(e){return false}}

/* ---------- Eingebaute Programme (nur lesen) ---------- */
const BASE=[['intro',['intro']],['p8',['p8','p8b','p8c']],['p10',['p10','p10b','p10c','p10d']],['p3',['p3']],['p10w',['p10w']]];
const HYN={l:'Niedrig',m:'Moderat',h:'Hoch'};
function builtin(){const out=[];BASE.forEach(([base,ids])=>{const have=ids.filter(id=>typeof PROGS!=='undefined'&&PROGS[id]);if(!have.length)return;const g=PROGS[have[0]];
 const weeks=g.P.map((wk,w)=>({n:w+1,name:g.WEEKS[w]||'',days:wk.map((day,d)=>({n:d+1,name:(g.DAYS[d]&&g.DAYS[d].tag)||('Tag '+(d+1)),wd:(g.DAYS[d]&&g.DAYS[d].wdl)||'',focus:day.f||'',notes:day.d||'',hints:(g.INFO&&g.INFO[w+'-'+d])||[],
  ex:day.b.map(bl=>({eid:bl.e,name:(EX[bl.e]||{n:bl.e}).n,sets:bl.s,reps:bl.r,amrap:/AMRAP/i.test(String(bl.r)),rpe:bl.rpe!=null?bl.rpe:null,rpeEst:!!bl.rpeEst,
   load:bl.pct!=null?{pct:bl.pct,ref:bl.ref||null,text:bl.pct+' % '+(bl.ref==='TOP'?'der Top-Satz-Last':bl.ref?'der '+bl.ref+'-Referenz':'')}:bl.test?{text:'Test-Satz ('+bl.test+')'}:null,
   hype:bl.h?HYN[bl.h]:null,opt:!!bl.opt,notes:bl.x||'',flags:[]}))}))}));
 out.push({id:'bi-'+base,src:'builtin',name:g.name.replace(/ · Zyklus \d+$/,''),sub:g.sub,variants:have.map((id,i)=>({id,name:have.length>1?'Zyklus '+(i+1):'Standard',label:PROGS[id].name})),blocks:[{name:'Gesamtphase',weeks}]})});return out}

/* ---------- Übungen dem Katalog zuordnen ---------- */
const ALIAS={'paused barbell bench press':'pbb','paused bench':'pbb','comp bench':'pbb','competition bench':'pbb','comp squat':'csq','competition squat':'csq','comp deadlift':'cdl','competition deadlift':'cdl','paused squat':'psq','paused deadlift':'pdl'};
function matchEx(name){const n=norm(name);if(!n)return null;if(ALIAS[n])return ALIAS[n];if(typeof EX==='undefined')return null;let best=null,bs=0;const tn=new Set(n.split(' '));
 Object.keys(EX).forEach(k=>{const en=norm(EX[k].n);if(en===n){best=k;bs=2;return}const te=en.split(' ');const hit=te.filter(t=>tn.has(t)).length;const sc=hit/Math.max(te.length,tn.size);if(sc>bs&&sc>=.75){bs=sc;best=k}});return best}

/* ---------- Satz-/Lastvorgabe aus Text ---------- */
function parseRx(t){const s=String(t||'');const o={sets:null,reps:null,amrap:false,rpe:null,load:null,hype:null};
 let m=s.match(/(\d{1,2})\s*[x×]\s*(\d{1,2}(?:\s*[-–]\s*\d{1,2})?|AMRAP|max)/i);if(m){o.sets=+m[1];if(/amrap|max/i.test(m[2])){o.amrap=true;o.reps='AMRAP'}else o.reps=m[2].replace(/\s+/g,'').replace('-','–')}
 else if((m=s.match(/(\d{1,2})\s*(?:sets?|sätze|saetze)\s*(?:of|à|a|mit)?\s*(\d{1,2}(?:\s*[-–]\s*\d{1,2})?)\s*(?:reps?|wdh|wiederholungen)/i))){o.sets=+m[1];o.reps=m[2].replace(/\s+/g,'')}
 else if(/\bAMRAP\b/i.test(s)){o.amrap=true;o.reps='AMRAP';const k=s.match(/(\d)\s*(?:set|satz)/i);o.sets=k?+k[1]:1}
 if((m=s.match(/RPE\s*(\d{1,2}(?:[.,]\d)?)/i))||(m=s.match(/@\s*(\d{1,2}(?:[.,]\d)?)(?!\s*%)/)))o.rpe=num(m[1]);
 if((m=s.match(/(\d{2,3}(?:[.,]\d+)?)\s*%\s*(?:of|des|der|vom|von)?\s*([^.;,\n)]{0,60})?/i)))o.load={pct:num(m[1]),text:(m[0]||'').replace(/\s*(?:--|—|w\/?\s*(?:low|moderate|high)|\b(?:low|moderate|high|niedrig|moderat|hoch)\b\s*hype|hype).*$/i,'').trim().slice(0,60)};
 else if((m=s.match(/(\d{2,3}(?:[.,]\d+)?)\s*kg/i)))o.load={kg:num(m[1]),text:m[0]};
 else if(/no\s*%\s*prescription|keine\s*%-?vorgabe|by\s*feel|nach\s*gef[uü]hl/i.test(s))o.load={text:'keine %-Vorgabe (nach RPE)'};
 if((m=s.match(/\b(low|moderate|high|niedrig|moderat|hoch)\b\s*hype|hype\s*[:\-]?\s*(low|moderate|high|niedrig|moderat|hoch)/i))){const h=(m[1]||m[2]).toLowerCase();o.hype={low:'Niedrig',niedrig:'Niedrig',moderate:'Moderat',moderat:'Moderat',high:'Hoch',hoch:'Hoch'}[h]}
 return o}
function flagEx(x,src){const f=[];if(x.sets==null)f.push('Satzanzahl fehlt');if(x.reps==null)f.push('Wiederholungen fehlen');
 if(x.rpe==null&&!x.load&&!x.amrap)f.push('Keine Last- oder RPE-Vorgabe gefunden');if(!x.eid)f.push('Übung nicht im Übungskatalog – Name prüfen');
 if(src==='ocr'&&/[|©®°“”«»~^]|\b[a-z]{1}[A-Z]/.test(x.raw||''))f.push('Text aus Bilderkennung – Zeichen unsicher');return f}

/* ---------- Text-Parser (PDF-Text, OCR, eingefügter Text) ---------- */
const NOISE=/^(\d{1,2}:\d{2}\b.*|close description|description|start workout|exercises|hide tips.*|<?\s*hide tips.*|finish.*|show tips.*|\W{0,3})$/i;
const cleanNm=l=>{let L=l.trim();for(let i=0;i<3;i++)L=L.replace(/\s+(?:x{1,2}|×|-{2,}|—+|[|>»]+)$/i,'').trim();return L};
function isExName(l){const L=cleanNm(l);if(/[=;!?'’]|:\)|\(\s*$/.test(L)&&!/\(\s*[A-Z]/.test(L))return false;const letters=L.replace(/[^A-Za-zÄÖÜäöü]/g,'');if(letters.length<5||L.length>48)return false;const up=L.replace(/[^A-ZÄÖÜ]/g,'').length;return up/letters.length>.85&&!/^(DAY|TAG|WEEK|WOCHE)\b/i.test(L)}
function parseText(text,o){o=o||{};const src=o.src||'text';const lines=String(text||'').replace(/\r/g,'').split('\n').map(l=>l.replace(/\s+/g,' ').trim());
 const prog={id:uid(),src:'import',name:o.name||o.fallback||'Importiertes Programm',sub:'',file:o.file||'',fmt:o.fmt||'text',at:Date.now(),variants:[{id:'v1',name:'Standard'}],blocks:[{name:'Block 1',weeks:[]}],unparsed:[]};
 const B=prog.blocks[0];let wk=null,day=null,ex=null,mode=null;const getW=n=>{let w=B.weeks.find(x=>x.n===n);if(!w){w={n,name:'',days:[]};B.weeks.push(w);B.weeks.sort((a,b)=>a.n-b.n)}return w};
 const getD=(w,n)=>{let d=w.days.find(x=>x.n===n);if(!d){d={n,name:'Tag '+n,wd:'',focus:'',notes:'',hints:[],ex:[]};w.days.push(d);w.days.sort((a,b)=>a.n-b.n)}return d};
 const endEx=()=>{if(ex){const R=parseRx(ex.rxLine||'');Object.assign(ex,{sets:R.sets,reps:R.reps,amrap:R.amrap,rpe:R.rpe,load:R.load,hype:R.hype});ex.notes=ex.noteL.join(' ').trim();delete ex.noteL;delete ex.rxLine;
   ex.flags=flagEx(ex,src);const dup=day.ex.find(y=>y!==ex&&norm(y.name)===norm(ex.name)&&(y.raw===ex.raw||!ex.sets));if(dup){if(!dup.notes&&ex.notes)dup.notes=ex.notes;day.ex.splice(day.ex.indexOf(ex),1)}ex=null}};
 for(const l of lines){if(!l)continue;let m;
  if((m=l.match(/^(?:week|woche)\s*(\d{1,2})\s*(?:[-–—:]+\s*(.*))?$/i))){endEx();wk=getW(+m[1]);if(m[2]&&!wk.name)wk.name=m[2].trim();mode=null;continue}
  if((m=l.match(/^(?:day|tag)\s*(\d{1,2})\s*(?:[-–—:]\s*([A-Za-zÄÖÜäöü]+))?\s*(?:\((?:W(?:eek)?\s*(\d{1,2}))?[,\s]*([^)]*)\))?/i))){endEx();const wn=m[3]?+m[3]:(wk?wk.n:1);wk=getW(wn);day=getD(wk,+m[1]);if(m[2])day.wd=m[2];
   if(m[4]&&!o.name&&!prog.named){prog.name=m[4].trim().replace(/\s+/g,' ');prog.named=1}mode='afterDay';continue}
  if(!day){if(NOISE.test(l))continue;prog.unparsed.push(l);continue}
  if(/^close description$/i.test(l)){mode=null;continue}
  if(/^description$/i.test(l)){endEx();mode='desc';continue}
  if(NOISE.test(l))continue;
  if(mode==='afterDay'){const f=l.match(/(legs?|chest|back|arms?|upper|lower|full ?body|push|pull|beine|brust|rücken|arme|oberkörper|unterkörper)\b.*$/i);if(f){day.focus=f[0].replace(/^focus:\s*/i,'');mode=null;continue}}
  if(mode==='desc'){day.notes=(day.notes?day.notes+' ':'')+l;continue}
  if(isExName(l)&&ex&&!ex.rxLine&&!ex.noteL.length){ex.name=(ex.name+' '+cleanNm(l).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())).replace(/\s+/g,' ');ex.eid=matchEx(ex.name);continue}
  if(isExName(l)){endEx();const nm=cleanNm(l).replace(/\s+/g,' ').trim();const pretty=nm.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
   ex={name:pretty,eid:matchEx(nm),raw:'',rxLine:'',noteL:[],flags:[]};day.ex.push(ex);mode='ex';continue}
  if(ex){if(!ex.rxLine&&/\d\s*[x×]\s*(\d|amrap)|\bAMRAP\b|\d\s*(?:sets?|sätze)/i.test(l)){ex.rxLine=l;ex.raw=l;continue}
   if(ex.rxLine&&ex.noteL.length===0&&/^(--|—|w\/|at |@|mit |with )/i.test(l)){ex.rxLine+=' '+l;ex.raw+=' '+l;continue}ex.noteL.push(l);continue}
  day.notes=(day.notes?day.notes+' ':'')+l}
 endEx();delete prog.named;if(!B.weeks.length)prog.flags=['Keine Wochen/Tage erkannt – Format nicht lesbar'];return finish(prog)}
function finish(p){let n=0,f=0;(p.blocks||[]).forEach(b=>(b.weeks||[]).forEach(w=>(w.days||[]).forEach(d=>{if(!d.ex.length){d.flags=['Keine Übungen erkannt']}(d.ex||[]).forEach(x=>{n++;if(x.flags&&x.flags.length)f++})})));p.stats={ex:n,flagged:f};return p}

/* ---------- CSV ---------- */
const COLS={prog:['programm','program','programme'],variant:['variante','variant'],block:['block','phase'],week:['woche','week','wk'],weekName:['wochenname','week name','weekname'],day:['tag','day'],dayName:['tagesname','day name','fokus','focus'],
 ex:['uebung','übung','exercise','lift'],sets:['saetze','sätze','sets'],reps:['wdh','wiederholungen','reps'],load:['last','load','prozent','percent','%'],rpe:['rpe'],hype:['hype'],notes:['hinweis','hinweise','notes','note','coaching']};
function csvSplit(line,sep){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(q){if(c==='"'){if(line[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}else if(c==='"')q=true;else if(c===sep){out.push(cur);cur=''}else cur+=c}out.push(cur);return out.map(s=>s.trim())}
function parseCSV(text,o){o=o||{};const lines=String(text||'').replace(/^﻿/,'').split(/\r?\n/).filter(l=>l.trim());if(!lines.length)return {error:'Datei ist leer'};
 const sep=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?';':',';const head=csvSplit(lines[0],sep).map(h=>norm(h));
 const idx={};Object.entries(COLS).forEach(([k,al])=>{const an=al.map(norm);const i=head.findIndex(h=>an.includes(h));if(i>=0)idx[k]=i});
 const miss=['week','day','ex'].filter(k=>idx[k]==null);if(miss.length)return {error:'Spalten fehlen: '+miss.map(k=>({week:'Woche',day:'Tag',ex:'Übung'}[k])).join(', ')+'. Erwartet z. B.: Programm;Woche;Tag;Übung;Sätze;Wdh;Last;RPE;Hype;Hinweis'};
 const progs={};lines.slice(1).forEach((l,ri)=>{const c=csvSplit(l,sep);const g=k=>idx[k]!=null?(c[idx[k]]||'').trim():'';const pn=g('prog')||o.name||'CSV-Import';
  const P=progs[pn]||(progs[pn]={id:uid(),src:'import',name:pn,sub:'',file:o.file||'',fmt:'csv',at:Date.now(),variants:[],blocks:[],unparsed:[]});
  const vn=g('variant')||'Standard';if(!P.variants.some(v=>v.name===vn))P.variants.push({id:'v'+(P.variants.length+1),name:vn});
  const bn=(g('variant')&&P.variants.length>1?vn+' · ':'')+(g('block')||'Block 1');let Bk=P.blocks.find(b=>b.name===bn);if(!Bk){Bk={name:bn,variant:vn,weeks:[]};P.blocks.push(Bk)}
  const wn=parseInt(g('week'),10),dn=parseInt(g('day'),10);if(!wn||!dn||!g('ex')){P.unparsed.push('Zeile '+(ri+2)+': '+l);return}
  let W=Bk.weeks.find(x=>x.n===wn);if(!W){W={n:wn,name:g('weekName'),days:[]};Bk.weeks.push(W);Bk.weeks.sort((a,b)=>a.n-b.n)}
  let D=W.days.find(x=>x.n===dn);if(!D){D={n:dn,name:'Tag '+dn,wd:'',focus:g('dayName'),notes:'',hints:[],ex:[]};W.days.push(D);W.days.sort((a,b)=>a.n-b.n)}
  const ld=g('load');const R=parseRx([g('sets')&&g('reps')?g('sets')+'x'+g('reps'):'',ld?(/%|kg/i.test(ld)?ld:ld+' %'):'',g('rpe')?'RPE '+g('rpe'):'',g('hype')?g('hype')+' hype':''].join(' '));
  const x={name:g('ex'),eid:matchEx(g('ex')),sets:num(g('sets'))!=null?num(g('sets')):R.sets,reps:g('reps')||R.reps,amrap:/amrap/i.test(g('reps')),rpe:num(g('rpe')),load:ld?(/%/.test(ld)||/^[\d.,]+$/.test(ld)?{pct:num(ld.replace('%','')),text:ld.includes('%')?ld:ld+' %'}:/kg/i.test(ld)?{kg:num(ld),text:ld}:{text:ld}):null,hype:R.hype||(g('hype')||null),notes:g('notes'),raw:l};
  x.flags=flagEx(x,'csv');D.ex.push(x)});return {progs:Object.values(progs).map(finish)}}

/* ---------- JSON ---------- */
function parseJSON(text,o){let j;try{j=JSON.parse(text)}catch(e){return {error:'Kein gültiges JSON: '+e.message}}
 const list=Array.isArray(j)?j:j&&Array.isArray(j.programs)?j.programs:j&&j.blocks?[j]:null;if(!list)return {error:'Unbekanntes JSON-Format. Erwartet: {"programs":[{"name":…,"blocks":[{"weeks":[{"n":1,"days":[{"n":1,"ex":[…]}]}]}]}]}'};
 const progs=list.map(p=>{const P={id:uid(),src:'import',name:String(p.name||'JSON-Import'),sub:String(p.sub||''),file:(o&&o.file)||'',fmt:'json',at:Date.now(),variants:Array.isArray(p.variants)&&p.variants.length?p.variants.map((v,i)=>({id:'v'+(i+1),name:String(v.name||v)})):[{id:'v1',name:'Standard'}],unparsed:[],
  blocks:(p.blocks||[]).map(b=>({name:String(b.name||'Block'),variant:b.variant||null,weeks:(b.weeks||[]).map((w,wi)=>({n:+w.n||wi+1,name:String(w.name||''),days:(w.days||[]).map((d,di)=>({n:+d.n||di+1,name:String(d.name||('Tag '+(+d.n||di+1))),wd:String(d.wd||''),focus:String(d.focus||''),notes:String(d.notes||''),hints:Array.isArray(d.hints)?d.hints.map(String):[],
   ex:(d.ex||d.exercises||[]).map(x=>{const R=x.rx?parseRx(x.rx):{};const e={name:String(x.name||''),eid:x.eid||matchEx(x.name),sets:x.sets!=null?num(x.sets):R.sets??null,reps:x.reps!=null?String(x.reps):R.reps??null,amrap:!!(x.amrap||/amrap/i.test(String(x.reps||''))),rpe:x.rpe!=null?num(x.rpe):R.rpe??null,
    load:x.load?(typeof x.load==='object'?x.load:{text:String(x.load)}):R.load||null,hype:x.hype||R.hype||null,notes:String(x.notes||''),raw:x.rx||''};e.flags=flagEx(e,'json');return e})}))}))}))};return finish(P)});return {progs}}

/* ---------- PDF: Text aus PDF lesen (ohne Fremdbibliothek) ---------- */
async function inflate(u8){if(typeof DecompressionStream==='undefined')throw new Error('Entpacken wird von diesem Browser nicht unterstützt');for(const fmt of ['deflate','deflate-raw']){try{const ds=new DecompressionStream(fmt);const r=new Response(new Blob([u8]).stream().pipeThrough(ds));return new Uint8Array(await r.arrayBuffer())}catch(e){}}throw new Error('Datenstrom nicht lesbar')}
function pdfStr(s){return s.replace(/\\(\d{1,3})/g,(m,o)=>String.fromCharCode(parseInt(o,8))).replace(/\\n/g,'\n').replace(/\\r/g,'').replace(/\\t/g,' ').replace(/\\([()\\])/g,'$1')}
function hexStr(h){h=h.replace(/\s+/g,'');let o='';if(h.length%4===0&&/^00|^feff/i.test(h)){for(let i=0;i<h.length;i+=4)o+=String.fromCharCode(parseInt(h.substr(i,4),16))}else for(let i=0;i<h.length;i+=2)o+=String.fromCharCode(parseInt(h.substr(i,2),16));return o}
function textOps(c){let out='',line='';const flush=()=>{if(line.trim())out+=line.trim()+'\n';line=''};
 const re=/\[((?:\\.|[^\]])*)\]\s*TJ|\(((?:\\.|[^\\)])*)\)\s*(?:Tj|'|")|<([0-9a-fA-F\s]+)>\s*Tj|(T\*|ET|BT)|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|[\d.\-\s]+Tm/g;let m;
 while((m=re.exec(c))){if(m[1]!=null){const parts=m[1].match(/\(((?:\\.|[^\\)])*)\)|<([0-9a-fA-F\s]+)>|-?\d+(?:\.\d+)?/g)||[];parts.forEach(p=>{if(p[0]==='(')line+=pdfStr(p.slice(1,-1));else if(p[0]==='<')line+=hexStr(p.slice(1,-1));else if(+p<-200)line+=' '})}
  else if(m[2]!=null)line+=pdfStr(m[2]);else if(m[3]!=null)line+=hexStr(m[3]);else if(m[4])flush();else if(m[6]!=null){if(Math.abs(+m[6])>.5)flush();else line+=' '}else flush()}flush();return out}
async function pdfText(buf){const u8=new Uint8Array(buf);const bin=new TextDecoder('latin1').decode(u8);if(!bin.startsWith('%PDF'))throw new Error('Keine PDF-Datei');
 let text='',images=0,streams=0;const re=/<<((?:(?!>>\s*stream)[\s\S]){0,800})>>\s*stream\r?\n/g;let m;
 while((m=re.exec(bin))){const dict=m[1];const start=m.index+m[0].length;let end=bin.indexOf('endstream',start);if(end<0)break;let len=parseInt((dict.match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/)||[])[1],10);if(!isNaN(len)&&len>0&&start+len<=end+2)end=start+len;
  if(/\/Subtype\s*\/Image/.test(dict)){images++;continue}if(/\/Type\s*\/(XRef|ObjStm|Metadata)/.test(dict)||/\/Length1|\/Subtype\s*\/(Type1C|CIDFontType0C|OpenType)/.test(dict))continue;streams++;
  let data=u8.subarray(start,end);try{if(/\/FlateDecode/.test(dict))data=await inflate(data);else if(/\/Filter/.test(dict))continue}catch(e){continue}
  const s=new TextDecoder('latin1').decode(data);if(/\bBT\b/.test(s))text+=textOps(s)+'\n'}
 try{text=decodeURIComponent(escape(text))}catch(e){}return {text:text.trim(),images,streams}}

/* ---------- Import-Einstieg ---------- */
async function importFile(file){const nm=file.name||'Datei';const base=nm.replace(/\.[a-z0-9]+$/i,'').replace(/^[0-9a-f]{8}-/,'').replace(/_/g,' ').trim();const ext=(nm.split('.').pop()||'').toLowerCase();
 if(ext==='json'||file.type==='application/json')return parseJSON(await file.text(),{file:nm});
 if(ext==='csv'||file.type==='text/csv')return parseCSV(await file.text(),{file:nm,name:base});
 if(ext==='txt'||file.type==='text/plain'){const p=parseText(await file.text(),{file:nm,fallback:base,fmt:'text'});return {progs:[p]}}
 if(ext==='pdf'||file.type==='application/pdf'){let r;try{r=await pdfText(await file.arrayBuffer())}catch(e){return {error:'PDF nicht lesbar: '+e.message}}
  if(r.text.replace(/\s/g,'').length<40)return {error:r.images?`Diese PDF enthält nur Bilder (${r.images} Bildseiten, z. B. Screenshots) und keinen auslesbaren Text. Tipp: Auf dem iPhone den Text im Screenshot mit „Live Text“ markieren, kopieren und unter „Text einfügen“ importieren – oder die Datei als JSON/CSV bereitstellen.`:'In der PDF wurde kein auslesbarer Text gefunden.',imageOnly:!!r.images};
  const p=parseText(r.text,{file:nm,fallback:base,fmt:'pdf'});return {progs:[p]}}
 return {error:'Dateityp nicht unterstützt. Erlaubt: PDF (mit Text), JSON, CSV, TXT.'}}

/* ---------- Kontrollierte Gym-Schnittstelle ---------- */
function toGymDay(day){const issues=[];const b=[];(day.ex||[]).forEach((x,i)=>{const need=[];if(!x.eid)need.push('Übung nicht im Katalog');if(x.sets==null)need.push('Satzanzahl fehlt');if(x.reps==null)need.push('Wiederholungen fehlen');
  if(need.length){issues.push({i,name:x.name,need});return}
  const r=String(x.reps).replace('–','-');const bl={e:x.eid,s:x.sets,r:x.amrap?'AMRAP':r,x:[x.sets+'×'+x.reps,x.rpe!=null?'@ RPE '+String(x.rpe).replace('.',','):'',x.load&&x.load.text?'· '+x.load.text:''].join(' ').trim()};
  if(x.rpe!=null)bl.rpe=x.rpe;if(x.hype)bl.h={Niedrig:'l',Moderat:'m',Hoch:'h'}[x.hype]||undefined;b.push(bl)});
 return {ok:!issues.length&&b.length>0,live:BIB_GYM_LIVE,day:{f:day.focus||day.name,d:day.notes||'',b},issues}}

return {load,save,builtin,parseText,parseCSV,parseJSON,parseRx,pdfText,importFile,toGymDay,matchEx,norm,esc:esc3}})();
window.BIB=BIB;

/* ===================== Programmbibliothek – Oberfläche ===================== */
(function(){const E=BIB.esc;let ST={p:null,v:0,b:0,w:null,d:null,imp:null,paste:false,del:null,gym:null};
function all(){return BIB.builtin().concat(BIB.load().progs)}
function cnt(p){let w=0,d=0,x=0,f=0;(p.blocks||[]).forEach(b=>(b.weeks||[]).forEach(W=>{w++;(W.days||[]).forEach(D=>{d++;(D.ex||[]).forEach(X=>{x++;if(X.flags&&X.flags.length)f++})})}));return {w,d,x,f}}
const ICO={back:'<path d="M15 6l-6 6 6 6"/>',up:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',warn:'<path d="M12 4 2 20h20L12 4z"/><path d="M12 10v4M12 17h.01"/>',chev:'<path d="m9 6 6 6-6 6"/>',lib:'<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-.8 3 15.6-3.5.8z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'};
const ic=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
function flagsHTML(f){return f&&f.length?`<p class="bb-fl">${ic('warn')}<span>${f.map(E).join(' · ')}</span></p>`:''}
function exHTML(x){const load=x.load?(x.load.text||(x.load.pct!=null?x.load.pct+' %':x.load.kg!=null?x.load.kg+' kg':'')):'';
 return `<article class="bb-ex${x.flags&&x.flags.length?' warn':''}"><div class="bb-exh"><b>${E(x.name||'–')}</b>${x.eid?'':'<span class="bb-tag w">nicht im Katalog</span>'}${x.opt?'<span class="bb-tag">optional</span>':''}</div>
 <dl class="bb-kv"><div><dt>Sätze</dt><dd>${x.sets!=null?E(x.sets):'<i>fehlt</i>'}</dd></div><div><dt>Wdh.</dt><dd>${x.reps!=null?E(x.reps):'<i>fehlt</i>'}</dd></div><div><dt>RPE</dt><dd>${x.rpe!=null?E(String(x.rpe).replace('.',','))+(x.rpeEst?' (Schätzung)':''):'–'}</dd></div><div><dt>Last</dt><dd>${load?E(load):'–'}</dd></div>${x.hype?`<div><dt>Hype</dt><dd>${E(x.hype)}</dd></div>`:''}</dl>
 ${x.notes?`<p class="bb-nt">${E(x.notes)}</p>`:''}${flagsHTML(x.flags)}${x.raw&&x.flags&&x.flags.length?`<p class="bb-raw">Gelesen: „${E(x.raw)}“</p>`:''}</article>`}
function crumbs(p){const c=[['Bibliothek','root']];if(p){c.push([p.name,'p']);if(ST.w!=null)c.push(['Woche '+ST.w,'w']);if(ST.d!=null)c.push(['Tag '+ST.d,'d'])}return `<nav class="bb-cr" aria-label="Pfad">${c.map(([t,k],i)=>i<c.length-1?`<button type="button" data-bbcr="${k}">${E(t)}</button><span>›</span>`:`<b>${E(t)}</b>`).join('')}</nav>`}
function body(){const P=all();const p=ST.p?P.find(x=>x.id===ST.p):null;
 if(ST.imp)return importPreview();if(ST.paste)return pasteHTML();if(ST.gym)return gymPrev();
 if(!p){const bi=P.filter(x=>x.src==='builtin'),im=P.filter(x=>x.src!=='builtin');const card=x=>{const c=cnt(x);return `<button type="button" class="bb-card" data-bbp="${x.id}"><span class="bb-ct"><b>${E(x.name)}</b><small>${x.src==='builtin'?'Eingebaut · nur lesen':'Importiert'+(x.file?' · '+E(x.file):'')} · ${x.variants.length} ${x.variants.length===1?'Variante':'Varianten'} · ${c.w} Wochen · ${c.d} Tage · ${c.x} Übungen</small>${c.f?`<em class="bb-tag w">${c.f} unvollständig</em>`:''}</span>${ic('chev')}</button>`};
  return `<div class="bb-imp"><label class="bb-btn"><input type="file" id="bbfile" accept=".pdf,.json,.csv,.txt,application/pdf,application/json,text/csv,text/plain" hidden>${ic('up')}Datei importieren</label><button type="button" class="bb-btn s" data-bbpaste>Text einfügen</button></div>
  <p class="bb-note">PDF (mit Text), JSON, CSV oder TXT. Nur eigene oder zur Nutzung freigegebene Dateien importieren. Die Bibliothek liest ausschließlich Dateien, die du selbst auswählst – sie ruft keine Inhalte aus Apps oder Diensten (z. B. Superset) ab. Importe liegen nur auf diesem iPhone, getrennt von deinen Trainingsdaten.</p>
  <h3 class="bb-h">Eingebaute Candito-Programme</h3>${bi.map(card).join('')}<h3 class="bb-h">Importiert</h3>${im.length?im.map(card).join(''):'<p class="bb-e">Noch nichts importiert.</p>'}`}
 const c=cnt(p);const blk=p.blocks[ST.b]||p.blocks[0];
 if(ST.w==null){return `${crumbs(p)}<header class="bb-ph"><h2>${E(p.name)}</h2><p>${p.src==='builtin'?'Eingebaut · Canditos Vorgaben, nur lesen':'Importiert'+(p.file?' aus '+E(p.file):'')} · ${c.x} Übungen${c.f?` · <b class="w">${c.f} unvollständig</b>`:''}</p></header>
  ${p.variants.length>1?`<p class="bb-l">Variante</p><div class="seg bb-seg" style="grid-template-columns:repeat(${Math.min(4,p.variants.length)},1fr)">${p.variants.map((v,i)=>`<button type="button" data-bbv="${i}" aria-pressed="${ST.v===i}">${E(v.name)}</button>`).join('')}</div>${p.src==='builtin'?'<p class="bb-note">Die Zyklen nutzen denselben Plan von Candito; sie unterscheiden sich nur in deinen Trainingsdaten.</p>':''}`:''}
  ${p.blocks.length>1?`<p class="bb-l">Block</p><div class="seg bb-seg" style="grid-template-columns:repeat(${Math.min(3,p.blocks.length)},1fr)">${p.blocks.map((b,i)=>`<button type="button" data-bbb="${i}" aria-pressed="${ST.b===i}">${E(b.name)}</button>`).join('')}</div>`:''}
  <p class="bb-l">${E(blk.name)} · Wochen</p>${blk.weeks.map(W=>{const f=W.days.reduce((a,D)=>a+D.ex.filter(x=>x.flags&&x.flags.length).length+(D.flags?1:0),0);return `<button type="button" class="bb-card" data-bbw="${W.n}"><span class="bb-ct"><b>Woche ${W.n}${W.name?' · '+E(W.name):''}</b><small>${W.days.length} Tage · ${W.days.reduce((a,D)=>a+D.ex.length,0)} Übungen</small>${f?`<em class="bb-tag w">${f} unvollständig</em>`:''}</span>${ic('chev')}</button>`}).join('')||'<p class="bb-e">Keine Wochen erkannt.</p>'}
  ${p.unparsed&&p.unparsed.length?`<details class="bb-un"><summary>${ic('warn')} ${p.unparsed.length} Zeilen nicht zugeordnet</summary><pre>${E(p.unparsed.slice(0,80).join('\n'))}</pre></details>`:''}
  ${p.src!=='builtin'?(ST.del===p.id?`<button type="button" class="bb-del armed" data-bbdel="${p.id}">Wirklich löschen? Nochmal tippen</button>`:`<button type="button" class="bb-del" data-bbdel="${p.id}">Aus Bibliothek löschen</button>`)+`<button type="button" class="bb-btn s" data-bbexp="${p.id}" style="margin-top:8px">Als JSON exportieren</button>`:''}`}
 const W=blk.weeks.find(x=>x.n===ST.w);if(!W){ST.w=null;return body()}
 if(ST.d==null)return `${crumbs(p)}<header class="bb-ph"><h2>Woche ${W.n}${W.name?' · '+E(W.name):''}</h2></header>${W.days.map(D=>`<button type="button" class="bb-card" data-bbd="${D.n}"><span class="bb-ct"><b>${E(D.name)}${D.wd?' · '+E(D.wd):''}${D.focus?' · '+E(D.focus):''}</b><small>${D.ex.length} Übungen${D.ex.length?' · '+E(D.ex.slice(0,3).map(x=>x.name).join(', '))+(D.ex.length>3?' …':''):''}</small>${D.flags||D.ex.some(x=>x.flags&&x.flags.length)?'<em class="bb-tag w">prüfen</em>':''}</span>${ic('chev')}</button>`).join('')}`;
 const D=W.days.find(x=>x.n===ST.d);if(!D){ST.d=null;return body()}
 return `${crumbs(p)}<header class="bb-ph"><h2>${E(D.name)}${D.wd?' · '+E(D.wd):''}</h2><p>Woche ${W.n}${D.focus?' · '+E(D.focus):''} · ${D.ex.length} Übungen</p></header>
 ${D.notes?`<section class="bb-co"><b>Coaching-Hinweise</b><p>${E(D.notes)}</p>${(D.hints||[]).map(h=>`<p>${E(h)}</p>`).join('')}</section>`:(D.hints||[]).length?`<section class="bb-co"><b>Coaching-Hinweise</b>${D.hints.map(h=>`<p>${E(h)}</p>`).join('')}</section>`:''}
 ${flagsHTML(D.flags)}${D.ex.map(exHTML).join('')}
 ${p.src!=='builtin'?`<button type="button" class="bb-btn" data-bbgym>${ic('eye')}Im Gym-Layout ansehen</button><p class="bb-note">Vorschau über die kontrollierte Gym-Schnittstelle – es wird nichts gespeichert und keine Einheit angelegt.</p>`:''}`}
function importPreview(){const R=ST.imp;if(R.error)return `<header class="bb-ph"><h2>Import nicht möglich</h2></header><p class="bb-err">${ic('warn')}<span>${E(R.error)}</span></p><button type="button" class="bb-btn s" data-bbimpx>Zurück</button>${R.imageOnly?'<button type="button" class="bb-btn" data-bbpaste style="margin-top:8px">Text einfügen</button>':''}`;
 return `<header class="bb-ph"><h2>Import prüfen</h2><p>${R.progs.length} ${R.progs.length===1?'Programm':'Programme'} erkannt – bitte vor dem Übernehmen kontrollieren.</p></header>
 ${R.progs.map(p=>{const c=cnt(p);return `<section class="bb-sum"><b>${E(p.name)}</b><dl class="bb-kv"><div><dt>Wochen</dt><dd>${c.w}</dd></div><div><dt>Tage</dt><dd>${c.d}</dd></div><div><dt>Übungen</dt><dd>${c.x}</dd></div><div><dt>Unvollständig</dt><dd class="${c.f?'w':''}">${c.f}</dd></div></dl>
  ${p.flags?flagsHTML(p.flags):''}${p.unparsed&&p.unparsed.length?`<p class="bb-note">${p.unparsed.length} Zeilen konnten keinem Tag zugeordnet werden – sie bleiben sichtbar unter „nicht zugeordnet“.</p>`:''}
  ${(p.blocks[0]&&p.blocks[0].weeks.slice(0,1).flatMap(W=>W.days.slice(0,1)).map(D=>`<p class="bb-l">Beispiel: Woche ${p.blocks[0].weeks[0].n} · ${E(D.name)}</p>${D.ex.slice(0,3).map(exHTML).join('')}`).join(''))||''}</section>`}).join('')}
 <div class="bb-imp"><button type="button" class="bb-btn" data-bbok>In Bibliothek übernehmen</button><button type="button" class="bb-btn s" data-bbimpx>Verwerfen</button></div>`}
function pasteHTML(){return `<header class="bb-ph"><h2>Text einfügen</h2><p>Zum Beispiel per „Live Text“ aus Screenshots kopiert. Erkannt werden Zeilen wie „Week 4 -- Test Week“, „Day 1 - Monday (W4, INTRO)“, Übungsnamen in GROSSBUCHSTABEN und „3 x 3 at RPE 8“.</p></header>
 <label class="bb-l" for="bbname">Programmname</label><input id="bbname" class="bb-in" placeholder="z. B. Candito 3RM-Phase (eigene Notizen)"><label class="bb-l" for="bbtxt">Text</label><textarea id="bbtxt" class="bb-in" rows="12" placeholder="Week 1 -- …&#10;Day 1 - Monday (W1, …)&#10;COMP SQUAT&#10;3 x 3 at RPE 8"></textarea>
 <div class="bb-imp"><button type="button" class="bb-btn" data-bbparse>Auswerten</button><button type="button" class="bb-btn s" data-bbimpx>Abbrechen</button></div>`}
function gymPrev(){const g=ST.gym;return `<header class="bb-ph"><h2>Gym-Vorschau</h2><p>Nur ansehen – nichts wird gespeichert.${g.live?'':' Die Übernahme in echte Einheiten ist noch gesperrt, bis du sie freigibst.'}</p></header>
 ${g.issues.length?`<p class="bb-err">${ic('warn')}<span>${g.issues.length} ${g.issues.length===1?'Übung kann':'Übungen können'} nicht ins Gym übernommen werden: ${g.issues.map(i=>E(i.name)+' ('+i.need.join(', ')+')').join('; ')}</span></p>`:''}
 <div class="bb-gym">${g.day.b.map((bl,i)=>`<section class="bb-gx"><b>${E((EX[bl.e]||{n:bl.e}).n)}</b><p>${E(bl.x)}</p>${Array.from({length:bl.s},(_,k)=>`<div class="bb-gr"><span>${k+1}</span><em>× ${E(bl.r)}${bl.rpe!=null?' @ RPE '+String(bl.rpe).replace('.',','):''}</em><i>+</i></div>`).join('')}</section>`).join('')||'<p class="bb-e">Keine übernehmbaren Übungen.</p>'}</div>
 <button type="button" class="bb-btn s" data-bbgymx>Zurück zum Tag</button>`}
function render(){let el=document.getElementById('bibv');if(!el){el=document.createElement('div');el.id='bibv';el.className='bibv';document.body.appendChild(el)}
 const y=el.querySelector('.bb-sc')?el.querySelector('.bb-sc').scrollTop:0;
 el.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Programmbibliothek"><div class="bb-top"><button type="button" class="bb-x" data-bbback aria-label="Zurück">${ic('back')}</button><div><small>Einstellungen</small><h1>Programmbibliothek</h1></div></div><div class="bb-sc">${body()}</div></div>`;el.hidden=false;document.body.classList.add('bibopen');return y}
function open(){ST={p:null,v:0,b:0,w:null,d:null,imp:null,paste:false,del:null,gym:null};render()}
function close(){const el=document.getElementById('bibv');if(el)el.hidden=true;document.body.classList.remove('bibopen')}
function go(f){f();render();const s=document.querySelector('#bibv .bb-sc');if(s)s.scrollTop=0}
window.bibOpen=open;
document.addEventListener('click',e=>{const t=e.target.closest('[data-tdk="bib"],[data-bibopen]');if(t){e.preventDefault();e.stopPropagation();open()}},true);
document.addEventListener('click',e=>{const el=document.getElementById('bibv');if(!el||el.hidden||!el.contains(e.target))return;const t=e.target.closest('button');if(!t)return;const d=t.dataset;
 if(d.bbback!=null){if(ST.gym){go(()=>ST.gym=null);return}if(ST.imp||ST.paste){go(()=>{ST.imp=null;ST.paste=false});return}if(ST.d!=null)go(()=>ST.d=null);else if(ST.w!=null)go(()=>ST.w=null);else if(ST.p)go(()=>ST.p=null);else close();return}
 if(d.bbp)go(()=>{ST.p=d.bbp;ST.v=0;ST.b=0;ST.w=null;ST.d=null;ST.del=null});
 else if(d.bbv!=null){ST.v=+d.bbv;const p=all().find(x=>x.id===ST.p);if(p&&p.blocks.length>1){const vn=p.variants[ST.v].name;const bi=p.blocks.findIndex(b=>b.variant===vn);if(bi>=0)ST.b=bi}render()}
 else if(d.bbb!=null){ST.b=+d.bbb;render()}
 else if(d.bbw)go(()=>ST.w=+d.bbw);else if(d.bbd)go(()=>ST.d=+d.bbd);
 else if(d.bbcr){go(()=>{if(d.bbcr==='root'){ST.p=null;ST.v=0;ST.b=0;ST.w=null;ST.d=null}else if(d.bbcr==='p'){ST.w=null;ST.d=null}else if(d.bbcr==='w')ST.d=null})}
 else if(d.bbpaste!=null)go(()=>{ST.imp=null;ST.paste=true});
 else if(d.bbparse!=null){const tx=document.getElementById('bbtxt').value,nm=document.getElementById('bbname').value.trim();const p=BIB.parseText(tx,{name:nm||undefined,fmt:'text',src:'ocr'});go(()=>{ST.paste=false;ST.imp={progs:[p]}})}
 else if(d.bbimpx!=null)go(()=>{ST.imp=null;ST.paste=false});
 else if(d.bbok!=null){const L=BIB.load();ST.imp.progs.forEach(p=>L.progs.push(p));const ok=BIB.save(L);const id=ST.imp.progs[0]&&ST.imp.progs[0].id;go(()=>{ST.imp=null;ST.p=ok?id:null;ST.v=0;ST.b=0;ST.w=null;ST.d=null});if(typeof toast==='function')toast(ok?'In die Bibliothek übernommen':'Speichern fehlgeschlagen – Speicher voll?')}
 else if(d.bbdel){if(ST.del!==d.bbdel){ST.del=d.bbdel;render();return}const L=BIB.load();L.progs=L.progs.filter(p=>p.id!==d.bbdel);BIB.save(L);go(()=>{ST.del=null;ST.p=null});if(typeof toast==='function')toast('Aus der Bibliothek gelöscht')}
 else if(d.bbexp){const p=BIB.load().progs.find(x=>x.id===d.bbexp);if(!p)return;const blob=new Blob([JSON.stringify({format:'candito-bib',v:1,programs:[p]},null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(p.name||'programm').replace(/[^\wäöüÄÖÜß -]+/g,'')+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
 else if(d.bbgym!=null){const p=all().find(x=>x.id===ST.p);const W=(p.blocks[ST.b]||p.blocks[0]).weeks.find(x=>x.n===ST.w);const D=W.days.find(x=>x.n===ST.d);go(()=>ST.gym=BIB.toGymDay(D))}
 else if(d.bbgymx!=null)go(()=>ST.gym=null)});
document.addEventListener('change',async e=>{if(e.target.id!=='bbfile')return;const f=e.target.files&&e.target.files[0];if(!f)return;const R=await BIB.importFile(f);go(()=>ST.imp=R)});
})();
