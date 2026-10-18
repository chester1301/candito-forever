import json,re
P=json.load(open('parsed.json'));P6=json.load(open('parsed6.json'));TR=json.load(open('tr.json'))
EXIST={'squat':'csq','deadlift':'cdl','bench press':'pbb','comp bench':'pbb','comp bench press':'pbb','comp bench press (regular pause duration)':'pbb','backoff squats':'csq','backoff bench':'pbb','close grip bench':'cgb','paused squat':'psq','comp squat':'csq','paused deadlift':'pdl','comp deadlift':'cdl','platz squat':'platz','feet up bench press':'fub','high bar squat':'hbs','snatch grip deadlift':'sgdl','close grip bench press':'cgb','leg extension':'lext','single arm cable curl':'sacc','lying hamstring curl':'lhc','seated hamstring curl':'shc','overhead cable tricep extension':'octe','incline bench press':'ibp','high bar constant tension squat':'hbct','stiff leg deadlift':'sldl','incline db bench':'idb','incline db bench press':'idb','barbell row':'row','machine row':'mrow','single leg extension':'slext'}
def T(x):
    if x is None: return None
    x=x.strip()
    return TR.get(x,x)
EX={}
def slug(s): return re.sub(r'[^a-z0-9]+','',s.lower())[:48]
def exid(name):
    base=re.split(r'\s+--\s+',re.sub(r'\s*\(optional\b[^)]*\)','',name.strip(),flags=re.I))[0].strip()
    base=re.sub(r'\s*\(optional\)\s*$','',base,flags=re.I)
    lb=base.lower().strip()
    if lb in EXIST: return EXIST[lb],None
    k='x'+slug(base)
    if k not in EX:
        ln=lb
        g='sq' if re.search(r'squat|platz|leg press|hack',ln) else 'bp' if re.search(r'bench|spoto|chest press|press-around|fly',ln) and not re.search(r'overhead|ohp',ln) else 'dl' if re.search(r'deadlift|sldl|rdl|good morning|back extension',ln) else 'acc'
        bb=bool(re.search(r'(comp|paused|pause|beltless|low bar|high bar|front|spoto|bench press|squat|deadlift|sldl|rdl|good morning|barbell)',ln)) and not re.search(r'(db|dumbbell|machine|cable|belt squat|split|hack|leg press|pendulum|platz|smith|goblet|incline db|chest press-around|lever)',ln)
        m=1 if bb and g in('sq','bp','dl') and not re.search(r'back extension|good morning',ln) else 0
        eq='bb' if bb else 'db' if re.search(r'\bdb\b|dumbbell',ln) else 'lat' if 'pulldown' in ln else 'rope' if re.search(r'tricep|pushdown|crunch',ln) and 'cable' in ln else 'cablec' if 'cable' in ln else 'mach'
        disp=T(base).replace('Sttanding','Standing').replace('Preferably Standing Cable','bevorzugt Standing Cable')
        if re.search(r'good morning|back extension',ln): g='dl';m=0
        if re.search(r'back extension|^optional|^one comp',ln): eq='mach'
        if 'high pin press' in ln: g,eq,m='bp','bb',1
        if 'crunch' in ln: eq='rope'
        EX[k]={'n':disp,'g':g,'m':m,'eq':eq,'t':''}
    return k,None
HY={'low':'l','moderate':'m','high':'h'}
WDN=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];WDS=['Mo','Di','Mi','Do','Fr','Sa','So']
GN={'sq':'Kniebeuge','bp':'Bank','dl':'Kreuzheben'}
def nfmt(x):
    s=('%g'%x);return s.replace('.',',')
def parse_rpe(t):
    o={}
    if not t: return o
    tl=t.lower()
    if 'failure' in tl: o.update(rpe=10.0,txt='bis zum Versagen');return o
    if re.search(r'find\s*\d*\s*rm',tl): o.update(rpe=10.0,txt=T(t));return o
    if 'no rpe' in tl or 'pre-determined' in tl or 'predetermined' in tl: o['txt']='Last vorgegeben – kein RPE';return o
    nums=[float(x) for x in re.findall(r'\d+(?:\.\d+)?',t)]
    if not nums: o['txt']=T(t);return o
    cap='cap' in tl
    if len(nums)>=2 and re.search(r'\d\s*-\s*\d',t): v=(nums[0]+nums[1])/2;rt=nfmt(nums[0])+'–'+nfmt(nums[1])
    else: v=nums[0];rt=nfmt(v)
    if cap: o.update(cap=v,txt='RPE-Cap '+rt);return o
    kind=' im Schnitt' if '(avg)' in tl else ' im letzten Satz' if '(ls)' in tl else ' in jedem Satz' if '(es)' in tl else ' im ersten Satz' if '(fs)' in tl else ''
    o.update(rpe=v,txt='@ RPE '+rt+kind)
    if '-' in rt or '–' in rt: o['rng']=rt
    return o
