#!/usr/bin/env python3
"""CSS in source/src.html aufräumen – nur beweisbar wirkungslose Teile entfernen.
 1) Selektoren, deren Klassen/IDs nirgends im übrigen Code vorkommen (können nie greifen)
 2) Deklarationen, die eine spätere Regel mit identischem Selektor im selben @-Kontext
    mit gleicher oder höherer Wichtigkeit überschreibt (verlieren immer).
Aufruf: cssclean.py <src.html> [--write] [--report]
"""
import re, sys, json, os

def tokenize_blocks(css):
    """Parst CSS in Knoten: ('c',text) Kommentar, ('at',prelude,children|None,raw), ('r',selector,decls_text)."""
    i=0;n=len(css);out=[]
    def skip_ws(i):
        while i<n and css[i] in ' \t\r\n': i+=1
        return i
    while True:
        i=skip_ws(i)
        if i>=n: break
        if css.startswith('/*',i):
            j=css.find('*/',i+2);j=n if j<0 else j+2;out.append(('c',css[i:j]));i=j;continue
        if css[i]=='}':  # verirrte Klammer – unverändert behalten
            out.append(('raw','}'));i+=1;continue
        # Prelude bis { oder ; (auf oberster Ebene, Strings/Klammern beachten)
        j=i;depth=0;q=None
        while j<n:
            ch=css[j]
            if q:
                if ch=='\\': j+=2;continue
                if ch==q: q=None
            elif ch in '"\'': q=ch
            elif ch=='(': depth+=1
            elif ch==')': depth-=1
            elif depth==0 and ch in '{;': break
            elif css.startswith('/*',j):
                k=css.find('*/',j+2);j=n if k<0 else k+2;continue
            j+=1
        pre=css[i:j].strip()
        if j>=n: out.append(('raw',css[i:]));break
        if css[j]==';':  # @import / @charset
            out.append(('raw',css[i:j+1]));i=j+1;continue
        # Block bis passende }
        k=j+1;depth=1;q=None
        while k<n and depth:
            ch=css[k]
            if q:
                if ch=='\\': k+=2;continue
                if ch==q: q=None
            elif ch in '"\'': q=ch
            elif css.startswith('/*',k):
                e=css.find('*/',k+2);k=n if e<0 else e+2;continue
            elif ch=='{': depth+=1
            elif ch=='}': depth-=1
            k+=1
        body=css[j+1:k-1]
        if pre.startswith('@'):
            name=pre.split()[0].lower() if pre.split() else pre
            if name in ('@media','@supports','@container','@layer','@document'):
                out.append(('at',pre,tokenize_blocks(body),None))
            else:  # @keyframes, @font-face, @page … unverändert
                out.append(('raw',css[i:k]))
        else:
            out.append(('r',pre,body))
        i=k
    return out

def split_top(s,sep):
    parts=[];cur=[];depth=0;q=None;i=0
    while i<len(s):
        ch=s[i]
        if q:
            cur.append(ch)
            if ch=='\\' and i+1<len(s): cur.append(s[i+1]);i+=2;continue
            if ch==q: q=None
        elif ch in '"\'': q=ch;cur.append(ch)
        elif ch in '([': depth+=1;cur.append(ch)
        elif ch in ')]': depth-=1;cur.append(ch)
        elif ch==sep and depth==0: parts.append(''.join(cur));cur=[]
        elif s.startswith('/*',i):
            e=s.find('*/',i+2);e=len(s) if e<0 else e+2;cur.append(s[i:e]);i=e;continue
        else: cur.append(ch)
        i+=1
    parts.append(''.join(cur));return parts

def parse_decls(body):
    ds=[]
    for part in split_top(body,';'):
        p=re.sub(r'/\*.*?\*/','',part,flags=re.S).strip()
        if not p: continue
        if ':' not in p: ds.append({'raw':part.strip(),'prop':None});continue
        prop,val=p.split(':',1);prop=prop.strip().lower();val=val.strip()
        imp=bool(re.search(r'!\s*important\s*$',val,re.I))
        ds.append({'prop':prop,'val':val,'imp':imp,'raw':p})
    return ds

def norm_sel(sel):
    return re.sub(r'\s+',' ',re.sub(r'\s*([>+~,])\s*',r'\1',sel.strip()))

FALLBACK=re.compile(r'dvh|svh|lvh|color-mix|-webkit-|env\(|oklch|oklab|lab\(|lch\(|cqw|cqh|cqi|\bcq|:has|light-dark|round\(',re.I)
TOK=re.compile(r'(?<![\w-])([.#])(-?[_a-zA-Z][\w-]*)')
def sel_tokens(sel):
    # Pseudo-Funktionen wie :not(.x) zählen nicht (ein fehlendes .x im :not macht den Selektor nicht tot)
    s=re.sub(r':not\((?:[^()]|\([^()]*\))*\)','',sel)
    s=re.sub(r'\[[^\]]*\]','',s)            # Attribute ausklammern
    s=re.sub(r'url\([^)]*\)','',s)
    return [(a,b) for a,b in TOK.findall(s) if not re.fullmatch(r'\d.*',b)]

def build(nodes,ctx,rules):
    for nd in nodes:
        if nd[0]=='at': build(nd[2],ctx+(re.sub(r'\s+',' ',nd[1].lower()),),rules)
        elif nd[0]=='r': rules.append({'node':nd,'ctx':ctx,'sel':nd[1],'decls':parse_decls(nd[2])})

