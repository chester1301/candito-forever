/* ===================== Programmbibliothek – Kern (ohne Oberfläche) =====================
   Gemeinsamer Kern für die App UND den Mac-Batch-Importer (tools/mac-importer): Parser für Text/OCR, CSV, JSON,
   PDF-Leser (Text und eingebettete Seitenbilder, ohne Fremdbibliothek), Zusammenführen mehrerer Importe,
   Lücken-/Qualitätsprüfung und die Prüfung, ob ein Tag trainierbar ist.
   Regeln: Nichts wird erfunden – fehlende Angaben bleiben leer und werden markiert. Keine Abhängigkeit von window/document. */
var BIBCORE=(function(){
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var norm=function(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9%., ]+/g,' ').replace(/\s+/g,' ').trim()};
var num=function(v){if(v==null||v==='')return null;var n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n};
var uid=function(){return 'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
var CAT=function(){return typeof EX!=='undefined'?EX:null};

/* ---------- Übungen dem Katalog zuordnen ---------- */
/* Gleichwertige Namen (Superset-Englisch ↔ Katalog der App). Nur echte Synonyme – Varianten (z. B. „Wide Stance“) bekommen eigene Einträge. */
var ALIAS0={'paused barbell bench press':'pbb','paused bench':'pbb','comp bench':'pbb','competition bench':'pbb','comp bench press':'pbb','comp squat':'csq','competition squat':'csq','comp deadlift':'cdl','competition deadlift':'cdl','paused squat':'psq','paused deadlift':'pdl',
 'barbell row underhand grip':'row','barbell row underhand':'row','lat pulldown w underhand grip':'lat','lat pulldown underhand grip':'lat','cable curl w straight bar':'ccurl','cable curl straight bar':'ccurl',
 'db preacher curl on inclined bench':'pcurl','db preacher curl on incline bench':'pcurl','3 second pause bench press':'pb3','3 sec pause bench press':'pb3','3 second pause bench':'pb3','3 second eccentric bench press':'ecc','3 sec eccentric bench press':'ecc',
 'rdl w aggressive tempo':'rdlt','rdl aggressive tempo':'rdlt','rdl w 3 second eccentric':'rdle','rdl w 3 sec eccentric':'rdle','db bulgarian split squat glute bias':'bss','single leg press glute bias':'slp',
 'neutral grip db bench press':'ndb','incline dumbbell bench press':'idb','close grip bench':'cgb','dumbbell lateral raise':'dlr','cable chest press around':'dbf','feet up bench':'fub','feet up bench press w comp grip width':'fub',
 'conventional stance snatch grip deadlift':'sgdl','super squat belt squat pendulum squat or hack squat':'mach','2 second pause spoto press':'spoto','2 second pause spoto':'spoto','wide grip lat pulldown overhand grip':'wlat','standing cable ab crunch':'cab','belt squat pendulum squat or hack squat':'mach','dumbbell lateral delt raise':'dlr','db lateral raise':'dlr','seated good morning':'sgm','neutral grip lat pulldown':'nlat','wide grip lat pulldown':'wlat','iliac lat pulldown':'ilat','incline db bench press':'idb'};
var STOPW={w:1,with:1,the:1,a:1,an:1,of:1,on:1};
var tokKey=function(t){return norm(t).replace(/[().,%]/g,' ').split(' ').filter(function(x){return x&&!STOPW[x]}).join(' ')};
var ALIAS={};Object.keys(ALIAS0).forEach(function(k){ALIAS[tokKey(k)]=ALIAS0[k]});
var EXTRA={};/* Übungen aus der Bibliothek (eigene Einträge, nie mit bestehenden zusammengeführt) */
function setExtra(o){EXTRA=o||{}}
function matchEx(name){var k=tokKey(cleanEx(name).name);if(!k)return null;if(ALIAS[k])return ALIAS[k];var E=CAT();var hit=null;
 var sorted=function(x){return x.split(' ').sort().join(' ')};var ks=sorted(k);
 [E||{},EXTRA].forEach(function(C){if(hit)return;Object.keys(C).some(function(id){var en=tokKey(C[id].n);if(en===k||sorted(en)===ks){hit=id;return true}return false})});return hit}
/* Übungsnamen säubern: Bedien-Symbole, Lesereste, Bedingungen („Only do if …“) und Home-Gym-Hinweise abtrennen */
function cleanEx(n){var s=String(n||'').replace(/[§|~©®«»“”\[\]{}]/g,' ').replace(/\bD8\b/g,'DB').replace(/\s+/g,' ').trim();var cond='',home=false;
 var hs=s.match(/\s*\(home gym(?: option)?\)\s*$/i);if(hs){home=true;s=s.slice(0,hs.index)}
 var hint='';var pm=s.match(/\s*\(((?:use|only|if|as|keep|do|wenn|nur)\b[^)]*)\)?\s*$/i);if(pm){hint=pm[1].trim();s=s.slice(0,pm.index)}
 var hm=s.match(/^\(home gym option\)\s*/i);if(hm){home=true;s=s.slice(hm[0].length)}
 var cm=s.match(/\s*(?:-{1,}|—|–)?\s*\b((?:only\s+)?do\s+if\b.*|nur\s+wenn\b.*)$/i);if(cm){cond=cm[1].replace(/(\.\.\.|…)\s*$/,'').trim();s=s.slice(0,cm.index).replace(/\s+-\s+\S.*$/,'')}
 for(var i=0;i<3;i++)s=s.replace(/\s+(?:x{1,2}|×|-{1,}|—+|[|>»=.]+|\d)$/i,'').trim();
 s=s.replace(/-{2,}.*$/,'').trim();var o=(s.match(/\(/g)||[]).length,c=(s.match(/\)/g)||[]).length;if(o>c)s+=')';
 var ww=s.split(' ');if(ww.length%2===0&&ww.length>=4){var h=ww.length/2;if(norm(ww.slice(0,h).join(' '))===norm(ww.slice(h).join(' ')))s=ww.slice(0,h).join(' ')}
 return {name:s,cond:cond,home:home,hint:hint}}
