import json,gzip,base64,pathlib,datetime
root=pathlib.Path(__file__).resolve().parents[1]
allstorms=[]
for fn in ['/tmp/hurdat-attempt.txt','/tmp/hurdat-pacific.txt']:
    storm=None
    for line in pathlib.Path(fn).read_text().splitlines():
        p=[v.strip() for v in line.split(',')]
        if len(p)<4: continue
        if p[0][:2] in ('AL','EP','CP') and len(p[0])==8:
            storm={'id':p[0],'name':p[1].title(),'points':[]}; allstorms.append(storm)
        elif storm and len(p)>7:
            d,t=p[:2]
            time=f'{d[:4]}-{d[4:6]}-{d[6:]}T{t[:2]}:{t[2:]}:00Z'
            coord=lambda s: float(s[:-1])*(-1 if s[-1] in 'SW' else 1)
            wind=int(p[6]); pressure=int(p[7])
            storm['points'].append([time,coord(p[4]),coord(p[5]),wind if wind>=0 else None,pressure if pressure>0 else None,p[3],p[2]])
assert len(allstorms)>3000
compact=json.dumps(allstorms,separators=(',',':'))
(root/'data/archive.gz.b64').write_text(base64.b64encode(gzip.compress(compact.encode(),mtime=0)).decode())
land=json.loads(pathlib.Path('/tmp/land.geojson').read_text())
rings=[]
for f in land['features']:
    g=f['geometry']; polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    for poly in polys:
        rings.append([[round(x,2),round(y,2)] for x,y in poly[0]])
(root/'data/land.json').write_text(json.dumps(rings,separators=(',',':')))
print(f'{len(allstorms)} archived storms; {sum(len(s["points"]) for s in allstorms)} track points; compressed {len((root/"data/archive.gz.b64").read_text())} bytes')
