/* Candito Forever – Programmbibliothek · Mac-Batch-Importer
   Liest viele Bild-PDFs (z. B. Superset-Screenshots aus PDF24) auf einmal, erkennt den Text lokal mit der
   Texterkennung von macOS (Vision-Framework, keine Cloud, keine Installation) und schreibt EINE JSON-Datei,
   die die App unter Einstellungen › Programmbibliothek › „Dateien importieren“ einliest.
   Strukturierung (Programm, Variante, Woche, Tag, Übung, Sätze, Wdh., RPE, Last, Hinweise, Markierungen)
   übernimmt derselbe Kern wie in der App (bib-core.js) – nichts wird erfunden, Unsicheres wird markiert.

   Start: Doppelklick auf „Programmbibliothek-Import.command“ (beim ersten Mal: Rechtsklick › Öffnen),
   oder im Terminal:  osascript -l JavaScript importer.js <Ordner dieses Tools> <PDF-Ordner oder PDF-Dateien …>
   Ergebnis im PDF-Ordner: Programmbibliothek-Import-<Datum>.json, …-Bericht.txt, …-Text.txt (erkannter Rohtext). */

/* ---------- reine Verarbeitung (auch in Node testbar) ---------- */
function pipeline(files,core){var lib={v:1,progs:[]},rows=[],seen={};
 files.forEach(function(f){
  if(f.error){rows.push({file:f.name,status:'Fehler',msg:f.error});return}
  if(f.sha&&seen[f.sha]){rows.push({file:f.name,status:'Dublette',msg:'identisch mit '+seen[f.sha]+' – übersprungen'});return}
  if(f.sha)seen[f.sha]=f.name;
  var text=(f.pages||[]).join('\n\f\n');
  if(text.replace(/\s/g,'').length<40){rows.push({file:f.name,status:'Fehler',msg:'kein Text erkannt'});return}
  var p=core.parseText(text,{file:f.name,fallback:core.baseName(f.name),src:'ocr',fmt:'pdf-ocr'});
  p.files=[{name:f.name,sha:f.sha||'',pages:(f.pages||[]).length}];p.ocrBy='macOS Vision';
  core.merge(lib,[p],f.name).forEach(function(r){rows.push(r)})});
 lib.progs.forEach(function(p){p.ocr=true;core.finish(p)});
 var json={format:'candito-bib',v:1,source:{tool:'Programmbibliothek Mac-Importer',ocr:true,at:new Date().toISOString(),files:files.length},programs:lib.progs};
 var L=['Programmbibliothek – Prüfbericht Mac-Importer','Erstellt: '+new Date().toLocaleString('de-DE'),'',
  'Dateien ('+files.length+'):'];
 rows.forEach(function(r){L.push('  '+(r.status||'').toUpperCase()+' · '+r.file+(r.prog?' → '+r.prog+(r.variant&&r.variant!=='Standard'?' · '+r.variant:''):'')+(r.weeks&&r.weeks.length?' · W'+r.weeks.filter(function(x,i,a){return a.indexOf(x)===i}).join(', W'):'')+(r.added?' · '+r.added+' Tage':'')+(r.same?' · '+r.same+' schon vorhanden':'')+(r.conflict&&r.conflict.length?' · abweichend (nicht überschrieben): '+r.conflict.join(', '):'')+(r.msg?' · '+r.msg:''))});
 L.push('','Programme ('+lib.progs.length+'):');
 lib.progs.forEach(function(p){p.variants.forEach(function(v){var q=core.quality(p,v.name);
  L.push('  '+p.name+(v.name!=='Standard'?' · '+v.name:'')+': '+q.weeks.length+' Wochen · '+q.days+' Tage · '+q.ok+' trainierbar · '+q.locked+' zu prüfen · '+q.ex+' Übungen ('+q.flagged+' markiert) · Qualität '+q.score+' %');
  if(q.missingWeeks.length)L.push('     fehlende Wochen: '+q.missingWeeks.join(', '));
  if(q.missingDays.length)L.push('     fehlende Tage: '+q.missingDays.join(', '))})});
 L.push('','Hinweis: Markierte Übungen sind in der App gesperrt, bis du sie mit dem Original verglichen hast.');
 var T=files.filter(function(f){return !f.error}).map(function(f){return '=== Datei: '+f.name+' ===\n'+(f.pages||[]).join('\n\f\n')}).join('\n');
 return {json:json,report:L.join('\n'),text:T,rows:rows}}