function cleanName(n){var w=n.split(' ').filter(Boolean);if(/\(\s|\s\)|\(\)|\(\W*\w{0,2}\)/.test(n))return false;return w.length>=1&&w.every(function(x){return /^[A-Za-zÄÖÜäöü0-9()\/'’&+-]+$/.test(x)&&(x.replace(/[^A-Za-zÄÖÜäöü]/g,'').length>=2||/^w\/$/i.test(x)||/^\d+$/.test(x)||/^[()\/&+-]+$/.test(x))})&&n.replace(/[^A-Za-z]/g,'').length>=4&&n.length<=60}

/* ---------- Satz-/Lastvorgabe aus Text ---------- */
function parseRx(t){var s=String(t||'').replace(/[©®]\s*[}\])]?|=\s*[)}]|\s[i]\)(?=\s|$)/g,' ').replace(/(\d)\s*[xX×]{2}\s*(\d)/g,'$1 x $2').replace(/(\d)\s*[Xx×]\s*(?=\d)/g,'$1 x ');var o={sets:null,reps:null,amrap:false,rpe:null,rpeTxt:null,load:null,hype:null,kind:null};var m;
 if((m=s.match(/(\d{1,2})\s*[x×]\s*(\d{1,2}(?:\s*[-–]\s*\d{1,2})?|AMRAP|max)/i))){o.sets=+m[1];if(/amrap|max/i.test(m[2])){o.amrap=true;o.reps='AMRAP'}else o.reps=m[2].replace(/\s+/g,'').replace('-','–')}
 else if((m=s.match(/(\d{1,2})\s*(?:sets?|sätze|saetze)\s*(?:of|à|a|mit)?\s*(\d{1,2}(?:\s*[-–]\s*\d{1,2})?)\s*(?:reps?|wdh|wiederholungen)/i))){o.sets=+m[1];o.reps=m[2].replace(/\s+/g,'')}
 else if((m=s.match(/(?:^|[^\d])(\d{1,2})\s*singles?\b/i))){o.sets=+m[1];o.reps='1'}
 else if((m=s.match(/(\d{1,2})\s*sets?[\s.]*(?:taken\s*)?(?:to|until)\s*(?:true\s*)?(?:muscular\s*)?failure/i))){o.sets=+m[1];o.reps='AMRAP';o.amrap=true;o.fail=true}
 else if((m=s.match(/(\d{1,2})\s*sets?\s*(?:taken\s*)?to\s*RPE\s*(\d{1,2}(?:[.,]\d)?)/i))){o.sets=+m[1];o.reps='AMRAP';o.amrap=true}
 else if(/\bAMRAP\b/i.test(s)){o.amrap=true;o.reps='AMRAP';var k=s.match(/(\d)\s*(?:set|satz)/i);o.sets=k?+k[1]:1}
 if((m=s.match(/RPE\s*(\d{1,2}(?:[.,]\d)?)\s*[-–]\s*(\d{1,2}(?:[.,]\d)?)/i))){o.rpeTxt=String(num(m[1])).replace('.',',')+'–'+String(num(m[2])).replace('.',',');o.rpeEnd=m.index+m[0].length}
 else if((m=s.match(/RPE\s*(\d{1,2}(?:[.,]\d)?)/i))||(m=s.match(/@\s*(\d{1,2}(?:[.,]\d)?)(?!\s*%)/))){var r=num(m[1]);if(r!=null&&r>=1&&r<=10){o.rpe=r;o.rpeEnd=m.index+m[0].length}else o.rpeBad=m[1]}
 if(o.fail&&o.rpe==null&&!o.rpeTxt){o.rpe=10;o.kind='bis zum Muskelversagen'}
 if(o.rpe==null&&!o.rpeTxt&&!o.rpeBad&&!o.fail&&!/\bRPE\b/i.test(s)&&(m=s.match(/\bat\s+(\d(?:[.,]\d)|10)\s+(?:w\/|on\b)/i))){o.rpe=num(m[1]);o.rpeInf=true}
 if(o.rpe==null&&!o.rpeTxt&&!o.rpeBad&&/\bRPE\b/i.test(s)&&!o.fail)o.rpeBad='?';
 if(/\d\s*[x×]\s*\d[^.;]{0,40}\bOR\b\s*\d\s*[x×]\s*\d|\bODER\b\s*\d\s*[x×]|\d(?:[.,]\d+)?\s*%\s*(?:OR|ODER)\s*\d/i.test(s))o.alt=true;
 if(o.rpe!=null||o.rpeTxt){if(/on (?:the )?last set|last set|letzten satz/i.test(s))o.kind='im letzten Satz';else if(/on (?:each|every) set|each set|every set|jedem satz/i.test(s))o.kind='in jedem Satz';else if(/on average|im schnitt|average/i.test(s))o.kind='im Schnitt';else if(/on the first set|first set|ersten satz/i.test(s))o.kind='im ersten Satz';else if((m=s.match(/on the (\d)(?:st|nd|rd|th) set/i)))o.kind=m[1]+'. Satz'}
 if((m=s.match(/(\d{2,3}(?:[.,]\d+)?)\s*(?:[-–]\s*(\d{2,3}(?:[.,]\d+)?))?\s*%\s*(?:load\s*)?(?:of|des|der|vom|von)?\s*([^.;,\n)]{0,60})?/i)))o.load={pct:m[2]?null:num(m[1]),text:(m[0]||'').replace(/\s*(?:--|—|w\/?\s*(?:low|moderate|high)|\b(?:low|moderate|high|niedrig|moderat|hoch)\b\s*(?:to\s*\w+\s*)?hype|hype).*$/i,'').trim().slice(0,60)};
 else if((m=s.match(/(\d{1,3}(?:\s*[-–]\s*\d{1,3})?)\s*(lbs?|kg)\s*in\s*reserve/i)))o.load={text:m[1].replace(/\s+/g,'').replace('-','–')+' '+m[2].replace(/^l/i,'l')+' in Reserve'};
 else if((m=s.match(/(\d{2,3}(?:[.,]\d+)?)\s*kg/i)))o.load={kg:num(m[1]),text:m[0]};
 else if(/no\s*%\s*prescription|keine\s*%-?vorgabe|by\s*feel|nach\s*gef[uü]hl/i.test(s))o.load={text:'keine %-Vorgabe (nach RPE)'};
 else if((m=s.match(/\b((?:the\s+)?(?:same|heaviest|lighter|heavier)\s+load(?:ing)?\b[^.;\n]{0,50})/i)))o.load={text:m[1].replace(/\s*(?:--|—).*$/,'').trim()};
 if(!o.load&&o.rpe==null&&!o.rpeTxt&&!o.fail&&(m=s.match(/\bw\/\s*([^\n]{4,70}?)(?:\s*(?:--|—|–\s)|\.\s|\.\.\.|…|$)/i))&&!/^(?:low|moderate|high|a?\s*(?:low|moderate|high))\b[^.]*hype/i.test(m[1]))o.load={text:m[1].replace(/\s+/g,' ').trim()};
 if((m=s.match(/\b(low|moderate|high|niedrig|moderat|hoch)\b\s*(?:to\s*(?:low|moderate|high)\s*)?hype|hype\s*[:\-]?\s*(low|moderate|high|niedrig|moderat|hoch)/i))){var h=(m[1]||m[2]).toLowerCase();o.hype={low:'Niedrig',niedrig:'Niedrig',moderate:'Moderat',moderat:'Moderat',high:'Hoch',hoch:'Hoch'}[h]}
 return o}
var OCRBAD=/[|©®°“”«»~^]|\b[a-z]{1}[A-Z]|\d[A-WYZa-wyz]\d|[A-WYZa-wyz]\d[a-z]|\d-[A-Z]\d/;
/* Symbole der App-Oberfläche im Screenshot (Info-Knopf „=)“, „©}“ …) sind kein Lesefehler im Text */
var ocrClean=function(r){return String(r||'').replace(/\b[xX]{2}\b/g,'x').replace(/[©®]\s*[}\])]?|[=i]\s*[)}]|\s\|(?=\s|$)|[“”]\s*$/g,' ')};
function flagEx(x,src){var f=[];if(x.sets==null)f.push('Satzanzahl fehlt');if(x.reps==null)f.push('Wiederholungen fehlen');
 if(x.rpe==null&&!x.rpeTxt&&!x.load&&!x.amrap)f.push('Keine Last- oder RPE-Vorgabe gefunden');if(!x.eid)f.push(x.nameOk===false||!x.nameOk&&src==='ocr'?'Übungsname unsicher gelesen – Katalogübung wählen':'Übung nicht im Übungskatalog – Name prüfen');
 if(x.cut&&!x.ok)f.push('Nur aus der Tagesübersicht gelesen – Vorgabe evtl. gekürzt');
 if(x.amb&&!x.ok)f.push('Tag-Zuordnung unsicher – Detailseite ohne Eintrag in der Tagesübersicht');
 if(x.rpeBad&&!x.ok)f.push('RPE nicht lesbar („'+x.rpeBad+'“)');if(x.alt&&!x.ok)f.push('Mehrere Optionen („OR“) – bitte die gewählte eintragen');
 if(x.rpeInf&&!x.ok&&!x.conf)f.push('RPE unsicher gelesen (Zahl ohne „RPE“) – bitte prüfen');
 if(x.ovMix&&!x.ok)f.push('Übersichtszeile vermischt'+(x.ovLine?' („'+x.ovLine+'“)':'')+' – unsicher gelesen, evtl. fehlt hier eine Übung');if(x.conflict&&!x.ok)f.push('Widerspruch zwischen Übersicht und Detailseite – '+x.conflict);
 if(src==='ocr'&&!x.ok&&!x.conf&&OCRBAD.test(ocrClean(String(x.raw||'').slice(0,64))))f.push('Text aus Bilderkennung – Zeichen unsicher');return f}

/* ---------- Kopfzeile „Day 1 - Monday (W4, 3 RM, V2)“ ---------- */
var WD={monday:0,montag:0,mon:0,mo:0,tuesday:1,dienstag:1,tue:1,di:1,wednesday:2,mittwoch:2,wed:2,mi:2,thursday:3,donnerstag:3,thu:3,do:3,friday:4,freitag:4,fri:4,fr:4,saturday:5,samstag:5,sat:5,sa:5,sunday:6,sonntag:6,sun:6,so:6};
function headInfo(inner){var o={w:null,prog:'',variant:''};if(!inner)return o;var parts=inner.split(/\s*,\s*/).map(function(s){return s.trim()}).filter(Boolean);var rest=[];
 parts.forEach(function(p){var m=p.match(/^W(?:eek)?\s*(\d{1,2})$/i);if(m&&o.w==null){o.w=+m[1];return}if(/^V\s*\d+(?:[.,]\d+)?$/i.test(p)&&!o.variant){o.variant=p.replace(/\s+/g,'').toUpperCase();return}rest.push(p)});
 o.prog=rest.join(', ').replace(/\s+/g,' ').trim();return o}
function weekFromName(n){var m=String(n||'').match(/(?:woche|week|wk)[\s_\-]*(\d{1,2})(?!\d)/i)||String(n||'').match(/(?:^|[\s_\-])W(\d{1,2})(?!\d)/);return m?+m[1]:null}
function baseName(nm){return String(nm||'').replace(/\.[a-z0-9]+$/i,'').replace(/^[0-9a-f]{8}-/,'').replace(/_/g,' ').replace(/\s+/g,' ').trim()}

