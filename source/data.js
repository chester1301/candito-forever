/* ===================== Programm-Daten ===================== */
const EX={
 psq:{n:'Paused Squat',g:'sq',m:1,t:'Gleiche Stangenposition und Standbreite wie bei deiner Wettkampf-Kniebeuge. Gürtel und Kniebandagen wie gewohnt.'},
 csq:{n:'Comp Squat',g:'sq',m:1,t:'Deine Wettkampf-Technik – die Ausführung, mit der du das meiste Gewicht bewegst.'},
 pdl:{n:'Paused Deadlift',g:'dl',m:1,t:'Pause kurz nach dem Lösen vom Boden. Gleicher Stil wie dein Wettkampf-Kreuzheben.'},
 cdl:{n:'Comp Deadlift',g:'dl',m:1,t:'Konventionell bleibt den ganzen Zyklus konventionell, Sumo bleibt Sumo. Ein Stilwechsel nur zwischen Zyklen, nie mittendrin.'},
 platz:{n:'Platz Squat',g:'sq',m:1,t:'Alternativ Belt Squat, Leg Press oder Pendulum Squat – dann aber den ganzen Monat bei dieser Übung bleiben.'},
 pb3:{n:'3 Sec Pause Bench',g:'bp',m:1,t:'3 echte Sekunden Pause auf der Brust, nicht nur bis 3 zählen. Metronom hilft; Aufwärmsätze filmen, damit es nicht nur 2–2,5 s sind. Comp-Griff, normales Tempo. Die Stange darf etwa 20 % tiefer einsinken als beim Comp-Bench.'},
 pbb:{n:'Paused Bench Press',g:'bp',m:1,t:'Wettkampf-Bankdrücken mit Pause auf der Brust.'},
 fub:{n:'Feet Up Bench Press',g:'bp',m:1,t:'Nur für Weitgriff-Drücker (Mittelfinger auf/außerhalb der Ringe). Gleiche Griffbreite wie Comp-Bench, ALLE Wiederholungen pausieren. Füße auf der Bank – das kippt das Becken, reduziert den Bogen und verlängert die ROM.'},
 cte:{n:'Cable Tricep Extension',g:'acc',m:0,t:'Ein Inkrement = kleinste Laststufe an deinem Gerät.'},
 dbf:{n:'Cable Chest Press-Around',g:'acc',m:0,t:'Hervorragend für die Brustaktivierung: gleichzeitig nach vorn und leicht quer vor den Körper drücken, unten eine tiefe Dehnung holen. Am wichtigsten: Mit der freien Hand stabil festhalten. Kannst du dich nicht stabilisieren, stattdessen Maschinen-Butterfly.'},
 hbs:{n:'High Bar Squat',g:'sq',m:1,t:'Lange Pausen: 8–10+ Minuten zwischen den Sätzen. Ein sauberes RPE-6-3×7 mit langen Pausen ist etwas völlig anderes als ein gehetztes mit 2–5 Minuten.'},
 sgdl:{n:'Snatch Grip Deadlift',g:'dl',m:1,t:'Konventioneller Stand, immer mit Zughilfen. Ab ca. 1,70 m Griff knapp außerhalb der Ringe, kleiner etwas enger (Ringe am Zeige-/Mittelfinger). Deutlich breiter als dein Kreuzheben-Griff.'},
 bss:{n:'DB Bulgarian Split Squat',g:'acc',m:0,eq:'db',t:'Glute-Bias: leicht nach vorn geneigt, Fokus auf das vordere Gesäß. In der 10RM-Phase Canditos Alternative zur Single Leg Press (Glute-Bias) – so in Canditos App gewählt.'},
 slp:{n:'Single Leg Press (Glute-Bias)',g:'acc',m:0,eq:'mach',t:'Canditos Vorgabe in der 10RM-Phase – nur für konventionelle Kreuzheber (Sumo-Zieher machen stattdessen Hip Abduction/Adduction). Fuß hoch auf der Plattform für den Glute-Bias. Ohne Beinpresse: DB Bulgarian Split Squat (Canditos Alternative).'},
 lp:{n:'Leg Press',g:'acc',m:0,eq:'mach',t:'Canditos Vorgabe in der 10RM-Phase. Der Slot soll ohne Achsenlast auf der Wirbelsäule bleiben: Belt Squat ist laut Candito eine Alternative, Hack Squat nicht; Bulgarian Split Squats sind okay.'},
 ecc:{n:'3 Sec Eccentric Bench',g:'bp',m:1,t:'Comp-Griff. 3 echte Sekunden ablassen, kurz auf der Brust pausieren (nicht zu lang – die Exzentrik fühlt sich schon lang an), dann mit voller Geschwindigkeit hoch. Gute Übung, um den Bogen zu maximieren.'},
 row:{n:'Barbell Row (Untergriff)',g:'acc',m:0,eq:'bb',t:'Den ersten Satz wie einen Top-Satz einer Langhantelübung behandeln. Canditos Alternative zur Machine Row – so in Canditos App gewählt.'},
 lat:{n:'Lat Pulldown (Untergriff)',g:'acc',m:0,t:'Last bei Bedarf von Satz zu Satz anpassen.'},
 idc:{n:'Incline Dumbbell Curl',g:'acc',m:0,t:'Betont die Dehnung besser als ein normaler Curl – Stretch-Hypertrophie.'},
 ndb:{n:'Neutral Grip DB Bench',g:'bp',m:0,t:'Pivot-Übung: Abwechslung bei moderatem Volumen.'},
 dfr:{n:'DB Front Delt Raise',g:'acc',m:0,t:'Kontrolliert, ohne Schwung.'},
 wlat:{n:'Wide Grip Lat Pulldown',g:'acc',m:0,t:'Obergriff, weit.'},
 ilat:{n:'Iliac Lat Pulldown',g:'acc',m:0,t:'Wenige, sehr harte Sätze im höheren Wdh-Bereich – sonst wird RPE leicht unterschätzt und es entsteht Junk Volume.'},
 pcurl:{n:'DB Preacher Curl (Schrägbank)',g:'acc',m:0,t:'Arme außenrotiert, Ellbogen leicht vor dem Körper. Betont den unteren Teil der Kraftkurve.'}
};
const B=(e,s,r,x,o={})=>Object.assign({e,s,r,x},o);
let DAYS=[{tag:'Tag 1',wd:'Sa',wdl:'Samstag',off:0},{tag:'Tag 2',wd:'So',wdl:'Sonntag',off:1},{tag:'Tag 3',wd:'Di',wdl:'Dienstag',off:3},{tag:'Tag 4',wd:'Do',wdl:'Donnerstag',off:5}];
let WEEKS=['Einstieg','80–85 %','Harter Block','Testwoche'];
let P=[
 [ // W1
  {f:'Beine',d:'Bei geraden Sätzen das RPE des letzten Satzes notieren. Start mit aktuellen Variations-Maxima (Paused Squat, Paused Deadlift, 3 s Pause Bench an Tag 2) – submaximal, aber aussagekräftig. Diese Singles sind die Referenz für alle %-Vorgaben des Zyklus.',b:[
   B('psq',1,'1','1 Single mit 2,5–5 kg Reserve',{h:'h',test:'SQ',rpe:9,rpeEst:1}),
   B('csq',3,'8','3×8 mit 75 % des Paused Singles – RPE des letzten Satzes notieren',{h:'m',pct:75,ref:'SQ'}),
   B('pdl',1,'1','1 Single mit 2,5–5 kg Reserve',{h:'h',test:'DL',rpe:9,rpeEst:1}),
   B('cdl',2,'8','2×8 mit 72,5 % des Paused-Deadlift-Singles',{h:'m',pct:72.5,ref:'DL'}),
   B('platz',1,'11','1×11 @ RPE 6,5',{h:'l',rpe:6.5}),
   B('platz',1,'11','1×11 mit 96 % der Top-Satz-Last',{pct:96,ref:'TOP'})]},
  {f:'Brust',d:'Entweder Feet-Up Bench (Weitgriff) ODER Close-Grip Bench – nicht beides. Cable Chest Press-Around nur mit stabilem Halt für die freie Hand – sonst Maschinen-Butterfly.',b:[
   B('pb3',1,'1','1 Single mit 2,5 kg Reserve – ein unbeabsichtigter Grinder ist okay',{h:'h',test:'BP',rpe:9,rpeEst:1}),
   B('pbb',1,'9','1×9 @ RPE 8,5',{h:'h',rpe:8.5}),
   B('pbb',2,'9','2×9 @ RPE 7 im letzten Satz – gleiche Last in beiden Sätzen',{h:'m',rpe:7}),
   B('fub',3,'8','3×8 @ RPE 5 im ersten Satz',{h:'m',rpe:5}),
   B('cte',3,'8','3×8 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('dbf',3,'13','Optional: 3×13 @ RPE 7 im letzten Satz',{h:'m',rpe:7,opt:1})]},
  {f:'Beine',d:'Bewusst kurzes Workout. Trotz niedriger RPEs viel Pause zwischen den Sätzen (8–10+ min) für hohe Qualität. Wer High Bar schon als Comp-Squat beugt: High Bar Constant Tension Squat.',b:[
   B('hbs',3,'7','3×7 @ RPE 6 im ersten Satz – gleiche Last für alle 3 Sätze',{h:'m',rpe:6}),
   B('pdl',3,'4','3×4 @ RPE 5 im 3. Satz – gleiche Last für alle Sätze',{h:'l',rpe:5}),
   B('sgdl',2,'7','2×7 @ RPE 5 im ersten Satz',{h:'m',rpe:5}),
   B('bss',3,'11','3×11 @ RPE 7 im 3. Satz',{h:'m',rpe:7}),
   B('ecc',4,'3','4×3 @ RPE 6 im Schnitt',{h:'m',rpe:6})]},
  {f:'Brust · Rücken · Arme',d:'Zweiter 12er-Satz Feet-Up: gleiche Last, wenn der erste bei RPE 7 oder leichter lief. Bei RPE 7,5 oder härter → 5 kg weniger.',b:[
   B('pbb',4,'5','4×5 mit 80 % des 3 s Pause Singles aus W1',{h:'m',pct:80,ref:'BP'}),
   B('fub',1,'12','1×12 mit der Last aus Tag 2 (3×8)',{h:'h',same:1}),
   B('fub',1,'12','1×12 mit gleicher Last ODER 5 kg weniger (siehe Hinweis)',{ref:'TOP',pct:100}),
   B('row',1,'6','1×6 @ RPE 7 – wie einen Top-Satz behandeln',{h:'h',rpe:7}),
   B('row',4,'6','4×6 @ RPE 7 im letzten Satz – gleiche Last für alle Sätze',{h:'m',rpe:7}),
   B('lat',3,'12','3×12 @ RPE 7,5 in jedem Satz – Last bei Bedarf anpassen',{rpe:7.5}),
   B('idc',3,'AMRAP','3× AMRAP bis RPE 8 – Gewicht für mind. 12 Wdh im ersten Satz, Last halten',{rpe:8})]}
 ],
 [ // W2
  {f:'Beine',d:'Jetzt der 80–85 %-Bereich – hier wird Kraft aufgebaut. Das 3×3 Kreuzheben ist Technikpraxis unter moderater Last; der 1×8 ist der eigentliche Fokus.',b:[
   B('csq',1,'1','1 Single mit 95 % des Paused Singles aus W1',{h:'m',pct:95,ref:'SQ'}),
   B('csq',1,'6','1×6 mit 85 % des Paused Singles aus W1',{h:'h',pct:85,ref:'SQ'}),
   B('csq',2,'6','2×6 mit 80 % des Paused Singles aus W1',{h:'m',pct:80,ref:'SQ'}),
   B('cdl',3,'3','3×3 mit 82,5 % des Paused-Deadlift-Singles aus W1',{h:'l',pct:82.5,ref:'DL'}),
   B('cdl',1,'8','1×8 mit 80 % des Paused-Deadlift-Singles aus W1',{h:'h',pct:80,ref:'DL'}),
   B('platz',1,'11','1×11 @ RPE 7',{h:'m',rpe:7}),
   B('platz',1,'11','1×11 mit 96 % der Top-Satz-Last',{pct:96,ref:'TOP'})]},
  {f:'Brust',d:'Trizeps: ein Inkrement (kleinste Stufe) mehr als letzte Woche, RPE-8-Deckel. Wird es härter als RPE 8, zurück auf die Vorwochenlast.',b:[
   B('pbb',1,'1','1 Single mit 95 % des 3 s Pause Singles aus W1',{h:'h',pct:95,ref:'BP'}),
   B('pbb',1,'7','1×7 @ RPE 8,5',{h:'h',rpe:8.5}),
   B('pbb',2,'7','2×7 @ RPE 7 im 2. Satz',{h:'m',rpe:7}),
   B('fub',3,'8','3×8 @ RPE 6 im ersten Satz',{h:'m',rpe:6}),
   B('dbf',1,'14','Optional: 1×14 mit der Last aus dem 3×13 der Vorwoche',{h:'m',same:1,opt:1}),
   B('dbf',1,'AMRAP','Optional: 1× AMRAP bis RPE 9, gleiche Last – Ziel 17+ Wdh',{h:'h',rpe:9,opt:1,ref:'TOP',pct:100}),
   B('cte',3,'8','3×8 mit einem Inkrement mehr als letzte Woche, RPE-8-Deckel',{rpe:8,same:1})]},
  {f:'Beine',d:'Lange Pausen beim 3×9 High Bar – die härteste Einheit dieser Variante im Zyklus. Nächste Woche geht die Last hoch, die Wiederholungen runter.',b:[
   B('hbs',3,'9','3×9 mit der Last der Vorwoche',{h:'h',same:1}),
   B('pdl',3,'4','3×4 @ RPE 6 im 3. Satz',{h:'l',rpe:6}),
   B('sgdl',2,'7','2×7 @ RPE 6,5 im Schnitt',{h:'m',rpe:6.5}),
   B('bss',3,'13','3×13 mit der Last der Vorwoche, RPE-8-Deckel',{h:'h',rpe:8,same:1}),
   B('ecc',4,'3','4×3 @ RPE 7,5 im letzten Satz',{h:'m',rpe:7.5})]},
  {f:'Brust · Arme · Rücken',d:'Top-Satz Bankdrücken: wähle 87,5 % oder 90 % – je nachdem, was näher an RPE 7 liegt. Back-offs 5 % leichter.',b:[
   B('pbb',1,'5','1×5 mit 87,5 % ODER 90 % des 3 s Pause Singles – was näher an RPE 7 liegt',{h:'h',pct:[87.5,90],ref:'BP'}),
   B('pbb',4,'5','4×5 mit 5 % weniger als der Top-Satz (82,5 % bzw. 85 %)',{h:'m',pct:95,ref:'TOP'}),
   B('fub',1,'10','1×10 @ RPE 7,5',{h:'h',rpe:7.5}),
   B('fub',1,'10','1×10 @ RPE 7',{h:'l',rpe:7}),
   B('row',1,'6','1×6 @ RPE 7,5',{h:'h',rpe:7.5}),
   B('row',4,'6','4×6 @ RPE 7,5 im Schnitt',{h:'m',rpe:7.5}),
   B('lat',3,'10','3×10 @ RPE 7,5 in jedem Satz – Last bei Bedarf anpassen',{rpe:7.5}),
   B('idc',3,'AMRAP','3× AMRAP bis RPE 8 mit +2,5 kg pro Kurzhantel ggü. Vorwoche',{h:'h',rpe:8,same:1})]}
 ],
 [ // W3
  {f:'Beine',d:'Letzter harter Tag der Intro-Phase: moderates Volumen bei relativ hoher Intensität. Ab der nächsten Einheit sinkt das Volumen. Stark beenden!',b:[
   B('csq',1,'1','1 Single mit 100 % des Paused Squats aus W1',{pct:100,ref:'SQ'}),
   B('csq',1,'4','1×4 mit 90 % – High Hype, Ziel: RPE 7,5 oder weniger',{h:'h',pct:90,ref:'SQ',rpe:7.5}),
   B('csq',3,'4','3×4 mit 85 % des Paused Singles aus W1',{h:'m',pct:85,ref:'SQ'}),
   B('cdl',1,'5','1×5 mit 90 % des Paused-Deadlift-Singles aus W1',{h:'h',pct:90,ref:'DL'}),
   B('cdl',1,'5','1×5 mit 85 % des Paused-Deadlift-Singles aus W1',{h:'m',pct:85,ref:'DL'}),
   B('platz',1,'9','1×9 @ RPE 7',{h:'m',rpe:7}),
   B('platz',1,'11','1×11 @ RPE 8 – die Progression stark beenden',{h:'h',rpe:8})]},
  {f:'Brust',d:'Cable Chest Press-Around: unter 18 Wdh beim AMRAP der Vorwoche → 3×9, bei 18+ → 3×13. In jedem Fall die schwerste Last des Zyklus.',b:[
   B('pbb',1,'1','1 Single mit 100 % des 3 s Pause Singles aus W1',{h:'h',pct:100,ref:'BP'}),
   B('pbb',1,'6','1×6 @ RPE 8,5',{h:'h',rpe:8.5}),
   B('pbb',2,'6','2×6 @ RPE 7 im 2. Satz',{h:'m',rpe:7}),
   B('fub',3,'5','3×5 mit einem Gewicht für ein konservatives 10RM',{h:'l'}),
   B('cte',2,'8','2×8 @ RPE 8,5 im Schnitt',{h:'h',rpe:8.5}),
   B('dbf',3,'9/13','Optional: 3×9 ODER 3×13 @ RPE 6,5 im Schnitt (siehe Hinweis)',{h:'m',rpe:6.5,opt:1})]},
  {f:'Beine',d:'Der Eccentric-Triple wird ein Variations-PR für die Zukunft – streng ausführen, als unbestreitbare Basis. Leichter Volumen-Taper, aber kein Intensitäts-Taper.',b:[
   B('hbs',1,'7','1×7 @ RPE 8',{h:'h',rpe:8}),
   B('hbs',1,'7','1×7 mit 96 % der Top-Satz-Last',{h:'l',pct:96,ref:'TOP'}),
   B('pdl',3,'2','3×2 @ RPE 6 im Schnitt',{h:'l',rpe:6}),
   B('sgdl',1,'7','1×7 @ RPE 7,5',{h:'h',rpe:7.5}),
   B('bss',2,'11','2×11 @ RPE 7 im Schnitt – deutlich schwerer als in W1',{h:'m',rpe:7}),
   B('ecc',1,'3','1×3 @ RPE 8,5 – Variations-PR',{h:'h',rpe:8.5}),
   B('ecc',1,'3','1×3 @ RPE 8',{h:'l',rpe:8})]},
  {f:'Brust · Arme · Rücken',d:'Bankdrücken von 5×5 auf 6×3: weniger Wiederholungen, aber 6 Sätze halten den Trainingseffekt. Kreuzheben peakt zuerst, dann Kniebeuge, Bank zuletzt.',b:[
   B('pbb',1,'3','1×3 mit 90 % ODER 92,5 % – was näher an RPE 7,5 liegt',{h:'h',pct:[90,92.5],ref:'BP'}),
   B('pbb',5,'3','5×3 mit 87,5 % des 3 s Pause Singles aus W1',{h:'m',pct:87.5,ref:'BP'}),
   B('fub',1,'10','1×10 mit der Last aus Tag 2 (3×5)',{h:'h',same:1}),
   B('row',1,'6','1×6 @ RPE 8,5',{h:'h',rpe:8.5}),
   B('row',4,'6','4×6 @ RPE 8 im letzten Satz',{h:'m',rpe:8}),
   B('lat',3,'8','3×8 @ RPE 8 in jedem Satz',{h:'h',rpe:8}),
   B('idc',3,'6-8','3×6–8 @ RPE 8 in jedem Satz – schwerste Last des Zyklus',{rpe:8})]}
 ],
 [ // W4
  {f:'Beine',d:'Lockerer Taper-Tag für den Unterkörper. Optional Bauch oder leichtes Cardio – nichts, was Kniebeuge- oder Kreuzheben-Muskulatur belastet. Bereit machen für die AMRAPs!',b:[
   B('csq',3,'3','3×3 mit 90 % des Paused Singles aus W1',{h:'m',pct:90,ref:'SQ'}),
   B('cdl',3,'2','3×2 @ RPE 6 im Schnitt – keine %-Vorgabe',{h:'l',rpe:6})]},
  {f:'Brust',d:'Lockerer Tag zur Vorbereitung auf den Test. Optional Bizeps, hintere Schulter oder Unterarme – nichts für Brust, Trizeps oder vordere Schulter.',b:[
   B('pbb',3,'1','3×1 @ RPE 6 im Schnitt',{h:'m',rpe:6}),
   B('pbb',1,'4','1×4 @ RPE 6,5',{h:'l',rpe:6.5}),
   B('pbb',2,'4','2×4 mit 5 kg weniger als der Top-Satz',{h:'l',ref:'TOP',minus:5})]},
  {f:'Ganzkörper · AMRAP-Test',d:'Wähle die schwerste Last (90 / 95 / 100 %), mit der du sicher mindestens 5 Wdh schaffst. 90 % ist ein gutes Minimum, 95 % ein sehr gutes Ziel, 100 % nur, wenn der Zyklus richtig gut lief. Kniebeuge mit RPE-9-Deckel; Bank und Kreuzheben bis echtes RPE 10. High Hype bei allen Sätzen!',test:1,b:[
   B('csq',1,'AMRAP','1× AMRAP mit RPE-9-Deckel – 90, 95 oder 100 % des Paused Singles',{h:'h',pct:[90,95,100],ref:'SQ',rpe:9}),
   B('cdl',1,'AMRAP','1× AMRAP mit 90, 95 oder 100 % des Paused-Deadlift-Singles',{h:'h',pct:[90,95,100],ref:'DL',rpe:10}),
   B('pbb',1,'AMRAP','1× AMRAP mit 90, 95 oder 100 % des 3 s Pause Singles',{h:'h',pct:[90,95,100],ref:'BP',rpe:10})]},
  {f:'Brust · Rücken',d:'Pivot-Workout: moderates Deload-Volumen mit Abwechslung. Etwas höhere RPEs als ein klassischer Deload, diese Progressionen werden nicht fortgesetzt.',b:[
   B('ndb',3,'8','3×8 @ RPE 6,5 in jedem Satz',{h:'m',rpe:6.5}),
   B('dfr',2,'12','2×12 @ RPE 8 in jedem Satz',{h:'m',rpe:8}),
   B('wlat',2,'12','2×12 @ RPE 7,5 in jedem Satz',{h:'m',rpe:7.5}),
   B('ilat',2,'15','2×15 @ RPE 8 in jedem Satz',{h:'m',rpe:8}),
   B('pcurl',3,'8-10','3×8–10 @ RPE 8 in jedem Satz',{h:'m',rpe:8})]}
 ]
];
let REFS={SQ:{w:0,d:0,b:0,n:'Paused Squat'},DL:{w:0,d:0,b:2,n:'Paused Deadlift'},BP:{w:0,d:1,b:0,n:'3 s Pause Bench'}};
const HYPE={h:'Hype hoch',m:'Hype moderat',l:'Hype niedrig'};
const GC={sq:'var(--sq)',bp:'var(--bp)',dl:'var(--dl)',acc:'var(--acc)'};


/* ===================== Candito 8 Week (V2) – Anschlussprogramm ===================== */
Object.assign(EX,{
 lext:{n:'Leg Extension',g:'acc',m:0,t:'Kontrolliert, volle Streckung oben, kein Schwung.'},
 rdle:{n:'RDL 3 s Exzentrik',g:'dl',m:1,t:'Gürtel wie gewohnt. 3 echte Sekunden ablassen, Hüfte nach hinten, Stange nah am Bein.'},
 rdlt:{n:'RDL aggressives Tempo',g:'dl',m:1,t:'Zügiges, kontrolliertes Tempo, Hüfte nach hinten, Stange nah am Bein – viel Spannung in der Dehnung.'},
 mach:{n:'Hack / Pendulum / Belt Squat',g:'sq',m:1,t:'Super Squat, Belt Squat, Pendulum Squat oder Hack Squat – eine Variante wählen und den ganzen Zyklus dabei bleiben.'},
 mrow:{n:'Machine Row',g:'acc',m:0,eq:'mach',t:'Canditos Vorgabe. Ohne Maschine: Barbell Row im Untergriff (Canditos Alternative). Den ersten Satz wie einen Top-Satz behandeln, Last Satz für Satz anpassen.'},
 sacc:{n:'Single Arm Cable Curl',g:'acc',m:0,t:'Ellbogen unten halten und sehr hohe RPEs erreichen – ideal, um bis zum echten Muskelversagen zu gehen, weil die Ermüdung bei der leichten Last gering bleibt.'}
});
const DAYS8=[{tag:'Tag 1',wd:'Sa',wdl:'Samstag',off:0},{tag:'Tag 2',wd:'So',wdl:'Sonntag',off:1},{tag:'Tag 3',wd:'Di',wdl:'Dienstag',off:3},{tag:'Tag 4',wd:'Do',wdl:'Donnerstag',off:5}];
const WEEKS8=['Start','Volumen','Steigerung','Mini-Deload','Spezifität','Volumen-Peak','Taper','Testwoche'];
const ORIG8=['Montag','Mittwoch','Freitag','Samstag'];
const FUB='Feet Up Bench nur als Weitgriff-Drücker – mit moderatem Griff stattdessen Close Grip Bench Press.';
const P8=[
 [ // W1
  {f:'Beine & Brust',d:'Der leichtere Unterkörpertag der Woche, um Schwung für den Haupttag aufzubauen. Zwischen den Sätzen viel Zeit lassen, damit die Satzqualität sehr hoch bleibt – an solchen Tagen baust du exzellente Technik auf und sammelst trotzdem viel Wiederholungsarbeit.',b:[
   B('psq',3,'6','3×6 @ RPE 7 im 3. Satz',{h:'m',rpe:7}),
   B('cdl',1,'8','1×8 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'8','1×8 @ RPE 6',{h:'l',rpe:6}),
   B('rdle',2,'7','2×7 @ RPE 6,5 im 2. Satz – gleiche Last in beiden Sätzen',{rpe:6.5}),
   B('lext',3,'15','3×15 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('ecc',4,'2','4×2 @ RPE 6 im Schnitt',{h:'m',rpe:6})]},
  {f:'Brust',d:'Hast du die Intro-Phase gemacht: Ziel für den 9er sind 2,5–5 kg mehr als beim 1×9 in Woche 1 des Intro. Den Backoff 2×9 danach entsprechend einordnen. Der Trizeps läuft in drei Wellen (linear, dann höhere Wdh mit AMRAP in W2, ab W4 3×7 mit der schwersten Last). Beim Press-Around die Last des 2. Satzes nicht ändern – 15 und 13 Wdh sind okay, Hauptsache RPE 8 pro Satz.',b:[
   B('pbb',1,'1','1 Single @ RPE 6',{h:'h',rpe:6}),
   B('pbb',1,'9','1×9 @ RPE 8,5 – Ziel siehe Tagesinfo',{h:'h',rpe:8.5}),
   B('pbb',2,'9','2×9 @ RPE 7 im 2. Satz',{h:'m',rpe:7}),
   B('fub',3,'8','3×8 @ RPE 5 im ersten Satz, RPE-Cap 6,5 insgesamt',{h:'l',rpe:5,cap:6.5}),
   B('cte',3,'11','3×11 @ RPE 7 im 3. Satz',{h:'m',rpe:7}),
   B('dbf',2,'AMRAP','Optional: 2 Sätze bis RPE 8 – mit einer Last für mind. 15 Wdh im ersten Satz',{rpe:8,opt:1})]},
  {f:'Beine',d:'Beim Kniebeugen-Single unbedingt streng starten. Weißt du nicht, was ein RPE-6-Single ist: etwa 85 % deines 1RM – nach dem Intro 85 % des projizierten 1RM aus dem W4-AMRAP. Lieber unterschätzen als überziehen.',b:[
   B('csq',1,'1','1 Single @ RPE 6',{h:'h',rpe:6}),
   B('csq',2,'7','2×7 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('pdl',1,'1','1 Single @ RPE 5',{h:'h',rpe:5}),
   B('pdl',1,'5','1×5 @ RPE 6',{h:'h',rpe:6}),
   B('pdl',2,'5','2×5 @ RPE 5 im ersten Satz',{h:'m',rpe:5}),
   B('mach',3,'8','3×8 @ RPE 7 im 3. Satz – an die Technik denken',{h:'l',rpe:7})]},
  {f:'Brust & Rücken',d:'Bankvolumen mit 5×4, danach Feet-Up-Arbeit mit der Last von Tag 2 und Rückenarbeit.',b:[
   B('pbb',5,'4','5×4 @ RPE 7 im 5. Satz',{h:'m',rpe:7}),
   B('fub',1,'12','1×12 mit der Last vom 3×8 an Tag 2',{h:'h',src:[0,1,3]}),
   B('fub',1,'12','1×12 mit gleicher Last ODER 5 kg weniger',{ref:'TOP',pct:100}),
   B('mrow',1,'10','1×10 @ RPE 7',{sw:'row',h:'h',rpe:7}),
   B('mrow',3,'10','3×10 @ RPE 7 in jedem Satz – Last Satz für Satz anpassen',{sw:'row',h:'m',rpe:7}),
   B('lat',3,'15','3×15 @ RPE 7,5 in jedem Satz – Last Satz für Satz anpassen',{rpe:7.5}),
   B('idc',3,'8','3×8 @ RPE 8 in jedem Satz',{rpe:8})]}],
 [ // W2
  {f:'Beine & Brust',d:'Beim 3×8 bei Bedarf extra Pause nehmen, damit die Last trotz 2 Wdh mehr als letzte Woche unter dem RPE-Cap bleibt. Ist klar, dass der Cap überschritten würde, die Last für den nächsten Satz auf RPE 8 reduzieren.',b:[
   B('psq',3,'8','3×8 mit der Last von letzter Woche – RPE-Cap 8,5',{h:'h',src:[0,0,0],cap:8.5}),
   B('cdl',1,'7','1×7 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'7','1×7 @ RPE 6',{h:'l',rpe:6}),
   B('rdle',2,'7','2×7 @ RPE 7 im Schnitt',{h:'m',rpe:7}),
   B('lext',2,'16','2×16 mit der Last von letzter Woche',{src:[0,0,4]}),
   B('lext',1,'AMRAP','1× AMRAP bis RPE 9 – gleiche Last wie das 2×16',{h:'h',rpe:9,ref:'TOP',pct:100}),
   B('ecc',4,'2','4×2 @ RPE 7,5 im Schnitt',{h:'m',rpe:7.5})]},
  {f:'Brust',d:'Nach dem Intro ist ein gutes Ziel, den 7er-Top-Satz aus Intro-Woche 2 jetzt für 8 Wdh zu schaffen. Grenze: nicht mehr als +2,5 kg UND +1 Wdh – mehr ist nicht nötig.',b:[
   B('pbb',1,'1','1 Single @ RPE 8',{h:'h',rpe:8}),
   B('pbb',1,'8','1×8 @ RPE 8,5',{h:'h',rpe:8.5}),
   B('pbb',2,'8','2×8 @ RPE 7 im 2. Satz – gleiche Last in beiden Sätzen',{h:'m',rpe:7}),
   B('fub',3,'8','3×8 @ RPE 6 im ersten Satz',{h:'m',rpe:6}),
   B('cte',2,'12','2×12 mit der Last vom 3×11 letzter Woche',{h:'m',src:[0,1,4]}),
   B('cte',1,'AMRAP','1× AMRAP bis RPE 9 mit gleicher Last – Ziel 13–15+ Wdh',{h:'h',rpe:9,ref:'TOP',pct:100}),
   B('dbf',2,'AMRAP','Optional: 2 Sätze bis RPE 8 – ein Inkrement mehr als letzte Woche',{h:'h',rpe:8,opt:1,src:[0,1,5],inc:1})]},
  {f:'Beine',d:'Die Paused Squats vom Anfang der Woche wirst du beim Single spüren – wahrscheinlich fühlt er sich flach an, der 7er-Top-Satz läuft aber trotzdem ungewöhnlich gut, weil du dafür gut konditioniert bist.',b:[
   B('csq',1,'1','1 Single mit der Last von letzter Woche',{h:'h',src:[0,2,0]}),
   B('csq',1,'7','1×7 @ RPE 8,5 – 7er-Rekord, wenn möglich, ohne Technikverlust',{h:'h',rpe:8.5}),
   B('csq',1,'7','1×7 @ RPE 7,5 – etwa 3 % mehr als die 7er letzter Woche',{h:'m',rpe:7.5}),
   B('pdl',1,'1','1 Single @ RPE 6',{h:'h',rpe:6}),
   B('pdl',1,'5','1×5 @ RPE 7',{h:'h',rpe:7}),
   B('pdl',2,'5','2×5 @ RPE 6,5 im Schnitt',{h:'m',rpe:6.5}),
   B('mach',3,'8','3×8 @ RPE 7 im letzten Satz – trotz gleichem RPE mehr Last als letzte Woche',{h:'m',rpe:7})]},
  {f:'Brust & Rücken',d:'Bankdrückst du für 4er-Sätze unter ca. 68 kg, lohnen sich Mikroscheiben, um beim Backoff 4×4 nur 1,25 kg zu steigern.',b:[
   B('pbb',1,'4','1×4 @ RPE 7,5',{h:'m',rpe:7.5}),
   B('pbb',4,'4','4×4 mit 2,5–5 kg mehr als das 5×4 letzter Woche – RPE-Cap 7,5',{h:'m',src:[0,3,0],add:2.5,cap:7.5}),
   B('fub',1,'10','1×10 @ RPE 7,5',{h:'h',rpe:7.5}),
   B('fub',1,'10','1×10 @ RPE 7 – Comp-Griffbreite',{h:'l',rpe:7}),
   B('mrow',1,'10','1×10 @ RPE 8',{sw:'row',h:'h',rpe:8}),
   B('mrow',3,'10','3×10 @ RPE 8 in jedem Satz – Last Satz für Satz anpassen',{sw:'row',h:'m',rpe:8}),
   B('lat',3,'16-17','3×16–17 mit der Last von letzter Woche – RPE-Cap 8,5, Ziel +2 Wdh pro Satz',{src:[0,3,5],cap:8.5}),
   B('idc',3,'8','3×8 @ RPE 8,5 in jedem Satz',{rpe:8.5})]}],
 [ // W3
  {f:'Beine & Brust',d:'Im Zweifel bei den Prozenten die vollen 6 % nehmen – Paused Deadlift und Paused Squat sind wahrscheinlich ungewohnt, da kommen schnelle motorische Anpassungen. RDL: Lief der 5er bei RPE 6,5 oder leichter, für den 7er Last erhöhen; bei RPE 7 gleich lassen; ab RPE 7,5 leicht reduzieren. Den 7er in jedem Fall schwerer als letzte Woche und stark beenden.',b:[
   B('psq',3,'6','3×6 mit 3–6 % mehr als in W1 – RPE-Cap 7,5',{src:[0,0,0],pct:106,cap:7.5}),
   B('cdl',1,'6','1×6 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'6','1×6 @ RPE 6',{h:'l',rpe:6}),
   B('rdle',1,'5','1×5 @ RPE 7 – schwerste Last des Zyklus auf dieser Übung',{h:'m',rpe:7}),
   B('rdle',1,'7','1×7 @ RPE 8 – siehe Tagesinfo',{h:'h',rpe:8}),
   B('lext',3,'15','3×15 @ RPE 7 im letzten Satz – mehr Last als W1 bei gleichem RPE',{rpe:7}),
   B('ecc',4,'2','4×2 @ RPE 7,5 im Schnitt',{h:'m',rpe:7.5})]},
  {f:'Brust',d:'Beim 6er auf einen 5er-Rekord zielen, wenn möglich.',b:[
   B('pbb',1,'1','1 Single @ RPE 8',{h:'h',rpe:8}),
   B('pbb',1,'6','1×6 @ RPE 8 – 5er-Rekord, wenn möglich',{h:'h',rpe:8}),
   B('pbb',2,'6','2×6 @ RPE 7 im 2. Satz',{h:'m',rpe:7}),
   B('fub',3,'5','3×5 mit einer Last, die du für 10 Wdh schaffst',{h:'m',rpe:5}),
   B('cte',3,'11','3×11 @ RPE 8 im 3. Satz – wahrscheinlich ein großer Sprung zu W1',{h:'m',rpe:8}),
   B('dbf',2,'AMRAP','Optional: 2 Sätze bis RPE 8 – ein Inkrement mehr als letzte Woche',{rpe:8,opt:1,src:[1,1,6],inc:1})]},
  {f:'Beine',d:'Beim Single steigt das RPE, der Hype bleibt bewusst niedrig.',b:[
   B('csq',1,'1','1 Single @ RPE 8 – RPE steigt, Hype bewusst zurückgehalten',{h:'l',rpe:8}),
   B('csq',3,'5','3×5 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('pdl',1,'1','1 Single @ RPE 7',{h:'h',rpe:7}),
   B('pdl',1,'5','1×5 @ RPE 7,5',{h:'h',rpe:7.5}),
   B('pdl',2,'5','2×5 @ RPE 7 im Schnitt',{h:'m',rpe:7}),
   B('mach',3,'8','3×8 @ RPE 7,5 in jedem Satz',{h:'m',rpe:7.5})]},
  {f:'Brust & Rücken',d:'Bank mit 6×3, dazu ein Feet-Up-10RM, das in künftigen Zyklen verbessert wird.',b:[
   B('pbb',6,'3','6×3 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('fub',1,'10','1×10 @ RPE 8,5 – ein 10RM, das in künftigen Zyklen verbessert wird',{h:'h',rpe:8.5}),
   B('mrow',1,'8','1×8 @ RPE 7',{sw:'row',h:'h',rpe:7}),
   B('mrow',3,'8','3×8 @ RPE 7 in jedem Satz – Last Satz für Satz anpassen',{sw:'row',h:'m',rpe:7}),
   B('lat',3,'13-15','3×13–15 mit einem Inkrement mehr als letzte Woche – RPE-Cap 8',{src:[1,3,6],inc:1,cap:8}),
   B('idc',3,'6-8','3×6–8 @ RPE 9 in jedem Satz',{rpe:9})]}],
 [ // W4
  {f:'Beine & Brust',d:'Keine RDL-Arbeit diese Woche – Ziel ist ein großes RPE-8-Single beim Paused Deadlift, nächste Woche kommt das Zubehör zurück. Im Grunde ein Mini-Deload. Der Paused Squat ist nur ein kleiner Sprung zum 3×6 – das 3×5 ist der Wendepunkt: ab jetzt nicht mehr direkt mit Vorwochen vergleichen, sondern dem RPE folgen.',b:[
   B('psq',3,'5','3×5 @ RPE 7 im 3. Satz',{h:'m',rpe:7}),
   B('cdl',1,'5','1×5 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'5','1×5 @ RPE 6',{h:'l',rpe:6}),
   B('lext',1,'12','1×12 @ RPE 8',{h:'m',rpe:8}),
   B('lext',1,'13-15','1×13–15 @ RPE 9 – der letzte Leg-Extension-Satz des Zyklus',{h:'h',rpe:9}),
   B('ecc',1,'2','1×2 @ RPE 8,5 – ein konservatives 2RM',{h:'h',rpe:8.5}),
   B('ecc',1,'2','1×2 @ RPE 8',{h:'l',rpe:8})]},
  {f:'Brust',d:'Das große Bank-Single voll pushen – das Ende einer 4-Wochen-Rampe, nächste Woche beginnt die Progression neu. Im Grunde ein Test-Single ohne echtes Tapering. Sonst nichts nötig; wer will, kann max. 15–20 Min. lockeres Cardio oder kleine Muskelgruppen (Bizeps, seitliche/hintere Schulter) machen – nicht oberer Rücken und nicht die Bank-Hauptmuskeln.',b:[
   B('pbb',1,'1','1 Single @ RPE 9 – neuer Rekord, wenn möglich, aber streng RPE 9',{h:'h',rpe:9}),
   B('pbb',1,'5','1×5 @ RPE 6,5',{h:'l',rpe:6.5}),
   B('pbb',2,'5','2×5 mit 96 % der Last des 5er-Top-Satzes',{h:'l',ref:'TOP',pct:96}),
   B('ndb',2,'9','2×9 @ RPE 6,5 im Schnitt',{h:'l',rpe:6.5})]},
  {f:'Beine',d:'Single mit der Last von letzter Woche und erneut niedrigem Hype – das ändert sich nächste Woche.',b:[
   B('csq',1,'1','1 Single mit der Last von letzter Woche – niedriger Hype',{h:'l',src:[2,2,0]}),
   B('csq',4,'4','4×4 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('pdl',1,'1','1 Single @ RPE 8',{h:'h',rpe:8}),
   B('cdl',3,'4','3×4 @ RPE 5 im letzten Satz',{h:'l',rpe:5}),
   B('mach',2,'8','2×8 @ RPE 8 im 2. Satz',{h:'m',rpe:8})]},
  {f:'Brust & Rücken',d:'Bank 4×5, Feet Up mit Comp-Griff als Top-Satz + Backoff, dazu Rücken und Bizeps.',b:[
   B('pbb',4,'5','4×5 @ RPE 7 im 4. Satz',{h:'m',rpe:7}),
   B('fub',1,'7','1×7 @ RPE 6 – Comp-Griffbreite',{h:'m',rpe:6}),
   B('fub',1,'7','1×7 mit 95 % der Last des Satzes davor',{h:'m',ref:'TOP',pct:95}),
   B('mrow',1,'8','1×8 @ RPE 8',{sw:'row',h:'h',rpe:8}),
   B('mrow',2,'8','2×8 @ RPE 8 in jedem Satz',{sw:'row',h:'m',rpe:8}),
   B('lat',2,'10-12','2×10–12 @ RPE 8 in jedem Satz – ein großer Lastsprung zur Vorwoche',{h:'h',rpe:8}),
   B('idc',2,'11','2×11 @ RPE 6,5 in jedem Satz',{h:'l',rpe:6.5})]}],
 [ // W5
  {f:'Beine & Brust',d:'Beim Bankdrücken steigt jetzt die Spezifität: an allen drei Bank-Tagen der Hauptstil, keine 3-s-Exzentrik mehr. Kreuzheben: mehr Wdh pro Satz, mehr Gesamtvolumen und mehr Last – der Weg Richtung 1RM-Peak.',b:[
   B('psq',1,'5','1×5 @ RPE 8,5 – 5er-Rekord in der Variante, wenn möglich',{h:'h',rpe:8.5}),
   B('csq',2,'5','2×5 @ RPE 5 im 2. Satz',{h:'l',rpe:5}),
   B('cdl',1,'7','1×7 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'7','1×7 @ RPE 6',{h:'l',rpe:6}),
   B('rdlt',2,'8','2×8 @ RPE 6,5 im 2. Satz',{h:'m',rpe:6.5}),
   B('pbb',4,'3','4×3 @ RPE 6 im letzten Satz',{h:'l',rpe:6})]},
  {f:'Brust',d:'Statt des optionalen Neutral Grip DB Bench gehen auch gewichtete Dips – je nachdem, worin du stärker bist. Das Single gedanklich genau auf RPE 6 zielen, die halbe Stufe extra ist Spielraum. Im Zweifel nur 2,5 kg mehr als W1, bei sehr gutem Gefühl 5 kg. Ohne die optionale DB-Arbeit beim Trizeps 4×7 machen.',b:[
   B('pbb',1,'1','1 Single mit 2,5–5 kg mehr als das RPE-6-Single aus W1 – RPE-Cap 6,5',{src:[0,1,0],add:2.5,cap:6.5}),
   B('pbb',1,'7','1×7 @ RPE 7',{h:'h',rpe:7}),
   B('pbb',2,'7','2×7 @ RPE 6,5 im 2. Satz – Ermüdung und Hype senken die Last etwas',{h:'l',rpe:6.5}),
   B('fub',3,'5','3×5 @ RPE 5 im ersten Satz – Comp-Griffbreite',{h:'l',rpe:5}),
   B('ndb',1,'9','Optional: 1×9 @ RPE 7',{h:'h',rpe:7,opt:1}),
   B('ndb',1,'9','Optional: 1×9 @ RPE 7',{h:'l',rpe:7,opt:1}),
   B('cte',3,'7','3×7 @ RPE 7 im Schnitt',{h:'m',rpe:7})]},
  {f:'Beine',d:'Das Single mit der zusätzlichen Aufregung spürbar schwerer nehmen, bei ähnlicher Stangengeschwindigkeit. Beim 4×4 diese Woche mehr als in jeder anderen Woche NICHT überziehen – nächste Woche kommt ein 6×3, das etwas leichter als der 4er-Top-Satz sein wird.',b:[
   B('csq',1,'1','1 Single @ RPE 8 – die Aufregung treibt den Sprung zur Vorwoche',{h:'h',rpe:8}),
   B('csq',1,'4','1×4 @ RPE 8,5',{h:'h',rpe:8.5}),
   B('csq',4,'4','4×4 @ RPE 7,5 im letzten Satz',{h:'m',rpe:7.5}),
   B('cdl',1,'1','1 Single @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'4','1×4 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',3,'4','3×4 @ RPE 5,5 im 3. Satz – deutlich schwerer als das Paused 4×3 aus W1',{h:'m',rpe:5.5}),
   B('mach',1,'8','1×8 @ RPE 8,5 – die Progression stark mit einem konservativen 8RM beenden',{h:'h',rpe:8.5})]},
  {f:'Brust & Rücken',d:'Machine Row weiter hart pushen wie in den ersten 4 Wochen. Abwechslung gibt es nur beim Wide Grip Lat Pulldown und beim Single Arm Cable Curl – Kernübungen bleiben konstant.',b:[
   B('pbb',1,'5','1×5 @ RPE 8',{h:'m',rpe:8}),
   B('pbb',3,'5','3×5 @ RPE 7,5 im letzten Satz',{h:'m',rpe:7.5}),
   B('fub',1,'7','1×7 @ RPE 7 – im Zweifel eher RPE 6,5 als 7,5',{h:'h',rpe:7}),
   B('fub',1,'7','1×7 mit 95 % der Last des Top-Satzes',{h:'h',ref:'TOP',pct:95}),
   B('mrow',1,'8','1×8 @ RPE 7',{sw:'row',h:'h',rpe:7}),
   B('mrow',3,'8','3×8 @ RPE 7 im 3. Satz',{sw:'row',h:'m',rpe:7}),
   B('wlat',3,'15','3×15 @ RPE 7,5 in jedem Satz',{rpe:7.5}),
   B('sacc',3,'AMRAP','3 Sätze bis zum Muskelversagen – Last für mind. 13 Wdh im ersten Satz',{rpe:10})]}],
 [ // W6
  {f:'Beine & Brust',d:'Beim Kniebeugen im Zweifel unterschätzen. Nächste Woche kommt noch ein leichtes 3×5 @ RPE 6,5 – du kannst vom Ziel rückwärts rechnen und gleich große Sprünge über die Wochen nehmen, damit dieser Tag so „gedankenlos“ bleibt wie gedacht.',b:[
   B('csq',3,'5','3×5 @ RPE 6 im 2. Satz',{h:'l',rpe:6}),
   B('cdl',1,'6','1×6 @ RPE 6',{h:'l',rpe:6}),
   B('cdl',1,'6','1×6 @ RPE 6',{h:'l',rpe:6}),
   B('rdlt',2,'8','2×8 @ RPE 7 im 2. Satz',{h:'m',rpe:7}),
   B('pbb',4,'3','4×3 @ RPE 6,5 im letzten Satz – hoffentlich leicht mehr als letzte Woche',{h:'l',rpe:6.5})]},
  {f:'Brust',d:'Wie letzte Woche: Ohne die optionale Neutral-Grip-DB-Arbeit beim Trizeps 4×7 machen.',b:[
   B('pbb',1,'1','1 Single @ RPE 7,5 – ohne Vorgabe, offen herangehen',{h:'m',rpe:7.5}),
   B('pbb',1,'7','1×7 @ RPE 8,5 – 7er-Rekord, wenn möglich',{h:'h',rpe:8.5}),
   B('pbb',2,'7','2×7 @ RPE 7 im 2. Satz – mehr Last als letzte Woche bei gleichem Schema',{h:'m',rpe:7}),
   B('fub',3,'5','3×5 @ RPE 6,5 im Schnitt – Comp-Griffbreite – niedriger bis moderater Hype',{h:'l',rpe:6.5}),
   B('ndb',1,'8','Optional: 1×8 @ RPE 7,5 – wahrscheinlich 2,5 kg mehr als der Top-Satz letzter Woche',{h:'h',rpe:7.5,opt:1}),
   B('ndb',1,'8','Optional: 1×8 @ RPE 7,5 – wahrscheinlich 2,5 kg mehr als der Backoff letzter Woche',{h:'l',rpe:7.5,opt:1}),
   B('cte',3,'7','3×7 @ RPE 8 im 3. Satz – ohne DB-Bench 4×7',{h:'m',rpe:8})]},
  {f:'Beine',d:'Das RPE-9-Single ist bis zur Testwoche das schwerste des Zyklus – lass es fliegen, aber es ist ungepeakt, streng bleiben ist entscheidend. Höchste Satzzahl bei der Comp-Kniebeuge mit 6×3, ohne Maschinen-Kniebeuge – der letzte Push. Nächste Woche wird die Satzzahl halbiert für einen aggressiven Peak.',b:[
   B('csq',1,'1','1 Single @ RPE 9 – das schwerste Single des Zyklus',{h:'h',rpe:9}),
   B('csq',6,'3','6×3 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('cdl',1,'1','1 Single @ RPE 8',{h:'h',rpe:8}),
   B('cdl',1,'4','1×4 @ RPE 7 – der schwerste Nicht-Single des Zyklus',{h:'h',rpe:7}),
   B('cdl',3,'4','3×4 @ RPE 6,5 im 3. Satz',{h:'m',rpe:6.5})]},
  {f:'Brust & Rücken',d:'Eine riesige Woche: der Satzzahl-Peak des gesamten 8-Wochen-Zyklus beim Bankdrücken. Das höchste Volumen spät im Zyklus bereitet ein gutes Tapering vor – das häufigste Problem beim Bankdrücken ist ein verfrühter Peak.',b:[
   B('pbb',7,'3','7×3 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('fub',1,'7','1×7 @ RPE 8 – Comp-Griffbreite',{h:'h',rpe:8}),
   B('fub',1,'7','1×7 mit 5 % weniger',{h:'h',ref:'TOP',pct:95}),
   B('mrow',1,'8','1×8 @ RPE 8',{sw:'row',h:'h',rpe:8}),
   B('mrow',3,'8','3×8 @ RPE 8 im 3. Satz',{sw:'row',h:'m',rpe:8}),
   B('wlat',3,'16-17','3×16–17 mit der Last von letzter Woche – RPE-Cap 8,5, Ziel +2 Wdh pro Satz',{src:[4,3,6],cap:8.5}),
   B('sacc',3,'AMRAP','3 Sätze bis zum echten Muskelversagen – ein Inkrement mehr als letzte Woche',{rpe:10,src:[4,3,7],inc:1})]}],
 [ // W7
  {f:'Beine & Brust',d:'Eine ruhige Einheit: Der RDL-/Wide-Stance-Slot endet hier, und die Kreuzheben-Wiederholungsarbeit ist damit im Wesentlichen erledigt.',b:[
   B('csq',3,'5','3×5 @ RPE 6,5 im 2. Satz',{h:'l',rpe:6.5}),
   B('cdl',1,'5','1×5 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',1,'5','1×5 @ RPE 6',{h:'l',rpe:6}),
   B('rdlt',1,'6','1×6 @ RPE 7',{h:'m',rpe:7}),
   B('rdlt',1,'8','1×8 @ RPE 8 – voll aufdrehen, damit endet die Übung',{h:'h',rpe:8}),
   B('pbb',4,'2','4×2 @ RPE 6 im letzten Satz – etwas mehr Last als das 4×3 letzter Woche',{h:'l',rpe:6})]},
  {f:'Brust',d:'Das RPE-9-Single aus W4 gibt Kontext. Diese Woche ist ungepeakt und die Rampe kürzer – 2,5–5 kg mehr als in W4 wären fantastisch, gleich viel oder 2,5–5 kg weniger ist völlig okay. Das Tapering kommt noch, deshalb zeigt erst das W8-Test-Single dein echtes Potenzial. Geduldig bleiben: Es ist das schwerste Bankdrücken bis zum Testtag.',b:[
   B('pbb',1,'1','1 Single @ RPE 9 – siehe Tagesinfo',{h:'h',rpe:9}),
   B('pbb',1,'4','1×4 @ RPE 8,5 – 5er-Rekord, wenn möglich',{h:'h',rpe:8.5}),
   B('pbb',3,'4','3×4 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('fub',3,'3','3×3 @ RPE 7 im 3. Satz – schwerste Last der Progression – niedriger bis moderater Hype',{h:'l',rpe:7}),
   B('ndb',1,'6','Optional: 1×6 @ RPE 7 – schwerste Last bis hierher',{h:'m',rpe:7,opt:1}),
   B('ndb',1,'6-8','Optional: 1×6–8 @ RPE 8,5',{h:'h',rpe:8.5,opt:1}),
   B('cte',2,'7','2×7 @ RPE 9 im 2. Satz – die schwerste Last, die du je auf dieser Übung hattest',{h:'h',rpe:9})]},
  {f:'Beine',d:'Kniebeugen-Volumen wird halbiert, keine Einbein-/Maschinenarbeit mehr. Beim Aufwärmen fühlst du dich wahrscheinlich flacher als letzte Woche – hier hat sich die Ermüdung angesammelt, ab jetzt baut sie sich bis zum Test ab. Das Single leichter als das RPE-9-Single der Vorwoche, aber möglichst schwerer als das RPE-8-Single aus W6. Weil der 3er mit hohem Hype kommt, liegt seine Last nah am Single – das Single darf sogar leichter sein.',b:[
   B('csq',1,'1','1 Single @ RPE 8,5 – Aufregung bewusst vermeiden',{h:'l',rpe:8.5}),
   B('csq',1,'3','1×3 @ RPE 8,5 – 3er-Rekord, wenn möglich, aber dem RPE folgen',{h:'h',rpe:8.5}),
   B('csq',2,'3','2×3 @ RPE 7,5 im 2. Satz',{h:'m',rpe:7.5}),
   B('cdl',1,'1','1 Single @ RPE 9',{h:'h',rpe:9}),
   B('cdl',1,'3','1×3 @ RPE 7',{h:'h',rpe:7}),
   B('cdl',2,'3','2×3 @ RPE 6,5 im letzten Satz',{h:'m',rpe:6.5})]},
  {f:'Brust & Rücken',d:'Alle Bodybuilding-Übungen entfallen, um die Erholung für die Zielgerade zu steigern.',b:[
   B('pbb',1,'3','1×3 @ RPE 8–8,5 – hart pushen, eventuell ein 3er-Rekord, dabei stoisch bleiben',{h:'m',rpe:8}),
   B('pbb',4,'3','4×3 @ RPE 7 im Schnitt',{h:'m',rpe:7}),
   B('fub',1,'5','1×5 @ RPE 8,5 – ein großes Varianten-5RM',{h:'h',rpe:8.5})]}],
 [ // W8
  {f:'Brust',d:'Keine Zubehörübungen. Das Single sprengen – jetzt reiten wir den Peak nach Hause! (Original: Montag)',b:[
   B('pbb',1,'1','1 Single @ RPE 7 – im Zweifel lieber RPE 6,5 als 7,5',{h:'h',rpe:7}),
   B('pbb',1,'4','1×4 @ RPE 6,5',{h:'l',rpe:6.5}),
   B('pbb',3,'4','3×4 mit 4 % weniger',{h:'l',ref:'TOP',pct:96})]},
  {f:'Beine',d:'Beim Kniebeugen und Kreuzheben unter ca. 184 kg im 2×1 nur 2,5 kg aufschlagen, ab ca. 184 kg 5 kg. Das 3. Single soll genauso gut oder besser laufen als das 2×1. Diese Grenze darf dein Ziel für das 2×1 nicht beeinflussen. (Original: Dienstag)',b:[
   B('csq',2,'1','2×1 @ RPE 6 im letzten Satz',{h:'l',rpe:6}),
   B('csq',1,'1','1 Single mit 2,5 ODER 5 kg mehr – Ziel RPE 6 oder leichter dank Hype',{h:'h',ref:'TOP',plus:2.5}),
   B('cdl',2,'1','2×1 @ RPE 5 im Schnitt',{h:'l',rpe:5}),
   B('cdl',1,'1','1 Single mit 102,5 % des 2×1 – sprengen',{h:'h',ref:'TOP',pct:102.5})]},
  {f:'Brust',d:'Etwas schwerer als das 4×2 @ RPE 6 aus W7. Den Zyklus locker beenden – nächste Einheit wird getestet! (Original: Mittwoch)',b:[
   B('pbb',3,'1','3×1 @ RPE 6 im 3. Satz',{h:'l',rpe:6}),
   B('pbb',1,'1','1 Single mit 103 % der 3×1-Last – Ziel RPE 6 oder leichter dank Hype',{h:'h',ref:'TOP',pct:103})]},
  {f:'Testtag',d:'Willst du am Testtag nur Kniebeuge und Kreuzheben maximal testen, kannst du das Bankdrücken auf den nächsten Tag legen – du bist dann immer noch gepeakt. Der Ablauf simuliert einen Wettkampf. Typisches Obergrenzen-Ziel: ca. +7 kg Rekord – das wären auf ein Jahr hochgerechnet rund 44 kg pro Lift. Mehr nur, wenn du dir 100 % sicher bist. Schon +2,5 kg sind auf das Jahr gerechnet stark. Und: NICHT VERFEHLEN. (Original: Samstag)',b:[
   B('csq',1,'1','Bis zum 1RM steigern – maximal, aber keinen Fehlversuch riskieren!',{h:'h',test1:1}),
   B('pbb',1,'1','Bis zum 1RM steigern – maximal, aber keinen Fehlversuch riskieren!',{h:'h',test1:1}),
   B('cdl',1,'1','Bis zum 1RM steigern – maximal, aber keinen Fehlversuch riskieren!',{h:'h',test1:1})]}]
];
const INFO8={};

/* ===================== Candito 10RM-Phase (V5) ===================== */
Object.assign(EX,{
 cgb:{n:'Close Grip Bench Press',g:'bp',m:1,t:'Für Weitgriff-Drücker: enger Griff, alle Wiederholungen mit Pause auf der Brust, Ellbogen etwas näher am Körper.'},
 dlr:{n:'Dumbbell Lateral Raise',g:'acc',m:0,t:'Optional – nicht für das Total nötig, sondern für runde, starke Schultern.'},
 ccurl:{n:'Cable Curl (gerade Stange)',g:'acc',m:0,t:'Optional: mit einer Last für mind. 10 Wdh im ersten Satz bis zum Muskelversagen.'},
 bbss:{n:'Barbell Bulgarian Split Squat',g:'acc',m:0,eq:'bb',t:'Canditos Alternative zur Leg Press (so in Canditos App gewählt): Der Slot soll ohne Achsenlast auf der Wirbelsäule bleiben – Belt Squat wäre ebenfalls okay, Hack Squat nicht. Im Home Gym ideal.'},
 sgm:{n:'Seated Good Morning (Home Gym)',g:'acc',m:0,eq:'bb',t:'Canditos Home-Gym-Option statt Seated Hamstring Curl – so in Canditos App gewählt. Rücken neutral, aus der Hüfte nach vorn kippen.'},
 nlat:{n:'Neutral Grip Lat Pulldown',g:'acc',m:0,t:'Neutraler Griff, Brust zum Griff, oben volle Dehnung.'},
 idb:{n:'Incline DB Bench Press',g:'bp',m:0,t:'Schrägbank, kontrolliert ablassen, volle Dehnung.'}
});
const DAYS10=[{tag:'Tag 1',wd:'Sa',wdl:'Samstag',off:0},{tag:'Tag 2',wd:'So',wdl:'Sonntag',off:1},{tag:'Tag 3',wd:'Di',wdl:'Dienstag',off:3},{tag:'Tag 4',wd:'Do',wdl:'Donnerstag',off:5}];
const WEEKS10=['Einstieg','Aufbau','Kern','Härteste Woche','10RM-Test'];
const ORIG10=['Montag','Mittwoch','Donnerstag','Samstag'];
const TOPB=(pct,o={})=>Object.assign({ref:'TOP',pct},o);
const P10=[
 [ // W1
  {f:'Beine, Brust & Schultern',d:'Die Seitheben-Slots sind optional – nicht fürs Total, sondern für runde Schultern. Der Rücken wird beim Aufwärmen für das Snatch Grip Deadlift wahrscheinlich ziemlich müde sein – das ist durch das Kniebeugen-Volumen davor normal, deshalb ist das RPE etwas kontrollierter. Das wöchentliche Gesamtvolumen ist König. Das Kniebeugen-RPE ist deutlich niedriger, kein Kreuzheben an diesem Tag – bis W3 kommt ein 5×5 @ RPE 7. Jede Woche baut auf der vorherigen auf.',b:[
   B('csq',4,'6','4×6 @ RPE 5,5 im letzten Satz',{h:'m',rpe:5.5}),
   B('sgdl',3,'6','3×6 @ RPE 6 im Schnitt – Snatch Grip Deadlift, konventioneller Stand',{h:'m',rpe:6}),
   B('ecc',3,'5','3×5 @ RPE 6,5 im letzten Satz',{h:'l',rpe:6.5}),
   B('dlr',3,'13','Optional: 3×13 @ RPE 7 in jedem Satz',{h:'m',rpe:7,opt:1})]},
  {f:'Brust & Rücken',d:'Bank-Volumen mit Top-Satz von 10 und Backoffs mit 97 % und 94 % – dazu Close Grip und Bizeps.',b:[
   B('pbb',1,'1','1 Single @ RPE 5',{h:'l',rpe:5}),
   B('pbb',1,'10','1×10 @ RPE 6,5',{h:'h',rpe:6.5}),
   B('pbb',1,'10','1×10 mit 97 % der Last des 10er-Top-Satzes',TOPB(97,{h:'l'})),
   B('pbb',2,'10','2×10 mit 94 % der Last des 10er-Top-Satzes',TOPB(94,{h:'l',back:2})),
   B('cgb',2,'12','2×12 @ RPE 6 im ersten Satz',{h:'m',rpe:6}),
   B('pcurl',4,'10','4×10 @ RPE 7 in jedem Satz',{h:'m',rpe:7}),
   B('ccurl',2,'AMRAP','Optional: 2 Sätze bis zum Muskelversagen – Last für mind. 10 Wdh im ersten Satz',{rpe:10,opt:1})]},
  {f:'Rücken & Kreuzheben',d:'Das Kreuzheben ist in diesem Zyklus frischer als sonst – keine Kniebeugen davor, und es ist der einzige Lift mit weniger Volumen in dieser Phase. Es gibt mehr Abwechslung, aber nimm das Kreuzheben trotzdem nicht auf die leichte Schulter: streng starten und dir keine mentalen Grenzen setzen, während die Triples über die Wochen geduldig steigen. Hast du im 8-Wochen-Programm die einbeinige Variante gemacht, jetzt Last UND 1 Wdh pro Satz steigern.',b:[
   B('cdl',1,'3','1×3 @ RPE 6',{h:'h',rpe:6}),
   B('cdl',3,'3','3×3 @ RPE 5,5 im letzten Satz',{h:'m',rpe:5.5}),
   B('slp',3,'9','3×9 @ RPE 7 im letzten Satz – Glute-Bias',{sw:'bss',h:'m',rpe:7}),
   B('shc',3,'10','3×10 @ RPE 7 in jedem Satz',{sw:'sgm',h:'m',rpe:7}),
   B('nlat',4,'8','4×8 @ RPE 7 im Schnitt',{h:'m',rpe:7})]},
  {f:'Beine & Brust',d:'Für den 3. Zehner: 94 % des Top-Satzes, wenn der 2. Satz bei RPE 6–6,5 lief – bei RPE 5,5 oder leichter die Last gleich lassen (97 %). Die Kniebeuge bleibt bei den Backoffs bewusst auf moderatem Hype, weil das Satzvolumen etwas geringer ist und Hype die Kniebeuge stärker beeinflusst als die Bank. Der Leg-Press-Slot soll bewusst KEINE Achsenlast auf der Wirbelsäule haben – deshalb ist ein Belt Squat eine Alternative, ein Hack Squat nicht; Bulgarian Split Squats sind okay.',b:[
   B('csq',1,'1','1 Single @ RPE 5',{h:'l',rpe:5}),
   B('csq',1,'10','1×10 @ RPE 6,5',{h:'h',rpe:6.5}),
   B('csq',1,'10','1×10 mit 97 % der Last des Top-Satzes',TOPB(97,{h:'m'})),
   B('csq',1,'10','1×10 mit 94 % des Top-Satzes ODER gleiche Last wie Satz 2 – siehe Tagesinfo',TOPB(94,{h:'m',back:2})),
   B('lp',3,'9-12','3×9–12 @ RPE 7 im Schnitt',{sw:'bbss',h:'m',rpe:7}),
   B('pbb',4,'6','4×6 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('cgb',2,'8','2×8 @ RPE 6 im letzten Satz',{h:'m',rpe:6})]}],
 [ // W2
  {f:'Beine, Schultern & Brust',d:'Ein geradliniger Aufbau zur Vorwoche. Weiter aufbauen – nächste Woche kommt das 5×5 bei der Kniebeuge, dann geht es in den RPE-7-Bereich.',b:[
   B('csq',4,'6','4×6 @ RPE 6,5 im letzten Satz',{h:'m',rpe:6.5}),
   B('sgdl',3,'6','3×6 @ RPE 6,5 im Schnitt',{h:'m',rpe:6.5}),
   B('ecc',3,'5','3×5 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('dlr',2,'14','Optional: 2×14 mit der Last der ersten 2 Sätze letzter Woche',{h:'h',opt:1,src:[0,0,3]}),
   B('dlr',1,'AMRAP','Optional: 1 Satz bis zum echten Muskelversagen mit der Last des 3. Satzes letzter Woche',{opt:1,rpe:10,src:[0,0,3]})]},
  {f:'Brust & Rücken',d:'Wie letzte Woche, mit etwas höherem RPE beim Top-Satz.',b:[
   B('pbb',1,'1','1 Single @ RPE 5,5',{h:'l',rpe:5.5}),
   B('pbb',1,'10','1×10 @ RPE 7',{h:'h',rpe:7}),
   B('pbb',1,'10','1×10 mit 97 % der Last des 10er-Top-Satzes',TOPB(97,{h:'l'})),
   B('pbb',2,'10','2×10 mit 94 % der Last des 10er-Top-Satzes',TOPB(94,{h:'l',back:2})),
   B('cgb',2,'11','2×11 @ RPE 6 im ersten Satz',{h:'m',rpe:6}),
   B('pcurl',4,'10','4×10 @ RPE 8 in jedem Satz',{h:'m',rpe:8}),
   B('ccurl',2,'AMRAP','Optional: 2 Sätze bis zum Muskelversagen – Last für mind. 10 Wdh im ersten Satz',{rpe:10,opt:1})]},
  {f:'Rücken & Kreuzheben',d:'Die Triples steigen weiter geduldig. Beim Latzug richtig pushen!',b:[
   B('cdl',1,'3','1×3 @ RPE 6,5',{h:'h',rpe:6.5}),
   B('cdl',3,'3','3×3 @ RPE 6 im letzten Satz',{h:'m',rpe:6}),
   B('slp',3,'9','3×9 @ RPE 7,5 im letzten Satz – Glute-Bias',{sw:'bss',h:'m',rpe:7.5}),
   B('shc',3,'10','3×10 @ RPE 8 in jedem Satz',{sw:'sgm',h:'m',rpe:8}),
   B('nlat',4,'8','4×8 @ RPE 8–8,5 im Schnitt – hier richtig pushen!',{h:'h',rpe:8})]},
  {f:'Beine & Brust',d:'Für den 3. Zehner: 94 % des Top-Satzes, wenn der 2. Satz bei RPE 6–6,5 oder schwerer lief – sonst gleiche Last (97 %). Beim Bank-4×6 2,5–5 kg mehr als letzte Woche (Mikroscheiben sind für leichtere Lifter okay).',b:[
   B('csq',1,'1','1 Single @ RPE 5,5',{h:'l',rpe:5.5}),
   B('csq',1,'10','1×10 @ RPE 7',{h:'h',rpe:7}),
   B('csq',1,'10','1×10 mit 97 % der Last des Top-Satzes',TOPB(97,{h:'m'})),
   B('csq',1,'10','1×10 mit 94 % des Top-Satzes ODER gleiche Last wie Satz 2 – siehe Tagesinfo',TOPB(94,{h:'m',back:2})),
   B('lp',3,'12','3×12 @ RPE 7,5 im Schnitt',{sw:'bbss',h:'m',rpe:7.5}),
   B('pbb',1,'6','1×6 @ RPE 8',{h:'m',rpe:8}),
   B('pbb',4,'6','4×6 mit 2,5–5 kg mehr als letzte Woche',{h:'m',src:[0,3,5],add:2.5}),
   B('cgb',2,'8','2×8 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('pcurl',4,'10','Optional: 4×10 @ RPE 8 in jedem Satz',{h:'m',rpe:8,opt:1}),
   B('ccurl',2,'AMRAP','Optional: 2 Sätze bis zum Muskelversagen – Last für mind. 10 Wdh im ersten Satz',{rpe:10,opt:1})]}],
 [ // W3
  {f:'Beine, Schultern & Brust',d:'Jetzt ist die Intensität im Kern des Zyklus angekommen, mit dem 5×5 bei der Kniebeuge. Diese und die nächste Woche machen die Phase so effektiv wie möglich. Konzentriert bleiben!',b:[
   B('csq',5,'5','5×5 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('sgdl',3,'6','3×6 @ RPE 7 im Schnitt',{h:'m',rpe:7}),
   B('ecc',3,'5','3×5 @ RPE 7,5 im letzten Satz',{h:'m',rpe:7.5}),
   B('dlr',3,'13','Optional: 3×13 @ RPE 8 in jedem Satz',{h:'m',rpe:8,opt:1})]},
  {f:'Brust & Rücken',d:'Top-Satz jetzt 8 Wdh, Backoffs wieder mit 97 % und 94 %. Beim Bizeps steigt der Hype.',b:[
   B('pbb',1,'1','1 Single @ RPE 6',{h:'l',rpe:6}),
   B('pbb',1,'8','1×8 @ RPE 6,5',{h:'h',rpe:6.5}),
   B('pbb',1,'8','1×8 mit 97 % der Last des Top-Satzes',TOPB(97,{h:'l'})),
   B('pbb',2,'8','2×8 mit 94 % der Last des Top-Satzes',TOPB(94,{h:'l',back:2})),
   B('cgb',2,'10','2×10 @ RPE 6 im ersten Satz',{h:'m',rpe:6}),
   B('pcurl',4,'8-10','4×8–10 @ RPE 8 in jedem Satz – Hype jetzt höher als letzte Woche',{h:'h',rpe:8}),
   B('ccurl',2,'AMRAP','Optional: 2 Sätze bis zum Muskelversagen – Last für mind. 10 Wdh im ersten Satz',{rpe:10,opt:1})]},
  {f:'Rücken & Kreuzheben',d:'Die Triples steigen weiter. Beim Latzug weiter hart pushen!',b:[
   B('cdl',1,'3','1×3 @ RPE 7',{h:'h',rpe:7}),
   B('cdl',3,'3','3×3 @ RPE 6,5 im letzten Satz',{h:'m',rpe:6.5}),
   B('slp',3,'9','3×9 @ RPE 8 im letzten Satz – Glute-Bias',{sw:'bss',h:'m',rpe:8}),
   B('shc',3,'8-10','3×8–10 @ RPE 8 in jedem Satz',{sw:'sgm',h:'m',rpe:8}),
   B('nlat',4,'8','4×8 @ RPE 8–8,5 im Schnitt – weiter hart pushen!',{h:'h',rpe:8})]},
  {f:'Beine & Brust',d:'Für den 3. Achter: 94 % des Top-Satzes, wenn der 2. Satz bei RPE 6,5 oder schwerer lief – lief er leichter, gleiche Last (97 %).',b:[
   B('csq',1,'1','1 Single @ RPE 6',{h:'l',rpe:6}),
   B('csq',1,'8','1×8 @ RPE 6,5',{h:'h',rpe:6.5}),
   B('csq',1,'8','1×8 mit 97 % der Last des Top-Satzes',TOPB(97,{h:'m'})),
   B('csq',1,'8','1×8 mit 94 % des Top-Satzes ODER gleiche Last wie Satz 2 – siehe Tagesinfo',TOPB(94,{h:'m',back:2})),
   B('lp',3,'12','3×12 @ RPE 8 im Schnitt',{sw:'bbss',h:'h',rpe:8}),
   B('pbb',6,'5','6×5 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('cgb',1,'8','1×8 @ RPE 8–8,5 – der letzte Close-Grip-Satz des Zyklus, hart pushen!',{h:'h',rpe:8}),
   B('pcurl',4,'8-10','Optional: 4×8–10 @ RPE 8 in jedem Satz – Hype höher als letzte Woche',{h:'h',rpe:8,opt:1}),
   B('ccurl',2,'AMRAP','Optional: 2 Sätze bis zum Muskelversagen – Last für mind. 10 Wdh im ersten Satz',{rpe:10,opt:1})]}],
 [ // W4
  {f:'Brust, Schultern & Beine',d:'Wahrscheinlich die härteste Einheit des Zyklus – der letzte 5×5-Tag. Nächste Woche sinkt das Volumen um 40 % (2 Sätze), und der Oberkörper beginnt an diesem Tag einen echten Deload: Die 3-s-Exzentrik wird durch leichtes Comp-Bankdrücken ersetzt. Also jetzt aggressiv durchziehen!',b:[
   B('csq',5,'5','5×5 @ RPE 7,5 im 5. Satz',{h:'m',rpe:7.5}),
   B('sgdl',3,'6','3×6 @ RPE 7,5 im Schnitt',{h:'h',rpe:7.5}),
   B('ecc',1,'5','1×5 @ RPE 8,5–9 – hart pushen als konservativer 5er-Test',{h:'h',rpe:8.5}),
   B('ecc',1,'5','1×5 @ RPE 8',{h:'m',rpe:8}),
   B('dlr',2,'14','Optional: 2×14 mit der Last der ersten 2 Sätze letzter Woche',{h:'h',opt:1,src:[2,0,3]}),
   B('dlr',1,'AMRAP','Optional: 1 Satz bis zum Muskelversagen mit der Last des 3. Satzes letzter Woche',{h:'h',opt:1,rpe:10,src:[2,0,3]})]},
  {f:'Brust & Rücken',d:'Ein riesiger Tag – du wirst am nächsten Tag wahrscheinlich ordentlich Muskelkater haben, vor allem vom letzten Satz bis zum Versagen beim oberen Rücken. Zieh das Volumen durch – solche Tage bringen langfristig großen Fortschritt.',b:[
   B('pbb',1,'1','1 Single @ RPE 6,5',{h:'l',rpe:6.5}),
   B('pbb',1,'8','1×8 @ RPE 7',{h:'h',rpe:7}),
   B('pbb',1,'8','1×8 mit 97 % der Last des Top-Satzes',TOPB(97,{h:'l'})),
   B('pbb',2,'8','2×8 mit 92–94 % der Last des Top-Satzes',TOPB(93,{h:'l',back:2})),
   B('pcurl',4,'8-10','4×8–10 @ RPE 8,5–9 in jedem Satz – Hype höher als letzte Woche',{h:'h',rpe:8.5}),
   B('ccurl',2,'AMRAP','Optional: 2 Sätze bis zum Muskelversagen – Last für mind. 10 Wdh im ersten Satz',{rpe:10,opt:1})]},
  {f:'Rücken & Kreuzheben',d:'Erwarte nicht, dass sich das Kreuzheben beim abschließenden Triple ganz frisch anfühlt – der Zyklus steckt in den Knochen. Durch den Kreuzheben-Test in W4 bleibt W5 frisch für den Kniebeugen-10RM-Test. Alles, was du hier schaffst, ist ein großer Bonus – vielleicht sogar ein Triple-Rekord oder ein projizierter 1RM-Rekord. Offen herangehen.',b:[
   B('cdl',1,'3','1×3 @ RPE 8 – der schwerste Satz des Zyklus!',{h:'h',rpe:8}),
   B('cdl',3,'3','3×3 @ RPE 7 im letzten Satz',{h:'m',rpe:7}),
   B('slp',3,'9','3×9 @ RPE 8,5 im letzten Satz – Glute-Bias',{sw:'bss',h:'m',rpe:8.5}),
   B('shc',3,'8-10','3×8–10 @ RPE 8,5 in jedem Satz',{sw:'sgm',h:'h',rpe:8.5}),
   B('nlat',4,'6-8','4×6–8 @ RPE 9 im Schnitt',{h:'h',rpe:9})]},
  {f:'Beine & Brust',d:'Für den 3. Achter: 94 % des Top-Satzes, wenn der 2. Satz bei RPE 7 oder schwerer lief – bei RPE 6,5 oder leichter gleiche Last (97 %). Das Bankvolumen halbiert sich jetzt; Intensität pro Satz steigt weiter, das geringere Gesamtvolumen führt zu einem großen 10RM-Test nächste Woche.',b:[
   B('csq',1,'1','1 Single @ RPE 6,5',{h:'l',rpe:6.5}),
   B('csq',1,'8','1×8 @ RPE 7',{h:'h',rpe:7}),
   B('csq',1,'8','1×8 mit 97 % der Last des Top-Satzes',TOPB(97,{h:'m'})),
   B('csq',1,'8','1×8 mit 94 % des Top-Satzes ODER gleiche Last wie Satz 2 – siehe Tagesinfo',TOPB(94,{h:'m',back:2})),
   B('pbb',1,'5','1×5 @ RPE 7,5',{h:'h',rpe:7.5}),
   B('pbb',2,'5','2×5 @ RPE 7,5 im 2. Satz',{h:'m',rpe:7.5})]}],
 [ // W5
  {f:'Beine, Brust & Schultern',d:'Keine leichte Einheit, aber durch den Volumenrückgang und weniger Maschinenarbeit letzte Woche bist du deutlich bereiter für den Kniebeugen-Test. Seitheben und Kreuzheben laufen hier im echten Deload.',b:[
   B('csq',3,'5','3×5 @ RPE 6 im letzten Satz',{h:'l',rpe:6}),
   B('sgdl',3,'4','3×4 @ RPE 5 im Schnitt',{h:'l',rpe:5}),
   B('pbb',2,'5','2×5 @ RPE 5 im ersten Satz',{h:'l',rpe:5}),
   B('dlr',2,'11','Optional: 2×11 @ RPE 6,5 im Schnitt',{h:'l',rpe:6.5,opt:1})]},
  {f:'Brust & Rücken · 10RM-Test',d:'Heute wird das 10RM beim Bankdrücken getestet. Viel Erfolg!',b:[
   B('pbb',1,'10','10RM finden – RPE 8,5–10 ist okay – KEINE Fehlversuche – maximaler Hype',{h:'h',rpe:9}),
   B('pbb',3,'5','3×5 @ RPE 5 im Schnitt',{h:'l',rpe:5}),
   B('nlat',2,'10-12','2×10–12 @ RPE 6,5 im letzten Satz',{h:'l',rpe:6.5}),
   B('ilat',2,'10-12','2×10–12 @ RPE 6,5 im letzten Satz',{h:'l',rpe:6.5})]},
  {f:'Rücken & Kreuzheben',d:'Ein angenehmer, leichter Deload-Tag – dadurch bist du für den Kniebeugen-10RM-Test frischer. Beim Preacher Curl steigt das Volumen, weil der optionale Cable Curl wegfällt (4 statt 5 Bizepssätze, bei deutlich niedrigerem RPE). Hast du den Cable Curl bisher ausgelassen, hier nur 3 Sätze Preacher Curl.',b:[
   B('cdl',4,'2','4×2 @ RPE 5 im Schnitt',{h:'l',rpe:5}),
   B('slp',2,'11','2×11 @ RPE 6,5 im letzten Satz – Glute-Bias',{sw:'bss',h:'l',rpe:6.5}),
   B('shc',2,'12-14','2×12–14 @ RPE 6,5 in jedem Satz',{sw:'sgm',h:'l',rpe:6.5}),
   B('pcurl',4,'11-13','4×11–13 @ RPE 6,5 in jedem Satz – siehe Tagesinfo',{h:'l',rpe:6.5})]},
  {f:'Beine & Brust · 10RM-Test',d:'Der Kniebeugen-10RM-Test – RPE 8,5–10 ist okay, aber keine Fehlversuche. Danach 3-s-Pause-Bench als Single und Triples sowie Incline DB Bench.',b:[
   B('csq',1,'10','10RM finden – RPE 8,5–10 ist okay – KEINE Fehlversuche – maximaler Hype',{h:'h',rpe:9}),
   B('pb3',1,'1','1 Single @ RPE 6',{h:'h',rpe:6}),
   B('pb3',1,'3','1×3 @ RPE 6,5',{h:'m',rpe:6.5}),
   B('pb3',3,'3','3×3 mit 95 % der Last des 3er-Top-Satzes',TOPB(95,{h:'l'})),
   B('idb',2,'8','2×8 @ RPE 7 im letzten Satz',{h:'m',rpe:7})]}]
];
const INFO10={};

/* ===================== Candito 3RM-Phase (V2.1) ===================== */
Object.assign(EX,{
 hbct:{n:'High Bar Constant Tension Squat',g:'sq',m:1,t:'High-Bar-Position, normal beugen – aber die letzten 10 % oben NICHT strecken, sofort in die nächste Wdh. Gleiche Standbreite wie deine Wettkampf-Kniebeuge, Gürtel und Kniebandagen wie gewohnt. Wer im Wettkampf High Bar beugt, nimmt stattdessen Front Squats.'},
 slext:{n:'Single Leg Extension',g:'acc',m:0,t:'Einbeinig an der Beinstreckmaschine. Bis zum echten Muskelversagen – jede Woche minimal mehr Gewicht.'},
 sdlr:{n:'Seated DB Lateral Raise',g:'acc',m:0,t:'Sitzend, kontrolliert, kein Schwung. Optional.'}
});
const DAYS3=[{tag:'Tag 1',wd:'Sa',wdl:'Samstag',off:0},{tag:'Tag 2',wd:'So',wdl:'Sonntag',off:1},{tag:'Tag 3',wd:'Di',wdl:'Dienstag',off:3},{tag:'Tag 4',wd:'Do',wdl:'Donnerstag',off:5}];
const WEEKS3=['Einstieg','Aufbau','Steigerung','Härteste Woche','3RM-Test'];
const ORIG3=['Montag','Mittwoch','Freitag','Samstag'];
const FUB3='Feet Up Bench nur als Weitgriff-Drücker – mit moderatem Griff stattdessen Close Grip Bench Press mit derselben RPE-Vorgabe (8er statt 12er).';
const P3=[
 [ // W1
  {f:'Beine & Brust',d:'Hochbeuger im Wettkampf: High Bar Constant Tension Squat durch Front Squat ersetzen. 3RM + 10-Wochen-Programm ergeben zusammen eine 15-Wochen-Progression mit steigender Spezifität: Constant Tension Squats (3RM) → High Bar Squats (2er-Phase) → Low Bar Paused Squat (letzte 4 Wochen).',b:[
   B('hbct',1,'8','1×8 @ RPE 6 – moderater Hype',{h:'m',rpe:6}),
   B('hbct',2,'8','2×8 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('slext',2,'AMRAP','2 Sätze bis zum Muskelversagen mit einer Last für mind. 15 Wdh im ersten Satz – hoher Hype',{h:'h',rpe:10}),
   B('pbb',1,'4','1×4 @ RPE 6 – moderater Hype',{h:'m',rpe:6}),
   B('pbb',3,'4','3×4 mit 96 % des Top-Satzes',TOPB(96)),
   B('fub',3,'12','3×12 @ RPE 5 in jedem Satz – niedriger bis moderater Hype · '+FUB3,{h:'l',rpe:5}),
   B('sdlr',3,'12','(Optional) 3×12 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7,opt:1})]},
  {f:'Beine & Rücken',d:'Das Kreuzheben-Volumen soll mit exzellenter Stangengeschwindigkeit starten. RPE 4 ist schwer zu schätzen – Ziel ist ein starkes 5×5 @ RPE 7 in Woche 4; plane rückwärts mit gleichen Sprüngen (z. B. 192,5 → 205 kg). Klappt das nicht: ca. 70 % vom 1RM. Trotzdem lange Pausen – das schwerste mögliche RPE-4-Training, kein „lockerer Tag“ im Kopf.',b:[
   B('cdl',5,'5','5×5 @ RPE 4 im Schnitt – moderater Hype',{h:'m',rpe:4}),
   B('pb3',1,'3','1×3 @ RPE 6 – moderater Hype',{h:'m',rpe:6}),
   B('pb3',3,'3','3×3 mit 95 % der Last des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'})),
   B('mrow',3,'10','3×10 @ RPE 7,5 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:7.5}),
   B('lat',3,'12','3×12 @ RPE 7 in jedem Satz',{rpe:7}),
   B('ccurl',3,'10','3×10 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8})]},
  {f:'Brust',d:'Der Haupt-Banktag der Woche: erst ein schweres Triple, dann der 9er @ RPE 8,5 als Rep-Satz und zwei Backoffs.',b:[
   B('pbb',1,'3','1×3 @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('pbb',1,'9','1×9 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'9','2×9 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',1,'12','1×12 @ RPE 6 – moderater Hype · '+FUB3,{h:'m',rpe:6}),
   B('fub',2,'12','2×12 mit 95 % der Last des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('idb',3,'8','3×8 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7}),
   B('sacc',2,'AMRAP','2 Sätze bis zum echten Muskelversagen mit einer Last für mind. 15 Wdh – hoher Hype',{h:'h',rpe:10})]},
  {f:'Beine',d:'Alle Kniebeugen-Top-Sätze jetzt mit hohem Hype – jede Woche größere Sprünge, ohne die zweiwöchigen Wellen des 8 Week. Volumen in 5ern wie in der 10RM-Phase, ab W3/W4 aber schon bei RPE 7,5–8. Die wichtigste Einheit der Woche. Die Leg Extensions hier bleiben locker – Tag 1 wird hart gepusht.',b:[
   B('csq',1,'3','1×3 @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('csq',4,'5','4×5 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('cdl',1,'10','1×10 @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('cdl',1,'10','1×10 mit 97 % der Last des Top-Satzes – moderater Hype',TOPB(97,{h:'m'})),
   B('cdl',1,'10','1×10 mit 94 % der Last des Top-Satzes – moderater Hype',TOPB(94,{h:'m',back:2})),
   B('lext',3,'12','(Optional) 3×12 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7,opt:1})]}],
 [ // W2
  {f:'Beine & Brust',d:'Woche 2: Constant Tension Squats und Bank-4er jeweils eine RPE-Stufe höher. Single Leg Extensions mit minimal mehr Last bis zum echten Versagen.',b:[
   B('hbct',1,'8','1×8 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('hbct',2,'8','2×8 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('slext',2,'AMRAP','2 Sätze bis zum echten Versagen mit minimal mehr Last als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[0,0,2],inc:1}),
   B('pbb',1,'4','1×4 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('pbb',3,'4','3×4 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('fub',3,'12','3×12 @ RPE 6 in jedem Satz – moderater Hype · '+FUB3,{h:'m',rpe:6}),
   B('sdlr',2,'13','(Optional) 2×13 mit gleicher Last wie letzte Woche – moderater Hype',{h:'m',same:1,opt:1}),
   B('sdlr',1,'AMRAP','(Optional) 1×AMRAP bis RPE 9 mit gleicher Last wie letzte Woche – hoher Hype',{h:'h',rpe:9,same:1,opt:1})]},
  {f:'Beine & Rücken',d:'Das Kreuzheben nimmt Fahrt auf – schnelle Stange, noch etwas Muskelkater von den 10ern. Die 5×5 dieser und nächster Woche laufen meist am rundesten, weil sich die Anpassung an das Volumen einstellt.',b:[
   B('cdl',5,'5','5×5 @ RPE 5 im Schnitt – moderater Hype',{h:'m',rpe:5}),
   B('pb3',1,'3','1×3 mit gleicher Last wie letzte Woche – moderater Hype',{h:'m',same:1}),
   B('pb3',3,'3','3×3 mit 95 % der Last des Top-Satzes',TOPB(95)),
   B('mrow',3,'10','3×10 @ RPE 8 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:8}),
   B('lat',3,'11','3×11 @ RPE 7 in jedem Satz',{rpe:7}),
   B('ccurl',3,'10','3×10 @ RPE 8,5 in jedem Satz – hoher Hype',{h:'h',rpe:8.5})]},
  {f:'Brust',d:'Bank-Rep-Satz jetzt 1×8 @ RPE 8,5. Feet Up Bench mit 12er-Top-Satz und Backoffs mit RPE-7-Deckel.',b:[
   B('pbb',1,'3','1×3 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',1,'8','1×8 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'8','2×8 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',1,'12','1×12 @ RPE 7 – moderater Hype · '+FUB3,{h:'m',rpe:7}),
   B('fub',2,'12','2×12 mit 93–95 % der Last des Top-Satzes – RPE-7-Deckel',TOPB(94,{cap:7})),
   B('idb',3,'8','3×8 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8}),
   B('sacc',2,'AMRAP','2 Sätze bis zum echten Versagen mit einem Inkrement mehr als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[0,2,6],inc:1})]},
  {f:'Beine',d:'Kniebeugen-Triple @ RPE 7 mit hohem Hype, dann 4×5. Kreuzheben-10er eine halbe Stufe schwerer.',b:[
   B('csq',1,'3','1×3 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('csq',4,'5','4×5 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('cdl',1,'10','1×10 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('cdl',1,'10','1×10 mit 97 % der Last des Top-Satzes – moderater Hype',TOPB(97,{h:'m'})),
   B('cdl',1,'10','1×10 mit 94 % der Last des Top-Satzes – moderater Hype',TOPB(94,{h:'m',back:2})),
   B('lext',3,'12','(Optional) 3×12 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7,opt:1})]}],
 [ // W3
  {f:'Beine & Brust',d:'Mehr Hype und die motorische Anpassung in Woche 3 sollten beim Constant-Tension-Top-Satz eine höhere Last bringen – bei exakt gleichem RPE wie letzte Woche. Nächste Woche der letzte Sprung auf RPE 8. Beim Bank-4er jetzt hoher Hype; dafür wird der Rep-Satz am Haupttag leichter (1×7 statt 1×8).',b:[
   B('hbct',1,'8','1×8 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('hbct',2,'8','2×8 mit 92–94 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(93,{h:'m',cap:7})),
   B('slext',2,'AMRAP','2 Sätze bis zum Versagen mit minimal mehr Last als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[1,0,2],inc:1}),
   B('pbb',1,'4','1×4 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',3,'4','3×4 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('fub',3,'12','3×12 @ RPE 7 in jedem Satz – moderater Hype · '+FUB3,{h:'m',rpe:7}),
   B('sdlr',3,'12','(Optional) 3×12 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7,opt:1})]},
  {f:'Beine & Rücken',d:'Nächste Woche kommt das schwerste 5×5 des Zyklus – heute geduldig bleiben und die richtige Last für RPE 6 wählen.',b:[
   B('cdl',5,'5','5×5 @ RPE 6 im Schnitt – moderater Hype',{h:'m',rpe:6}),
   B('pb3',1,'3','1×3 @ RPE 7 – moderater Hype (der Hype steigt hier bewusst nicht)',{h:'m',rpe:7}),
   B('pb3',3,'3','3×3 mit 95 % der Last des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'})),
   B('mrow',1,'8','1×8 @ RPE 7 – hoher Hype',{sw:'row',h:'h',rpe:7}),
   B('mrow',2,'8','2×8 @ RPE 7 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:7}),
   B('lat',3,'9-11','3×9–11 @ RPE 7,5 in jedem Satz – Last Satz für Satz an das RPE anpassen',{rpe:7.5}),
   B('ccurl',3,'8','3×8 @ RPE 8,5 in jedem Satz – hoher Hype',{h:'h',rpe:8.5})]},
  {f:'Brust',d:'Bank-Triple jetzt @ RPE 8. Feet Up Bench als konservatives 12RM – hier richtig pushen.',b:[
   B('pbb',1,'3','1×3 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('pbb',1,'7','1×7 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'7','2×7 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',1,'12','1×12 @ RPE 8,5 – hoher Hype – bei diesem konservativen 12RM richtig pushen · '+FUB3,{h:'h',rpe:8.5}),
   B('idb',3,'6','3×6 @ RPE 7 in jedem Satz – hoher Hype',{h:'h',rpe:7}),
   B('sacc',2,'AMRAP','2 Sätze bis zum echten Versagen mit einem Inkrement mehr als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[1,2,6],inc:1})]},
  {f:'Beine',d:'Die 3×12 Leg Extensions fallen nächste Woche weg, um vor dem Test in Woche 5 Erholung zu gewinnen. Dann hast du 4 Wochen Versagenstraining an der Leg Extension und 3 Wochen RPE-7-Arbeit gesammelt – so viel Arbeit wie möglich, ohne die Top-Sätze zu beeinträchtigen.',b:[
   B('csq',1,'3','1×3 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('csq',4,'5','4×5 @ RPE 7 im letzten Satz – hoher Hype',{h:'h',rpe:7}),
   B('cdl',1,'8','1×8 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('cdl',1,'8','1×8 mit 97 % der Last des Top-Satzes – moderater Hype',TOPB(97,{h:'m'})),
   B('cdl',1,'8','1×8 mit 94 % der Last des Top-Satzes – moderater Hype',TOPB(94,{h:'m',back:2})),
   B('lext',3,'12','(Optional) 3×12 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7,opt:1})]}],
 [ // W4
  {f:'Beine & Brust',d:'Nächste Woche fallen die Single Leg Extensions weg – Erholung vor dem 3RM-Test. Nach dieser Einheit ist die Ermüdung wahrscheinlich am höchsten; wundere dich nicht, wenn sich der Unterkörper beim Aufwärmen der nächsten Einheiten etwas flach anfühlt – die Leistung bleibt hoch.',b:[
   B('hbct',1,'8','1×8 @ RPE 8 – hoher Hype – push hart für einen Wiederholungsrekord!',{h:'h',rpe:8}),
   B('hbct',2,'8','2×8 mit 90–93 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(91.5,{h:'m',cap:7})),
   B('slext',2,'AMRAP','2 Sätze bis zum Versagen mit minimal mehr Last als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[2,0,2],inc:1}),
   B('pbb',1,'4','1×4 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('pbb',3,'4','3×4 mit 92–94 % der Last – RPE-7,5-Deckel – moderater Hype',TOPB(93,{h:'m',cap:7.5})),
   B('fub',3,'6','3×6 mit einer Last, die du 12× schaffst – durch den niedrigen Hype ca. RPE 6 im letzten Satz · '+FUB3,{h:'l',rpe:6}),
   B('sdlr',2,'13','(Optional) 2×13 mit gleicher Last wie letzte Woche – moderater Hype',{h:'m',same:1,opt:1}),
   B('sdlr',1,'AMRAP','(Optional) 1×AMRAP bis RPE 9 mit gleicher Last wie letzte Woche – hoher Hype',{h:'h',rpe:9,same:1,opt:1})]},
  {f:'Beine & Rücken',d:'Der wichtigste Kreuzheben-Tag des Zyklus. Nächste Woche sinken Satzzahl und RPE – dieses 5×5 mit guter Stangengeschwindigkeit und vielleicht mehr Last als erwartet abliefern. Auch Rücken und Bizeps entlasten nächste Woche – heute also pushen.',b:[
   B('cdl',5,'5','5×5 @ RPE 7 im Schnitt – hoher Hype',{h:'h',rpe:7}),
   B('pb3',1,'3','1×3 mit gleicher Last wie letzte Woche – hoher Hype',{h:'h',same:1}),
   B('pb3',3,'3','3×3 mit 95 % der Last des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('mrow',1,'8','1×8 @ RPE 8 – hoher Hype',{sw:'row',h:'h',rpe:8}),
   B('mrow',2,'8','2×8 @ RPE 8 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:8}),
   B('lat',3,'9-11','3×9–11 @ RPE 8,5 in jedem Satz – Last Satz für Satz an das RPE anpassen',{rpe:8.5}),
   B('ccurl',3,'8','3×8 @ RPE 9 in jedem Satz – hoher Hype',{h:'h',rpe:9})]},
  {f:'Brust',d:'Letzter schwerer Banktag vor dem Test: Triple @ RPE 8 und 1×6 @ RPE 8,5. Feet Up Bench entfällt.',b:[
   B('pbb',1,'3','1×3 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('pbb',1,'6','1×6 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'6','2×6 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('idb',3,'6','3×6 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8}),
   B('sacc',2,'AMRAP','2 Sätze bis zum echten Versagen mit einem Inkrement mehr als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[2,2,5],inc:1})]},
  {f:'Beine',d:'Nächste Woche testest du das konservative 3RM in der Kniebeuge und das 10RM im Kreuzheben. Heute die entscheidende Brücke: deutlich schwerer als letzte Woche, aber mit genug Luft für den Test. Das Volumen in den 5ern sollte im Vergleich zu früher sehr stark sein – diese Basis trägt in die nächsten Phasen.',b:[
   B('csq',1,'3','1×3 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('csq',4,'5','4×5 @ RPE 8 im letzten Satz – hoher Hype',{h:'h',rpe:8}),
   B('cdl',1,'8','1×8 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('cdl',1,'8','1×8 mit 96 % der Last des Top-Satzes – moderater Hype',TOPB(96,{h:'m'})),
   B('cdl',1,'8','1×8 mit 93 % der Last des Top-Satzes – moderater Hype',TOPB(93,{h:'m',back:2}))]}],
 [ // W5
  {f:'Beine & Brust',d:'Last für die 5er: schwerer als die 8er-Backoffs der letzten Woche, aber etwas leichter als der 8er-Top-Satz. Single Leg Extensions entfallen – kurze Erholung vor dem 3RM-Test.',b:[
   B('hbct',3,'5','3×5 @ RPE 6,5 im letzten Satz – niedriger Hype (Last zwischen den Backoffs und dem Top-Satz der Vorwoche)',{h:'l',rpe:6.5}),
   B('pbb',1,'3','1×3 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',3,'3','3×3 mit 91–94 % der Last des Top-Satzes – RPE-6,5-Deckel',TOPB(92.5,{cap:6.5})),
   B('sdlr',3,'9','(Optional) 3×9 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5,opt:1})]},
  {f:'Beine & Rücken',d:'Single Arm Curls fallen komplett weg – Deload für das Bodybuilding mit etwas Volumen zum Erhalt. Kreuzheben jetzt erstmals weniger Sätze, ein echter leichter Tag. Der Hype bleibt hoch, weil das RPE um 2 sinkt – mit Absicht explodieren. Später in der Woche testest du dein 10RM!',b:[
   B('cdl',3,'5','3×5 @ RPE 5 im letzten Satz (nicht im Schnitt) – hoher Hype',{h:'h',rpe:5}),
   B('pb3',1,'2','1×2 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('pb3',3,'2','3×2 mit 95 % der Last des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('mrow',2,'10','2×10 @ RPE 6,5 im Schnitt – niedriger Hype',{sw:'row',h:'l',rpe:6.5}),
   B('lat',3,'7','3×7 @ RPE 6,5 im Schnitt – niedriger Hype',{h:'l',rpe:6.5}),
   B('ccurl',3,'10','3×10 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5})]},
  {f:'Brust · 3RM-Test',d:'Der große Tag für das 3RM auf der Bank! Kein Risiko eingehen: RPE 9 bis 9,5 ist völlig in Ordnung, idealerweise kein echtes RPE 10 – und auf keinen Fall Fehlversuche. Der Tag dient gleichzeitig als Deload; die Front Delt Raises darfst du weglassen, wenn du müde bist oder wenig Zeit hast. Erfolgreiche Zyklen stapeln: vom 3RM über das 2RM zu einem neuen, großen 1RM.',b:[
   B('pbb',1,'3','3RM-Test: 1×3 @ RPE 9–9,5 – hoher Hype – keine Fehlversuche',{h:'h',rpe:9}),
   B('pbb',1,'5','1×5 @ RPE 6 – niedriger Hype',{h:'l',rpe:6}),
   B('pbb',2,'5','2×5 mit 95 % der Last des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'})),
   B('ndb',3,'9','3×9 @ RPE 6 im Schnitt – niedriger Hype',{h:'l',rpe:6}),
   B('dfr',2,'10-12','(Optional) 2×10–12 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7,opt:1})]},
  {f:'Beine · 3RM/10RM-Test',d:'Viel Erfolg beim 3RM-Test in der Kniebeuge und beim 10RM im Kreuzheben! Kein Backoff-Volumen im Kreuzheben und stark reduziertes Kniebeugen-Volumen – Testwoche UND Volumen-Deload zugleich. Nächste Woche startet direkt die nächste Phase.',b:[
   B('csq',1,'3','3RM-Test: 1×3 @ RPE 9–9,5 – hoher Hype – keine Fehlversuche',{h:'h',rpe:9}),
   B('csq',3,'4','3×4 @ RPE 5 – niedriger Hype',{h:'l',rpe:5}),
   B('cdl',1,'10','10RM finden – irgendwo zwischen RPE 8,5 und 10 ist okay – hoher Hype und keine Fehlversuche!',{h:'h',rpe:9})]}]
];
const INFO3={};

/* ===================== Candito 10-Wochen-Programm (V2) ===================== */
Object.assign(EX,{
 octe:{n:'Overhead Cable Tricep Extension',g:'acc',m:0,t:'Über Kopf am Kabel, Ellbogen eng und ruhig, volle Dehnung unten.'},
 lhc:{n:'Lying Hamstring Curl',g:'acc',m:0,eq:'mach',t:'Liegend an der Beinbeuger-Maschine, kontrolliert, kein Hohlkreuz. Im 10-Wochen-Programm an Tag 2 Canditos Alternative zur Barbell Back Extension – so in Canditos App gewählt (gleiche Vorgabe).'},
 shc:{n:'Seated Hamstring Curl',g:'acc',m:0,eq:'mach',t:'Sitzender Beinbeuger an der Maschine. Ohne Maschine: Seated Good Morning (Canditos Home-Gym-Option). Im 10-Wochen-Programm optional und nur für konventionelle Kreuzheber (Sumo: Hip Abduction/Adduction).'},
 spoto:{n:'2 s Pause Spoto Press',g:'bp',m:1,t:'Bankdrücken mit 2 Sekunden Pause ca. 1–3 cm über der Brust, ohne sie zu berühren. Wettkampfgriff.'},
 ibp:{n:'Incline Bench Press',g:'bp',m:0,t:'Langhantel-Schrägbankdrücken, moderater Griff, Schulterblätter fest.'},
 cab:{n:'Standing Cable Ab Crunch',g:'acc',m:0,t:'Stehend am Kabel, Rumpf aktiv einrollen. Optional.'},
 sldl:{n:'Stiff Leg Deadlift',g:'dl',m:1,t:'Kniee fast gestreckt, Hüfte nach hinten, Stange nah am Körper – Dehnung im hinteren Oberschenkel.'}
});
const DAYS10W=[{tag:'Tag 1',wd:'Sa',wdl:'Samstag',off:0},{tag:'Tag 2',wd:'So',wdl:'Sonntag',off:1},{tag:'Tag 3',wd:'Di',wdl:'Dienstag',off:3},{tag:'Tag 4',wd:'Do',wdl:'Donnerstag',off:5}];
const WEEKS10W=['Einstieg','Aufbau','Steigerung','Schwere Doubles','2RM-Test','Start Singles','Aufbau','Steigerung','Schwerste Woche','1RM-Test'];
const ORIG10W=['Montag','Mittwoch','Freitag','Samstag'];
const FUBW='Feet Up Bench nur als Weitgriff-Drücker – mit moderatem Griff stattdessen Close Grip Bench Press (je 1 Wdh weniger).';
const HBN='Hochbeuger im Wettkampf: statt High Bar Squat den High Bar Constant Tension Squat nehmen und in jedem Satz 1 Wdh mehr machen.';
const P10W=[
 [ // W1
  {f:'Brust & Beine',d:'Ein eher leichter Tag zum Einstieg in den Block – das Programm startet bewusst leichter und steigert die Ermüdung gleichmäßiger als das 8 Week. '+HBN,b:[
   B('hbs',1,'6','1×6 @ RPE 6 – moderater Hype',{h:'m',rpe:6}),
   B('hbs',2,'6','2×6 mit 96 % des Top-Satzes – moderater Hype',TOPB(96,{h:'m'})),
   B('pbb',1,'2','1×2 @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('pbb',1,'7','1×7 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',2,'7','2×7 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('fub',3,'6','3×6 @ RPE 6 im Schnitt – niedriger Hype · '+FUBW,{h:'l',rpe:6}),
   B('octe',3,'11','3×11 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7})]},
  {f:'Beine & Rücken',d:'Neu in diesem Programm: ein eigener Kreuzheben-Tag. So bekommt der 2er-Top-Satz in den ersten 5 Wochen Priorität. Die Kniebeuge später in der Woche ist dadurch etwas weniger frisch – bei 2× Kniebeuge pro Woche kein großes Thema.',b:[
   B('cdl',1,'2','1×2 @ RPE 5 – hoher Hype',{h:'h',rpe:5}),
   B('cdl',1,'6','1×6 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('cdl',2,'6','2×6 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('xbarbellbackextension',3,'11','3×11 @ RPE 7 in jedem Satz – niedriger Hype',{sw:'lhc',h:'l',rpe:7}),
   B('mrow',1,'6','1×6 @ RPE 7 – hoher Hype – bei dieser mittleren Wdh-Zahl etwas schwerer als sonst',{sw:'row',h:'h',rpe:7}),
   B('mrow',4,'6','4×6 @ RPE 7 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:7}),
   B('pb3',1,'2','1×2 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('pb3',3,'2','3×2 mit 95 % des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'}))]},
  {f:'Arme & Brust',d:'Zweiter Banktag mit Triples und viel Volumen, dazu Arme und Schultern.',b:[
   B('pbb',1,'3','1×3 @ RPE 6 – moderater Hype',{h:'m',rpe:6}),
   B('pbb',5,'3','5×3 mit 96 % des Top-Satzes – moderater Hype',TOPB(96,{h:'m'})),
   B('fub',2,'8','2×8 @ RPE 7 im 2. Satz – hoher Hype · '+FUBW,{h:'h',rpe:7}),
   B('dlr',3,'6-8','3×6–8 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7}),
   B('pcurl',3,'8','3×8 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit einer Last für mind. 15 Wdh im ersten Satz – hoher Hype',{h:'h',rpe:10})]},
  {f:'Beine',d:'Geduldig bleiben und den 2er @ RPE 5 sauber treffen. Am Haupttag startet das Programm bewusst leicht, damit viel Raum für Schwung bleibt. Seated Hamstring Curl nur für konventionelle Kreuzheber (Sumo: Hip Abduction/Adduction) – optional.',b:[
   B('csq',1,'2','1×2 @ RPE 5 – hoher Hype',{h:'h',rpe:5}),
   B('csq',4,'4','4×4 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('pdl',3,'4','3×4 @ RPE 5 im Schnitt – niedriger Hype',{h:'l',rpe:5}),
   B('mach',3,'10','3×10 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7}),
   B('shc',2,'12-15','(Optional) 2×12–15 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8,opt:1})]}],
 [ // W2
  {f:'Brust & Beine',d:'Den 7er-Top-Satz auf der Bank hart pushen – wenn möglich ein Wiederholungsrekord. Nächste Woche geht es auf 5er-Sätze, alle anderen Slots bleiben gleich (RPE steigt überall außer bei den Overhead Tricep Extensions).',b:[
   B('hbs',1,'6','1×6 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('hbs',2,'6','2×6 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('pbb',1,'2','1×2 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('pbb',1,'7','1×7 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'7','2×7 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',3,'6','3×6 @ RPE 6,5 im Schnitt – niedriger Hype · '+FUBW,{h:'l',rpe:6.5}),
   B('octe',3,'11','3×11 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7})]},
  {f:'Beine & Rücken',d:'Hip Abduction/Adduction bzw. Hamstring Curl am Samstag sind kein Muss – nur, wenn du die Belastung sicher verkraftest. Im Zweifel weglassen, damit du am Haupt-Kniebeugentag frisch bist.',b:[
   B('cdl',1,'2','1×2 @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('cdl',1,'6','1×6 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('cdl',2,'6','2×6 mit 92–94 % des Top-Satzes – RPE-6,5-Deckel – moderater Hype',TOPB(93,{h:'m',cap:6.5})),
   B('xbarbellbackextension',3,'11','3×11 @ RPE 7 in jedem Satz – moderater Hype',{sw:'lhc',h:'m',rpe:7}),
   B('mrow',1,'6','1×6 @ RPE 7,5 – hoher Hype',{sw:'row',h:'h',rpe:7.5}),
   B('mrow',4,'6','4×6 @ RPE 7,5 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:7.5}),
   B('pb3',1,'2','1×2 mit gleicher Last wie letzte Woche – moderater Hype',{h:'m',same:1}),
   B('pb3',3,'2','3×2 mit 95 % des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'}))]},
  {f:'Arme & Brust',d:'Bank-Triples eine Stufe schwerer, Backoffs mit RPE-7-Deckel (Last senken, falls nötig).',b:[
   B('pbb',1,'3','1×3 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('pbb',5,'3','5×3 mit 95 % des Top-Satzes – RPE-7-Deckel (Last senken, falls er überschritten würde)',TOPB(95,{cap:7})),
   B('fub',2,'8','2×8 @ RPE 7,5 im letzten Satz – hoher Hype · '+FUBW,{h:'h',rpe:7.5}),
   B('dlr',3,'6-8','3×6–8 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('pcurl',3,'8','3×8 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit ca. 2 kg (5 lbs) mehr pro Kurzhantel als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[0,2,5],add:2})]},
  {f:'Beine',d:'Beim Hack Squat ändert sich nur der Hype. Die Last soll spürbar steigen, während du dich an Übung und Wiederholungsbereich anpasst – das RPE bleibt bei 7, ohne Spitzen in dieser Phase.',b:[
   B('csq',1,'2','1×2 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('csq',4,'4','4×4 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('pdl',3,'4','3×4 @ RPE 6 im Schnitt – niedriger Hype',{h:'l',rpe:6}),
   B('mach',3,'10','3×10 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7}),
   B('shc',2,'12-15','(Optional) 2×12–15 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8,opt:1})]}],
 [ // W3
  {f:'Brust & Beine',d:'Nächste Woche erreicht der High Bar Squat einen echten RPE-8-Top-Satz. Diese Woche solltest du allein durch Trainingsschwung und mehr Hype Last draufpacken können – bei gleichem RPE wie letzte Woche.',b:[
   B('hbs',1,'6','1×6 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('hbs',2,'6','2×6 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('pbb',1,'2','1×2 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',1,'5','1×5 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',2,'5','2×5 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('fub',3,'6','3×6 @ RPE 7 im Schnitt – niedriger Hype · '+FUBW,{h:'l',rpe:7}),
   B('octe',3,'11','3×11 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7})]},
  {f:'Beine & Rücken',d:'Hip Abduction/Adduction bzw. Hamstring Curl bleiben freiwillig – im Zweifel weglassen, damit du am Haupt-Kniebeugentag frisch bist.',b:[
   B('cdl',1,'2','1×2 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('cdl',1,'6','1×6 @ RPE 7,5 – hoher Hype',{h:'h',rpe:7.5}),
   B('cdl',2,'6','2×6 mit 91–94 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(92.5,{h:'m',cap:7})),
   B('xbarbellbackextension',3,'11','3×11 @ RPE 7 in jedem Satz – hoher Hype',{sw:'lhc',h:'h',rpe:7}),
   B('mrow',1,'6','1×6 @ RPE 8 – hoher Hype',{sw:'row',h:'h',rpe:8}),
   B('mrow',4,'6','4×6 @ RPE 8 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:8}),
   B('pb3',1,'2','1×2 @ RPE 7,5 – moderater Hype',{h:'m',rpe:7.5}),
   B('pb3',3,'2','3×2 mit 95 % des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'}))]},
  {f:'Arme & Brust',d:'Nächste Woche kommt hier ein Testsatz auf der Feet-Up-/Close-Grip-Bank – die 2 Sätze heute hart pushen, aber das RPE sauber treffen.',b:[
   B('pbb',1,'3','1×3 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',5,'3','5×3 mit 95 % des Top-Satzes – RPE-7-Deckel (Last senken, falls er überschritten würde)',TOPB(95,{cap:7})),
   B('fub',2,'8','2×8 @ RPE 8 im 2. Satz – hoher Hype · '+FUBW,{h:'h',rpe:8}),
   B('dlr',3,'6-8','3×6–8 @ RPE 8,5 in jedem Satz – hoher Hype',{h:'h',rpe:8.5}),
   B('pcurl',3,'6-8','3×6–8 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit ca. 2 kg (5 lbs) mehr pro Kurzhantel als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[1,2,5],add:2})]},
  {f:'Beine',d:'Nächste Woche ein großer 2er @ RPE 8–8,5 – es wird schwer, mit viel Schwung! Ziel dieser Phase sind weniger Ermüdungsschwankungen als in früheren Phasen; es ist okay, wenn du dich relativ frisch fühlst.',b:[
   B('csq',1,'2','1×2 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('csq',4,'4','4×4 @ RPE 7,5 im letzten Satz – moderater Hype',{h:'m',rpe:7.5}),
   B('pdl',3,'4','3×4 @ RPE 6,5 im Schnitt – niedriger Hype',{h:'l',rpe:6.5}),
   B('shc',2,'12-15','(Optional) 2×12–15 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8,opt:1})]}],
 [ // W4
  {f:'Brust & Beine',d:'Den 2er auf der Bank hart pushen! Das Zubehör wird jetzt überall leichter: die Wdh sinken um 2 (außer bei der Wettkampf-Bank), die Last soll trotzdem steigen, während das RPE sinkt. Damit ist der härteste Teil der ersten 5 Wochen geschafft. Ziel: ein starker 2er und ein 5er-Rekord im Volumen.',b:[
   B('hbs',1,'6','1×6 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('hbs',2,'6','2×6 mit 91–93 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(92,{h:'m',cap:7})),
   B('pbb',1,'2','1×2 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('pbb',1,'5','1×5 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'5','2×5 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',3,'4','3×4 @ RPE 6 im Schnitt – niedriger Hype · '+FUBW,{h:'l',rpe:6}),
   B('octe',2,'9','2×9 @ RPE 6,5 in jedem Satz – moderater Hype',{h:'m',rpe:6.5})]},
  {f:'Beine & Rücken',d:'Den großen 2er im Kreuzheben pushen! Die 3×4 fühlen sich deutlich leichter an als die 3×6 – der 2er ist klar im Fokus. Das Durchschnitts-RPE im Volumen bleibt hoch, die Gesamtwiederholungen sinken für eine starke Testwoche. Back-Extension-Volumen um einen Satz reduziert, optionales Zubehör am Samstag fällt weg.',b:[
   B('cdl',1,'2','1×2 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('cdl',1,'4','1×4 @ RPE 7,5 – hoher Hype – im Zweifel leicht darunter bleiben',{h:'h',rpe:7.5}),
   B('cdl',2,'4','2×4 mit 91–94 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(92.5,{h:'m',cap:7})),
   B('xbarbellbackextension',1,'11','1×11 @ RPE 8 – hoher Hype',{sw:'lhc',h:'h',rpe:8}),
   B('xbarbellbackextension',1,'11','1×11 @ RPE 7,5 – moderater Hype',{sw:'lhc',h:'m',rpe:7.5}),
   B('mrow',1,'6','1×6 @ RPE 8,5–9 – hoher Hype – bei dieser mittleren Wdh-Zahl etwas schwerer als sonst',{sw:'row',h:'h',rpe:8.5}),
   B('mrow',4,'6','4×6 @ RPE 8 in jedem Satz – moderater Hype',{sw:'row',h:'m',rpe:8}),
   B('pb3',1,'2','1×2 @ RPE 7,5 – moderater Hype',{h:'m',rpe:7.5}),
   B('pb3',3,'2','3×2 mit 95 % des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'}))]},
  {f:'Arme & Brust',d:'Eine starke Vorbereitung auf den Test nächste Woche – aber noch kein komplettes Tapering wie im finalen Peak in Woche 9–10.',b:[
   B('pbb',1,'2','1×2 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',4,'2','4×2 mit 91–94 % der Last des Top-Satzes – RPE-6,5-Deckel',TOPB(92.5,{cap:6.5})),
   B('fub',1,'7','1×7 @ RPE 8,5 – hoher Hype – richtig pushen, das wird ein großer Variations-Rekord · '+FUBW,{h:'h',rpe:8.5}),
   B('dlr',3,'6-8','3×6–8 @ RPE 9 in jedem Satz – hoher Hype',{h:'h',rpe:9}),
   B('pcurl',3,'6-8','3×6–8 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit einem Inkrement (ca. 2 kg pro Kurzhantel) mehr als letzte Woche – hoher Hype',{h:'h',rpe:10,src:[2,2,5],add:2})]},
  {f:'Beine',d:'Der letzte 2er-Top-Satz dieser Woche. Im Zweifel eher RPE 8 als 8,5 – hier gibt es aber etwas mehr Spielraum als beim Kreuzheben. Da das Kreuzheben früh nächste Woche getestet wird, eine kurze Einheit. Wer will, darf mit Bizeps- oder anderem Bodybuilding-Zubehör auffüllen – max. 2–3 Sätze pro Übung, mentale Ermüdung niedrig halten.',b:[
   B('csq',1,'2','1×2 @ RPE 8–8,5 – hoher Hype',{h:'h',rpe:8}),
   B('csq',4,'4','4×4 @ RPE 7,5 im letzten Satz – hoher Hype',{h:'h',rpe:7.5}),
   B('pdl',3,'2','3×2 @ RPE 6 im Schnitt – niedriger Hype',{h:'l',rpe:6})]}],
 [ // W5
  {f:'Brust · 2RM-Test',d:'Heute ein 2er-Rekord auf der Bank! RPE 9 ist völlig in Ordnung, du musst nicht bis 9,5 – und auf keinen Fall ein echter 100-%-Grinder. Das Volumen fürs Bankzubehör ist jetzt stark reduziert. Für den High Bar 3×4: etwas schwerer als die 6er-Backoffs der Vorwoche, etwas leichter als der 6er-Top-Satz – mit weniger Hype.',b:[
   B('hbs',3,'4','3×4 @ RPE 6,5 im letzten Satz – niedriger Hype (Last zwischen Backoffs und Top-Satz der Vorwoche)',{h:'l',rpe:6.5}),
   B('pbb',1,'2','2RM-Test: 1×2 @ RPE 9–9,5 – hoher Hype – Ziel: ein 2er-Rekord!',{h:'h',rpe:9}),
   B('pbb',1,'4','1×4 @ RPE 6,5 – niedriger Hype',{h:'l',rpe:6.5}),
   B('pbb',3,'4','3×4 mit 95 % der Last des Top-Satzes – ebenfalls niedriger Hype',TOPB(95,{h:'l'})),
   B('sdlr',3,'8-12','3×8–12 @ RPE 7 in jedem Satz – niedriger bis moderater Hype',{h:'l',rpe:7}),
   B('dfr',3,'10-12','(Optional) 3×10–12 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7,opt:1})]},
  {f:'Beine · 2RM-Test',d:'Ein großer 2er-Rekord im Kreuzheben! Kein Backoff-Volumen im Kreuzheben – damit du dich voll auf den Rekord konzentrieren kannst und mehr Erholung für den Kniebeugen-Test später in der Woche hast.',b:[
   B('cdl',1,'2','2RM-Test: 1×2 @ RPE 9–9,5 – hoher Hype',{h:'h',rpe:9}),
   B('mrow',3,'8','3×8 @ RPE 6,5 in jedem Satz – niedriger Hype',{sw:'row',h:'l',rpe:6.5}),
   B('cab',3,'12-15','(Optional) 3×12–15 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7,opt:1}),
   B('pb3',1,'1','1 Single @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('pb3',3,'1','3×1 mit 95 % des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'}))]},
  {f:'Arme & Brust · Deload',d:'Kompletter Deload fürs Bodybuilding und ein Wechseltag auf der Bank (andere Übungen statt nur weniger RPE oder Volumen). Locker und entspannt – mit frischem Kopf in die nächste Woche.',b:[
   B('spoto',1,'3','1×3 @ RPE 6,5 – moderater Hype',{h:'m',rpe:6.5}),
   B('spoto',3,'3','3×3 mit 95 % der Last des Top-Satzes – niedriger Hype',TOPB(95,{h:'l'})),
   B('ibp',2,'8','2×8 @ RPE 7 im Schnitt – moderater Hype',{h:'m',rpe:7}),
   B('dlr',3,'12','3×12 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5}),
   B('pcurl',3,'10-12','3×10–12 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5}),
   B('idc',2,'8-10','2×8–10 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5})]},
  {f:'Beine · 2RM-Test',d:'Den großen Kniebeugen-Rekord abliefern! Damit endet der 2er-Abschnitt. Woche 6 startest du wie eine Woche 1 – jetzt mit Singles und neuem Volumen.',b:[
   B('csq',1,'2','2RM-Test: 1×2 @ RPE 9–9,5 – hoher Hype',{h:'h',rpe:9}),
   B('csq',3,'3','3×3 @ RPE 5 im Schnitt – niedriger Hype',{h:'l',rpe:5}),
   B('sldl',2,'8','2×8 @ RPE 5 im ersten Satz – moderater Hype',{h:'m',rpe:5}),
   B('lhc',3,'8-10','3×8–10 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7})]}],
 [ // W6
  {f:'Brust & Beine',d:'Zweite Hälfte des Zyklus: die Wdh sinken, aus dem 3×6 High Bar Squat wird ein 4×4. Das 4×4 locker abliefern, Schwung aufbauen – die Durchschnittslast steigt auch an diesem Nebentag. Peaken klappt am besten, wenn mehrere Slots zusammenspielen.',b:[
   B('hbs',1,'4','1×4 @ RPE 6 – moderater Hype',{h:'m',rpe:6}),
   B('hbs',3,'4','3×4 mit 96 % des Top-Satzes – moderater Hype',TOPB(96,{h:'m'})),
   B('pbb',1,'1','1 Single @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('pbb',1,'6','1×6 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',2,'6','2×6 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('fub',3,'5','3×5 @ RPE 6 im Schnitt – niedriger Hype · '+FUBW,{h:'l',rpe:6}),
   B('cte',3,'8','3×8 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7})]},
  {f:'Beine & Rücken',d:'Nahtlose Fortsetzung des letzten Blocks: im Kreuzheben 1 Wdh weniger pro Satz (3×6 → 3×5), die Back Extension wird zum 3×8. Am Ende dieser Progression soll ein großer 8er-Rekord stehen – mit starkem Übertrag.',b:[
   B('cdl',1,'1','1 Single @ RPE 5 – hoher Hype',{h:'h',rpe:5}),
   B('cdl',1,'5','1×5 @ RPE 6,5 – hoher Hype',{h:'h',rpe:6.5}),
   B('cdl',2,'5','2×5 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('xbarbellbackextension',3,'8','3×8 @ RPE 7 in jedem Satz – niedriger Hype',{sw:'lhc',h:'l',rpe:7}),
   B('lat',1,'7','1×7 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('lat',2,'7','2×7 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7}),
   B('ilat',3,'8-12','(Optional) 3×8–12 @ RPE 8 in jedem Satz – moderater Hype · 3 s Exzentrik + 1 s Pause in der Kontraktion',{h:'m',rpe:8,opt:1}),
   B('pbb',5,'1','5×1 @ RPE 5 in jedem Satz – niedriger Hype',{h:'l',rpe:5})]},
  {f:'Arme & Brust',d:'Die Bank überschneidet sich direkt mit den ersten 5 Wochen, der Feet-Up-/Close-Grip-Slot liegt bewusst 1 Wdh niedriger (der Abschluss-Testsatz 2 Wdh niedriger). Beim Hypertrophie-Zubehör wechseln ein paar Übungen, die Satzzahl bleibt gleich. Weiter aufbauen!',b:[
   B('pbb',1,'3','1×3 mit 2,5–5 kg (5–10 lbs) mehr als der 3er-Top-Satz aus Woche 1 – RPE-6,5-Deckel – moderater Hype',{h:'m',src:[0,2,0],add:2.5,cap:6.5}),
   B('pbb',5,'3','5×3 mit 96 % des Top-Satzes – moderater Hype',TOPB(96,{h:'m'})),
   B('fub',2,'7','2×7 @ RPE 7 im 2. Satz – hoher Hype · '+FUBW,{h:'h',rpe:7}),
   B('sdlr',3,'8-12','3×8–12 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('ccurl',3,'8','3×8 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit gleicher Last wie in Woche 1 – hoher Hype, Ziel: mind. 2–3 Wdh mehr!',{h:'h',rpe:10,src:[0,2,5]})]},
  {f:'Beine',d:'Jetzt kommen die Singles! Die Schlussphase der Kniebeuge beginnt – streng bleiben, stark starten, in den nächsten Wochen geht es auf RPE 7–8,5.',b:[
   B('csq',1,'1','1 Single @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('csq',5,'3','5×3 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('pdl',4,'3','4×3 @ RPE 5 im Schnitt – niedriger Hype',{h:'l',rpe:5}),
   B('mach',3,'8','3×8 @ RPE 7 in jedem Satz – niedriger Hype',{h:'l',rpe:7}),
   B('shc',2,'8-12','(Optional) 2×8–12 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8,opt:1})]}],
 [ // W7
  {f:'Brust & Beine',d:'Übergangspunkt: die High Bar Squats am Nebentag werden deutlich schwerer. Die 3×6 der ersten Hälfte haben das 4×4 vorbereitet. Beim Top-Satz eher konservativ bleiben – niedrige Wdh im High Bar brauchen Gewöhnung. Zeit nehmen für Bracing und Position unten. In Woche 8 und 9 hoffentlich schwerer als je zuvor.',b:[
   B('hbs',1,'4','1×4 @ RPE 7 – moderater Hype',{h:'m',rpe:7}),
   B('hbs',3,'4','3×4 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('pbb',1,'1','1 Single @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',1,'6','1×6 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',2,'6','2×6 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',3,'5','3×5 @ RPE 6,5 im Schnitt – niedriger Hype · '+FUBW,{h:'l',rpe:6.5}),
   B('cte',3,'8','3×8 @ RPE 7,5 in jedem Satz – moderater Hype',{h:'m',rpe:7.5})]},
  {f:'Beine & Rücken',d:'Kreuzheben-Singles und 5er steigen weiter, Backoffs mit RPE-7-Deckel.',b:[
   B('cdl',1,'1','1 Single @ RPE 6 – hoher Hype',{h:'h',rpe:6}),
   B('cdl',1,'5','1×5 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('cdl',2,'5','2×5 mit 93–95 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(94,{h:'m',cap:7})),
   B('xbarbellbackextension',3,'8','3×8 @ RPE 7,5 in jedem Satz – niedriger Hype',{sw:'lhc',h:'l',rpe:7.5}),
   B('lat',1,'7','1×7 @ RPE 7,5 – hoher Hype',{h:'h',rpe:7.5}),
   B('lat',2,'7','2×7 @ RPE 7,5 in jedem Satz – moderater Hype',{h:'m',rpe:7.5}),
   B('ilat',3,'8-12','(Optional) 3×8–12 @ RPE 8 in jedem Satz – moderater Hype · 3 s Exzentrik + 1 s Pause in der Kontraktion',{h:'m',rpe:8,opt:1}),
   B('pbb',5,'1','5×1 @ RPE 6 in jedem Satz – niedriger Hype',{h:'l',rpe:6})]},
  {f:'Arme & Brust',d:'Die Basis weiter anheben – stetiger Fortschritt bei den 6×3-Banktagen über die Wochen und über die 5-Wochen-Wellen. Streng bei den RPE-Deckeln: im Zweifel nur 2,5 kg mehr als in Woche 2, aber volle 5 kg, wenn sie da sind. Am Haupttag heben wir die Decke, an diesem Nebentag das Minimum.',b:[
   B('pbb',1,'3','1×3 mit 2,5–5 kg (5–10 lbs) mehr als der 3er-Top-Satz aus Woche 2 – RPE-7,5-Deckel – moderater Hype',{h:'m',src:[1,2,0],add:2.5,cap:7.5}),
   B('pbb',5,'3','5×3 mit 95 % des Top-Satzes – RPE-7-Deckel (Last senken, falls er überschritten würde)',TOPB(95,{cap:7})),
   B('fub',2,'7','2×7 @ RPE 7,5 im 2. Satz – hoher Hype · '+FUBW,{h:'h',rpe:7.5}),
   B('sdlr',3,'8-12','3×8–12 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('ccurl',3,'8','3×8 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit gleicher Last wie in Woche 2 – hoher Hype, Ziel: mind. 2–3 Wdh mehr!',{h:'h',rpe:10,src:[1,2,5]})]},
  {f:'Beine',d:'Die Intensität im Kreuzheben ist heute der größte X-Faktor. Der Kniebeugen-Haupttag steht im Fokus, aber bleib auch bei der Arbeit mit wenig Hype konzentriert. Die Woche stark abschließen!',b:[
   B('csq',1,'1','1 Single @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('csq',5,'3','5×3 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('pdl',4,'3','4×3 @ RPE 6 im Schnitt – niedriger Hype',{h:'l',rpe:6}),
   B('mach',3,'8','3×8 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7}),
   B('shc',2,'8-12','(Optional) 2×8–12 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8,opt:1})]}],
 [ // W8
  {f:'Brust & Beine',d:'Den 4er im High Bar hart pushen – nächste Woche kommt der wichtigste RPE-8-Top-Satz des Zyklus.',b:[
   B('hbs',1,'4','1×4 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('hbs',3,'4','3×4 mit 95 % des Top-Satzes – moderater Hype',TOPB(95,{h:'m'})),
   B('pbb',1,'1','1 Single @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('pbb',1,'4','1×4 @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',3,'4','3×4 @ RPE 6,5 im letzten Satz – moderater Hype',{h:'m',rpe:6.5}),
   B('fub',3,'5','3×5 @ RPE 7 im ersten Satz – niedriger Hype · '+FUBW,{h:'l',rpe:7}),
   B('cte',3,'8','3×8 @ RPE 8 in jedem Satz – hoher Hype – richtig pushen!',{h:'h',rpe:8})]},
  {f:'Beine & Rücken',d:'Kreuzheben-Single @ RPE 7 und schwere 5er – die Backoffs bleiben unter dem RPE-7-Deckel.',b:[
   B('cdl',1,'1','1 Single @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('cdl',1,'5','1×5 @ RPE 7,5 – hoher Hype',{h:'h',rpe:7.5}),
   B('cdl',2,'5','2×5 mit 91–95 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(93,{h:'m',cap:7})),
   B('xbarbellbackextension',3,'8','3×8 @ RPE 7,5 in jedem Satz – niedriger Hype',{sw:'lhc',h:'l',rpe:7.5}),
   B('lat',1,'7','1×7 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('lat',2,'7','2×7 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('ilat',3,'8-12','(Optional) 3×8–12 @ RPE 8 in jedem Satz – moderater Hype · 3 s Exzentrik + 1 s Pause in der Kontraktion',{h:'m',rpe:8,opt:1}),
   B('pbb',5,'1','5×1 @ RPE 6 in jedem Satz – niedriger Hype',{h:'l',rpe:6})]},
  {f:'Arme & Brust',d:'Ein großer 3er auf der Bank! Nächste Woche geht es auf Doubles mit etwas niedrigerem RPE und Tapering – dieser 3er mit vollem Volumen ist der Hauptfokus. Nächste Woche auch nur noch 1 Satz Feet Up/Close Grip.',b:[
   B('pbb',1,'3','1×3 @ RPE 8 – hoher Hype – kein Vergleich mit früheren Wochen, einfach fliegen lassen!',{h:'h',rpe:8}),
   B('pbb',5,'3','5×3 mit 92–94 % des Top-Satzes – RPE-7-Deckel (Last senken, falls er überschritten würde)',TOPB(93,{cap:7})),
   B('fub',2,'7','2×7 @ RPE 8 im 2. Satz – hoher Hype · '+FUBW,{h:'h',rpe:8}),
   B('sdlr',3,'8-12','3×8–12 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('ccurl',3,'8','3×8 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit gleicher Last wie in Woche 2 – hoher Hype, Ziel: mind. 2–3 Wdh mehr!',{h:'h',rpe:10,src:[1,2,5]})]},
  {f:'Beine',d:'Der Hack-Squat-Slot fällt nächste Woche weg – stark abschließen, aber ehrlich beim RPE bleiben, um Ermüdungsspitzen zu vermeiden. Die Intensität steigt stetig, du solltest in Rekordnähe sein (ca. 10–15 kg), aber geduldig Raum für die letzten Sprünge lassen.',b:[
   B('csq',1,'1','1 Single @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('csq',5,'3','5×3 @ RPE 7,5 im letzten Satz – moderater Hype',{h:'m',rpe:7.5}),
   B('pdl',4,'3','4×3 @ RPE 6,5 im Schnitt – niedriger Hype',{h:'l',rpe:6.5}),
   B('mach',3,'8','3×8 @ RPE 7 in jedem Satz – hoher Hype',{h:'h',rpe:7}),
   B('shc',2,'8-12','(Optional) 2×8–12 @ RPE 8 in jedem Satz – hoher Hype',{h:'h',rpe:8,opt:1})]}],
 [ // W9
  {f:'Brust & Beine',d:'Das schwerste Bank-Single der Vorbereitung! Hart pushen, vielleicht ein kleiner Rekord – aber streng bleiben, nächste Woche kommt hier ein RPE-7-Single. Den 4er im High Bar hart pushen, idealerweise ein großer Wiederholungsrekord; danach ist nächste Woche genug Zeit zur Erholung.',b:[
   B('hbs',1,'4','1×4 @ RPE 8 – hoher Hype',{h:'h',rpe:8}),
   B('hbs',3,'4','3×4 mit 91–93 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(92,{h:'m',cap:7})),
   B('pbb',1,'1','1 Single @ RPE 9 – hoher Hype',{h:'h',rpe:9}),
   B('pbb',1,'4','1×4 @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('pbb',3,'4','3×4 @ RPE 7 im letzten Satz – moderater Hype',{h:'m',rpe:7}),
   B('fub',3,'3','3×3 @ RPE 6 im ersten Satz – niedriger Hype · '+FUBW,{h:'l',rpe:6}),
   B('cte',2,'8','2×8 @ RPE 9 in jedem Satz – hoher Hype – richtig pushen!',{h:'h',rpe:9})]},
  {f:'Beine & Rücken',d:'Das Kreuzheben ist durch den schweren High-Bar-Satz vom Montag leicht beeinflusst – keine Sorge, wenn sich das Aufwärmen anders anfühlt. Bis zum Testtag sind es noch 1,5 Wochen, und das Kreuzheben hat das größte Tapering.',b:[
   B('cdl',1,'1','1 Single @ RPE 8,5–9 – hoher Hype',{h:'h',rpe:8.5}),
   B('cdl',1,'3','1×3 @ RPE 7,5 – hoher Hype',{h:'h',rpe:7.5}),
   B('cdl',2,'3','2×3 mit 91–95 % des Top-Satzes – RPE-7-Deckel – moderater Hype',TOPB(93,{h:'m',cap:7})),
   B('xbarbellbackextension',1,'8','1×8 @ RPE 8,5 – hoher Hype – diese Progression stark abschließen!',{sw:'lhc',h:'h',rpe:8.5}),
   B('xbarbellbackextension',1,'8','1×8 @ RPE 8 – moderater Hype',{sw:'lhc',h:'m',rpe:8}),
   B('lat',1,'7','1×7 @ RPE 8,5–9 – hoher Hype',{h:'h',rpe:8.5}),
   B('lat',2,'7','2×7 @ RPE 8 in jedem Satz – moderater Hype',{h:'m',rpe:8}),
   B('ilat',3,'8-12','(Optional) 3×8–12 @ RPE 8 in jedem Satz – moderater Hype · 3 s Exzentrik + 1 s Pause in der Kontraktion',{h:'m',rpe:8,opt:1}),
   B('pbb',5,'1','5×1 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5})]},
  {f:'Arme & Brust',d:'Wer an einem Wettkampf teilnimmt: Bodybuilding-Arbeit weglassen ODER nur RPE 6,5 mit niedrigem Hype. Ohne Wettkampf: Zubehör mit voller Kraft – das beeinflusst deine Gym-1RMs kaum, und zum Muskelaufbau soll das Volumen moderat bleiben.',b:[
   B('pbb',1,'2','1×2 @ RPE 8 – hoher Hype – kein Vergleich mit früheren Wochen, einfach fliegen lassen!',{h:'h',rpe:8}),
   B('pbb',5,'2','5×2 mit 92–94 % des Top-Satzes – RPE-7-Deckel (Last senken, falls er überschritten würde)',TOPB(93,{cap:7})),
   B('fub',1,'5','1×5 @ RPE 8,5 – hoher Hype – ein Variations-Rekord! · '+FUBW,{h:'h',rpe:8.5}),
   B('sdlr',3,'8-12','3×8–12 @ RPE 8 in jedem Satz – moderater Hype (Wettkämpfer: siehe Tageshinweis)',{h:'m',rpe:8}),
   B('ccurl',3,'8','3×8 @ RPE 8 in jedem Satz – moderater Hype (Wettkämpfer: siehe Tageshinweis)',{h:'m',rpe:8}),
   B('idc',2,'AMRAP','2 Sätze bis zum echten Versagen mit gleicher Last wie in Woche 3 – hoher Hype (Wettkämpfer: siehe Tageshinweis)',{h:'h',rpe:10,src:[2,2,5]})]},
  {f:'Beine',d:'Das Volumen sinkt – die letzte schwere Kniebeuge! Im Zweifel ganz leicht zur niedrigeren RPE tendieren.',b:[
   B('csq',1,'1','1 Single @ RPE 8,5 – hoher Hype',{h:'h',rpe:8.5}),
   B('csq',4,'3','4×3 @ RPE 7,5 im letzten Satz – hoher Hype',{h:'h',rpe:7.5}),
   B('pdl',3,'2','3×2 @ RPE 6 im Schnitt – niedriger Hype',{h:'l',rpe:6})]}],
 [ // W10
  {f:'Beine & Brust',d:'Eine lockere Kniebeugen-Einheit, während die Bank das letzte Haupt-Single bekommt. Feet Up/Close Grip und Tricep Extensions fallen weg; das Wettkampf-Bankvolumen bleibt exakt gleich, nur das RPE sinkt – das verhindert einen verfrühten Peak und bringt trotzdem Erholung. Am Ende der Woche bist du frisch für den Test!',b:[
   B('hbs',3,'3','3×3 @ RPE 6,5 im letzten Satz – niedriger bis moderater Hype',{h:'l',rpe:6.5}),
   B('pbb',1,'1','1 Single @ RPE 7 – hoher Hype',{h:'h',rpe:7}),
   B('pbb',1,'4','1×4 @ RPE 6,5 – niedriger Hype',{h:'l',rpe:6.5}),
   B('pbb',3,'4','3×4 mit 96 % der Last des Top-Satzes darüber',TOPB(96))]},
  {f:'Beine & Rücken',d:'Bei den 5 Bank-Singles bei EINIGEN mehr Last als letzte Woche nehmen – meist bei 2–3 Singles, die anderen mit gleicher Last. Nehmen, was da ist, nichts erzwingen. Die leichteste Einheit von allen: etwa 40 % der Ermüdung der letzten Woche sind noch da, nach dieser Einheit + 2 Tagen Erholung bist du am Testtag bei 100 %.',b:[
   B('cdl',3,'1','3×1 @ RPE 5 im Schnitt – niedriger Hype',{h:'l',rpe:5}),
   B('lat',3,'8','3×8 @ RPE 6,5 im Schnitt – niedriger Hype',{h:'l',rpe:6.5}),
   B('ilat',2,'8-10','2×8–10 @ RPE 7 in jedem Satz – moderater Hype',{h:'m',rpe:7}),
   B('pbb',5,'1','5×1 @ RPE 6,5 in jedem Satz – niedriger Hype – bei einigen Singles mehr Last als letzte Woche',{h:'l',rpe:6.5})]},
  {f:'Optional · Bank-Maxtag',d:'Nur für alle, die NICHT an einem Wettkampf teilnehmen und an einem anderen Tag maximal testen können. Wettkämpfer machen diesen Tag gar nicht. In dieser Version Bank NICHT am Sonntag maximal testen – nur am Freitag (hier) oder am Samstag. Wer hier testet, testet Bank am Testtag nicht noch einmal.',b:[
   B('pbb',1,'1','1 Single @ RPE 10 – Bank-Max (nur ohne Wettkampf, siehe Tageshinweis)',{h:'h',rpe:10,test1:1,opt:1}),
   B('pbb',3,'6','3×6 @ RPE 5 im ersten Satz – niedriger Hype',{h:'l',rpe:5,opt:1}),
   B('sdlr',3,'8-12','3×8–12 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5,opt:1}),
   B('ccurl',3,'9-12','3×9–12 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5,opt:1}),
   B('idc',2,'8-10','2×8–10 @ RPE 6,5 in jedem Satz – niedriger Hype',{h:'l',rpe:6.5,opt:1})]},
  {f:'Testtag · 1RM',d:'Testtag! Wer am Freitag schon Bank maximal getestet hat, testet Bank hier NICHT noch einmal – dieser Tag ist für Wettkämpfer oder als Probe-Wettkampf gedacht. Keine Einschränkungen, aber Fehlversuche wann immer möglich vermeiden!',b:[
   B('csq',1,'1','1RM-Test: 1 Single @ RPE 10 – keine Einschränkungen, aber Fehlversuche vermeiden!',{h:'h',rpe:10,test1:1}),
   B('pbb',1,'1','1RM-Test: 1 Single @ RPE 10 – nur, wenn du am Freitag nicht getestet hast',{h:'h',rpe:10,test1:1}),
   B('cdl',1,'1','1RM-Test: 1 Single @ RPE 10 – keine Einschränkungen, aber Fehlversuche vermeiden!',{h:'h',rpe:10,test1:1})]}]
];
const INFO10W={};