def reps_of(r):
    if r is None: return '?',None
    if re.fullmatch(r'\d+',r) or re.fullmatch(r'\d+-\d+',r): return r,None
    rl=r.lower()
    if rl.startswith('amrap'): return 'AMRAP',T(r)
    m=re.search(r'rpe\s*([\d.]+)',rl)
    if 'failure' in rl: return 'bis Versagen',T(r)
    if m and ('taken' in rl or 'to rpe' in rl): return 'bis RPE '+nfmt(float(m.group(1))),T(r)
    return 'siehe Hinweis',T(r)
def block_js(o):
    return json.dumps(o,ensure_ascii=False)
def conv_blocks_sheet(ver):
    weeks=ver['weeks'];Pw=[];INFO={};WEEKS=[]
    days0=weeks[0]['days']
    for wi,wk in enumerate(weeks):
        lab=T(wk['label']);wl=re.sub(r'^Woche \d+\s*[–-]*\s*','',lab).strip(' –-()') or 'Woche '+str(wi+1)
        if re.search(r'optional',wk['label'],re.I) and 'optional' not in wl.lower(): wl+=' (optional)'
        WEEKS.append(wl[:28])
        row=[]
        for di,dy in enumerate(wk['days']):
            bl=[];tips=[]
            for b in dy['blocks']:
                e,_=exid(b['name'])
                r,rtxt=reps_of(b['reps'])
                rp=parse_rpe(b['rpe'])
                o={'e':e,'s':b['sets'],'r':r}
                x=f"{b['sets']}×{r}"
                if rp.get('txt') and not r.startswith('bis '): x+=' '+rp['txt']
                if rtxt: x+=' – '+rtxt
                if 'rpe' in rp: o['rpe']=rp['rpe']
                if 'cap' in rp: o['cap']=rp['cap']
                h=HY.get((b['hype'] or '').strip().lower())
                if h: o['h']=h
                w=b.get('w')
                if w and w['t']=='src':
                    o['src']=w['src']
                    if abs(w['pct']-100)>1e-6: o['pct']=w['pct']
                elif w and w['t']=='ref':
                    o['ref']='SQ';o['pct']=w['pct']
                if w and w['t']=='ref': x+=f" · {nfmt(w['pct'])} % vom Kniebeuge-1RM"
                elif w and w['t']=='src':
                    sw,sd,sb=w['src']
                    if sw==wi and sd==di: x+=f" · {nfmt(w['pct'])} % von Übung {sb+1}"
                    elif w['pct']>100.0001: x+=f" · +{nfmt(round(w['pct']-100,3))} % zur Last aus W{sw+1}"
                    elif w['pct']<99.999: x+=f" · {nfmt(w['pct'])} % der Last aus W{sw+1}"
                    else: x+=f" · gleiche Last wie W{sw+1}"
                notes=[]
                nm0=re.sub(r'\s*\(optional\b[^)]*\)','',b['name'],flags=re.I)
                if nm0!=b['name']: notes.append('Optional – kann bei Zeitmangel entfallen.' if re.search(r'skip|short on time',b['name'],re.I) else 'Optional.')
                hint=re.split(r'\s+--\s+',nm0,maxsplit=1)
                if len(hint)>1:
                    tn=T(nm0);parts=re.split(r'\s+[–-]{1,2}\s+',tn,maxsplit=1);notes.append(parts[1] if len(parts)>1 else tn)
                if b.get('wtext') and not re.fullmatch(r'[\d.,\s]+',b['wtext']): notes.append('Last: '+T(b['wtext']))
                if b.get('note'): notes.append(T(b['note']))
                if notes: o['n']=' '.join(notes)
                if dy['opt'] or re.match(r'(optional|one compl|one compeltely)',b['name'],re.I) or re.search(r'\(optional',b['name'],re.I) or re.search(r'optional (volume boost|slot)|100% optional',(b.get('note') or '')+' '+b['name'],re.I): o['opt']=1
                if b.get('orNext'): o['orN']=1
                if b.get('nmf'): o['nmf']=1
                o['x']=x
                bl.append(o)
                if b.get('note'): tips.append(EX[e]['n'] if e in EX else e)
            if not bl:
                ex=' '.join(dy.get('extra',[])).lower()
                if any(re.match(r'\s*max out all 3',t,re.I) for t in dy.get('extra',[])):
                    for e0 in ('csq','pbb','cdl'): bl.append({'e':e0,'s':1,'r':'1','test1':1,'h':'h','x':'1×1 – Tages-1RM ermitteln (Max-Out)'})
            gs=[]
            for o in bl:
                g=EX[o['e']]['g'] if o['e'] in EX else EXG.get(o['e'],'acc')
                if g in GN and GN[g] not in gs and not o.get('opt'): gs.append(GN[g])
            f=('Optional · ' if dy['opt'] else '')+(' & '.join(gs[:3]) if gs else ('Bodybuilding' if bl else 'Ruhetag / optional'))
            if bl and all(o.get('test1') for o in bl): f='Max-Out · alle 3 Lifts'
            info=[T(t) for t in dy.get('extra',[]) if len(t)>25 and t.lower()!="coach's notes"]
            if info: INFO[f'{wi}-{di}']=info
            row.append({'f':f,'d':T(dy['name']),'b':bl})
        Pw.append(row)
    for w_,wk_ in enumerate(Pw):
        for d_,dy_ in enumerate(wk_):
            for o in dy_['b']:
                if 'src' in o:
                    sw,sd,sb=o['src']
                    try: te=Pw[sw][sd]['b'][sb]['e']
                    except Exception: te=None
                    if te!=o['e'] and o.get('nmf') and sw==w_ and sd==d_:
                        o['e']=te;o['n']='(In der Tabelle steht hier per Formel ein falscher Übungsname – Sätze, Wdh. und Last gehören zu dieser Übung.)'
                    elif te!=o['e']:
                        o.pop('src');o.pop('pct',None);o['x']=re.sub(r' · (\+?[\d,]+ %|gleiche Last).*$','',o['x'])
                        o['n']=(o.get('n','')+' ' if o.get('n') else '')+'(In der Tabelle verweist die Last hier versehentlich auf eine andere Übung – Last nach RPE wählen.)'
    for wk_ in Pw:
        for dy_ in wk_:
            B=dy_['b']
            for j,o in enumerate(B):
                o.pop('nmf',None)
                if o.pop('orN',None) and j+1<len(B):
                    a_,b_=exname(o['e']),exname(B[j+1]['e'])
                    o['n']=(o.get('n','')+' ' if o.get('n') else '')+f'Entweder diese Übung ODER {b_} (laut Tabelle Alternative).'
                    B[j+1]['opt']=1;B[j+1]['n']=(B[j+1].get('n','')+' ' if B[j+1].get('n') else '')+f'Alternative zu {a_} – nur eine von beiden machen.'
    DAYS=[];ORIG=[]
    for i,dy in enumerate(days0):
        wd=dy['wd'] if dy['wd'] is not None else i
        tag='Optional' if dy['opt'] else f'Tag {sum(1 for x in days0[:i+1] if not x["opt"])}'
        DAYS.append({'tag':tag,'wd':WDS[wd],'wdl':WDN[wd],'off':wd,**({'opt':1} if dy['opt'] else {})});ORIG.append(WDN[wd])
    return Pw,WEEKS,DAYS,ORIG,INFO