/* ---------- Text-Parser (PDF-Text, OCR, eingefügter Text) ---------- */
var NOISE=/^(\d{1,2}:\d{2}\b.*|close description|description|start workout|workout incomplete|exercises|hide tips.*|<?\s*hide tips.*|finish.*|show tips.*|\W{0,3})$/i;
var cleanNm=function(l){var L=l.trim();for(var i=0;i<3;i++)L=L.replace(/\s+(?:x{1,2}|×|-{2,}|—+|[|>»]+)$/i,'').trim();return L};
function isExName(l){var L=cleanNm(l);if(/[=;!?'’]|:\)|\(\s*$/.test(L)&&!/\(\s*[A-Z]/.test(L))return false;var letters=L.replace(/[^A-Za-zÄÖÜäöü]/g,'');if(letters.length<5||L.length>48)return false;var up=L.replace(/[^A-ZÄÖÜ]/g,'').length;return up/letters.length>.85&&!/^(DAY|TAG|WEEK|WOCHE)\b/i.test(L)}
var pretty=function(s){return s.toLowerCase().replace(/\b\w/g,function(c){return c.toUpperCase()})};
var FOCUSW='(?:legs?|chest|back|arms?|shoulders?|upper(?: body)?|lower(?: body)?|full ?body|push|pull|core|beine|brust|rücken|arme|schultern|oberkörper|unterkörper|ganzkörper)';
var FOCUSL=new RegExp('^(?:focus:\\s*|[A-Za-z]{1,2}\\s+)?('+FOCUSW+'(?:\\s*[,;&/]\\s*'+FOCUSW+')*)\\s*\\S{0,2}$','i');
var RXSTART=/^(?:\(optional\)\s*)?\d{1,2}\s*(?:[xX×]|sets?\b|singles?\b|sätze)|^\d{1,2}\s*[xX×]\s*AMRAP/i;
/* Übungsname in der Tagesübersicht: kurz, überwiegend groß geschriebene Wörter, kein Satz */
function isOvName(l){if(l.length>72||/[?!]|[a-z]\.\s*$/.test(l.replace(/(\.\.\.|…)\s*$/,''))||RXSTART.test(l))return false;var w=l.split(/\s+/).filter(function(x){return /^[A-Za-zÄÖÜäöü]{3,}/.test(x)});if(!w.length)return false;var up=w.filter(function(x){return /^[A-ZÄÖÜ]/.test(x)}).length;return up/w.length>=.6&&/^[A-Za-zÄÖÜäöü0-9(]/.test(l)}
var stripJunk=function(l){var i=l.lastIndexOf(' | ');return i>=0&&i<l.length-4?l.slice(i+3).trim():l};
var rxKey=function(r){var s=norm(String(r||'').replace(/(\.\.\.|…)\s*$/,'')).replace(/^[^\d(]*/,'').replace(/\(optional\)\s*/,'').replace(/\s+/g,'');return s};
var tokSim=function(a,b){var A=norm(a).split(' ').filter(function(t){return t.length>1&&t!=='w'}),B=new Set(norm(b).split(' ').filter(function(t){return t.length>1&&t!=='w'}));if(!A.length||!B.size)return 0;var hit=A.filter(function(t){return B.has(t)}).length;return hit/Math.min(A.length,B.size)};
var cpre=function(a,b){var n=Math.min(a.length,b.length),i=0;while(i<n&&a[i]===b[i])i++;return i};
function rxMatch(ov,det){var a=rxKey(ov),b=rxKey(det);if(!a||!b)return 0;var c=cpre(a,b);var need=Math.min(14,Math.floor(a.length*.7));return c>=Math.max(6,need)?c:0}
/* Zwei Bildschirm-Ausschnitte derselben Übersicht zusammensetzen (Überlappung beim Scrollen) */
function mergeSeq(a,b){var eq=function(x,y){var ts=tokSim(cleanEx(x.name).name,cleanEx(y.name).name);if(ts<.6){if(!(x.rx&&y.rx&&rxKey(x.rx).slice(0,14)===rxKey(y.rx).slice(0,14)&&(ts>=.3||!cleanName(cleanEx(x.name).name)||!cleanName(cleanEx(y.name).name))))return false}if(!x.rx||!y.rx)return true;var A=parseRx(x.rx),B=parseRx(y.rx);return A.sets===B.sets&&String(A.reps)===String(B.reps)};
 var eqP=function(x,y){return eq(x,y)||!!(x.rx&&y.rx&&rxKey(x.rx).slice(0,14)===rxKey(y.rx).slice(0,14))||((!x.rx||!y.rx)&&tokSim(cleanEx(x.name).name,cleanEx(y.name).name)>=.4)};
 for(var n=Math.min(a.length,b.length);n>=1;n--){var ok=true;for(var i=0;i<n;i++)if(!(n>1?eqP:eq)(a[a.length-n+i],b[i])){ok=false;break}if(ok){for(var k=0;k<n;k++){var t=a[a.length-n+k];if(!t.rx&&b[k].rx)t.rx=b[k].rx}return a.concat(b.slice(n))}}
 var j=0;while(j<a.length&&j<b.length&&(j===0?eq:eqP)(a[j],b[j])){if(!a[j].rx&&b[j].rx)a[j].rx=b[j].rx;j++}if(j>0)return a.concat(b.slice(j));
 return a.concat(b.filter(function(o){return !a.some(function(x){return eq(x,o)&&x.rx&&o.rx&&rxKey(x.rx).slice(0,8)===rxKey(o.rx).slice(0,8)})}))}
/* Name einer Übersichtszeile enthält Vorgabentext (Sätze×Wdh., RPE, „N RM“, „(Optional) -“) → Zeilen wurden vermischt */
var RXNAME=/\b\d+\s*x\s*\d+|\bRPE\b|\b\d+\s*RM\b|\(optional\)\s*[-–]/i;
/* zwei Übersichtszeilen zu einem Namen verschmolzen: Vorgabentext im Namen oder derselbe Name doppelt („Feet Up Bench Press Feet Up Bench Press“) */
var mixName=function(n){n=String(n).replace(/\s+/g,' ').trim();return RXNAME.test(n)||/^(.{8,}?) \1\b/i.test(n)};
var EXNOUN=/\b(press|squat|deadlift|raise|curl|row|pulldown|pull-?down|extension|fly|flye|dip|crunch|lunge|good morning|rdl|sldl|pushdown|thrust|bridge|abduction|adduction|pull-?up|chin-?up|shrug)s?\b/i;
function parseText(text,o){o=o||{};var src=o.src||'text';var lines=String(text||'').replace(/\r/g,'').replace(/\f/g,'\n\f\n').split('\n').map(function(l){return l==='\f'?l:l.replace(/\s+/g,' ').trim()});
 var prog={id:uid(),src:'import',name:o.name||'',sub:'',file:o.file||'',fmt:o.fmt||'text',ocr:src==='ocr',at:Date.now(),variants:[{id:'v1',name:'Standard'}],blocks:[{name:'Block 1',weeks:[]}],unparsed:[]};
 var B=prog.blocks[0],wk=null,day=null,ex=null,mode=null,hp=null,hv=null,orphan=0;var fw=weekFromName(o.file||o.fallback);var det=[],ovs=[],ev=[],curL=null;var skipTo=-1,wasOv=false;
 /* Gescrollte Tagesübersicht ohne „Exercises“-Kopf: auf der Seite folgen Name/Vorgabe-Paare (gemischte Schreibweise) */
 var scrollOv=function(k){var c=[];for(var q=k;q<lines.length&&c.length<5;q++){var t=lines[q];if(t==='\f')break;if(!t)continue;c.push({q:q,t:stripJunk(t)})}
  for(var a=0;a<c.length;a++){var t=c[a].t;if(/^(?:day|tag|week|woche)\s*\d|^(?:exercises|description|close description)$/i.test(t)||isExName(t))return -1;
   if(RXSTART.test(t)){if(a>0&&isOvName(c[a-1].t))return c[a-1].q;if(a+1<c.length&&isOvName(c[a+1].t)&&a+2<c.length&&RXSTART.test(c[a+2].t))return c[a].q;return -1}}return -1};
 var newL=function(cont){curL={items:[],day:day,at:ev.length,cont:!!cont};ovs.push(curL);ev.push({t:'ov',L:curL})};
 var getW=function(n){var w=B.weeks.find(function(x){return x.n===n});if(!w){w={n:n,name:'',days:[]};B.weeks.push(w);B.weeks.sort(function(a,b){return a.n-b.n})}return w};
 var getD=function(w,n){var d=w.days.find(function(x){return x.n===n});if(!d){d={n:n,name:'Tag '+n,wd:'',focus:'',notes:'',hints:[],ex:[]};w.days.push(d);w.days.sort(function(a,b){return a.n-b.n})}return d};
 var endEx=function(){if(ex){ex.notes=ex.noteL.join(' ').trim();delete ex.noteL;ex=null}};
 var addNote=function(l){var lt=l.replace(/[^A-Za-zÄÖÜäöüß]/g,'').length;if(src==='ocr'&&(lt<l.length*.55||!/[A-Za-zÄÖÜäöü]{3,}/.test(l)||/^(?:\S{1,3}\s+){2,}\S{0,3}$/.test(l)))return;if(day.notes.indexOf(l)>=0)return;day.notes=(day.notes?day.notes+' ':'')+l};
 for(var i=0;i<lines.length;i++){var l=lines[i];if(!l)continue;var m;
  /* Seitenwechsel (\f) bzw. Statuszeile eines Screenshots („16:06 …“): eine Detailseite endet hier, eine gescrollte Übersicht beginnt neu */
  if(l==='\f'){endEx();wasOv=mode==='ovw';if(mode==='ovw'&&day&&!orphan)newL(true);if(mode==='ex'||mode==='desc')mode=null;if(day&&!orphan){var st=scrollOv(i+1);if(st>=0)skipTo=st}continue}
  if(l==='\f'||/^\d{1,2}:\d{2}(?!\s*(?:min|sek|sec|s\b))/.test(l)){endEx();if(mode==='ovw'&&day&&!orphan)newL(true);if(mode==='ex'||mode==='desc')mode=null;continue}
  if(i===skipTo){skipTo=-1;endEx();if(!(wasOv&&mode==='ovw')){mode='ovw';newL(false)}if(RXSTART.test(stripJunk(l)))continue}else if(skipTo>i)continue;
  if(mode!=='desc'&&(m=l.match(/^(?:week|woche)\s*(\d{1,2})\s*(?:[-–—:]+\s*(.*))?$/i))){endEx();day=null;wk=getW(+m[1]);if(m[2]&&!wk.name)wk.name=m[2].replace(/\s*\d+\s*\/\s*\d+\s*$/,'').trim();mode=null;orphan=0;continue}
  if((m=l.match(/^(?:day|tag)\s*(\d{1,2})\s*(?:[-–—:]\s*([A-Za-zÄÖÜäöü]+))?\s*(?:\(([^)]*)\)?)?/i))&&(m[2]||m[3]!=null||/^(?:day|tag)\s*\d{1,2}\s*$/i.test(l))){endEx();var H=headInfo(m[3]);var wn=H.w!=null?H.w:(wk?wk.n:(fw||1));wk=getW(wn);day=getD(wk,+m[1]);if(m[2])day.wd=m[2];
   if(H.prog&&!hp)hp=H.prog;if(H.variant&&!hv)hv=H.variant;mode='afterDay';orphan=0;ev.push({t:'day',day:day});continue}
  if(!day){if(NOISE.test(l))continue;var f0=l.match(FOCUSL);if(f0)continue;prog.unparsed.push(l);continue}
  if(mode==='afterDay'){var f=l.match(FOCUSL);if(f){if(!day.focus)day.focus=f[1];mode=null;continue}}
  else if(FOCUSL.test(l)&&mode!=='desc'&&!isExName(l)){/* Tagesseite ohne sichtbaren Kopf (beim Scrollen abgeschnitten) – nicht dem falschen Tag zuordnen */endEx();orphan=1;mode=null;continue}
  if(/^close description$/i.test(l)){mode=null;continue}
  if(/^description$/i.test(l)){endEx();mode='desc';continue}
  if(/^exercises$/i.test(l)){endEx();mode='ovw';if(!orphan)newL(false);else curL=null;continue}
  if(/^(start workout|workout incomplete|finish workout)$/i.test(l)&&mode==='ovw'&&curL)curL.complete=true;
  if(NOISE.test(l))continue;
  if(mode==='desc'){if(!orphan)addNote(l);continue}
  if(mode==='ovw'&&!isExName(l)){if(orphan||!curL)continue;var L=curL.items;var last=L[L.length-1];var ll=stripJunk(l);
   if(last&&!last.rx&&RXSTART.test(ll)){last.rx=ll;continue}
   if(isOvName(ll)){if(last&&!last.rx&&!(EXNOUN.test(last.name)&&EXNOUN.test(ll)&&!/(w\/|-|with|on|,)\s*$/i.test(last.name)&&!/^[a-z]|,\s*or\b/i.test(ll))){if(!/[A-Za-zÄÖÜäöü]{4}/.test(last.name))last.name=ll;else last.name=(last.name+' '+ll).replace(/\s+/g,' ')}else L.push({name:ll,rx:''});continue}
   continue}
  if(ex&&!ex.rxLine&&/^(?:only\s+)?do\s+if\b|^nur\s+wenn\b/i.test(l)){ex.cond=l.replace(/[=)©}\]]+\s*$/,'').trim();ex.condOpen=1;continue}
  if(ex&&ex.condOpen&&!ex.rxLine&&isExName(l)){ex.cond+=' '+cleanNm(l);continue}
  if(ex&&!ex.rxLine&&!ex.noteL.length&&!ex.cond&&/^[A-Z][A-Z0-9 ()\/'’&-]{1,20}$/.test(cleanNm(l))&&!/^(?:DAY|TAG|WEEK|WOCHE)\b/.test(l)){ex.name=(ex.name+' '+pretty(cleanNm(l))).replace(/\s+/g,' ');continue}
  if(isExName(l)&&ex&&!ex.rxLine&&!ex.noteL.length){ex.name=(ex.name+' '+pretty(cleanNm(l))).replace(/\s+/g,' ');continue}
  if(isExName(l)){endEx();mode='ex';orphan=0;var nm=cleanNm(l).replace(/\s+/g,' ').trim();ex={name:pretty(nm),raw:'',rxLine:'',noteL:[],w:wk,d:day};det.push(ex);ev.push({t:'det'});continue}
  if(ex){if(!ex.rxLine&&/\d\s*[xX×]{1,2}\s*(\d|amrap)|\bAMRAP\b|\d\s*(?:sets?|sätze)|\d\s*singles?\b/i.test(l)){ex.rxLine=l;ex.raw=l;ex.condOpen=0;continue}
   if(ex.rxLine&&ex.noteL.length===0&&/^(--|—|w\/|at |@|mit |with |hype|moderate|low|high)/i.test(l)){ex.rxLine+=' '+l;ex.raw+=' '+l;continue}ex.noteL.push(l);continue}
  if(!orphan)addNote(l)}
 endEx();
 /* Zusammensetzen: Tagesübersicht ist maßgeblich für Reihenfolge; Detailseiten liefern die vollständige Vorgabe */
 /* Übersichtslisten den Tagen zuordnen: eine Liste ohne jede Überschneidung mit der bisherigen Übersicht des Tages stammt
    von einer Seite, deren Kopf abgeschnitten war → sie gehört zum nächsten Tageskopf (unsicher, wenn dazwischen Detailseiten lagen) */
 var okey=function(x){return norm(x.name).replace(/\s+/g,'').slice(0,18)+'|'+rxKey(x.rx).slice(0,10)};var dl=new Map(),prevD=null;
 ovs.forEach(function(L){var D=L.day;if(L.cont&&prevD)D=prevD;if(!L.items.some(function(x){return x.rx})){prevD=D;return}var have=dl.get(D)||[];var hk=new Set();have.forEach(function(h){h.items.forEach(function(x){hk.add(okey(x))})});
  var nk=function(x){return norm(cleanEx(x.name).name).replace(/\s+/g,'')};var top=have.length&&have[0].items[0];var rescan=top&&L.items[0]&&nk(top)===nk(L.items[0])&&(!top.rx||!L.items[0].rx||okey(top)===okey(L.items[0])||(function(a,b){var A=parseRx(a),Bx=parseRx(b);return A.sets!=null&&A.sets===Bx.sets&&String(A.reps)===String(Bx.reps)})(top.rx,L.items[0].rx));
  if(have.length&&!L.cont&&!rescan&&!L.items.some(function(x){return x.rx&&hk.has(okey(x))})){var nx=null,dt=false;for(var j=L.at+1;j<ev.length;j++){if(ev[j].t==='det')dt=true;if(ev[j].t==='day'&&ev[j].day!==D){nx=ev[j].day;break}}if(nx){D=nx;if(dt)L.items.forEach(function(x){x.amb=1})}else L.foreign=1}
  if(!dl.has(D))dl.set(D,[]);dl.get(D).push(L);prevD=D;if(o.debug)(prog._dbg=prog._dbg||[]).push({from:L.day&&L.day.n,to:D&&D.n,cont:L.cont,items:L.items.map(function(x){return x.name+' | '+x.rx})})});
 /* Vollständigkeit einer gekürzten Übersichtszeile: Sätze×Wdh. und RPE/Last stehen vollständig vor dem „…“ */
 var cutOk=function(rx,R){var t=String(rx||'').replace(/(\.\.\.|…)\s*$/,'');if(R.sets==null||R.reps==null)return false;if(R.amrap&&!R.fail)return true;if(R.rpe==null&&!R.rpeTxt&&!(R.load&&R.load.text))return false;
  var e=R.fail?(function(){var m=t.match(/failure/i);return m?m.index+7:-1})():R.rpeEnd!=null?R.rpeEnd:(function(){var m=t.match(/\d{2,3}(?:[.,]\d+)?\s*(?:[-–]\s*\d{2,3}(?:[.,]\d+)?)?\s*%[^.;]*?\b(?:set|single|squat|bench|deadlift|load)\b/i);return m?m.index+m[0].length:-1})();if(e<0)return false;
  var rest=t.slice(e).trim();if(!/[A-Za-z]{2,}/.test(rest))return false;if(R.sets>1&&(R.rpe!=null||R.rpeTxt)&&!R.kind&&/^on\b/i.test(rest)){var k=kindPrefix(rest);if(!k)return false;R.kind=k}return true};
 var kindPrefix=function(r){var t=r.toLowerCase().replace(/\s+/g,' ').trim();var K=[['on average','im Schnitt'],['on each set','in jedem Satz'],['on every set','in jedem Satz'],['on the last set','im letzten Satz'],['on the first set','im ersten Satz']];var h=K.filter(function(k){return t.length>=5&&(k[0].indexOf(t)===0||t.indexOf(k[0])===0)});var u=h.map(function(k){return k[1]}).filter(function(v,i,a){return a.indexOf(v)===i});return u.length===1?u[0]:null};
 var mk=function(d0,ovItem,amb){var rx=d0?d0.rxLine:ovItem.rx;var R=parseRx(rx);var O=ovItem&&ovItem.rx&&d0?parseRx(ovItem.rx):null;
  var nm0=d0?d0.name:ovItem.name;var CE=cleanEx(nm0),CO=ovItem?cleanEx(ovItem.name):null;
  var x={name:CE.name||nm0,eid:null,sets:R.sets,reps:R.reps,amrap:R.amrap,rpe:R.rpe,rpeTxt:R.rpeTxt,kind:R.kind,load:R.load,hype:R.hype,rpeBad:R.rpeBad,rpeInf:R.rpeInf,alt:R.alt,notes:d0?d0.notes:'',raw:d0?d0.raw:ovItem.rx,
   opt:/\(optional\)/i.test(rx||'')||(ovItem&&/\(optional\)/i.test(ovItem.rx)),cut:!d0&&/(\.\.\.|…)\s*$/.test(ovItem.rx||'')};
  var hint=CE.hint||(CO&&CO.hint)||'';if(hint)x.notes=(x.notes?x.notes+' ':'')+'('+hint+')';
  var cond=(d0&&d0.cond)||CE.cond||(CO&&CO.cond)||'';if(cond){x.cond=cond.replace(/\s+/g,' ').replace(/[=)©}\]]+$/,'').trim();x.opt=true}if(CE.home||(CO&&CO.home)){x.home=true;x.opt=true}
  if(x.cut&&cutOk(ovItem.rx,R)){x.cut=false;if(R.kind&&!x.kind)x.kind=R.kind;x.notes=(x.notes?x.notes+' ':'')+'(Hinweistext in der Übersicht abgeschnitten – Vorgabe vollständig gelesen.)'}
  /* zwei unabhängige Lesungen derselben Vorgabe (Übersicht + Detailseite) */
  if(O&&O.sets!=null&&O.reps!=null){var same=O.sets===R.sets&&String(O.reps)===String(R.reps);var rpeSame=O.rpe==null||R.rpe==null||O.rpe===R.rpe;
   if(R.rpeBad&&O.rpe!=null&&same){x.rpe=O.rpe;delete R.rpeBad;x.rpeBad=null;x.conf=true}
   else if(R.sets==null&&same===false&&O.sets!=null&&!d0.rxLine){}
   else if(same&&rpeSame){x.conf=true;if(x.rpe==null&&O.rpe!=null&&!R.rpeTxt){x.rpe=O.rpe;x.rpeBad=null}if(!x.kind&&O.kind)x.kind=O.kind;}else if(R.sets!=null&&R.reps!=null)x.conflict='Übersicht: '+O.sets+'×'+O.reps+(O.rpe!=null?' @ '+O.rpe:'')+' · Detailseite: '+R.sets+'×'+R.reps+(R.rpe!=null?' @ '+R.rpe:'')}
  if(d0&&ovItem&&tokSim(cleanEx(ovItem.name).name,x.name)>=.8)x.nameOk=true;if(!d0&&ovItem&&/(\.\.\.|…)\s*$/.test(ovItem.name)&&!(CO&&CO.cond))x.nameCut=true;
  if(amb||(ovItem&&ovItem.amb))x.amb=true;if(ovItem&&mixName(ovItem.name||'')){x.ovMix=true;x.ovLine=String(ovItem.name).replace(/\s+/g,' ').trim().slice(0,140)}['rpeBad','rpeInf','alt','cond','home','conf','conflict','nameOk','nameCut','ovMix','ovLine'].forEach(function(k){if(!x[k])delete x[k]});
  x.eid=matchEx(x.name)||(CO?matchEx(CO.name):null);if(x.eid)x.nameOk=true;x.flags=flagEx(x,src);return x};
 var sr=function(t){var R=parseRx(t);return R.sets!=null&&R.reps!=null?R.sets+'x'+R.reps:''};
 B.weeks.forEach(function(W){var pool=det.filter(function(x){return x.w===W});var used=new Set();var dayOv=new Map();
  W.days.forEach(function(D){var Ls=dl.get(D)||[];var ov=Ls.map(function(L){return L.items}).filter(function(x){return x.length}).reduce(function(a,b){return a.length?mergeSeq(a,b):b.slice()},[]);
   D.hasOv=ov.some(function(x){return x.rx});if(Ls.some(function(L){return L.foreign})&&!D.chk)D.chk='Zweite, abweichende Tagesübersicht gefunden – evtl. Übungen eines anderen Tages enthalten';D.ovN=ov.filter(function(x){return x.rx}).length;D.ovDone=Ls.some(function(L){return L.complete});dayOv.set(D,ov);
   ov.forEach(function(it){if(!it.rx&&!pool.some(function(x){return !used.has(x)&&tokSim(it.name,x.name)>=.6})&&!RXNAME.test(it.name))return;var best=null,bs=0;
    pool.forEach(function(x){if(used.has(x))return;var ns=tokSim(it.name,x.name);if(ns<.5)return;var rs=it.rx?rxMatch(it.rx,x.rxLine):(x.d===D&&x.rxLine?1:0);if(!rs)return;var sc=rs+ns*10+(x.d===D?3:0);if(sc>bs){bs=sc;best=x}});
    if(best)used.add(best);var e=mk(best,best&&!it.rx?{name:it.name,rx:best.rxLine}:it,false);e._ov=it;e._d=!!best;D.ex.push(e)})});
  /* 2. Durchgang: nur aus der Übersicht gelesene Einträge mit einer übrigen Detailseite gleicher Übung und gleichem Satz×Wdh.-Schema ergänzen (auch tagübergreifend) */
  W.days.forEach(function(D){D.ex.forEach(function(e,k){if(e._d||!e._ov||!e._ov.rx)return;var key=sr(e._ov.rx);if(!key)return;
   var c=pool.filter(function(x){return !used.has(x)&&x.rxLine&&tokSim(e._ov.name,x.name)>=.8&&sr(x.rxLine)===key});if(c.length!==1)return;used.add(c[0]);var n=mk(c[0],e._ov,false);n._ov=e._ov;n._d=true;D.ex[k]=n})});
  /* übrige Detailseiten: doppelte Aufnahmen verwerfen, Seiten ohne Vorgabe als nicht zugeordnet führen, sonst dem Tag in Lesereihenfolge zuordnen.
     Unsicher ist die Zuordnung, wenn die Übersicht dieses Tages vollständig sichtbar war oder ein anderer Tag die Übung in seiner Übersicht führt. */
  pool.forEach(function(x){if(used.has(x)||!x.d)return;var dupe=pool.some(function(y){return y!==x&&used.has(y)&&tokSim(y.name,x.name)>=.8&&rxKey(y.rxLine).slice(0,16)===rxKey(x.rxLine).slice(0,16)});if(dupe)return;
   var D=x.d;if(!x.rxLine&&D.hasOv){prog.unparsed.push('Detailseite ohne lesbare Vorgabe: '+x.name);return}var same=D.ex.find(function(e){return tokSim(e.name,x.name)>=.8&&rxKey(e.raw).slice(0,16)===rxKey(x.rxLine).slice(0,16)});if(same){if(!same.notes&&x.notes)same.notes=x.notes;return}
   var else_=W.days.some(function(o){return o!==D&&(dayOv.get(o)||[]).some(function(it){return tokSim(it.name,x.name)>=.8})});var inOwn=(dayOv.get(D)||[]).some(function(it){return tokSim(it.name,x.name)>=.8});
   used.add(x);var ne=mk(x,null,D.hasOv&&!inOwn&&(D.ovDone||else_||D.ovN>=3));ne._det=x;D.ex.push(ne)})});
 /* Sicherheitsprüfung: Im Screenshot-Modus belegt die Tagesübersicht, welche Übungen zum Tag gehören. Fehlt sie, ist nicht prüfbar, ob alle erfasst sind → Tag gesperrt, bis der Nutzer ihn mit dem Original verglichen hat. */
 if(B.weeks.some(function(W){return W.days.some(function(D){return D.hasOv})}))B.weeks.forEach(function(W){W.days.forEach(function(D){if(!D.ex.length||D.chk)return;if(!D.hasOv)D.chk='Tagesübersicht nicht gefunden – nicht prüfbar, ob alle Übungen erfasst sind'})});
 B.weeks.forEach(function(W){W.days.forEach(function(D){D.ex.forEach(function(e){delete e._ov;delete e._d;delete e._det});delete D.ovDone;delete D.ovN})});
 B.weeks.forEach(function(W){W.days.forEach(function(D){delete D.hasOv})});
 B.weeks=B.weeks.filter(function(W){if(W.days.length)return true;prog.unparsed.push('Woche '+W.n+(W.name?' – '+W.name:'')+' (ohne erkannte Tage)');return false});
 if(!prog.name&&!hp)prog.noName=true;
 if(!prog.name)prog.name=hp||(o.fallback?String(o.fallback).replace(/(?:^|[\s_-])(?:woche|week|wk)[\s_-]*\d{1,2}\b.*$/i,'').replace(/[\s_-]+$/,'').trim():'')||o.fallback||'Importiertes Programm';if(hv)prog.variants=[{id:'v1',name:hv}];
 if(!B.weeks.length)prog.flags=['Keine Wochen/Tage erkannt – Format nicht lesbar'];return finish(prog)}
