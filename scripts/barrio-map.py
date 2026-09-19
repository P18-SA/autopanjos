"""
Genera lib/barrio-map.ts: el mapa de /mientras-esperas a partir de datos
reales de OpenStreetMap (calles, costa, Parque Rodó y su lago) y las rutas a
pie entre paradas, calculadas por calles reales con Dijkstra.

Uso (desde la raíz del repo):  python scripts/barrio-map.py

Para mover una parada o sumar otra, editar POI y legs y volver a correrlo.
Datos © OpenStreetMap contributors, licencia ODbL.
"""
import json, math, heapq, sys, time, urllib.error, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

OVERPASS = "https://overpass-api.de/api/interpreter"
def overpass(q):
    body = urllib.parse.urlencode({"data": "[out:json][timeout:60];(" + q + ");out geom;"}).encode()
    req = urllib.request.Request(OVERPASS, data=body, headers={"User-Agent": "autopanjos-map/1.0"})
    # Overpass rate-limits back-to-back queries (HTTP 429): wait and retry.
    for attempt in range(5):
        try:
            return json.load(urllib.request.urlopen(req, timeout=120))["elements"]
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 4: raise
            time.sleep(10 * (attempt + 1))

osm = overpass('way["natural"="coastline"](-34.925,-56.192,-34.902,-56.160);'
               'way["highway"~"primary|secondary|tertiary|residential|trunk|unclassified"](-34.922,-56.192,-34.902,-56.160);'
               'way["leisure"="park"]["name"~"Rod"](-34.925,-56.192,-34.902,-56.160);')
paths = overpass('way["highway"~"footway|path|pedestrian|living_street|service"](-34.921,-56.172,-34.910,-56.162);')
water = overpass('nwr["natural"="water"](-34.921,-56.175,-34.910,-56.160);')

LON0,LON1,LAT0,LAT1=-56.1905,-56.1605,-34.9215,-34.9030
KX=math.cos(math.radians(34.912))
W=600
SCALE=W/((LON1-LON0)*KX)
H=round((LAT1-LAT0)*SCALE,1)
def P(lon,lat): return ((lon-LON0)*KX*SCALE,(LAT1-lat)*SCALE)
def m(lon1,lat1,lon2,lat2): return math.hypot((lon1-lon2)*KX*111320,(lat1-lat2)*110574)
def fmt(pts): 
    out=[]
    for i,(x,y) in enumerate(pts):
        out.append(('M' if i==0 else 'L')+f'{x:.1f},{y:.1f}')
    return ' '.join(out)

# ---- graph
adj={}; coord={}
def add_way(e):
    ns=e.get('nodes'); gs=e.get('geometry')
    if not ns or not gs: return
    for n,g in zip(ns,gs): coord[n]=(g['lon'],g['lat'])
    for a,b in zip(ns,ns[1:]):
        d=m(*coord[a],*coord[b])
        adj.setdefault(a,[]).append((b,d)); adj.setdefault(b,[]).append((a,d))
for e in osm+paths:
    if e['type']=='way' and 'highway' in e.get('tags',{}): add_way(e)

def nearest(lon,lat,filt=None):
    best=None
    for n,(x,y) in coord.items():
        if filt and n not in filt: continue
        d=m(lon,lat,x,y)
        if best is None or d<best[0]: best=(d,n)
    return best[1]
def dijkstra(a,b):
    dist={a:0}; prev={}; pq=[(0,a)]
    while pq:
        d,u=heapq.heappop(pq)
        if u==b: break
        if d>dist[u]: continue
        for v,w in adj.get(u,[]):
            nd=d+w
            if nd<dist.get(v,1e18): dist[v]=nd; prev[v]=u; heapq.heappush(pq,(nd,v))
    path=[b]
    while path[-1]!=a: path.append(prev[path[-1]])
    return path[::-1], dist[b]

rambla_nodes=set()
for e in osm:
    if 'Rambla' in e.get('tags',{}).get('name',''): rambla_nodes.update(e.get('nodes',[]))

POI={
 'taller':(-56.1784274,-34.9104785),
 'tinkal':(-56.1747828,-34.9132942),
 'playa':(-56.1697189,-34.9167085),
 'lago':(-56.16712,-34.91275),   # orilla oeste del lago
 'mnav':(-56.1649722,-34.9138391),
 'intendencia':(-56.1860876,-34.9064979),
}
t0=nearest(*POI['taller'])
comp={t0}; st=[t0]
while st:
    u=st.pop()
    for v,_ in adj.get(u,[]):
        if v not in comp: comp.add(v); st.append(v)
rambla_nodes&=comp
# The Palacio Municipal's OSM point is the middle of its block; its door is
# on 18 de Julio, so the detour ends on the avenue.
julio_nodes=set()
for e in osm:
    if e.get('tags',{}).get('name')=='Avenida 18 de Julio': julio_nodes.update(e.get('nodes',[]))