EXG={'pbb':'bp','psq':'sq','csq':'sq','pdl':'dl','cdl':'dl','platz':'sq','fub':'bp','hbs':'sq','sgdl':'dl','cgb':'bp','lext':'acc','sacc':'acc','lhc':'acc','shc':'acc','octe':'acc','ibp':'bp','hbct':'sq','sldl':'dl','idb':'bp','row':'acc','mrow':'acc','slext':'acc'}
EXN={'psq':'Paused Squat','csq':'Comp Squat','pdl':'Paused Deadlift','cdl':'Comp Deadlift','platz':'Platz Squat','fub':'Feet Up Bench Press','hbs':'High Bar Squat','sgdl':'Snatch Grip Deadlift','cgb':'Close Grip Bench Press','lext':'Leg Extension','sacc':'Single Arm Cable Curl','lhc':'Lying Hamstring Curl','shc':'Seated Hamstring Curl','octe':'Overhead Cable Tricep Extension','ibp':'Incline Bench Press','hbct':'High Bar Constant Tension Squat','sldl':'Stiff Leg Deadlift','idb':'Incline DB Bench Press','row':'Barbell Row','mrow':'Machine Row','slext':'Single Leg Extension'}
def exname(e): return EX[e]['n'] if e in EX else EXN.get(e,e)
# ---------- 6 Week ----------
def conv6():
    Pw=[];INFO={};WEEKS=[]
    for wi,wk in enumerate(P6['weeks']):
        WEEKS.append(re.sub(r'^Woche \d+\s*[–-]\s*','',T(wk['title'])))
        row=[]
        for di,dy in enumerate(wk['days']):
            bl=[]
            for b in dy['blocks']:
                e,_=exid(b['name'])
                name=b['name'];opt=name.lower().startswith('optional')
                # sets -> keys
                sets=[];prev={}
                for s in b['sets']:
                    w=s['w'];reps=s['reps']
                    if w and w['t']=='eq':
                        k=prev.get(w['cell'][0]);key=k
                    elif w and w['t']=='ref': key=('ref',w['ref'],w['pct'],w['add'])
                    elif w and w['t']=='rel':
                        pk=prev.get(w['cell'][0])
                        key=('rel',round(w['f']*(pk[1] if pk and pk[0]=='rel' else 1),5))
                    elif w and w['t']=='text': key=('text',w['v'])
                    else: key=None
                    col='CDEFGHIJKL'[s['col']-3]
                    prev[col]=key
                    if key and key[0]=='text' and key[1].lower().startswith('see below'): continue
                    sets.append((key,(reps or '').strip()))
                # group
                groups=[]
                for key,reps in sets:
                    if groups and groups[-1][0]==key and groups[-1][1]==reps: groups[-1][2]+=1
                    else: groups.append([key,reps,1])
                for gi,(key,reps,n) in enumerate(groups):
                    o={'e':e,'s':n}
                    rl=reps.lower();note=[]
                    m=re.match(r'(\d+) sets x (\d+) reps',rl)
                    if m: o['s']=int(m.group(1));o['r']=m.group(2);note.append(T(reps))
                    elif key and key[0]=='text' and 'find 1 rm' in key[1].lower(): o['r']='1';o['test1']=1;o['s']=1;reps='Tages-1RM ermitteln'
                    else:
                        m=re.match(r'^x?\s*(\d+(?:-\d+)?)(.*)$',reps,re.I)
                        if m and reps[:1].lower() in 'x0123456789' and not re.match(r'\d+\s+(sets?|reps?)\b',rl):
                            o['r']=m.group(1);rest=m.group(2)
                            mr=re.search(r'at rpe ([\d.]+)(?:-([\d.]+))?',rest,re.I)
                            if mr:
                                a=float(mr.group(1));bb=float(mr.group(2)) if mr.group(2) else None
                                o['rpe']=(a+bb)/2 if bb else a;o['rt']=nfmt(a)+('–'+nfmt(bb) if bb else '')
                            elif rest.strip(' -'): note.append(T(reps))
                        else:
                            ms=re.match(r'(\d+) sets? ',rl)
                            if ms: o['s']=int(ms.group(1))
                            mr=re.search(r'rpe ([\d.]+)',rl)
                            if 'rep added' in rl: o['r']='Vorwoche +1'
                            elif 'failure' in rl: o['r']='bis Versagen';o['rpe']=10.0
                            elif mr: o['r']='bis RPE '+nfmt(float(mr.group(1)));o['rpe']=float(mr.group(1))
                            else: o['r']=reps or '?'
                            note.append(T(reps))
                    if key and key[0]=='ref':
                        o['ref']=key[1];o['pct']=key[2]
                        if key[3]: o['add']=key[3]
                    elif key and key[0]=='rel':
                        o['ref']='TOP';o['back']=gi;o['pct']=round(key[1]*100,2);o['n']=f"{nfmt(o['pct'])} % vom ersten Satz (Top-Satz nach RPE)"
                    rpart=(' @ RPE '+o['rt']+' in jedem Satz') if o.get('rt') else ''
                    pct=f" · {nfmt(o['pct'])} % vom {dict(SQ='Kniebeuge',BP='Bank',DL='Kreuzheben')[o['ref']]}-1RM"+((f" + {nfmt(o['add'])} kg" if o['add']>0 else f" − {nfmt(-o['add'])} kg") if o.get('add') else '') if o.get('ref') in ('SQ','BP','DL') else ''
                    o['x']=f"{o['s']}×{o['r']}{rpart}{pct}"+(f" – {note[0]}" if note and not o.get('test1') else (' – Tages-1RM ermitteln' if o.get('test1') else ''))
                    if gi>0 and o.get('ref') in ('SQ','BP','DL') and groups[0][0] and groups[0][0][0]=='ref': o['n']='Backoff-Sätze'
                    if name.lower().startswith('backoff'): o['n']='Backoff-Sätze – volle Pause zwischen den Sätzen'
                    if opt: o['opt']=1
                    o.pop('rt',None)
                    bl.append(o)
            gs=[]
            for o in bl:
                g=EX[o['e']]['g'] if o['e'] in EX else EXG.get(o['e'],'acc')
                if g in GN and GN[g] not in gs: gs.append(GN[g])
            info=[T(t) for t in dy['notes']]
            if di==len(wk['days'])-1: info+= [T(t) for t in wk['notes']]
            if info: INFO[f'{wi}-{di}']=info
            row.append({'f':' & '.join(gs) or 'Bodybuilding','d':'','b':bl})
        Pw.append(row)
    offs=[0,1,3,4,5]
    DAYS=[{'tag':f'Tag {i+1}','wd':WDS[o],'wdl':WDN[o],'off':o} for i,o in enumerate(offs)]
    return Pw,WEEKS,DAYS,[WDN[o] for o in offs],INFO