function finish(p){var n=0,f=0;(p.blocks||[]).forEach(function(b){(b.weeks||[]).forEach(function(w){(w.days||[]).forEach(function(d){if(!d.ex.length)d.flags=['Keine Übungen erkannt'];else if(d.flags&&d.flags[0]==='Keine Übungen erkannt')delete d.flags;(d.ex||[]).forEach(function(x){n++;if(x.flags&&x.flags.length)f++})})})});p.stats={ex:n,flagged:f};return p}

/* ---------- Mehrere Dateien in einem Text („=== Datei: name.pdf ===“, z. B. aus dem iPhone-Kurzbefehl) ---------- */
function splitMulti(text){var parts=[],cur=null;String(text||'').replace(/\r/g,'').split('\n').forEach(function(l){var m=l.match(/^\s*={3,}\s*(?:datei|file)\s*:\s*(.+?)\s*={3,}\s*$/i);if(m){cur={file:m[1].trim(),text:''};parts.push(cur);return}if(!cur){cur={file:'',text:''};parts.push(cur)}cur.text+=l+'\n'});
 return parts.filter(function(p){return p.text.trim()})}

/* ---------- CSV ---------- */
var COLS={prog:['programm','program','programme'],variant:['variante','variant'],block:['block','phase'],week:['woche','week','wk'],weekName:['wochenname','week name','weekname'],day:['tag','day'],dayName:['tagesname','day name','fokus','focus'],
 ex:['uebung','übung','exercise','lift'],sets:['saetze','sätze','sets'],reps:['wdh','wiederholungen','reps'],load:['last','load','prozent','percent','%'],rpe:['rpe'],hype:['hype'],notes:['hinweis','hinweise','notes','note','coaching'],opt:['optional']};