def main():
    path=sys.argv[1];write='--write' in sys.argv;report='--report' in sys.argv
    src=open(path,encoding='utf-8').read()
    blocks=list(re.finditer(r'(<style[^>]*>)(.*?)(</style>)',src,re.S))
    # Code ohne Style-Blöcke = Suchraum für lebende Klassen/IDs
    code=src
    for m in reversed(blocks): code=code[:m.start(2)]+code[m.end(2):]
    for extra in ('source/data.js','source/data_sq.js','src/pwa-ui.js','src/pwa-shim.js','build.py','src/pwa.css'):
        try: code+=open(extra,encoding='utf-8').read()
        except Exception: pass
    alive_cache={}
    def alive(kind,name):
        k=kind+name
        if k in alive_cache: return alive_cache[k]
        ok=re.search(r'(?<![\w-])'+re.escape(name)+r'(?![\w-])',code) is not None
        if not ok:
            # dynamisch zusammengesetzt? Präfix vor letztem '-' oder Ziffern direkt vor ${ / '+ / "+
            for pre in {re.sub(r'\d+$','',name), name.rsplit('-',1)[0]+'-' if '-' in name else None}:
                if pre and len(pre)>=3 and re.search(re.escape(pre)+r"(\$\{|'\s*\+|\"\s*\+|`\s*\+)",code): ok=True;break
        alive_cache[k]=ok;return ok
    trees=[tokenize_blocks(m.group(2)) for m in blocks]
    rules=[]
    for t in trees: build(t,(),rules)
    dead_sel=[];removed_decl=0;dead_rules=0
    # 1) tote Selektoren
    for r in rules:
        sels=split_top(r['sel'],',');keep=[]
        for s in sels:
            toks=sel_tokens(s)
            dead=[t for t in toks if not alive(*t)]
            if dead and os.environ.get('NOOP'): dead=[]
            if dead: dead_sel.append((s.strip()[:90],''.join(dead[0])))
            else: keep.append(s)
        r['keep']=keep
    # 2) überschriebene Deklarationen (identischer Selektor + Kontext, später gleiche/höhere Wichtigkeit)
    last={}  # (ctx,normsel,prop) -> list of (rule_idx,decl_idx,imp)
    for ri,r in enumerate(rules):
        if not r['keep'] or len(r['keep'])!=len(split_top(r['sel'],',')): continue  # nur unveränderte Selektorlisten
        key=(r['ctx'],norm_sel(r['sel']))
        for di,d in enumerate(r['decls']):
            if not d.get('prop') or d['prop'].startswith('--'): continue
            last.setdefault(key+(d['prop'],),[]).append((ri,di,d['imp']))
    kill=set()
    if os.environ.get('NOOP'): last={}
    # Kurzform/Langform: Langform-Deklaration wird nur entfernt, wenn exakt dieselbe Eigenschaft später kommt
    for k,lst in last.items():
        for a in range(len(lst)):
            ri,di,imp=lst[a]
            for b in range(a+1,len(lst)):
                rb,db,ib=lst[b]
                if not (ib or not imp): continue
                if rb==ri: continue                      # gleiche Regel: Rückfallwert-Muster, stehen lassen
                if FALLBACK.search(rules[rb]['decls'][db]['val']): continue  # neuere CSS-Funktion: Rückfall behalten
                kill.add((ri,di));break
    # Ausgabe zusammensetzen
    for ri,r in enumerate(rules):
        ds=[d for di,d in enumerate(r['decls']) if (ri,di) not in kill]
        removed_decl+=len(r['decls'])-len(ds)
        if not r['keep'] or not any(d.get('prop') or d.get('raw') for d in ds): r['out']=None;dead_rules+=1
        else: r['out']=(','.join(x.strip() for x in r['keep']),';'.join(d['raw'] for d in ds))
    it=iter(rules)
    def render(nodes):
        o=[]
        for nd in nodes:
            if nd[0]=='c': o.append(nd[1])
            elif nd[0]=='raw': o.append(nd[1])
            elif nd[0]=='at':
                inner=render(nd[2])
                if inner.strip(): o.append(nd[1]+'{'+inner+'}')
            else:
                r=next(it)
                if r['out']: o.append(r['out'][0]+'{'+r['out'][1]+'}')
        return '\n'.join(o)
    outs=[render(t) for t in trees]
    before=sum(len(m.group(2)) for m in blocks);after=sum(len(x) for x in outs)
    print(f'Regeln {len(rules)} · tote Selektoren {len(dead_sel)} · leere/entfernte Regeln {dead_rules} · überschriebene Deklarationen {removed_decl}')
    print(f'CSS {before//1024} KB → {after//1024} KB')
    if report:
        from collections import Counter
        c=Counter(t for _,t in dead_sel)
        print('tote Tokens (Top 60):',', '.join(f'{k}×{v}' for k,v in c.most_common(60)))
    if write:
        res=src
        for m,o in reversed(list(zip(blocks,outs))): res=res[:m.start(2)]+'\n'+o+'\n'+res[m.end(2):]
        open(path,'w',encoding='utf-8').write(res)
        print('geschrieben')

main()