/* Erwartetes Ergebnis der beiliegenden selbsttest.pdf (frei erfundenes Testprogramm) */
function selfCheck(R){var c=[];var ok=function(n,b,info){c.push({n:n,ok:!!b,info:info||''})};
 var P=R.json.programs[0];ok('Programm erkannt',P&&P.name==='TESTPROGRAMM SELBSTTEST',P&&P.name);
 var W=P&&P.blocks[0]&&P.blocks[0].weeks[0];ok('Variante V1, Woche 1',P&&P.variants[0].name==='V1'&&W&&W.n===1);
 var D=W?W.days:[];ok('2 Trainingstage (Mo, Do)',D.length===2&&/monday/i.test(D[0].wd)&&/thursday/i.test(D[1].wd),D.map(function(d){return d.wd}).join(', '));
 var e=function(d,i){return D[d]&&D[d].ex[i]};var chk=function(d,i,nm,s,r,rpe){var x=e(d,i);ok(nm+' '+s+'×'+r+' @ '+rpe,x&&x.name.toLowerCase()===nm.toLowerCase()&&x.sets===s&&String(x.reps)===r&&x.rpe===rpe,x?x.name+' '+x.sets+'×'+x.reps+' @ '+x.rpe:'fehlt')};
 chk(0,0,'Comp Squat',3,'5',7);chk(0,1,'Paused Deadlift',2,'4',6.5);chk(1,0,'Paused Barbell Bench Press',4,'6',8);
 ok('RPE-Bezug „im letzten Satz“',e(0,0)&&e(0,0).kind==='im letzten Satz');ok('Dublette erkannt',R.rows.some(function(r){return r.status==='Dublette'}));
 return c}
if(typeof module!=='undefined'&&module.exports)module.exports={pipeline:pipeline,selfCheck:selfCheck};