function csvSplit(line,sep){var out=[],cur='',q=false;for(var i=0;i<line.length;i++){var c=line[i];if(q){if(c==='"'){if(line[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}else if(c==='"')q=true;else if(c===sep){out.push(cur);cur=''}else cur+=c}out.push(cur);return out.map(function(s){return s.trim()})}
function parseCSV(text,o){o=o||{};var lines=String(text||'').replace(/^﻿/,'').split(/\r?\n/).filter(function(l){return l.trim()});if(!lines.length)return {error:'Datei ist leer'};
 var sep=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?';':',';var head=csvSplit(lines[0],sep).map(function(h){return norm(h)});
 var idx={};Object.keys(COLS).forEach(function(k){var an=COLS[k].map(norm);var i=head.findIndex(function(h){return an.indexOf(h)>=0});if(i>=0)idx[k]=i});
 var miss=['week','day','ex'].filter(function(k){return idx[k]==null});if(miss.length)return {error:'Spalten fehlen: '+miss.map(function(k){return {week:'Woche',day:'Tag',ex:'Übung'}[k]}).join(', ')+'. Erwartet z. B.: Programm;Woche;Tag;Übung;Sätze;Wdh;Last;RPE;Hype;Hinweis'};
 var progs={};lines.slice(1).forEach(function(l,ri){var c=csvSplit(l,sep);var g=function(k){return idx[k]!=null?(c[idx[k]]||'').trim():''};var pn=g('prog')||o.name||'CSV-Import';
  var P=progs[pn]||(progs[pn]={id:uid(),src:'import',name:pn,sub:'',file:o.file||'',fmt:'csv',at:Date.now(),variants:[],blocks:[],unparsed:[]});
  var vn=g('variant')||'Standard';if(!P.variants.some(function(v){return v.name===vn}))P.variants.push({id:'v'+(P.variants.length+1),name:vn});
  var bn=(g('variant')&&P.variants.length>1?vn+' · ':'')+(g('block')||'Block 1');var Bk=P.blocks.find(function(b){return b.name===bn});if(!Bk){Bk={name:bn,variant:vn,weeks:[]};P.blocks.push(Bk)}
  var wn=parseInt(g('week'),10),dn=parseInt(g('day'),10);if(!wn||!dn||!g('ex')){P.unparsed.push('Zeile '+(ri+2)+': '+l);return}
  var W=Bk.weeks.find(function(x){return x.n===wn});if(!W){W={n:wn,name:g('weekName'),days:[]};Bk.weeks.push(W);Bk.weeks.sort(function(a,b){return a.n-b.n})}
  var D=W.days.find(function(x){return x.n===dn});if(!D){D={n:dn,name:'Tag '+dn,wd:'',focus:g('dayName'),notes:'',hints:[],ex:[]};W.days.push(D);W.days.sort(function(a,b){return a.n-b.n})}
  var ld=g('load');var R=parseRx([g('sets')&&g('reps')?g('sets')+'x'+g('reps'):'',ld?(/%|kg/i.test(ld)?ld:ld+' %'):'',g('rpe')?'RPE '+g('rpe'):'',g('hype')?g('hype')+' hype':''].join(' '));
  var x={name:g('ex'),eid:matchEx(g('ex')),sets:num(g('sets'))!=null?num(g('sets')):R.sets,reps:g('reps')||R.reps,amrap:/amrap/i.test(g('reps')),rpe:num(g('rpe')),load:ld?(/%/.test(ld)||/^[\d.,]+$/.test(ld)?{pct:num(ld.replace('%','')),text:ld.indexOf('%')>=0?ld:ld+' %'}:/kg/i.test(ld)?{kg:num(ld),text:ld}:{text:ld}):null,hype:R.hype||(g('hype')||null),notes:g('notes'),opt:/^(ja|yes|x|1|true)$/i.test(g('opt')),raw:l};
  x.flags=flagEx(x,'csv');D.ex.push(x)});return {progs:Object.keys(progs).map(function(k){return finish(progs[k])})}}

/* ---------- JSON (eigenes Format, Export der App, Mac-Importer) ---------- */
function parseJSON(text,o){var j;try{j=JSON.parse(text)}catch(e){return {error:'Kein gültiges JSON: '+e.message}}
 var list=Array.isArray(j)?j:j&&Array.isArray(j.programs)?j.programs:j&&j.blocks?[j]:null;if(!list)return {error:'Unbekanntes JSON-Format. Erwartet: {"programs":[{"name":…,"blocks":[{"weeks":[{"n":1,"days":[{"n":1,"ex":[…]}]}]}]}]}'};
 var src0=j&&j.source?j.source:null;
 var progs=list.map(function(p){var ocr=!!(p.ocr||(src0&&src0.ocr));var src=ocr?'ocr':'json';
  var P={id:uid(),src:'import',key:p.key?String(p.key):undefined,name:String(p.name||'JSON-Import'),sub:String(p.sub||''),file:(o&&o.file)||p.file||'',fmt:'json',ocr:ocr,at:Date.now(),variants:Array.isArray(p.variants)&&p.variants.length?p.variants.map(function(v,i){return {id:'v'+(i+1),name:String(v.name||v)}}):[{id:'v1',name:'Standard'}],unparsed:Array.isArray(p.unparsed)?p.unparsed.map(String):[],
  files:Array.isArray(p.files)?p.files.filter(function(f){return f&&f.sha}).map(function(f){return {name:String(f.name||''),sha:String(f.sha),pages:+f.pages||0}}):[],
  blocks:(p.blocks||[]).map(function(b){return {name:String(b.name||'Block'),variant:b.variant||null,weeks:(b.weeks||[]).map(function(w,wi){return {n:+w.n||wi+1,name:String(w.name||''),days:(w.days||[]).map(function(d,di){return {n:+d.n||di+1,name:String(d.name||('Tag '+(+d.n||di+1))),wd:String(d.wd||''),focus:String(d.focus||''),notes:String(d.notes||''),hints:Array.isArray(d.hints)?d.hints.map(String):[],chk:d.chk?String(d.chk):undefined,chkOk:d.chkOk?true:undefined,
   ex:(d.ex||d.exercises||[]).map(function(x){var R=x.rx?parseRx(x.rx):{};var e={name:String(x.name||''),eid:x.eid||matchEx(x.name),sets:x.sets!=null?num(x.sets):(R.sets!=null?R.sets:null),reps:x.reps!=null?String(x.reps):(R.reps!=null?R.reps:null),amrap:!!(x.amrap||/amrap/i.test(String(x.reps||''))),rpe:x.rpe!=null?num(x.rpe):(R.rpe!=null?R.rpe:null),
    load:x.load?(typeof x.load==='object'?x.load:{text:String(x.load)}):R.load||null,hype:x.hype||R.hype||null,notes:String(x.notes||''),raw:String(x.raw||x.rx||''),opt:!!x.opt,cut:!!x.cut,ok:!!x.ok,amb:!!x.amb,rpeBad:x.rpeBad?String(x.rpeBad):(R.rpeBad||null),alt:!!(x.alt||R.alt),rpeTxt:x.rpeTxt?String(x.rpeTxt):(R.rpeTxt||null),kind:x.kind?String(x.kind):(R.kind||null)};['cond','home','conf','conflict','nameOk','nameCut','cutNote','rpeInf','ref','moved','ovMix','ovLine','sw','swNm'].forEach(function(k){if(x[k])e[k]=x[k]});if(e.nameOk==null&&x.nameOk===false)e.nameOk=false;if(e.eid)e.nameOk=true;e.flags=flagEx(e,src);if(!e.rpeTxt)delete e.rpeTxt;if(!e.kind)delete e.kind;if(!e.amb)delete e.amb;if(!e.rpeBad)delete e.rpeBad;if(!e.alt)delete e.alt;e.flags=flagEx(e,src);return e})}})}})}})};return finish(P)});return {progs:progs}}

/* ---------- PDF lesen (Bytes, ohne Fremdbibliothek): Textinhalt + eingebettete Seitenbilder ---------- */
function bfind(u8,pat,from){var f=pat.charCodeAt(0),n=pat.length;var i=u8.indexOf(f,from||0);while(i>=0&&i<=u8.length-n){var k=1;while(k<n&&u8[i+k]===pat.charCodeAt(k))k++;if(k===n)return i;i=u8.indexOf(f,i+1)}return -1}
function blast(u8,pat,before,min){var i=before;var f=pat.charCodeAt(0),n=pat.length;for(;i>=min;i--){if(u8[i]!==f)continue;var k=1;while(k<n&&u8[i+k]===pat.charCodeAt(k))k++;if(k===n)return i}return -1}
function lat(u8,a,b){var s='';for(var i=a;i<b;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,Math.min(b,i+8192)));return s}
function objText(u8,num0){var pat=num0+' 0 obj';var i=0;while((i=bfind(u8,pat,i))>=0){var pre=i?u8[i-1]:10;if(pre===10||pre===13||pre===32){var e=bfind(u8,'endobj',i);return lat(u8,i+pat.length,e<0?Math.min(u8.length,i+3000):Math.min(e,i+3000))}i+=pat.length}return ''}
function dictVal(u8,dict,key){var m=dict.match(new RegExp('/'+key+'\\s+(\\d+)\\s+0\\s+R'));if(m)return objText(u8,m[1]).trim();m=dict.match(new RegExp('/'+key+'\\s*(<<[\\s\\S]*?>>|\\[[^\\]]*\\]|/[A-Za-z0-9]+|-?[\\d.]+)'));return m?m[1]:''}
function scanPdf(buf){var u8=buf instanceof Uint8Array?buf:new Uint8Array(buf);if(lat(u8,0,Math.min(8,u8.length)).indexOf('%PDF')!==0)throw new Error('Keine PDF-Datei');
 var out=[],pos=0;while((pos=bfind(u8,'stream',pos))>=0){var st=pos+6;if(u8[st]===13)st++;if(u8[st]!==10){pos+=6;continue}st++;
  var ob=blast(u8,'obj',pos,Math.max(0,pos-6000));if(ob<0){pos=st;continue}if(u8[pos-1]===100&&u8[pos-2]===110){pos=st;continue}/* „endstream“ */
  var dict=lat(u8,ob+3,pos);var len=parseInt(dictVal(u8,dict,'Length'),10);var end=(!isNaN(len)&&len>0&&st+len<=u8.length)?st+len:bfind(u8,'endstream',st);if(end<0)break;
  out.push({dict:dict,start:st,end:end});pos=end}return {u8:u8,streams:out}}
async function inflate(u8){if(typeof DecompressionStream==='undefined')throw new Error('Entpacken wird von diesem Browser nicht unterstützt');var fmts=['deflate','deflate-raw'];for(var i=0;i<fmts.length;i++){try{var ds=new DecompressionStream(fmts[i]);var r=new Response(new Blob([u8]).stream().pipeThrough(ds));return new Uint8Array(await r.arrayBuffer())}catch(e){}}throw new Error('Datenstrom nicht lesbar')}
function pdfStr(s){return s.replace(/\\(\d{1,3})/g,function(m,o){return String.fromCharCode(parseInt(o,8))}).replace(/\\n/g,'\n').replace(/\\r/g,'').replace(/\\t/g,' ').replace(/\\([()\\])/g,'$1')}
function hexStr(h){h=h.replace(/\s+/g,'');var o='';if(h.length%4===0&&/^00|^feff/i.test(h)){for(var i=0;i<h.length;i+=4)o+=String.fromCharCode(parseInt(h.substr(i,4),16))}else for(var k=0;k<h.length;k+=2)o+=String.fromCharCode(parseInt(h.substr(k,2),16));return o}
function textOps(c){var out='',line='';var flush=function(){if(line.trim())out+=line.trim()+'\n';line=''};
 var re=/\[((?:\\.|[^\]])*)\]\s*TJ|\(((?:\\.|[^\\)])*)\)\s*(?:Tj|'|")|<([0-9a-fA-F\s]+)>\s*Tj|(T\*|ET|BT)|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|[\d.\-\s]+Tm/g;var m;
 while((m=re.exec(c))){if(m[1]!=null){var parts=m[1].match(/\(((?:\\.|[^\\)])*)\)|<([0-9a-fA-F\s]+)>|-?\d+(?:\.\d+)?/g)||[];parts.forEach(function(p){if(p[0]==='(')line+=pdfStr(p.slice(1,-1));else if(p[0]==='<')line+=hexStr(p.slice(1,-1));else if(+p<-200)line+=' '})}
  else if(m[2]!=null)line+=pdfStr(m[2]);else if(m[3]!=null)line+=hexStr(m[3]);else if(m[4])flush();else if(m[6]!=null){if(Math.abs(+m[6])>.5)flush();else line+=' '}else flush()}flush();return out}