julio_nodes&=comp
nodes={
 'taller':t0,
 'rambla':nearest(*POI['taller'],filt=rambla_nodes),
 'tinkal':nearest(*POI['tinkal'],filt=comp),
 'playa':nearest(*POI['playa'],filt=rambla_nodes),
 'lago':nearest(*POI['lago'],filt=comp),
 'mnav':nearest(*POI['mnav'],filt=comp),
 'intendencia':nearest(*POI['intendencia'],filt=julio_nodes),
}
legs=[('taller','rambla'),('rambla','tinkal'),('tinkal','playa'),('playa','lago'),('lago','mnav'),('taller','intendencia')]
res={}
for a,b in legs:
    p,d=dijkstra(nodes[a],nodes[b])
    pts=[P(*coord[n]) for n in p]
    if a=='taller': pts=[P(*POI['taller'])]+pts
    res[b]=(fmt(pts),round(d),pts[-1])
    print(a,'->',b,round(d),'m',round(d/80),'min')
pins={'taller':P(*POI['taller'])}
for k,(_,_,end) in res.items(): pins[k]=end

# ---- streets
streets=[];named={}
for e in osm:
    t=e.get('tags',{})
    if e['type']!='way' or 'highway' not in t: continue
    pts=[P(g['lon'],g['lat']) for g in e['geometry']]
    s=fmt(pts) if 'name' in t and ('Rambla' in t['name'] or t['name'] in ('Isla de Flores','Avenida 18 de Julio')) else ' '.join(('M' if i==0 else 'L')+f'{x:.0f},{y:.0f}' for i,(x,y) in enumerate(pts))
    n=t.get('name','')
    key=None
    if 'Rambla' in n: key='rambla'
    elif n=='Isla de Flores': key='isla'
    elif n=='Avenida 18 de Julio': key='julio'
    if key: named.setdefault(key,[]).append(s)
    else: streets.append(s)

# ---- coast -> water polygon
segs=[[P(g['lon'],g['lat']) for g in e['geometry']] for e in osm if e.get('tags',{}).get('natural')=='coastline']
chain=segs.pop(0)
def close(a,b): return abs(a[0]-b[0])<0.01 and abs(a[1]-b[1])<0.01
changed=True
while changed and segs:
    changed=False
    for s in list(segs):
        if close(chain[-1],s[0]): chain+=s[1:]; segs.remove(s); changed=True
        elif close(s[-1],chain[0]): chain=s[:-1]+chain; segs.remove(s); changed=True
print('coast leftover',len(segs), 'chain', chain[0], chain[-1])
inside=[p for p in chain if -80<p[0]<W+80 and p[1]<H+200]
coast=fmt(inside)
water_d=coast+f' L{W+80},{H+200} L-80,{H+200} Z' if inside[0][0]<inside[-1][0] else coast+f' L-80,{H+200} L{W+80},{H+200} Z'

# ---- park & lake
park=[e for e in osm if e.get('tags',{}).get('leisure')=='park'][0]
park_d=fmt([P(g['lon'],g['lat']) for g in park['geometry']])+' Z'
lake=[e for e in water if e.get('tags',{}).get('name')=='Lago del Parque Rodó'][0]
lake_d=' '.join(fmt([P(g['lon'],g['lat']) for g in mbr['geometry']])+' Z' for mbr in lake['members'] if mbr.get('role')=='outer' and mbr.get('geometry'))

out={'H':H,'streets':' '.join(streets),'named':{k:' '.join(v) for k,v in named.items()},'coast':coast,'water':water_d,'park':park_d,'lake':lake_d,
     'routes':{k:v[0] for k,v in res.items()},'meters':{k:v[1] for k,v in res.items()},'pins':{k:[round(x,1),round(y,1)] for k,(x,y) in pins.items()}}
print('H',H,'pins',out['pins']); print('sizes',{k:len(v) if isinstance(v,str) else 0 for k,v in out.items()})

ts = f"""// GENERADO por scripts/barrio-map.py — no editar a mano.
// Geometría © OpenStreetMap contributors (ODbL), proyectada a un viewBox de
// {W}x{H} con norte arriba. Las rutas siguen calles reales.

export const MAP_W = {W};
export const MAP_H = {H};

export const STREETS = {json.dumps(out['streets'])};
export const RAMBLA = {json.dumps(out['named'].get('rambla',''))};
export const ISLA_DE_FLORES = {json.dumps(out['named'].get('isla',''))};
export const DIECIOCHO = {json.dumps(out['named'].get('julio',''))};
export const COAST = {json.dumps(out['coast'])};
export const WATER = {json.dumps(out['water'])};
export const PARK = {json.dumps(out['park'])};
export const LAKE = {json.dumps(out['lake'])};

/** Ruta a pie que llega a cada parada, desde la parada anterior. */
export const ROUTES = {json.dumps(out['routes'], indent=2, ensure_ascii=False)} as const;

/** Largo de cada tramo en metros, para los tiempos a pie del texto. */
export const METERS = {json.dumps(out['meters'], indent=2)} as const;

export const PINS = {json.dumps(out['pins'], indent=2)} as const;
"""
open("lib/barrio-map.ts", "w", encoding="utf-8", newline="\n").write(ts)
print("wrote lib/barrio-map.ts")
