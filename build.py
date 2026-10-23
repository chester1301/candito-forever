#!/usr/bin/env python3
"""Baut die PWA aus dem Dashboard-Quelltext (intro-zyklus/index.html) nach site/."""
import hashlib,json,re,shutil,sys,datetime,os
ROOT=os.path.dirname(os.path.abspath(__file__))
S=os.path.join(ROOT,'source')
rd=lambda f:open(os.path.join(S,f),encoding='utf-8').read()
app=rd('src.html').replace('/*__DATA__*/',rd('data.js')+'\n'+rd('data_sq.js')).replace('/*__BIB__*/',rd('bib.js'))
if '/*__DATA__*/' in app or len(app)<500000: sys.exit('Quelltext unvollständig')
# Claude-Version (für das Artifact auf claude.ai) zusätzlich ablegen
os.makedirs(os.path.join(ROOT,'build'),exist_ok=True)
open(os.path.join(ROOT,'build','claude-artifact.html'),'w',encoding='utf-8').write(app)
shim=open(os.path.join(ROOT,'src/pwa-shim.js'),encoding='utf-8').read()
ui=open(os.path.join(ROOT,'src/pwa-ui.js'),encoding='utf-8').read()
css=open(os.path.join(ROOT,'src/pwa.css'),encoding='utf-8').read()
# Texte, die in der App-Version anders lauten
REP=[
 ("return {c:'ok',t:'Gespeichert & synchronisiert'}","return {c:'ok',t:'Gespeichert auf dem iPhone'}"),
 ("if(!navigator.onLine)return {c:'wait',t:'Offline – wird gesendet, sobald Netz da ist'};",""),
 ("syncState('verbunden','on')","syncState('iPhone-Speicher','on')"),
 ("Bild-Lesen ist in dieser Ansicht nicht verfügbar. Öffne die Seite in der Claude-App bzw. auf claude.ai – oder trag die Werte unten selbst ein.","Das Auslesen von Screenshots gibt es nur in der Claude-Version. Trag die WHOOP-Werte unten einfach selbst ein."),
 ("Claude-Analyse ist in dieser Ansicht nicht verfügbar","Die Claude-Analyse gibt es nur in der Claude-Version"),
 ("toast('Für das Cockpit bereitgestellt')","toast('Auf dem iPhone bereitgestellt – ans Cockpit geht es nur aus der Claude-Version')"),
 ('<li><span><b>Auf dem Gerät:</b> Zusätzlich liegt immer eine Kopie im Gerätespeicher – auch offline.</span></li></ul>',
  '<li><span><b>Auf dem iPhone:</b> Alles liegt doppelt im Gerätespeicher – auch offline. Die letzten 60 Stände bleiben erhalten.</span></li><li><span><b>iCloud-Sicherung:</b> „Sicherung herunterladen“ → „In Dateien sichern“ → iCloud Drive. Die App erinnert dich, wenn die letzte Sicherung älter als 7 Tage ist.</span></li></ul><p class="note2" style="margin-top:8px">App-Version __VERSION__</p>'),
]
miss=[a[:50] for a,b in REP if a not in app]
if miss: sys.exit('Fehlende Textstellen: '+repr(miss))
for a,b in REP: app=app.replace(a,b)
ver=datetime.datetime.now(datetime.timezone.utc).strftime('%Y.%m.%d-%H%M')
hh=hashlib.sha1((app+shim+ui+css).encode())
for f in sorted(os.listdir(os.path.join(ROOT,'docs','icons'))): hh.update(open(os.path.join(ROOT,'docs','icons',f),'rb').read())
h=hh.hexdigest()[:7]
VERSION=f'{ver}-{h}'
try:
    old=json.load(open(os.path.join(ROOT,'docs','version.json')))['version']
    if old.endswith('-'+h): VERSION=old  # nichts geändert → keine neue Version
except Exception: pass
app=app.replace('__VERSION__',VERSION)
head=f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Candito">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1290x2796.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1179x2556.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1206x2622.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1320x2868.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1170x2532.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1284x2778.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="icons/splash-1125x2436.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="icons/splash-828x1792.jpg">
<link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="icons/splash-750x1334.jpg">
<link rel="icon" type="image/png" href="icons/favicon-64.png">
<style>{css}</style>
<script>window.CF_VERSION="{VERSION}";
{shim}</script>
</head>
<body>
'''
site=os.path.join(ROOT,'docs');os.makedirs(site,exist_ok=True)
# Große Skript-Blöcke als eigene Dateien an derselben Stelle einbinden (gleiche Reihenfolge, gleiches Verhalten).
# Vorteil: der HTML-Leser muss nicht über 1 MB Inline-Code scannen, und Safari kann das übersetzte Skript zwischenspeichern.
adir=os.path.join(site,'assets');shutil.rmtree(adir,ignore_errors=True);os.makedirs(adir)
ASSETS=[]
def ext(m):
    tag,attrs,body=m.group(1),m.group(2),m.group(3)
    # Styles bleiben eingebettet: das Farbthema „Midnight Blue“ färbt zur Laufzeit den Text des letzten <style> um
    if tag!='script' or len(body)<15000 or 'src=' in attrs: return m.group(0)
    n=len(ASSETS);name=f"assets/{'app' if tag=='script' else 'style'}-{n}.{h}.{'js' if tag=='script' else 'css'}"
    open(os.path.join(site,name),'w',encoding='utf-8').write(body);ASSETS.append(name)
    return f'<script src="{name}"></script>' if tag=='script' else f'<link rel="stylesheet" href="{name}"{attrs}>'
app=re.sub(r'<(script|style)([^>]*)>(.*?)</\1>',ext,app,flags=re.S)
out=head+app+'\n<script>\n'+ui+'\n</script>\n</body>\n</html>\n'
open(os.path.join(site,'index.html'),'w',encoding='utf-8').write(out)
open(os.path.join(site,'sw.js'),'w',encoding='utf-8').write(open(os.path.join(ROOT,'src/sw.js'),encoding='utf-8').read().replace('__VERSION__',VERSION).replace("'__ASSETS__'",','.join(json.dumps('./'+a) for a in ASSETS)))
shutil.copy(os.path.join(ROOT,'src/manifest.webmanifest'),os.path.join(site,'manifest.webmanifest'))
open(os.path.join(site,'version.json'),'w').write(json.dumps({'version':VERSION}))
open(os.path.join(site,'.nojekyll'),'w').write('')
print('PWA gebaut:',VERSION,len(out)//1024,'KB Seite +',len(ASSETS),'Dateien',sum(os.path.getsize(os.path.join(site,a)) for a in ASSETS)//1024,'KB')