/* Liefert Text + Liste der Seitenbilder (noch nicht entpackt – erst bei Bedarf, Bild für Bild, damit große PDFs den Speicher schonen) */
async function pdfRead(buf){var S=scanPdf(buf),u8=S.u8;var text='',images=[];
 for(var i=0;i<S.streams.length;i++){var s=S.streams[i],dict=s.dict;
  if(/\/Subtype\s*\/Image/.test(dict)){var w=+dictVal(u8,dict,'Width'),h=+dictVal(u8,dict,'Height');if(/\/ImageMask\s+true/.test(dict)||w*h<4000)continue;images.push({w:w,h:h,dict:dict,start:s.start,end:s.end});continue}
  if(/\/Type\s*\/(XRef|ObjStm|Metadata)/.test(dict)||/\/Length1|\/Subtype\s*\/(Type1C|CIDFontType0C|OpenType)/.test(dict))continue;
  var data=u8.subarray(s.start,s.end);try{if(/\/FlateDecode/.test(dict))data=await inflate(data);else if(/\/Filter/.test(dict))continue}catch(e){continue}
  if(data.length>4e6)continue;var str=lat(data,0,data.length);if(/\bBT\b/.test(str))text+=textOps(str)+'\n'}
 try{text=decodeURIComponent(escape(text))}catch(e){}return {text:text.trim(),images:images,u8:u8}}