OUT={}
VERS={'pv':['V1 · Hauptversion (4 Tage + optionaler BB-Tag)','V2 · 3× pro Woche Ganzkörper','V3 · 5× Bank pro Woche'],
 'rm5':['V1 · Hauptversion (3× Kniebeuge pro Woche)','V2 · 2× Kniebeuge pro Woche','V3 · 3× pro Woche (minimal)','V4 · 5× Bank pro Woche'],
 'rm20':['Zyklus 1'],'pk8':['V1 · Hauptversion – 3× Kniebeuge','V2 · 2× Kniebeuge','V3 · 3× Ganzkörper','V4 · 6× Bank']}
TEST={'pv':None,'rm5':3,'rm20':3,'pk8':7}
for fam,vs in P.items():
    for i,v in enumerate(vs):
        Pw,WEEKS,DAYS,ORIG,INFO=conv_blocks_sheet(v)
        tw=TEST[fam] if TEST[fam] is not None else len(Pw)-1
        td=0
        if fam=='rm5' or fam=='pk8':
            # Testtag = Tag mit Kniebeuge-Test (erster Tag der Testwoche)
            td=0
        if fam=='pv': td=max(i for i,d in enumerate(DAYS) if not d.get('opt'))
        key=v.get('key',[])
        OUT[f'sq{fam}{i+1}']={'fam':fam,'v':VERS[fam][i],'P':Pw,'WEEKS':WEEKS,'DAYS':DAYS,'ORIG':ORIG,'INFO':INFO,'test':[tw,td],'key':[[k[0],T(k[1]) if k[1] else None] for k in key if k[0] or k[1]]}