/* ---------- macOS (JXA): Dateien, Vision-Texterkennung, Ausgabe ---------- */
function _read(p){return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(p,$.NSUTF8StringEncoding,null))}
function _write(p,s){return $(s).writeToFileAtomicallyEncodingError(p,true,$.NSUTF8StringEncoding,null)}
function _q(p){return "'"+String(p).replace(/'/g,"'\\''")+"'"}
function _isDir(p){var d=Ref();return $.NSFileManager.defaultManager.fileExistsAtPathIsDirectory(p,d)&&d[0]}
function _pdfs(paths){var out=[];paths.forEach(function(p){if(_isDir(p)){var ls=ObjC.deepUnwrap($.NSFileManager.defaultManager.contentsOfDirectoryAtPathError(p,null))||[];ls.sort().forEach(function(n){if(/\.pdf$/i.test(n)&&n[0]!=='.')out.push(p.replace(/\/$/,'')+'/'+n)})}else if(/\.pdf$/i.test(p))out.push(p)});return out}
function _ocrPdf(path,core,log){var doc=$.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(path));if(!doc||(doc.isNil&&doc.isNil()))throw new Error('PDF nicht lesbar');
 var n=doc.pageCount,pages=[];
 for(var i=0;i<n;i++){var page=doc.pageAtIndex(i);var r=page.boundsForBox(0);var w=r.size.width,h=r.size.height;var sc=Math.max(1,Math.min(3,2900/Math.max(w,h)));
  var pool=null;try{pool=$.NSAutoreleasePool.alloc.init}catch(e){}
  var img=page.thumbnailOfSizeForBox({width:w*sc,height:h*sc},0);var data=img.TIFFRepresentation;
  var req=$.VNRecognizeTextRequest.alloc.init;req.setRecognitionLevel(0);req.setUsesLanguageCorrection(true);try{req.setRecognitionLanguages($(['en-US','de-DE']))}catch(e){}
  var hd=$.VNImageRequestHandler.alloc.initWithDataOptions(data,$({}));var er=Ref();var okv=hd.performRequestsError($([req]),er);if(!okv){var em='';try{em=ObjC.unwrap(er[0].localizedDescription)}catch(e){}throw new Error('Texterkennung (Vision) fehlgeschlagen auf Seite '+(i+1)+(em?': '+em:''))}
  var res=req.results,items=[],W=w*sc,H=h*sc;var cnt=res?res.count:0;
  for(var j=0;j<cnt;j++){var ob=res.objectAtIndex(j);var c=ob.topCandidates(1);if(!c||!c.count)continue;var t=ObjC.unwrap(c.objectAtIndex(0).string);var bb=ob.boundingBox;
   items.push({text:t,x:bb.origin.x*W,y:(1-bb.origin.y-bb.size.height)*H,h:bb.size.height*H})}
  pages.push(core.linesFromBoxes(items));try{if(pool)pool.drain}catch(e){}if(log&&(i%5===4||i===n-1))log('   Seite '+(i+1)+'/'+n)}
 return pages}
function run(argv){ObjC.import('Foundation');ObjC.import('AppKit');ObjC.import('Quartz');ObjC.import('Vision');
 var app=Application.currentApplication();app.includeStandardAdditions=true;var log=function(s){console.log(s)};
 var tool=argv[0];var core=(0,eval)(_read(tool+'/bib-core.js')+'\n;BIBCORE');
 if(argv[1]==='--selbsttest')return selftest(app,tool,core,log);
 var paths=argv.slice(1);if(!paths.length){try{paths=[app.chooseFolder({withPrompt:'Ordner mit den Programm-PDFs wählen'}).toString()]}catch(e){return 'Abgebrochen'}}
 var list=_pdfs(paths);if(!list.length){app.displayDialog('Keine PDF-Dateien gefunden.',{buttons:['OK']});return}
 var outDir=_isDir(paths[0])?paths[0].replace(/\/$/,''):paths[0].replace(/\/[^\/]+$/,'');
 log('Programmbibliothek-Import: '+list.length+' PDF-Dateien');var files=[];
 list.forEach(function(p,k){var name=p.split('/').pop();log('['+(k+1)+'/'+list.length+'] '+name);var f={name:name};
  try{f.sha=app.doShellScript('shasum -a 256 '+_q(p)).split(' ')[0]}catch(e){f.sha=''}
  if(f.sha&&files.some(function(x){return x.sha===f.sha})){f.pages=[];files.push(f);log('   identisch mit einer anderen Datei – übersprungen');return}
  try{f.pages=_ocrPdf(p,core,log)}catch(e){f.error=String(e&&e.message||e);log('   Fehler: '+f.error)}files.push(f)});
 var R=pipeline(files,core);var d=new Date().toISOString().slice(0,10);var base=outDir+'/Programmbibliothek-Import-'+d;
 _write(base+'.json',JSON.stringify(R.json,null,1));_write(base+'-Bericht.txt',R.report);_write(base+'-Text.txt',R.text);
 log('\n'+R.report);
 app.displayDialog('Fertig: '+R.json.programs.length+' Programme aus '+list.length+' Dateien.\n\nDie Datei „Programmbibliothek-Import-'+d+'.json“ liegt im PDF-Ordner. Per AirDrop oder iCloud Drive aufs iPhone bringen und in der App unter Einstellungen › Programmbibliothek › „Dateien importieren“ auswählen.\n\nPrüfbericht: …-Bericht.txt',{buttons:['OK'],defaultButton:'OK'});
 return ''}

/* ---------- Selbsttest auf dem Mac: prüft Vision, Seitenwiedergabe, Parser, Dubletten, Zeit und Speicher ---------- */
function _rss(app){try{var pid=$.NSProcessInfo.processInfo.processIdentifier;return Math.round(+app.doShellScript('ps -o rss= -p '+pid)/1024)}catch(e){return null}}
function selftest(app,tool,core,log){var L=[],T0=Date.now();var add=function(n,ok,info){L.push((ok?'OK    ':'FEHLER')+'  '+n+(info?'  ('+info+')':''));log((ok?'OK     ':'FEHLER ')+n+(info?' – '+info:''))};
 add('macOS-Version',true,ObjC.unwrap($.NSProcessInfo.processInfo.operatingSystemVersionString));
 var hasV=false;try{hasV=!!$.VNRecognizeTextRequest&&!$.VNRecognizeTextRequest.isNil()}catch(e){}add('Texterkennung (Vision) verfügbar',hasV,hasV?'':'benötigt macOS 10.15 oder neuer');
 add('Parser-Kern geladen',typeof core.parseText==='function');
 var pdf=tool+'/selbsttest.pdf';var pages=null,ms=0,m0=_rss(app);
 try{var t=Date.now();pages=_ocrPdf(pdf,core,null);ms=Date.now()-t;add('Selbsttest-PDF gelesen',pages.length===2,pages.length+' Seiten, '+Math.round(ms/pages.length)+' ms je Seite')}catch(e){add('Selbsttest-PDF gelesen',false,String(e&&e.message||e))}
 var m1=_rss(app);add('Speicher',m1==null||m1<1500,m1!=null?m1+' MB belegt (vorher '+m0+' MB)':'nicht messbar');
 if(pages){var sha='selbsttest';var R=pipeline([{name:'selbsttest.pdf',sha:sha,pages:pages},{name:'selbsttest-kopie.pdf',sha:sha,pages:pages}],core);
  selfCheck(R).forEach(function(c){add(c.n,c.ok,c.info)});_write(tool+'/Selbsttest-Text.txt',pages.join('\n\f\n'))}
 var bad=L.filter(function(x){return /^FEHLER/.test(x)}).length;
 var txt=['Programmbibliothek – Selbsttest Mac-Importer',new Date().toLocaleString('de-DE'),'',L.join('\n'),'',bad?bad+' Prüfung(en) fehlgeschlagen – bitte diese Datei an Claude schicken.':'Alle Prüfungen bestanden. Der Mac-Importer ist einsatzbereit.','Dauer: '+Math.round((Date.now()-T0)/1000)+' s'].join('\n');
 _write(tool+'/Selbsttest-Ergebnis.txt',txt);app.displayDialog((bad?'Selbsttest: '+bad+' Fehler':'Selbsttest bestanden')+'\n\nErgebnis: Selbsttest-Ergebnis.txt im Ordner des Importers.',{buttons:['OK'],defaultButton:'OK'});return ''}