function unpredict(d,cols,colors,bpc){var bpp=Math.max(1,colors*bpc/8),rl=cols*bpp,rows=Math.floor(d.length/(rl+1));var out=new Uint8Array(rows*rl);var prev=new Uint8Array(rl);
 for(var r=0;r<rows;r++){var t=d[r*(rl+1)],src=d.subarray(r*(rl+1)+1,(r+1)*(rl+1)),cur=out.subarray(r*rl,(r+1)*rl);
  for(var i=0;i<rl;i++){var a=i>=bpp?cur[i-bpp]:0,b=prev[i],c=i>=bpp?prev[i-bpp]:0,x=src[i];
   if(t===1)x+=a;else if(t===2)x+=b;else if(t===3)x+=(a+b)>>1;else if(t===4){var p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);x+=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c)}cur[i]=x&255}prev=cur}return out}
/* Ein Seitenbild entpacken → {kind:'jpeg',bytes} oder {kind:'rgba',w,h,data} */
async function pdfImage(R,im){var u8=R.u8,dict=im.dict,raw=u8.subarray(im.start,im.end);
 if(/\/DCTDecode/.test(dict))return {kind:'jpeg',bytes:raw,w:im.w,h:im.h};
 if(!/\/FlateDecode/.test(dict)||/\/Filter\s*\[/.test(dict)&&!/\[\s*\/FlateDecode\s*\]/.test(dict))throw new Error('Bildformat nicht unterstützt');
 var bpc=+dictVal(u8,dict,'BitsPerComponent')||8;if(bpc!==8&&bpc!==16)throw new Error('Bildtiefe nicht unterstützt');
 var cs=dictVal(u8,dict,'ColorSpace');var colors=3;if(/DeviceGray|CalGray/.test(cs))colors=1;else if(/DeviceCMYK/.test(cs))colors=4;else if(/ICCBased/.test(cs)){var rr=cs.match(/(\d+)\s+0\s+R/);var nn=(rr?objText(u8,rr[1]):'').match(/\/N\s+(\d)/);if(nn)colors=+nn[1]}else if(/Indexed/.test(cs))throw new Error('Farbpalette nicht unterstützt');
 var d=await inflate(raw);var dp=dictVal(u8,dict,'DecodeParms');var pr=+((dp.match(/\/Predictor\s+(\d+)/)||[])[1]||1);
 var Bp=bpc/8;if(pr<10&&d.length===im.h*(im.w*colors*Bp+1))pr=15;/* Parameter fehlen (z. B. abgeschnittene Datei): Länge verrät den PNG-Prädiktor */
 if(pr>=10)d=unpredict(d,+((dp.match(/\/Columns\s+(\d+)/)||[])[1]||im.w),+((dp.match(/\/Colors\s+(\d+)/)||[])[1]||colors),bpc);
 if(Bp===2){var h8=new Uint8Array(d.length>>1);for(var z=0;z<h8.length;z++)h8[z]=d[z*2];d=h8}/* 16 Bit je Kanal → oberes Byte */
 var n=im.w*im.h,rgba=new Uint8ClampedArray(n*4);for(var p=0,q=0;p<n;p++,q+=colors){var o=p*4;if(colors===1){rgba[o]=rgba[o+1]=rgba[o+2]=d[q]}else if(colors===4){var k=255-d[q+3];rgba[o]=(255-d[q])*k/255;rgba[o+1]=(255-d[q+1])*k/255;rgba[o+2]=(255-d[q+2])*k/255}else{rgba[o]=d[q];rgba[o+1]=d[q+1];rgba[o+2]=d[q+2]}rgba[o+3]=255}
 return {kind:'rgba',w:im.w,h:im.h,data:rgba}}
/* Erkannte Textblöcke (mit Rahmen) zu Zeilen in Lesereihenfolge ordnen */
function linesFromBoxes(items){var it=items.filter(function(x){return x&&x.text&&String(x.text).trim()}).map(function(x){return {t:String(x.text).trim(),x:x.x||0,y:x.y||0,h:x.h||10}}).sort(function(a,b){return a.y-b.y||a.x-b.x});
 var out=[],cur=null;it.forEach(function(x){if(cur&&Math.abs(x.y-cur.y)<Math.max(4,Math.min(x.h,cur.h)*.5)){cur.a.push(x)}else{cur={y:x.y,h:x.h,a:[x]};out.push(cur)}});
 return out.map(function(l){return l.a.sort(function(a,b){return a.x-b.x}).map(function(x){return x.t}).join(' ')}).join('\n')}

/* ---------- Kontrollierte Gym-Schnittstelle: Ist ein Tag eindeutig und vollständig genug zum Trainieren? ---------- */
function toGymDay(day){var issues=[];var b=[];(day.ex||[]).forEach(function(x,i){var need=[];if(!x.eid)need.push('Übung nicht im Katalog');if(x.sets==null||!(x.sets>0))need.push('Satzanzahl fehlt');if(x.reps==null||x.reps==='')need.push('Wiederholungen fehlen');
  if(!x.ok&&(x.flags||[]).some(function(f){return /unsicher|gekürzt|nicht lesbar|Optionen|Widerspruch/.test(f)}))need.push('unsicher gelesen – bitte prüfen');
  if(need.length){issues.push({i:i,name:x.name,need:need});return}
  var r=String(x.reps).replace(/–/g,'-');var bl={e:x.eid,s:Math.round(x.sets),r:x.amrap?'AMRAP':r,x:[x.sets+'×'+String(x.reps).replace('-','–'),x.rpe!=null?'@ RPE '+String(x.rpe).replace('.',','):x.rpeTxt?'@ RPE '+x.rpeTxt:'',(x.rpe!=null||x.rpeTxt)&&x.kind?x.kind:'',x.load&&x.load.text?'· '+x.load.text:'',x.cond?'· nur wenn: „'+x.cond+'“':'',x.home?'· Home-Gym-Option':''].join(' ').replace(/\s+/g,' ').trim()};
  if(x.rpe!=null)bl.rpe=x.rpe;if(x.hype){var hk={Niedrig:'l',Moderat:'m',Hoch:'h'}[x.hype];if(hk)bl.h=hk}if(x.opt)bl.opt=1;if(x.sw)bl.sw=x.sw;b.push(bl)});
 if(!(day.ex||[]).length)issues.push({i:-1,name:'Tag',need:['keine Übungen erkannt']});if(day.chk&&!day.chkOk)issues.push({i:-1,name:'Tag',need:[day.chk]});
 return {ok:!issues.length&&b.length>0,day:{f:day.focus||day.name,d:day.notes||'',b:b},issues:issues}}

/* ---------- Zusammenführen: mehrere Importe → Bibliothek (nie überschreiben) ---------- */
var daySig=function(D){return JSON.stringify((D.ex||[]).map(function(x){return [norm(x.name),x.sets,String(x.reps||''),x.rpe,x.load&&x.load.text||'']}))};
function progKey(p){return norm(p.name).replace(/\s+/g,'')}
function variantOf(p){return (p.variants&&p.variants[0]&&p.variants[0].name)||'Standard'}
/* lib: {v:1,progs:[]}. inc: Liste geparster Programme (je Datei). Rückgabe: Bericht je Datei/Programm. Bestehende Tage bleiben unverändert. */
function merge(lib,inc,file){var rep=[];inc.forEach(function(p){if(!(p.blocks||[]).some(function(b){return b.weeks&&b.weeks.length})){rep.push({file:file||p.file||'',prog:p.name,status:'Fehler',msg:'Keine Wochen/Tage erkannt – Text nicht lesbar',weeks:[]});return}var key=progKey(p);var tgt=lib.progs.find(function(x){return x.src!=='builtin'&&(x.key||progKey(x))===key});
  /* Programm ohne Namen im Tageskopf (Name nur aus dem Dateinamen): über den Inhalt einem vorhandenen Programm zuordnen */
  if(!tgt&&p.noName){var best=null,bs=0;lib.progs.forEach(function(x){if(x.src==='builtin'||x===p)return;var sim=progSim(x,p);if(sim>bs){bs=sim;best=x}});if(best&&bs>=.6){tgt=best;key=tgt.key||progKey(tgt)}}var row={file:file||p.file||'',prog:tgt?tgt.name:p.name,variant:variantOf(p),weeks:[],added:0,same:0,conflict:[],status:''};
  if(!tgt){p.key=key;lib.progs.push(p);p.files=(p.files||[]).slice();row.status='neu';row.target=p.id;(p.blocks||[]).forEach(function(b){b.weeks.forEach(function(w){row.weeks.push(w.n);row.added+=w.days.length})});rep.push(row);return}
  row.target=tgt.id;(p.variants||[]).forEach(function(v){if(!tgt.variants.some(function(t){return t.name===v.name})){tgt.variants.push({id:'v'+(tgt.variants.length+1),name:v.name})}});
  if(tgt.variants.length>1)tgt.blocks.forEach(function(b){if(!b.variant)b.variant=tgt.variants[0].name});
  (p.blocks||[]).forEach(function(b){var vn=b.variant||(tgt.variants.length>1||p.variants.length?variantOf(p):null);
   var tb=tgt.blocks.find(function(x){return x.name===b.name&&(!vn||!x.variant||x.variant===vn)&&(tgt.variants.length<2||x.variant===vn)});
   if(!tb){tb={name:b.name,variant:tgt.variants.length>1?vn:null,weeks:[]};if(tgt.variants.length>1&&tgt.blocks.some(function(x){return x.name===b.name}))tb.name=b.name+' · '+vn;tgt.blocks.push(tb)}
   b.weeks.forEach(function(w){row.weeks.push(w.n);var tw=tb.weeks.find(function(x){return x.n===w.n});if(!tw){tb.weeks.push(w);tb.weeks.sort(function(a,c){return a.n-c.n});row.added+=w.days.length;return}
    if(!tw.name&&w.name)tw.name=w.name;
    w.days.forEach(function(d){var td=tw.days.find(function(x){return x.n===d.n});if(!td){tw.days.push(d);tw.days.sort(function(a,c){return a.n-c.n});row.added++;return}
     if(daySig(td)===daySig(d)){row.same++;return}
     if(!td.ex.length&&d.ex.length){var keep=td;tw.days[tw.days.indexOf(keep)]=d;row.added++;return}
     row.conflict.push('W'+w.n+' Tag '+d.n)})})});
  (p.unparsed||[]).forEach(function(u){if((tgt.unparsed||(tgt.unparsed=[])).indexOf(u)<0)tgt.unparsed.push(u)});
  tgt.files=(tgt.files||[]).concat(p.files||[]);finish(tgt);
  row.status=row.added?'ergänzt':row.conflict.length?'Konflikt':'bereits vorhanden';rep.push(row)});return rep}

function progSim(a,b){var tot=0,hit=0;(b.blocks||[]).forEach(function(bb){bb.weeks.forEach(function(W){var aw=null;(a.blocks||[]).forEach(function(ab){ab.weeks.forEach(function(x){if(x.n===W.n)aw=x})});
  W.days.forEach(function(D){D.ex.forEach(function(x){tot++;if(!aw)return;var AD=aw.days.find(function(d){return d.n===D.n});if(AD&&AD.ex.some(function(y){return tokKey(cleanEx(y.name).name)===tokKey(cleanEx(x.name).name)&&y.sets===x.sets&&String(y.reps)===String(x.reps)}))hit++})})})});
 if(!tot)return 0;var va=(a.variants||[]).map(function(v){return v.name}),vb=(b.variants||[]).map(function(v){return v.name});if(vb[0]!=='Standard'&&va.indexOf(vb[0])<0)return 0;return hit/tot}
/* ---------- Lücken und Datenqualität ---------- */
function blocksOf(p,vname){var multi=(p.variants||[]).length>1;return (p.blocks||[]).filter(function(b){return !multi||!b.variant||b.variant===vname})}
function quality(p,vname){vname=vname||variantOf(p);var bl=blocksOf(p,vname);var q={weeks:[],missingWeeks:[],missingDays:[],days:0,ok:0,locked:0,ex:0,exOk:0,flagged:0,lockedList:[]};
 bl.forEach(function(b){var ns=b.weeks.map(function(w){return w.n});var mx=ns.length?Math.max.apply(null,ns):0;var dmax=0;b.weeks.forEach(function(w){w.days.forEach(function(d){if(d.n>dmax)dmax=d.n})});
  for(var n=1;n<=mx;n++){if(ns.indexOf(n)<0)q.missingWeeks.push((bl.length>1?b.name+' ':'')+'W'+n)}
  b.weeks.forEach(function(w){q.weeks.push(w.n);for(var dn=1;dn<=dmax;dn++){if(!w.days.some(function(d){return d.n===dn}))q.missingDays.push('W'+w.n+' Tag '+dn)}
   w.days.forEach(function(d){q.days++;var g=toGymDay(d);if(g.ok)q.ok++;else{q.locked++;q.lockedList.push({w:w.n,d:d.n,issues:g.issues})}(d.ex||[]).forEach(function(x){q.ex++;if(x.flags&&x.flags.length)q.flagged++;else q.exOk++})})})});
 q.score=q.ex?Math.round(q.exOk/q.ex*100):0;return q}

return {esc:esc,norm:norm,num:num,uid:uid,matchEx:matchEx,cleanEx:cleanEx,cleanName:cleanName,setExtra:setExtra,tokKey:tokKey,tokSim:tokSim,parseRx:parseRx,flagEx:flagEx,headInfo:headInfo,weekFromName:weekFromName,baseName:baseName,parseText:parseText,splitMulti:splitMulti,finish:finish,
 parseCSV:parseCSV,parseJSON:parseJSON,pdfRead:pdfRead,pdfImage:pdfImage,unpredict:unpredict,linesFromBoxes:linesFromBoxes,textOps:textOps,toGymDay:toGymDay,merge:merge,progKey:progKey,variantOf:variantOf,daySig:daySig,quality:quality,blocksOf:blocksOf,WD:WD}})();
if(typeof module!=='undefined'&&module.exports)module.exports=BIBCORE;