def testloc(Pw,tw):
    tl={}
    for g,e in (('sq','csq'),('bp','pbb'),('dl','cdl')):
        best=None
        for d,dy in enumerate(Pw[tw]):
            for b,o in enumerate(dy['b']):
                if o['e']!=e: continue
                sc=(2 if o.get('test1') else 1 if (o.get('r') or '').isdigit() else 0, min(o.get('rpe') or 0,10))
                if best is None or sc>best[0]: best=(sc,[tw,d])
        if best: tl[g]=best[1]
    return tl
for k_,v_ in OUT.items():
    if v_['fam']=='rm20': v_['test']=[3,2]
    v_['tl']=testloc(v_['P'],v_['test'][0])
    if v_['fam']=='rm5' and 'sq' in v_['tl']: v_['test']=[3,v_['tl']['sq'][1]]
    if v_['fam']=='pk8':
        md=next((d for d,dy in enumerate(v_['P'][7]) if dy['b'] and all(o.get('test1') for o in dy['b'])),None)
        if md is not None: v_['test']=[7,md]
Pw,WEEKS,DAYS,ORIG,INFO=conv6()
OUT['sqw61']={'fam':'w6','v':'Version 2 (2025)','P':Pw,'WEEKS':WEEKS,'DAYS':DAYS,'ORIG':ORIG,'INFO':INFO,'test':[5,3],'key':[],'pct':1};OUT['sqw61']['tl']=testloc(Pw,5)
inp=[T(t) for t in P6['inputs']['info'] if t]
js='/* ===================== Side Quests (aus Canditos Excel-Tabellen generiert) ===================== */\n'
js+='Object.assign(EX,'+json.dumps(EX,ensure_ascii=False)+');\n'
js+='const SQV='+json.dumps(OUT,ensure_ascii=False)+';\n'
js+='const SQ6INFO='+json.dumps(inp,ensure_ascii=False)+';\n'
open('data_sq.js','w').write(js)
print(len(js),len(EX),list(OUT))
for k,v in OUT.items(): print(k,len(v['P']),len(v['DAYS']),sum(len(d['b']) for w in v['P'] for d in w))
