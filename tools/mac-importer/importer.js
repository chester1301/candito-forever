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
if(typeof module!=='undefined'&&module.exports)module.exports={pipeline:pipeline};

/* ---------- macOS (JXA): Dateien, Vision-Texterkennung, Ausgabe ---------- */
function _read(p){return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(p,$.NSUTF8StringEncoding,null))}
function _write(p,s){return $(s).writeToFileAtomicallyEncodingError(p,true,$.NSUTF8StringEncoding,null)}
function _q(p){return "'"+String(p).replace(/'/g,"'\\''")+"'"}
function _isDir(p){var d=Ref();return $.NSFileManager.defaultManager.fileExistsAtPathIsDirectory(p,d)&&d[0]}
function _pdfs(paths){var out=[];paths.forEach(function(p){if(_isDir(p)){var ls=ObjC.deepUnwrap($.NSFileManager.defaultManager.contentsOfDirectoryAtPathError(p,null))||[];ls.sort().forEach(function(n){if(/\.pdf$/i.test(n)&&n[0]!=='.')out.push(p.replace(/\/$/,'')+'/'+n)})}else if(/\.pdf$/i.test(p))out.push(p)});return out}
function _ocrPdf(path,core,log){var doc=$.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(path));if(!doc||(doc.isNil&&doc.isNil()))throw new Error('PDF nicht lesbar');
 var n=doc.pageCount,pages=[];
 for(var i=0;i<n;i++){var page=doc.pageAtIndex(i);var r=page.boundsForBox(0);var w=r.size.width,h=r.size.height;var sc=Math.max(1,Math.min(3,2900/Math.max(w,h)));
  var img=page.thumbnailOfSizeForBox($.NSMakeSize(w*sc,h*sc),0);var data=img.TIFFRepresentation;
  var req=$.VNRecognizeTextRequest.alloc.init;req.setRecognitionLevel(0);req.setUsesLanguageCorrection(true);try{req.setRecognitionLanguages($(['en-US','de-DE']))}catch(e){}
  var hd=$.VNImageRequestHandler.alloc.initWithDataOptions(data,$({}));hd.performRequestsError($([req]),null);
  var res=req.results,items=[],W=w*sc,H=h*sc;var cnt=res?res.count:0;
  for(var j=0;j<cnt;j++){var ob=res.objectAtIndex(j);var c=ob.topCandidates(1);if(!c||!c.count)continue;var t=ObjC.unwrap(c.objectAtIndex(0).string);var bb=ob.boundingBox;
   items.push({text:t,x:bb.origin.x*W,y:(1-bb.origin.y-bb.size.height)*H,h:bb.size.height*H})}
  pages.push(core.linesFromBoxes(items));if(log&&(i%5===4||i===n-1))log('   Seite '+(i+1)+'/'+n)}
 return pages}
function run(argv){ObjC.import('Foundation');ObjC.import('AppKit');ObjC.import('Quartz');ObjC.import('Vision');
 var app=Application.currentApplication();app.includeStandardAdditions=true;var log=function(s){console.log(s)};
 var tool=argv[0];var core=(0,eval)(_read(tool+'/bib-core.js')+'\n;BIBCORE');
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
